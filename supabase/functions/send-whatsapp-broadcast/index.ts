import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Customer {
  name: string;
  phone: string;
}

interface BroadcastRequest {
  message: string;
  customers: Customer[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, customers }: BroadcastRequest = await req.json();

    console.log(`Starting WhatsApp broadcast to ${customers.length} customers`);

    // Get Twilio credentials from environment
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in Edge Functions secrets.');
    }

    // Twilio API endpoint
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    // Basic Auth for Twilio
    const auth = btoa(`${accountSid}:${authToken}`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Send message to each customer
    for (const customer of customers) {
      try {
        // Ensure phone number has correct format (should start with +)
        let phoneNumber = customer.phone.trim();
        if (!phoneNumber.startsWith('+')) {
          // Assume Dutch number if no country code
          phoneNumber = phoneNumber.startsWith('0') 
            ? `+31${phoneNumber.substring(1)}` 
            : `+31${phoneNumber}`;
        }

        // Format for WhatsApp
        const toNumber = `whatsapp:${phoneNumber}`;
        
        console.log(`Sending WhatsApp to ${customer.name} at ${toNumber}`);

        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioWhatsAppNumber,
            To: toNumber,
            Body: message,
          }),
        });

        const responseData = await response.json();

        if (response.ok) {
          console.log(`Successfully sent to ${customer.name}:`, responseData.sid);
          successCount++;
          results.push({
            customer: customer.name,
            phone: phoneNumber,
            success: true,
            messageId: responseData.sid,
          });
        } else {
          console.error(`Failed to send to ${customer.name}:`, responseData);
          failCount++;
          results.push({
            customer: customer.name,
            phone: phoneNumber,
            success: false,
            error: responseData.message || 'Unknown error',
          });
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error sending to ${customer.name}:`, error);
        failCount++;
        results.push({
          customer: customer.name,
          phone: customer.phone,
          success: false,
          error: error.message,
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
    console.error('Error in send-whatsapp-broadcast function:', error);
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
