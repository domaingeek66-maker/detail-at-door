import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";

interface OpeningHour {
  day: string;
  hours: string;
}

interface ContactContent {
  whatsapp: string;
  phone: string;
  email: string;
  work_area: string;
  opening_hours: OpeningHour[];
}

export default function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState<ContactContent>({
    whatsapp: "",
    phone: "",
    email: "",
    work_area: "",
    opening_hours: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", "contact")
      .maybeSingle();

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle || "");
      setContent(data.content as unknown as ContactContent);
    }
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("page_content")
      .update({
        title,
        subtitle,
        content: content as any
      })
      .eq("page_key", "contact");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij opslaan",
        description: error.message,
      });
      setSaving(false);
      return;
    }

    toast({
      title: "Opgeslagen",
      description: "Contact pagina succesvol bijgewerkt",
    });
    setSaving(false);
  };

  const addOpeningHour = () => {
    setContent({
      ...content,
      opening_hours: [...content.opening_hours, { day: "", hours: "" }]
    });
  };

  const removeOpeningHour = (index: number) => {
    setContent({
      ...content,
      opening_hours: content.opening_hours.filter((_, i) => i !== index)
    });
  };

  const updateOpeningHour = (index: number, field: "day" | "hours", value: string) => {
    const updated = [...content.opening_hours];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, opening_hours: updated });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Contact Beheren</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Bewerk de content van de "Contact" pagina
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoofdgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Hoofdtitel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Neem Contact Op"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Ondertitel</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Heeft u vragen of wilt u een afspraak maken?"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactgegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Nummer</Label>
              <Input
                id="whatsapp"
                value={content.whatsapp}
                onChange={(e) => setContent({...content, whatsapp: e.target.value})}
                placeholder="+31612345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                value={content.phone}
                onChange={(e) => setContent({...content, phone: e.target.value})}
                placeholder="+31612345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={content.email}
                onChange={(e) => setContent({...content, email: e.target.value})}
                placeholder="info@cardetail-exclusief.nl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work-area">Werkgebied</Label>
              <Input
                id="work-area"
                value={content.work_area}
                onChange={(e) => setContent({...content, work_area: e.target.value})}
                placeholder="Landelijk actief"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Openingstijden</CardTitle>
              <Button onClick={addOpeningHour} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.opening_hours.map((hour, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={hour.day}
                    onChange={(e) => updateOpeningHour(index, "day", e.target.value)}
                    placeholder="Maandag - Vrijdag"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={hour.hours}
                    onChange={(e) => updateOpeningHour(index, "hours", e.target.value)}
                    placeholder="09:00 - 17:00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOpeningHour(index)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {content.opening_hours.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Geen openingstijden toegevoegd. Klik op "Toevoegen" om te beginnen.
              </p>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={saveContent} 
          disabled={saving}
          size="lg"
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Wijzigingen Opslaan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}