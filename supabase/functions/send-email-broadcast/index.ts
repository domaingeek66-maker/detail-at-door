import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message, customers }: BroadcastRequest = await req.json();

    console.log(`Starting email broadcast to ${customers.length} customers`);

    // Create Supabase client to fetch settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Gmail credentials from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['gmail_user', 'gmail_app_password']);

    if (settingsError) {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`);
    }

    const gmailUser = settings?.find(s => s.key === 'gmail_user')?.value;
    const gmailPassword = settings?.find(s => s.key === 'gmail_app_password')?.value;

    if (!gmailUser || !gmailPassword) {
      throw new Error('Gmail credentials not configured. Please set gmail_user and gmail_app_password in Admin Settings.');
    }

    console.log(`Using Gmail account: ${gmailUser}`);

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Send email to each customer
    for (const customer of customers) {
      try {
        console.log(`Sending email to ${customer.name} at ${customer.email}`);

        // Create SMTP client for each email
        const client = new SmtpClient();

        await client.connectTLS({
          hostname: "smtp.gmail.com",
          port: 465,
          username: gmailUser,
          password: gmailPassword,
        });

        await client.send({
          from: gmailUser,
          to: customer.email,
          subject: subject,
          content: `Beste ${customer.name},\n\n${message}\n\nMet vriendelijke groet,\nCar Detail Exclusief`,
        });

        await client.close();

        console.log(`Successfully sent to ${customer.name}`);
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
