import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Users } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function AdminBroadcast() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Fout",
        description: "Kon klanten niet ophalen",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: "Fout",
        description: "Voer een bericht in",
        variant: "destructive",
      });
      return;
    }

    if (customers.length === 0) {
      toast({
        title: "Fout",
        description: "Geen klanten gevonden om naar te sturen",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-broadcast", {
        body: {
          message: message.trim(),
          customers: customers.map(c => ({
            name: c.name,
            phone: c.phone,
          })),
        },
      });

      if (error) throw error;

      toast({
        title: "Succesvol verzonden",
        description: `Bericht verzonden naar ${customers.length} klanten`,
      });

      setMessage("");
    } catch (error: any) {
      console.error("Error sending broadcast:", error);
      toast({
        title: "Fout bij verzenden",
        description: error.message || "Kon berichten niet verzenden. Controleer of de Twilio instellingen correct zijn.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const messageTemplates = [
    {
      title: "Nieuwjaarswens",
      content: "Beste klant, wij wensen u een gelukkig en voorspoedig nieuwjaar! Bedankt voor uw vertrouwen in ons. 🎉",
    },
    {
      title: "Feestdagen",
      content: "Fijne feestdagen gewenst! Wij zijn er ook dit jaar weer voor al uw detailing behoeften. 🎄",
    },
    {
      title: "Speciale aanbieding",
      content: "Speciale actie deze maand! Boek nu en ontvang 10% korting op onze diensten. Geldig t/m einde maand. 🚗✨",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Broadcast</h1>
        <p className="text-muted-foreground">
          Verstuur berichten naar alle klanten via WhatsApp
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ontvangers
            </CardTitle>
            <CardDescription>
              {customers.length} klanten zullen dit bericht ontvangen
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bericht sjablonen</CardTitle>
            <CardDescription>Klik op een sjabloon om deze te gebruiken</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {messageTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3 px-4 text-left"
                onClick={() => setMessage(template.content)}
              >
                <div>
                  <div className="font-semibold">{template.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {template.content}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bericht</CardTitle>
            <CardDescription>
              Schrijf uw bericht voor alle klanten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Bericht tekst</Label>
              <Textarea
                id="message"
                placeholder="Typ hier uw bericht..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {message.length} karakters
              </p>
            </div>

            <Button
              onClick={handleSendBroadcast}
              disabled={isSending || !message.trim()}
              className="w-full"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met verzenden...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Verstuur naar {customers.length} klanten
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
