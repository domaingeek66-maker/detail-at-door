import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/95 backdrop-blur-lg"
            onClick={closeMenu}
          />
          <nav className="relative h-full flex flex-col p-6 pt-20">
            <div className="flex flex-col gap-6">
              <Link
                to="/"
                onClick={closeMenu}
                className="text-2xl font-semibold hover:text-primary transition-smooth"
              >
                Home
              </Link>
              <Link
                to="/diensten"
                onClick={closeMenu}
                className="text-2xl font-semibold hover:text-primary transition-smooth"
              >
                Diensten
              </Link>
              <Link
                to="/over-ons"
                onClick={closeMenu}
                className="text-2xl font-semibold hover:text-primary transition-smooth"
              >
                Over Ons
              </Link>
              <Link
                to="/contact"
                onClick={closeMenu}
                className="text-2xl font-semibold hover:text-primary transition-smooth"
              >
                Contact
              </Link>
              <Link to="/boeking" onClick={closeMenu} className="mt-4">
                <Button className="w-full gradient-primary shadow-glow" size="lg">
                  Plan Afspraak
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
