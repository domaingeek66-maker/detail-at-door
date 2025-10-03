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

interface SendResult {
  customer: string;
  phone: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, customers }: BroadcastRequest = await req.json();

    console.log(`Starting WhatsApp broadcast to ${customers.length} customers`);

    // Get WhatsApp Business API credentials from environment
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Edge Functions secrets.');
    }

    // WhatsApp Business API endpoint
    const whatsappUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Send message to each customer
    for (const customer of customers) {
      try {
        // Ensure phone number has correct format (should start with country code, no +)
        let phoneNumber = customer.phone.trim().replace(/\s/g, '');
        if (phoneNumber.startsWith('+')) {
          phoneNumber = phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('0')) {
          // Assume Dutch number if starts with 0
          phoneNumber = `31${phoneNumber.substring(1)}`;
        } else if (!phoneNumber.startsWith('31')) {
          // Assume Dutch number if no country code
          phoneNumber = `31${phoneNumber}`;
        }
        
        console.log(`Sending WhatsApp to ${customer.name} at ${phoneNumber}`);

        const response = await fetch(whatsappUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
              body: message,
            },
          }),
        });

        const responseData = await response.json();

        if (response.ok && responseData.messages) {
          console.log(`Successfully sent to ${customer.name}:`, responseData.messages[0].id);
          successCount++;
          results.push({
            customer: customer.name,
            phone: phoneNumber,
            success: true,
            messageId: responseData.messages[0].id,
          });
        } else {
          console.error(`Failed to send to ${customer.name}:`, responseData);
          failCount++;
          const errorMsg = responseData.error?.message || 'Unknown error';
          results.push({
            customer: customer.name,
            phone: phoneNumber,
            success: false,
            error: errorMsg,
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
