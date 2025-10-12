import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Customer {
  name: string;
  email: string;
}

interface BroadcastRequest {
  subject: string;
  message: string;
  customers: Customer[];
}

interface SendResult {
  customer: string;
  email: string;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message, customers }: BroadcastRequest = await req.json();

    console.log(`Starting email broadcast to ${customers.length} customers`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Gmail OAuth credentials from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['gmail_user', 'gmail_client_id', 'gmail_client_secret', 'gmail_refresh_token']);

    if (settingsError) {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`);
    }

    const gmailUser = settings?.find(s => s.key === 'gmail_user')?.value;
    const clientId = settings?.find(s => s.key === 'gmail_client_id')?.value;
    const clientSecret = settings?.find(s => s.key === 'gmail_client_secret')?.value;
    const refreshToken = settings?.find(s => s.key === 'gmail_refresh_token')?.value;

    if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
      throw new Error('Gmail OAuth credentials not configured. Please set gmail_user, gmail_client_id, gmail_client_secret, and gmail_refresh_token in Admin Settings.');
    }

    console.log(`Using Gmail account: ${gmailUser}`);

    // Get access token from refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to refresh Gmail access token: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Send email to each customer
    for (const customer of customers) {
      try {
        console.log(`Sending email to ${customer.name} at ${customer.email}`);

        // Create RFC 2822 formatted email
        const emailContent = [
          `From: ${gmailUser}`,
          `To: ${customer.email}`,
          `Subject: ${subject}`,
          `Content-Type: text/plain; charset=utf-8`,
          '',
          `Beste ${customer.name},`,
          '',
          message,
          '',
          'Met vriendelijke groet,',
          'Car Detail Exclusief',
        ].join('\r\n');

        // Base64url encode the email
        const encodedEmail = btoa(emailContent)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send via Gmail API
        const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedEmail }),
        });

        if (!sendResponse.ok) {
          const errorData = await sendResponse.json();
          throw new Error(errorData.error?.message || 'Failed to send email');
        }

        const responseData = await sendResponse.json();
        console.log(`Successfully sent to ${customer.name}:`, responseData.id);
        successCount++;
        results.push({
          customer: customer.name,
          email: customer.email,
          success: true,
        });

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error sending to ${customer.name}:`, error);
        failCount++;
        results.push({
          customer: customer.name,
          email: customer.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Broadcast complete: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalSent: successCount,
        totalFailed: failCount,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-email-broadcast function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
