import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const emailJsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const emailJsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const emailJsPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');
    const emailJsPrivateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey || !emailJsPrivateKey) {
      console.error('EmailJS credentials not configured');
      throw new Error('EmailJS credentials not configured');
    }

    console.log('Using EmailJS for email sending...');

    const body = await req.json();

    // Check if this is a broadcast request
    if ('customers' in body && Array.isArray(body.customers)) {
      const { subject, message, customers } = body as BroadcastRequest;
      
      console.log(`Starting broadcast to ${customers.length} customers`);
      
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const customer of customers) {
        try {
          console.log(`Sending email via EmailJS to ${customer.email}...`);

          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: emailJsServiceId,
              template_id: emailJsTemplateId,
              user_id: emailJsPublicKey,
              accessToken: emailJsPrivateKey,
              template_params: {
                to_email: customer.email,
                to_name: customer.name,
                subject: subject,
                message: message,
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
          }

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

      console.log(`Sending single email via EmailJS to ${to}`);

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: emailJsServiceId,
          template_id: emailJsTemplateId,
          user_id: emailJsPublicKey,
          accessToken: emailJsPrivateKey,
          template_params: {
            to_email: to,
            subject: subject,
            message: html,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
      }

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
