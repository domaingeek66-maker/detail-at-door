import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface Setting {
  key: string;
  value: string | null;
  description: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("key");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    setSettings(data || []);
    setLoading(false);
  };

  const handleValueChange = (key: string, value: string) => {
    setSettings(settings.map(s => 
      s.key === key ? { ...s, value } : s
    ));
  };

  const saveSettings = async () => {
    setSaving(true);

    for (const setting of settings) {
      const { error } = await supabase
        .from("settings")
        .update({ value: setting.value })
        .eq("key", setting.key);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij opslaan",
          description: `Kon ${setting.key} niet opslaan: ${error.message}`,
        });
        setSaving(false);
        return;
      }
    }

    toast({
      title: "Opgeslagen",
      description: "Alle instellingen zijn succesvol opgeslagen",
    });
    setSaving(false);
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      RESEND_API_KEY: "Resend API Key",
      WHATSAPP_ACCESS_TOKEN: "WhatsApp Access Token",
      WHATSAPP_PHONE_NUMBER_ID: "WhatsApp Phone Number ID",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "WhatsApp Business Account ID",
    };
    return labels[key] || key;
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">API Instellingen</h2>
        <p className="text-muted-foreground mt-2">
          Configureer je API keys voor notificaties
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <Label htmlFor={setting.key}>
                {getSettingLabel(setting.key)}
              </Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}
              <Input
                id={setting.key}
                type="password"
                value={setting.value || ""}
                onChange={(e) => handleValueChange(setting.key, e.target.value)}
                placeholder={`Voer ${getSettingLabel(setting.key)} in`}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Opslaan..." : "Instellingen Opslaan"}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">📚 API Keys verkrijgen:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Resend:</strong> Maak een account op{" "}
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                resend.com
              </a>
              {" "}en maak een API key aan
            </li>
            <li>
              <strong>WhatsApp:</strong> Registreer je app op{" "}
              <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Meta Developers
              </a>
              {" "}en voeg WhatsApp toe
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
