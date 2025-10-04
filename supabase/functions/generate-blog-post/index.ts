import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Je bent een ervaren SEO content writer en auto detailing specialist. 
Creëer UNIEKE, originele blogposts in perfect Nederlands met:

BELANGRIJKE CONTEXT:
- Dit is een MOBIELE aan huis service - we komen bij de klant thuis
- Benadruk het gemak: geen rijden, parkeren of wachten
- Professionele service op de eigen oprit/parkeerplaats
- Werk in heel de regio/omgeving

SEO VEREISTEN:
- Pakkende H1 titel met hoofdzoekwoord + "aan huis" (50-60 karakters)
- Meta description met call-to-action en "mobiele service" (150-160 karakters)
- Natuurlijke keyword integratie (aan huis, mobiel, bij u thuis, op locatie, detailing, carwash, coating, poetsen)
- Long-tail zoekwoorden: "car detailing aan huis [stad]", "mobiele autopoets [stad]"
- Leesbare structuur met korte paragrafen (3-4 zinnen)

CONTENT KWALITEIT:
- Minimaal 800 woorden unieke, waardevolle content
- Storytelling: het gemak van service aan huis
- Concrete voordelen van mobiele service
- Expertise en professionele uitstraling
- Conversational maar professionele toon

STRUCTUUR (gebruik alleen tekst, GEEN HTML tags of markdown):
Inleiding: voordelen aan huis service + lokale focus
Hoofddelen: diensten, proces, voordelen van mobiele service
Werkgebied: specificeer dat we in [stad] en omgeving werken
Tips sectie: praktische informatie
Afsluiting: call-to-action + contact

BELANGRIJK: Schrijf alleen platte tekst zonder HTML tags, markdown symbolen of speciale opmaak. Gebruik alleen normale tekst met lege regels tussen paragrafen.`;

    const userPrompt = `Schrijf een unieke, SEO-geoptimaliseerde blogpost over: ${topic}

Focus op:
- MOBIELE AAN HUIS SERVICE - dit is cruciaal!
- Gemak: wij komen bij de klant thuis/op het werk
- Originele invalshoek en frisse content
- Nederlandse zoekintentie en taalgebruik
- Praktische waarde voor autobezitters
- Lokale expertise en kennis in de regio
- Natuurlijke keyword integratie

Zoekwoorden om te integreren: aan huis, mobiel, bij u thuis, op locatie, car detailing, autopoets, poetsen, waxen, ceramic coating, interieur reiniging, lak bescherming, auto onderhoud, glans, bescherming

Benadruk voordelen zoals: geen reistijd, geen wachten, gemak van eigen locatie, professionele service bij u thuis, werken in heel de regio.

GEEN HTML TAGS OF MARKDOWN - alleen platte tekst met lege regels tussen paragrafen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_blog_post",
              description: "Creëer een gestructureerde blogpost met title, excerpt en content",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "SEO-geoptimaliseerde titel (max 60 karakters)"
                  },
                  excerpt: {
                    type: "string",
                    description: "Korte samenvatting (max 160 karakters)"
                  },
                  content: {
                    type: "string",
                    description: "Volledige blogpost content met meerdere paragrafen"
                  }
                },
                required: ["title", "excerpt", "content"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_blog_post" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit bereikt, probeer het later opnieuw." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits op, voeg credits toe aan je Lovable workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const blogPost = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(blogPost), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-blog-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});