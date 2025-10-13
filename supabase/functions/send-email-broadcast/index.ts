import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const emailJsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const emailJsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const emailJsPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');
    const emailJsPrivateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey || !emailJsPrivateKey) {
      console.error('EmailJS credentials not configured');
      throw new Error('EmailJS credentials not configured');
    }

    console.log('Using EmailJS for broadcast emails...');

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Send email to each customer
    for (const customer of customers) {
      try {
        console.log(`Sending email via EmailJS to ${customer.name} at ${customer.email}`);

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
