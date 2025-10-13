import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    const resend = new Resend(apiKey);

    const { subject, message, customers }: BroadcastRequest = await req.json();

    console.log(`Starting Resend broadcast to ${customers.length} customers`);

    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      try {
        const html = `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; line-height:1.6; color:#111">
            <p>Beste ${customer.name || "klant"},</p>
            <p>${message.replace(/\n/g, "<br/>")}</p>
            <p style="margin-top:24px;color:#666">Vriendelijke groet,<br/>Cardetail Exclusief</p>
          </div>
        `;

        const result: any = await resend.emails.send({
          from: "Cardetail Exclusief <onboarding@resend.dev>",
          to: [customer.email],
          subject,
          html,
        });

        if (result?.error) {
          throw new Error(result.error?.message || "Unknown Resend error");
        }

        console.log(`Successfully sent to ${customer.name} <${customer.email}>`);
        successCount++;
        results.push({ customer: customer.name, email: customer.email, success: true });

        // Gentle pacing
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`Error sending to ${customer.name}:`, msg);
        failCount++;
        results.push({ customer: customer.name, email: customer.email, success: false, error: msg });
      }
    }

    console.log(`Broadcast complete: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({ success: true, totalSent: successCount, totalFailed: failCount, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in send-email-broadcast (Resend):", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});