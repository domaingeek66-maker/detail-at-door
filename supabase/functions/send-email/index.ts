import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
      throw new Error('Gmail credentials not configured');
    }

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailAppPassword,
        },
      },
    });

    const body = await req.json();

    // Check if this is a broadcast request
    if ('customers' in body && Array.isArray(body.customers)) {
      const { subject, message, customers } = body as BroadcastRequest;
      
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const customer of customers) {
        try {
          await client.send({
            from: gmailUser,
            to: customer.email,
            subject: subject,
            content: message,
            html: message,
          });

          console.log(`Email sent successfully to ${customer.email}`);
          results.push({
            email: customer.email,
            success: true,
          });
          successCount++;

          // Add delay to avoid rate limiting (1 second between emails)
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to send email to ${customer.email}:`, error);
          results.push({
            email: customer.email,
            success: false,
            error: error.message,
          });
          failCount++;
        }
      }

      await client.close();

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

      await client.send({
        from: gmailUser,
        to: to,
        subject: subject,
        content: text || '',
        html: html,
      });

      await client.close();

      console.log(`Email sent successfully to ${to}`);

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
