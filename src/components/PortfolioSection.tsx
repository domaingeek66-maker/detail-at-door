import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import heroImage from "@/assets/hero-detailing.jpg";
import serviceExterior from "@/assets/service-exterior.jpg";
import serviceInterior from "@/assets/service-interior.jpg";
import serviceCoating from "@/assets/service-coating.jpg";

export const PortfolioSection = () => {
  const portfolioItems = [
    { image: heroImage, title: "Premium Detailing" },
    { image: serviceExterior, title: "Exterior & Velgen" },
    { image: serviceInterior, title: "Interieur Reiniging" },
    { image: serviceCoating, title: "Ceramic Coating" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Ons Werk</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Bekijk de resultaten van onze premium car detailing service. 
            Elk project wordt uitgevoerd met de hoogste precisie en aandacht voor detail.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="gap-2"
            onClick={() => window.open('https://www.instagram.com/cardetail.exclusief', '_blank')}
          >
            <Instagram className="w-5 h-5" />
            @cardetail.exclusief
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioItems.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer"
              onClick={() => window.open('https://www.instagram.com/cardetail.exclusief', '_blank')}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
