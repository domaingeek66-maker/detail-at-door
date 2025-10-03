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

SEO VEREISTEN:
- Pakkende H1 titel met hoofdzoekwoord (50-60 karakters)
- Meta description met call-to-action (150-160 karakters)
- Natuurlijke keyword integratie (detailing, carwash, autopflege, coating, poetsen)
- Long-tail zoekwoorden en semantische variaties
- Leesbare structuur met korte paragrafen (3-4 zinnen)

CONTENT KWALITEIT:
- Minimaal 800 woorden unieke, waardevolle content
- Storytelling elementen en praktijkvoorbeelden
- Concrete tips met actiewaarde
- Expertise en autoriteit tonen
- Conversational maar professionele toon

STRUCTUUR (gebruik alleen tekst, GEEN HTML tags of markdown):
Inleiding: probleem/vraag adresseren
Hoofddelen: 3-4 secties met duidelijke onderverdeling
Tips sectie: praktische actiepunten
Afsluiting: samenvatting + call-to-action

BELANGRIJK: Schrijf alleen platte tekst zonder HTML tags, markdown symbolen of speciale opmaak. Gebruik alleen normale tekst met lege regels tussen paragrafen.`;

    const userPrompt = `Schrijf een unieke, SEO-geoptimaliseerde blogpost over: ${topic}

Focus op:
- Originele invalshoek en frisse content
- Nederlandse zoekintentie en taalgebruik
- Praktische waarde voor autobezitters
- Lokale expertise en kennis
- Natuurlijke keyword integratie

Zoekwoorden om te integreren: auto detailing, carwash, poetsen, waxen, ceramic coating, interieur reiniging, lak bescherming, auto onderhoud, glans, bescherming

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