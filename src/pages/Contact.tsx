import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Neem <span className="text-primary">Contact</span> Op
              </h1>
              <p className="text-xl text-muted-foreground">
                Heeft u vragen of wilt u een afspraak maken? We helpen u graag!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>WhatsApp</CardTitle>
                  <CardDescription>
                    Chat direct met ons via WhatsApp voor snelle vragen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="https://wa.me/31612345678" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gradient-primary shadow-glow">
                      <MessageCircle className="w-4 h-4" />
                      Start WhatsApp Chat
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Telefoon</CardTitle>
                  <CardDescription>
                    Bel ons voor directe assistentie en advies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="tel:+31612345678">
                    <Button className="w-full" variant="outline">
                      <Phone className="w-4 h-4" />
                      +31 6 12345678
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>E-mail</CardTitle>
                  <CardDescription>
                    Stuur ons een e-mail met uw vraag of wensen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="mailto:info@cardetail-exclusief.nl">
                    <Button className="w-full" variant="outline">
                      <Mail className="w-4 h-4" />
                      info@cardetail-exclusief.nl
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="gradient-card border-border">
                <CardHeader>
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Werkgebied</CardTitle>
                  <CardDescription>
                    Wij komen bij u aan huis in heel Nederland
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Landelijk actief</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gradient-card border-border">
              <CardHeader>
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Openingstijden</CardTitle>
                <CardDescription>
                  Wij zijn bereikbaar op de volgende tijden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maandag - Vrijdag</span>
                    <span className="font-semibold">09:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Zaterdag</span>
                    <span className="font-semibold">Op afspraak</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Zondag</span>
                    <span className="font-semibold">Gesloten</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Klaar om uw auto te laten stralen?
              </p>
              <a href="/boeking">
                <Button size="lg" className="gradient-primary shadow-glow text-lg px-8">
                  Plan Direct Een Afspraak
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
