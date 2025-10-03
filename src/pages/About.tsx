import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Shield, Heart, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Over <span className="text-primary">Cardetail Exclusief</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Premium car detailing service met passie voor perfectie
              </p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <div className="gradient-card p-8 rounded-lg border border-border">
                <h2 className="text-3xl font-bold mb-4">Onze Missie</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Bij Cardetail Exclusief geloven we dat uw auto meer is dan alleen vervoer - het is een investering die de beste zorg verdient. 
                  Daarom brengen we premium car detailing services direct naar uw deur, zodat u kunt genieten van een perfecte auto zonder uw huis te verlaten.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="gradient-card p-6 rounded-lg border border-border">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Professioneel</h3>
                  <p className="text-muted-foreground">
                    Ervaren specialisten met hoogwaardige producten en technieken voor het beste resultaat.
                  </p>
                </div>

                <div className="gradient-card p-6 rounded-lg border border-border">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Betrouwbaar</h3>
                  <p className="text-muted-foreground">
                    Transparante prijzen, duidelijke afspraken en altijd op tijd. Uw tevredenheid is gegarandeerd.
                  </p>
                </div>

                <div className="gradient-card p-6 rounded-lg border border-border">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Met Passie</h3>
                  <p className="text-muted-foreground">
                    We behandelen elke auto met dezelfde zorg en aandacht alsof het onze eigen auto is.
                  </p>
                </div>

                <div className="gradient-card p-6 rounded-lg border border-border">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Premium Kwaliteit</h3>
                  <p className="text-muted-foreground">
                    Alleen de beste producten en methoden voor een resultaat dat uw verwachtingen overtreft.
                  </p>
                </div>
              </div>

              <div className="gradient-card p-8 rounded-lg border border-border text-center">
                <h2 className="text-3xl font-bold mb-4">Waarom Cardetail Exclusief?</h2>
                <ul className="space-y-4 text-lg text-muted-foreground text-left max-w-2xl mx-auto">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Professionele 3-staps handwash behandeling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Premium producten voor optimale bescherming</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Flexibele afspraken op uw locatie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Transparante prijzen zonder verrassingen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>WhatsApp updates en herinneringen</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link to="/boeking">
                  <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                    Plan Nu Uw Afspraak
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
