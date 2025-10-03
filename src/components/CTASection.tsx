import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-dark opacity-50" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Klaar voor een <span className="text-primary">Perfecte Detailing?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Boek vandaag nog uw afspraak en ervaar de kwaliteit van professionele car detailing bij u aan huis
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/boeking" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gradient-primary shadow-glow text-lg px-8 group">
                Boek Nu Direct
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                Stel Een Vraag
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              "Snelle WhatsApp bevestiging",
              "Geen reistijd voor u nodig",
              "100% tevredenheidsgarantie"
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 justify-center p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary/20 p-2 rounded-full">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
