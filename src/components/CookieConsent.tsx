import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowConsent(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
      <Card className="max-w-4xl mx-auto p-4 md:p-6 bg-background/95 backdrop-blur-lg border shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Deze website gebruikt cookies
              </p>
              <p className="text-xs text-muted-foreground">
                We gebruiken functionele cookies om de website goed te laten werken en analytische cookies om te begrijpen hoe bezoekers onze website gebruiken. Door op "Accepteren" te klikken, ga je akkoord met het gebruik van deze cookies.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 md:flex-none"
            >
              Weigeren
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 md:flex-none"
            >
              Accepteren
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
