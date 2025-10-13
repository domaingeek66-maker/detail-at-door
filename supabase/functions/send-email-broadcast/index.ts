import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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

    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      throw new Error('Gmail credentials not configured');
    }

    console.log('Using Gmail SMTP for broadcast emails...');

    // Create SMTP client
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: gmailUser,
      password: gmailAppPassword,
    });

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Send email to each customer
    for (const customer of customers) {
      try {
        console.log(`Sending email via Gmail SMTP to ${customer.name} at ${customer.email}`);

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hallo ${customer.name},</h2>
            <div style="line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <br>
            <p style="color: #666;">
              Met vriendelijke groet,<br>
              Car Detail Exclusief
            </p>
          </div>
        `;

        await client.send({
          from: gmailUser,
          to: customer.email,
          subject: subject,
          content: htmlContent,
          html: htmlContent,
        });

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
    
    // Close SMTP connection
    await client.close();

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
