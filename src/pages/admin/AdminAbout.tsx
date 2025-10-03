import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface AboutContent {
  mission_title: string;
  mission_text: string;
  why_us_title: string;
  why_us_points: string[];
}

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState<AboutContent>({
    mission_title: "",
    mission_text: "",
    why_us_title: "",
    why_us_points: []
  });
  const [whyUsInput, setWhyUsInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", "about")
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
      const aboutContent = data.content as unknown as AboutContent;
      setContent(aboutContent);
      setWhyUsInput(aboutContent.why_us_points.join("\n"));
    }
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);

    const whyUsPoints = whyUsInput.split("\n").filter(p => p.trim());
    
    const { error } = await supabase
      .from("page_content")
      .update({
        title,
        subtitle,
        content: {
          ...content,
          why_us_points: whyUsPoints
        }
      })
      .eq("page_key", "about");

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
      description: "Over ons pagina succesvol bijgewerkt",
    });
    setSaving(false);
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
        <h2 className="text-2xl sm:text-3xl font-bold">Over Ons Beheren</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Bewerk de content van de "Over Ons" pagina
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
                placeholder="Over Cardetail Exclusief"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Ondertitel</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Premium car detailing service met passie voor perfectie"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missie Sectie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission-title">Missie Titel</Label>
              <Input
                id="mission-title"
                value={content.mission_title}
                onChange={(e) => setContent({...content, mission_title: e.target.value})}
                placeholder="Onze Missie"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission-text">Missie Tekst</Label>
              <Textarea
                id="mission-text"
                value={content.mission_text}
                onChange={(e) => setContent({...content, mission_text: e.target.value})}
                placeholder="Beschrijf uw missie..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waarom Ons Sectie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="why-title">Waarom Ons Titel</Label>
              <Input
                id="why-title"
                value={content.why_us_title}
                onChange={(e) => setContent({...content, why_us_title: e.target.value})}
                placeholder="Waarom Cardetail Exclusief?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why-points">Waarom Ons Punten (één per regel)</Label>
              <Textarea
                id="why-points"
                value={whyUsInput}
                onChange={(e) => setWhyUsInput(e.target.value)}
                placeholder="Punt 1&#10;Punt 2&#10;Punt 3"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Voer elke reden op een nieuwe regel in
              </p>
            </div>
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