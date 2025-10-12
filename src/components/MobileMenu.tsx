import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <button
          className="p-2 hover:bg-muted rounded-lg transition-smooth"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-8">
          <nav className="flex flex-col gap-6 pr-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-xl font-semibold hover:text-primary transition-smooth py-2"
            >
              Home
            </Link>
            <Link
              to="/diensten"
              onClick={closeMenu}
              className="text-xl font-semibold hover:text-primary transition-smooth py-2"
            >
              Diensten
            </Link>
            <Link
              to="/blog"
              onClick={closeMenu}
              className="text-xl font-semibold hover:text-primary transition-smooth py-2"
            >
              Blog
            </Link>
            <Link
              to="/over-ons"
              onClick={closeMenu}
              className="text-xl font-semibold hover:text-primary transition-smooth py-2"
            >
              Over Ons
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className="text-xl font-semibold hover:text-primary transition-smooth py-2"
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-border">
              <Link to="/boeking" onClick={closeMenu}>
                <Button className="w-full gradient-primary shadow-glow" size="lg">
                  Plan Afspraak
                </Button>
              </Link>
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
