import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface OpeningHour {
  day: string;
  hours: string;
}

interface ContactContent {
  whatsapp: string;
  phone: string;
  email: string;
  work_area: string;
  opening_hours: OpeningHour[];
}

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Neem Contact Op");
  const [subtitle, setSubtitle] = useState("Heeft u vragen of wilt u een afspraak maken? We helpen u graag!");
  const [content, setContent] = useState<ContactContent>({
    whatsapp: "+31612345678",
    phone: "+31612345678",
    email: "info@cardetail-exclusief.nl",
    work_area: "Landelijk actief",
    opening_hours: []
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", "contact")
      .maybeSingle();

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle || "");
      setContent(data.content as unknown as ContactContent);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <SEO 
          title="Contact - Neem Contact Op voor Car Detailing"
          description="Neem contact op met Cardetail Exclusief voor vragen of afspraken. Bereikbaar via WhatsApp, telefoon en e-mail. Landelijk actief."
          keywords="contact, car detailing contact, afspraak maken, whatsapp booking"
          url="https://cardetail-exclusief.nl/contact"
        />
        <div className="min-h-screen">
          <Header />
          <main className="pt-24 pb-20 flex items-center justify-center">
            <LoadingSpinner />
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  return (
    <>
      <SEO 
        title="Contact - Neem Contact Op voor Car Detailing"
        description="Neem contact op met Cardetail Exclusief voor vragen of afspraken. Bereikbaar via WhatsApp, telefoon en e-mail. Landelijk actief."
        keywords="contact, car detailing contact, afspraak maken, whatsapp booking"
        url="https://cardetail-exclusief.nl/contact"
      />
      <div className="min-h-screen">
        <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {title.split(" ").slice(0, -1).join(" ")} <span className="text-primary">{title.split(" ").slice(-1)}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>WhatsApp</CardTitle>
                  <CardDescription>
                    Chat direct met ons via WhatsApp voor snelle vragen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={`https://wa.me/${content.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gradient-primary shadow-glow">
                      <MessageCircle className="w-4 h-4" />
                      Start WhatsApp Chat
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Telefoon</CardTitle>
                  <CardDescription>
                    Bel ons voor directe assistentie en advies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={`tel:${content.phone}`}>
                    <Button className="w-full" variant="outline">
                      <Phone className="w-4 h-4" />
                      {content.phone}
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>E-mail</CardTitle>
                  <CardDescription>
                    Stuur ons een e-mail met uw vraag of wensen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={`mailto:${content.email}`}>
                    <Button className="w-full" variant="outline">
                      <Mail className="w-4 h-4" />
                      {content.email}
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Werkgebied</CardTitle>
                  <CardDescription>
                    {content.work_area}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{content.work_area}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gradient-card border-border">
              <CardHeader>
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Openingstijden</CardTitle>
                <CardDescription>
                  Wij zijn bereikbaar op de volgende tijden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {content.opening_hours.map((hour, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{hour.day}</span>
                      <span className="font-semibold">{hour.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Klaar om uw auto te laten stralen?
              </p>
              <a href="/boeking">
                <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                  Plan Direct Een Afspraak
                </Button>
              </a>
            </div>
          </div>
        </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;
