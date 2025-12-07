import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Cardetail Exclusief logo" className="w-6 h-6" />
              <span className="font-bold text-lg">Cardetail Exclusief</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium car detailing service aan huis. Wij komen naar u toe voor het perfecte resultaat.
            </p>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/diensten" className="text-muted-foreground hover:text-primary transition-smooth">
                  Diensten
                </Link>
              </li>
              <li>
                <Link to="/over-ons" className="text-muted-foreground hover:text-primary transition-smooth">
                  Over Ons
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Diensten</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/boeking" className="text-muted-foreground hover:text-primary transition-smooth">
                  Exterior & Velgen
                </Link>
              </li>
              <li>
                <Link to="/boeking" className="text-muted-foreground hover:text-primary transition-smooth">
                  Interieur + Exterieur
                </Link>
              </li>
              <li>
                <Link to="/boeking" className="text-muted-foreground hover:text-primary transition-smooth">
                  Ceramic Coating
                </Link>
              </li>
              <li>
                <Link to="/boeking" className="text-muted-foreground hover:text-primary transition-smooth">
                  Wax Behandeling
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <a 
                href="tel:+31621116963" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>+31 6 21116963</span>
              </a>
              
              <a 
                href="mailto:cardetail.exclusief@gmail.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="break-all">cardetail.exclusief@gmail.com</span>
              </a>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Landelijk actief</span>
              </div>
              
              <a 
                href="https://www.instagram.com/cardetail.exclusief/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Instagram className="w-4 h-4 text-primary" />
                <span>@cardetail.exclusief</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Cardetail Exclusief. Alle rechten voorbehouden.</p>
            <p>
              Built by{" "}
              <a 
                href="https://ontwikkelaars.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-smooth underline"
              >
                Ontwikkelaars.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
