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
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background-color: #000000;
      color: #ffffff;
    }
    a {
      color: #00bfff;
      text-decoration: none;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0a0a0a;
    }
    .header {
      background: linear-gradient(180deg, #000000 0%, #0a0a0a 100%);
      text-align: center;
      padding: 40px 20px 30px 20px;
    }
    .header img {
      max-width: 280px;
      height: auto;
    }
    .content {
      padding: 30px 30px 40px 30px;
      line-height: 1.8;
    }
    .content p {
      color: #e0e0e0;
      margin: 15px 0;
    }
    .message-box {
      background-color: #111111;
      border: 1px solid rgba(0, 191, 255, 0.3);
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      color: #ffffff;
      line-height: 1.8;
    }
    .highlight {
      color: #00bfff;
      font-weight: 600;
    }
    .footer {
      background-color: #000000;
      text-align: center;
      padding: 25px 20px;
      font-size: 13px;
      color: #666666;
      border-top: 1px solid #1a1a1a;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #00bfff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i.postimg.cc/1zyMk2Gg/Cardetail.png" alt="Cardetail.Exclusief Logo">
    </div>
    <div class="content">
      <p>Beste <strong>${customer.name || "klant"}</strong>,</p>

      <div class="message-box">
        ${message.replace(/\n/g, "<br/>")}
      </div>

      <p style="margin-top: 25px;">
        Met vriendelijke groet,<br>
        <strong>Het team van Cardetail.Exclusief</strong>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Cardetail.Exclusief – Car detailing aan huis</p>
      <p><a href="https://cardetailexclusief.nl">cardetailexclusief.nl</a> | E-mail: info@cardetailexclusief.nl</p>
      <p>Volg ons op Instagram: <a href="https://instagram.com/cardetail.exclusief">@cardetail.exclusief</a></p>
      <p style="margin-top: 15px; color: #444;">Built by <a href="https://ontwikkelaars.dev" style="color: #00bfff;">Ontwikkelaars.dev</a></p>
    </div>
  </div>
</body>
</html>
        `;

        const result: any = await resend.emails.send({
          from: "Cardetail Exclusief <info@cardetailexclusief.nl>",
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

        // Rate limit protection: 700ms between emails (max ~1.4 emails/sec)
        await new Promise((r) => setTimeout(r, 700));
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