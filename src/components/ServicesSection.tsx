import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import exteriorImage from "@/assets/service-exterior.jpg";
import interiorImage from "@/assets/service-interior.jpg";
import coatingImage from "@/assets/service-coating.jpg";

const services = [
  {
    title: "Exterior & Velgen",
    description: "3-staps handwash behandeling voor een perfecte buitenkant en schone velgen",
    price: "€65,-",
    duration: "2 uur",
    image: exteriorImage,
  },
  {
    title: "Interieur + Exterieur Pakket",
    description: "Complete behandeling binnen en buiten voor een volledig gereinigde auto",
    price: "€85,-",
    duration: "3 uur",
    image: interiorImage,
  },
  {
    title: "Ceramic & Wax Coating",
    description: "Beschermende coating voor langdurige glans en bescherming",
    price: "€35,-",
    duration: "1,5 uur",
    image: coatingImage,
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Onze <span className="text-primary">Diensten</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Professionele car detailing treatments voor elk type voertuig
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="overflow-hidden group hover:shadow-glow transition-smooth gradient-card border-border animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <span className="text-2xl font-bold text-primary">
                    {service.price}
                  </span>
                </div>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duur: {service.duration}
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
      </div>
    </section>
  );
};
