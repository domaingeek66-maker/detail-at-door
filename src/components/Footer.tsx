import { Link } from "react-router-dom";
import { Car, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Cardetail Exclusief</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium car detailing service aan huis voor de meest veeleisende klanten.
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
              <li>Exterior & Velgen</li>
              <li>Interieur + Exterieur</li>
              <li>Ceramic Coating</li>
              <li>Wax Behandeling</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+31 6 12345678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@cardetail-exclusief.nl</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Nederland</span>
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
