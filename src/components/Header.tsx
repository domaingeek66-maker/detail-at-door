import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Car className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Cardetail Exclusief</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-primary transition-smooth">
              Home
            </Link>
            <Link to="/diensten" className="hover:text-primary transition-smooth">
              Diensten
            </Link>
            <Link to="/over-ons" className="hover:text-primary transition-smooth">
              Over Ons
            </Link>
            <Link to="/contact" className="hover:text-primary transition-smooth">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/boeking">
              <Button className="gradient-primary shadow-glow">
                Plan Afspraak
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
