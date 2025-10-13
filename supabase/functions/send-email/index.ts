import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  customers: Array<{ name: string; email: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    const resend = new Resend(apiKey);

    const body = await req.json();

    // Support both single email and broadcast (backwards compatible)
    if (Array.isArray(body?.customers)) {
      const { subject, message, customers } = body as BroadcastRequest;
      console.log(`Starting Resend broadcast to ${customers.length} customers`);

      const results: Array<{ email: string; success: boolean; error?: string }> = [];
      let successCount = 0;
      let failCount = 0;

      for (const c of customers) {
        try {
          const html = `
            <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; line-height:1.6; color:#111">
              <p>Beste ${c.name || "klant"},</p>
              <p>${message.replace(/\n/g, "<br/>")}</p>
              <p style="margin-top:24px;color:#666">Vriendelijke groet,<br/>Cardetail Exclusief</p>
            </div>
          `;

          const result: any = await resend.emails.send({
            from: "Cardetail Exclusief <info@cardetailexclusief.nl>",
            to: [c.email],
            subject,
            html,
          });

          if (result?.error) throw new Error(result.error?.message || "Unknown Resend error");

          console.log(`✓ Email sent successfully to ${c.email}`);
          results.push({ email: c.email, success: true });
          successCount++;
          await new Promise((r) => setTimeout(r, 700));
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error(`✗ Failed to send email to ${c.email}:`, msg);
          results.push({ email: c.email, success: false, error: msg });
          failCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, totalSent: successCount, totalFailed: failCount, results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single email
    const { to, subject, html, text } = body as EmailRequest;
    console.log(`Sending single email via Resend to ${to}`);

    const result: any = await resend.emails.send({
      from: "Cardetail Exclusief <info@cardetailexclusief.nl>",
      to: [to],
      subject,
      html,
      text,
    });

    if (result?.error) throw new Error(result.error?.message || "Unknown Resend error");

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in send-email (Resend):", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
