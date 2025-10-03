import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

export const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-elegant">
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 lg:gap-3 group transition-smooth hover:scale-105"
          >
            <div className="relative">
              <Car className="w-7 h-7 lg:w-9 lg:h-9 text-primary transition-smooth group-hover:text-primary-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </div>
            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Cardetail Exclusief
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-8">
            <Link 
              to="/" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-smooth group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
            <Link 
              to="/diensten" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-smooth group"
            >
              <span className="relative z-10">Diensten</span>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
            <Link 
              to="/blog" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-smooth group"
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
            <Link 
              to="/over-ons" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-smooth group"
            >
              <span className="relative z-10">Over Ons</span>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
            <Link 
              to="/contact" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-smooth group"
            >
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link to="/boeking">
              <Button className="gradient-primary shadow-glow hover:shadow-[0_0_50px_hsl(215_95%_55%/0.4)] hover:scale-105 transition-all duration-300 text-sm lg:text-base px-4 lg:px-6">
                Plan Afspraak
              </Button>
            </Link>
          </div>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};
