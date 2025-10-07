import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-detailing.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero sectie">
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
      
      <div className="container mx-auto px-4 relative z-10 pt-20 pb-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            Exclusieve Car Detailing aan Huis{" "}
            <span className="text-primary">Nederland</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            Premium car detailing service die naar u toekomt. Professionele behandeling zonder dat u uw huis hoeft te verlaten.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-8">
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
                <div className="bg-primary/20 p-2 rounded-full shrink-0">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-left">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link to="/boeking" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gradient-primary shadow-glow text-base sm:text-lg px-6 sm:px-8">
                Plan Direct Uw Afspraak
              </Button>
            </Link>
            <Link to="/diensten" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                Bekijk Diensten
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
