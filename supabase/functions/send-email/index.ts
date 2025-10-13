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

interface BookingConfirmationRequest {
  type: 'booking_confirmation';
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  address: string;
  services: string[];
  totalPrice: number;
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

    // Handle booking confirmation emails
    if (body?.type === 'booking_confirmation') {
      const { customerName, customerEmail, date, time, address, services, totalPrice } = body as BookingConfirmationRequest;
      console.log(`Sending booking confirmation to ${customerEmail}`);

      const servicesList = services.map(s => `<li style="margin: 4px 0;">${s}</li>`).join('');
      
      // Calculate price breakdown (assuming totalPrice includes 21% BTW)
      const subtotal = totalPrice / 1.21;
      const btw = totalPrice - subtotal;

      const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging van je boeking – Cardetail.Exclusief</title>
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
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #00bfff;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .content {
      padding: 30px 30px 40px 30px;
      line-height: 1.8;
    }
    .content p {
      color: #e0e0e0;
      margin: 15px 0;
    }
    .info-box {
      background-color: #111111;
      border: 1px solid rgba(0, 191, 255, 0.3);
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
    }
    .info-row {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      color: #ffffff;
    }
    .info-icon {
      font-size: 20px;
      margin-right: 12px;
      min-width: 24px;
    }
    .info-label {
      font-weight: 600;
      color: #00bfff;
      margin-right: 8px;
    }
    .info-value {
      color: #ffffff;
    }
    .service-list {
      margin: 8px 0 0 36px;
      padding: 0;
      list-style: none;
    }
    .service-list li {
      color: #ffffff;
      margin: 6px 0;
      padding-left: 16px;
      position: relative;
    }
    .service-list li:before {
      content: "•";
      color: #00bfff;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .highlight {
      color: #00bfff;
      font-weight: 600;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0 25px 0;
    }
    .btn {
      display: inline-block;
      background-color: #00bfff;
      color: #000000 !important;
      font-weight: 700;
      text-align: center;
      padding: 14px 32px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 14px;
      text-decoration: none;
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
      <h1>Bevestiging van je boeking</h1>
    </div>
    <div class="content">
      <p>Beste <strong>${customerName}</strong>,</p>

      <p>
        Bedankt voor je boeking bij <strong>Cardetail.Exclusief</strong>! Hierbij bevestigen we je afspraak voor onze car detailing aan huis service.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-icon">📅</span>
          <span class="info-label">Datum:</span>
          <span class="info-value">${date}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🕒</span>
          <span class="info-label">Tijdstip:</span>
          <span class="info-value">${time}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📍</span>
          <span class="info-label">Locatie:</span>
          <span class="info-value">${address}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🚘</span>
          <span class="info-label">Pakket:</span>
        </div>
        <ul class="service-list">
          ${servicesList}
        </ul>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0, 191, 255, 0.2);">
          <div class="info-row">
            <span class="info-icon">💰</span>
            <span class="info-label">Subtotaal (excl. BTW):</span>
            <span class="info-value">€${subtotal.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="info-icon"></span>
            <span class="info-label">BTW (21%):</span>
            <span class="info-value">€${btw.toFixed(2)}</span>
          </div>
          <div class="info-row" style="margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(0, 191, 255, 0.15);">
            <span class="info-icon"></span>
            <span class="info-label">Totaal (incl. BTW):</span>
            <span class="info-value" style="font-size: 18px; font-weight: 700; color: #00bfff;">€${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p>
        Onze specialist komt langs met alle benodigde materialen. Zorg voor toegang tot een stopcontact en watertoevoer in de buurt van de auto.
      </p>
      
      <p>
        <span class="highlight">Betaling:</span> na afloop van de behandeling Contant/tikkie of op Factuur.
      </p>
      
      <p>
        Wil je de afspraak verplaatsen of annuleren? Laat het ons minstens <span class="highlight">24 uur van tevoren</span> weten.
      </p>

      <div class="btn-container">
        <a href="mailto:info@cardetailexclusief.nl?subject=Wijziging afspraak" class="btn">Afspraak wijzigen</a>
      </div>

      <p>
        Wij kijken ernaar uit om jouw auto weer in showroomstaat te brengen! Vragen? Antwoord gerust op deze e-mail of bel ons.
      </p>

      <p style="margin-top: 25px;">
        Met vriendelijke groet,<br>
        <strong>Het team van Cardetail.Exclusief</strong>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Cardetail.Exclusief – Car detailing aan huis</p>
      <p><a href="https://cardetailexclusief.nl">cardetailexclusief.nl</a> | E-mail: info@cardetailexclusief.nl</p>
      <p>Volg ons op Instagram: <a href="https://instagram.com/cardetail.exclusief">@cardetail.exclusief</a></p>
      <p style="margin-top: 15px; color: #444;">Built with ❤️ by <a href="https://ontwikkelaars.dev" style="color: #00bfff;">ontwikkelaars.dev</a></p>
    </div>
  </div>
</body>
</html>
      `;

      const result: any = await resend.emails.send({
        from: "Cardetail Exclusief <info@cardetailexclusief.nl>",
        to: [customerEmail],
        subject: "Bevestiging van je boeking - Cardetail.Exclusief",
        html,
      });

      if (result?.error) throw new Error(result.error?.message || "Unknown Resend error");

      console.log("Booking confirmation email sent successfully");
      return new Response(JSON.stringify({ success: true, message: "Booking confirmation sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
