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

    const systemPrompt = `Je bent een expert content writer gespecialiseerd in auto detailing en car care. 
Schrijf SEO-geoptimaliseerde blogposts in het Nederlands met:
- Een pakkende titel (max 60 karakters)
- Een korte samenvatting/excerpt (max 160 karakters)
- Uitgebreide, informatieve content (minimaal 500 woorden)
- Gebruik van relevante zoekwoorden
- Praktische tips en advies
- Professionele maar toegankelijke toon`;

    const userPrompt = `Schrijf een complete blogpost over: ${topic}

Structureer de content met:
- Inleiding
- Meerdere paragrafen met subonderwerpen
- Praktische tips
- Conclusie

Zorg voor natuurlijke zoekwoorden zoals: auto detailing, carwash, poetsen, waxen, onderhoud, bescherming, etc.`;

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

    // Generate image for the blog post
    console.log("Generating image for:", blogPost.title);
    const imagePrompt = `Create a professional, high-quality image for a car detailing blog post titled: "${blogPost.title}". 
The image should feature a luxury car being detailed, polished, or showcased. 
Style: Modern, clean, professional. 
Focus on automotive excellence and premium car care.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!imageResponse.ok) {
      console.error("Image generation failed:", imageResponse.status);
      // Continue without image if generation fails
      return new Response(JSON.stringify(blogPost), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageData = await imageResponse.json();
    const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (generatedImage) {
      blogPost.image_url = generatedImage;
      console.log("Image generated successfully");
    }

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