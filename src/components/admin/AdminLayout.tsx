import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Users, Settings, Clock, Menu, FileText, Phone, BookOpen, Image, Briefcase, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      await supabase.auth.signOut();
      navigate("/admin/login");
      return;
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Uitgelogd",
      description: "Tot ziens!",
    });
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Navigatie</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/dashboard") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Afspraken
                    </Button>
                  </Link>
                  <Link to="/admin/customers" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/customers") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Klanten
                    </Button>
                  </Link>
                  <Link to="/admin/services" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/services") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Diensten
                    </Button>
                  </Link>
                  <Link to="/admin/availability" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/availability") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Beschikbaarheid
                    </Button>
                  </Link>
                  <Link to="/admin/blog-posts" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/blog-posts") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Blog Posts
                    </Button>
                  </Link>
                  <Link to="/admin/portfolio" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/portfolio") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link to="/admin/about" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/about") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Over Ons
                    </Button>
                  </Link>
                  <Link to="/admin/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/contact") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </Link>
                  <Link to="/admin/broadcast" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/broadcast") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      WhatsApp Broadcast
                    </Button>
                  </Link>
                  <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/admin/settings") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Instellingen
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} size="sm" className="text-xs sm:text-sm">
            <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Uitloggen</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex gap-4 sm:gap-8">
          {/* Desktop Sidebar */}
          <nav className="hidden lg:block w-64 space-y-2 shrink-0">
            <Link to="/admin/dashboard">
              <Button
                variant={isActive("/admin/dashboard") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Afspraken
              </Button>
            </Link>
            <Link to="/admin/customers">
              <Button
                variant={isActive("/admin/customers") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Klanten
              </Button>
            </Link>
            <Link to="/admin/services">
              <Button
                variant={isActive("/admin/services") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Diensten
              </Button>
            </Link>
            <Link to="/admin/availability">
              <Button
                variant={isActive("/admin/availability") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Clock className="mr-2 h-4 w-4" />
                Beschikbaarheid
              </Button>
            </Link>
            <Link to="/admin/blog-posts">
              <Button
                variant={isActive("/admin/blog-posts") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Blog Posts
              </Button>
            </Link>
            <Link to="/admin/portfolio">
              <Button
                variant={isActive("/admin/portfolio") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Image className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
            </Link>
            <Link to="/admin/about">
              <Button
                variant={isActive("/admin/about") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Over Ons
              </Button>
            </Link>
            <Link to="/admin/contact">
              <Button
                variant={isActive("/admin/contact") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </Link>
            <Link to="/admin/broadcast">
              <Button
                variant={isActive("/admin/broadcast") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Send className="mr-2 h-4 w-4" />
                WhatsApp Broadcast
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant={isActive("/admin/settings") ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Instellingen
              </Button>
            </Link>
          </nav>


          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
