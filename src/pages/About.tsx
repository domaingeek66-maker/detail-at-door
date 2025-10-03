import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Shield, Heart, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AboutContent {
  mission_title: string;
  mission_text: string;
  why_us_title: string;
  why_us_points: string[];
}

const About = () => {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Over Cardetail Exclusief");
  const [subtitle, setSubtitle] = useState("Premium car detailing service met passie voor perfectie");
  const [content, setContent] = useState<AboutContent>({
    mission_title: "Onze Missie",
    mission_text: "",
    why_us_title: "Waarom Cardetail Exclusief?",
    why_us_points: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", "about")
      .maybeSingle();

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle || "");
      setContent(data.content as unknown as AboutContent);
    }
    setLoading(false);
  };

  const iconMap: Record<string, any> = {
    Award,
    Shield,
    Heart,
    Sparkles
  };

  const values = [
    { title: "Professioneel", description: "Ervaren specialisten met hoogwaardige producten en technieken voor het beste resultaat.", icon: "Award" },
    { title: "Betrouwbaar", description: "Transparante prijzen, duidelijke afspraken en altijd op tijd. Uw tevredenheid is gegarandeerd.", icon: "Shield" },
    { title: "Met Passie", description: "We behandelen elke auto met dezelfde zorg en aandacht alsof het onze eigen auto is.", icon: "Heart" },
    { title: "Premium Kwaliteit", description: "Alleen de beste producten en methoden voor een resultaat dat uw verwachtingen overtreft.", icon: "Sparkles" }
  ];
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {title.split(" ").slice(0, -2).join(" ")} <span className="text-primary">{title.split(" ").slice(-2).join(" ")}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {subtitle}
              </p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <div className="gradient-card p-8 rounded-lg border border-border">
                <h2 className="text-3xl font-bold mb-4">{content.mission_title}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {content.mission_text}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => {
                  const Icon = iconMap[value.icon] || Award;
                  return (
                    <div key={index} className="gradient-card p-6 rounded-lg border border-border">
                      <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="gradient-card p-8 rounded-lg border border-border text-center">
                <h2 className="text-3xl font-bold mb-4">{content.why_us_title}</h2>
                <ul className="space-y-4 text-lg text-muted-foreground text-left max-w-2xl mx-auto">
                  {content.why_us_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary font-bold">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <Link to="/boeking">
                  <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                    Plan Nu Uw Afspraak
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
