import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Cardetail Exclusief logo" className="w-6 h-6" />
              <span className="font-bold text-lg">Cardetail Exclusief</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium car detailing service aan huis
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-smooth">Home</Link></li>
              <li><Link to="/diensten" className="hover:text-primary transition-smooth">Diensten</Link></li>
              <li><Link to="/over-ons" className="hover:text-primary transition-smooth">Over Ons</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Diensten</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/boeking" className="hover:text-primary transition-smooth">Exterior & Velgen</Link></li>
              <li><Link to="/boeking" className="hover:text-primary transition-smooth">Interieur + Exterieur</Link></li>
              <li><Link to="/boeking" className="hover:text-primary transition-smooth">Ceramic Coating</Link></li>
              <li><Link to="/boeking" className="hover:text-primary transition-smooth">Wax Behandeling</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 leading-none">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+31621116963" className="hover:text-primary transition-smooth whitespace-nowrap leading-none">+31621116963</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:cardetail.exclusief@gmail.com" className="hover:text-primary transition-smooth whitespace-nowrap leading-none">cardetail.exclusief@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Landelijk actief</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Cardetail Exclusief. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
};
