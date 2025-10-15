import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const ServicesSection = () => {
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

  return (
    <section id="diensten" className="py-12 sm:py-16 md:py-20 px-4" aria-label="Onze diensten">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Onze <span className="text-primary">Diensten</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Professionele car detailing treatments voor elk type voertuig
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services?.map((service) => (
              <Card 
                key={service.id}
                className="overflow-hidden group hover:shadow-glow transition-smooth gradient-card border-border h-full flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image_url || serviceImages[service.name] || exteriorImage}
                    alt={`${service.name} - Cardetail Exclusief professionele behandeling`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                
                <CardHeader className="flex-grow">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                    <span className="text-2xl font-bold text-primary">
                      €{service.price.toString()},-
                    </span>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duur: {service.duration_min} minuten
                    </span>
                    <Link to="/boeking">
                      <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                        Boek Nu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
