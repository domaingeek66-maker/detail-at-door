import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Clock, Euro } from "lucide-react";
import { SEO } from "@/components/SEO";
import exteriorImage from "@/assets/service-exterior.jpg";
import interiorImage from "@/assets/service-interior.jpg";
import coatingImage from "@/assets/service-coating.jpg";
import seatCleaningImage from "@/assets/service-seat-cleaning.jpg";
import leatherTreatmentImage from "@/assets/service-leather-treatment.jpg";

const serviceImages: Record<string, string> = {
  "Exterior & Velgen": exteriorImage,
  "Interieur + Exterieur Pakket": interiorImage,
  "Ceramic & Wax Coating": coatingImage,
  "Stoelreiniging": seatCleaningImage,
  "Leerbehandeling": leatherTreatmentImage,
  "Leerbehandeling ": leatherTreatmentImage, // Met spatie
};

const Services = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const structuredData = services ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
          "@type": "LocalBusiness",
          "name": "Cardetail Exclusief"
        },
        "offers": {
          "@type": "Offer",
          "price": service.price.toString(),
          "priceCurrency": "EUR"
        }
      }
    }))
  } : undefined;

  return (
    <>
      <SEO
        title="Onze Diensten - Premium Car Detailing Behandelingen"
        description="Bekijk onze professionele car detailing diensten aan huis: exterieur reiniging, interieur behandeling en ceramic coating. Transparante prijzen."
        keywords="car detailing diensten, auto poetsen, ceramic coating, interieur reiniging, exterieur behandeling, mobiel car detailing"
        url="https://cardetail-exclusief.nl/diensten"
        structuredData={structuredData}
      />
      <div className="min-h-screen">
        <Header />
      
        <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Onze <span className="text-primary">Diensten</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Premium car detailing behandelingen op uw locatie. Alle prijzen zijn exclusief BTW.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 sm:h-96 rounded-lg bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services?.map((service) => (
                <Card 
                  key={service.id}
                  className="overflow-hidden group hover:shadow-glow transition-smooth gradient-card border-border"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={service.image_url || serviceImages[service.name] || exteriorImage}
                      alt={`${service.name} - Professionele car detailing service aan huis`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white">{service.name}</h3>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{service.duration_min} minuten</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="w-5 h-5 text-primary" />
                        <span className="text-3xl font-bold text-primary">
                          {service.price.toString()},-
                        </span>
                      </div>
                    </div>
                    
                    <Link to="/boeking" className="block">
                      <Button className="w-full gradient-primary shadow-glow">
                        <Sparkles className="w-4 h-4" />
                        Plan Deze Behandeling
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">
              Heeft u vragen over onze diensten? Neem contact met ons op!
            </p>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Opnemen
              </Button>
            </Link>
          </div>
        </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Services;
