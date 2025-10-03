import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-detailing.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            Exclusieve Car Detailing{" "}
            <span className="text-primary">bij u aan huis</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Premium car detailing service die naar u toekomt. Professionele behandeling zonder dat u uw huis hoeft te verlaten.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {[
              "Wij komen bij u aan huis",
              "Transparante prijzen",
              "Betaling op locatie",
              "WhatsApp bevestiging"
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border"
              >
                <div className="bg-primary/20 p-2 rounded-full">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/boeking">
              <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                Plan Direct Uw Afspraak
              </Button>
            </Link>
            <Link to="/diensten">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Bekijk Diensten
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
