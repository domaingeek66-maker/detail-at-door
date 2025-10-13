import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BroadcastRequest {
  subject: string;
  message: string;
  customers: Array<{
    name: string;
    email: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      throw new Error('Gmail credentials not configured');
    }

    console.log('Creating Gmail SMTP client...');

    const body = await req.json();

    // Check if this is a broadcast request
    if ('customers' in body && Array.isArray(body.customers)) {
      const { subject, message, customers } = body as BroadcastRequest;
      
      console.log(`Starting broadcast to ${customers.length} customers`);
      
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const customer of customers) {
        const client = new SmtpClient();
        
        try {
          console.log(`Connecting to Gmail SMTP for ${customer.email}...`);
          
          await client.connectTLS({
            hostname: "smtp.gmail.com",
            port: 465,
            username: gmailUser,
            password: gmailAppPassword,
          });

          console.log(`Sending email to ${customer.email}...`);

          await client.send({
            from: gmailUser,
            to: customer.email,
            subject: subject,
            content: message.replace(/<[^>]*>/g, ''),
            html: message,
          });

          await client.close();

          console.log(`✓ Email sent successfully to ${customer.email}`);
          results.push({
            email: customer.email,
            success: true,
          });
          successCount++;

          // Add delay to avoid rate limiting (1 second between emails)
          if (successCount < customers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          console.error(`✗ Failed to send email to ${customer.email}:`, error);
          try {
            await client.close();
          } catch (e) {
            // Ignore close errors
          }
          results.push({
            email: customer.email,
            success: false,
            error: error?.message || 'Unknown error',
          });
          failCount++;
        }
      }

      console.log(`Broadcast complete: ${successCount} sent, ${failCount} failed`);

      return new Response(
        JSON.stringify({
          success: true,
          totalSent: successCount,
          totalFailed: failCount,
          results: results,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Single email request
      const { to, subject, html, text } = body as EmailRequest;

      console.log(`Sending single email to ${to}`);

      const client = new SmtpClient();
      
      await client.connectTLS({
        hostname: "smtp.gmail.com",
        port: 465,
        username: gmailUser,
        password: gmailAppPassword,
      });

      await client.send({
        from: gmailUser,
        to: to,
        subject: subject,
        content: text || html.replace(/<[^>]*>/g, ''),
        html: html,
      });

      await client.close();

      console.log(`✓ Email sent successfully to ${to}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
