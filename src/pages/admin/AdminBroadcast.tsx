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
  email: string;
}

export default function AdminBroadcast() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subject, setSubject] = useState("");
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
        .select("id, name, email")
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
    if (!subject.trim()) {
      toast({
        title: "Fout",
        description: "Voer een onderwerp in",
        variant: "destructive",
      });
      return;
    }

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
      const { data, error } = await supabase.functions.invoke("send-email-broadcast", {
        body: {
          subject: subject.trim(),
          message: message.trim(),
          customers: customers.map(c => ({
            name: c.name,
            email: c.email,
          })),
        },
      });

      if (error) throw error;

      const totalSent = (data as any)?.totalSent ?? 0;
      const totalFailed = (data as any)?.totalFailed ?? 0;

      toast({
        title: totalFailed > 0 ? "Verzenden deels mislukt" : "Succesvol verzonden",
        description: `Verzonden: ${totalSent} • Mislukt: ${totalFailed}`,
        variant: totalFailed > 0 ? "destructive" : undefined,
      });

      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending broadcast:", error);
      toast({
        title: "Fout bij verzenden",
        description: error.message || "Kon e-mails niet verzonden. Controleer of de EmailJS instellingen correct zijn.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const messageTemplates = [
    {
      title: "Nieuwjaarswens",
      subject: "Gelukkig Nieuwjaar! 🎉",
      content: "Wij wensen u een gelukkig en voorspoedig nieuwjaar! Bedankt voor uw vertrouwen in ons.",
    },
    {
      title: "Feestdagen",
      subject: "Fijne Feestdagen 🎄",
      content: "Fijne feestdagen gewenst! Wij zijn er ook dit jaar weer voor al uw detailing behoeften.",
    },
    {
      title: "Speciale aanbieding",
      subject: "Speciale Actie - 10% Korting! 🚗",
      content: "Speciale actie deze maand! Boek nu en ontvang 10% korting op onze diensten. Geldig t/m einde maand.",
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
        <h1 className="text-3xl font-bold mb-2">E-mail Broadcast</h1>
        <p className="text-muted-foreground">
          Verstuur e-mails naar alle klanten via EmailJS
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
              {customers.length} klanten zullen deze e-mail ontvangen
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
                onClick={() => {
                  setSubject(template.subject);
                  setMessage(template.content);
                }}
              >
                <div>
                  <div className="font-semibold">{template.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <strong>Onderwerp:</strong> {template.subject}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {template.content}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-mail Bericht</CardTitle>
            <CardDescription>
              Schrijf uw e-mail voor alle klanten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Onderwerp</Label>
              <input
                id="subject"
                type="text"
                placeholder="Voer onderwerp in..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

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
              disabled={isSending || !subject.trim() || !message.trim()}
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
