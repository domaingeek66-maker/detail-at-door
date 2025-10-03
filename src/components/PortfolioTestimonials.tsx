import portfolio1 from "@/assets/portfolio-1.jpeg";
import portfolio2 from "@/assets/portfolio-2.jpeg";
import portfolio3 from "@/assets/portfolio-3.jpeg";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const portfolioItems = [
  {
    id: 1,
    image: portfolio1,
    alt: "Volvo interieur detailing met bescherming",
    title: "Volvo Premium Detailing",
    customer: "Jan de Vries",
    rating: 5,
    review: "Fantastisch werk! Mijn Volvo ziet er weer uit als nieuw. Het interieur is perfect schoongemaakt."
  },
  {
    id: 2,
    image: portfolio2,
    alt: "Porsche interieur behandeling",
    title: "Porsche Interior Care",
    customer: "Sandra Bakker",
    rating: 5,
    review: "Zeer professioneel en nauwkeurig. De Porsche is perfect verzorgd, echt top service!"
  },
  {
    id: 3,
    image: portfolio3,
    alt: "Volkswagen interieur reiniging",
    title: "Volkswagen Deep Clean",
    customer: "Mohammed Ali",
    rating: 5,
    review: "Geweldig resultaat! Alle vlekken zijn weg en de auto ruikt heerlijk fris. Absoluut een aanrader."
  }
];

export const PortfolioTestimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Ons Werk & Tevreden Klanten
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bekijk onze recente projecten en lees wat onze klanten over ons zeggen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {portfolioItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-semibold">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-3 italic">
                  "{item.review}"
                </p>
                <p className="text-sm font-semibold text-foreground">
                  - {item.customer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
