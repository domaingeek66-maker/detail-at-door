import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mark van den Berg",
    car: "BMW 5-serie",
    rating: 5,
    text: "Fantastische service! Mijn auto ziet er weer uit als nieuw. De coating houdt al maanden stand.",
    date: "December 2024"
  },
  {
    name: "Sarah Jansen",
    car: "Mercedes C-klasse",
    rating: 5,
    text: "Professioneel werk en super vriendelijk. Ze komen bij je thuis, dat is echt ideaal. Aanrader!",
    date: "November 2024"
  },
  {
    name: "Peter de Vries",
    car: "Audi A6",
    rating: 5,
    text: "Perfecte detailing en uitstekende prijs-kwaliteit verhouding. Het interieur is weer helemaal schoon.",
    date: "Oktober 2024"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Wat Onze <span className="text-primary">Klanten</span> Zeggen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ontdek waarom onze klanten zo enthousiast zijn over onze service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="gradient-card border-border hover:shadow-glow transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.car}</p>
                  <p className="text-xs text-muted-foreground mt-1">{testimonial.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
