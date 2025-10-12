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
      gmail_user: "Gmail E-mailadres",
      gmail_app_password: "Gmail App-specifiek Wachtwoord",
      service_area_lat: "Startlocatie Breedtegraad",
      service_area_lng: "Startlocatie Lengtegraad",
      service_area_radius_km: "Servicegebied Radius (km)",
      travel_cost_per_km: "Reiskosten per km (€)",
      company_name: "Bedrijfsnaam",
      company_address: "Bedrijfsadres",
      company_postal_city: "Postcode en Plaats",
      company_vat_number: "BTW-nummer",
      company_kvk_number: "KVK-nummer",
      company_email: "E-mailadres",
      company_phone: "Telefoonnummer",
    };
    return labels[key] || key;
  };

  const getSettingType = (key: string) => {
    if (key.includes('API') || key.includes('TOKEN') || key.includes('ACCOUNT') || key.includes('password')) {
      return 'password';
    }
    return 'text';
  };

  const getSettingCategory = (key: string) => {
    if (key.startsWith('service_area') || key.startsWith('travel_cost')) {
      return 'servicegebied';
    }
    if (key.startsWith('company_')) {
      return 'bedrijf';
    }
    return 'api';
  };

  const apiSettings = settings.filter(s => getSettingCategory(s.key) === 'api');
  const serviceAreaSettings = settings.filter(s => getSettingCategory(s.key) === 'servicegebied');
  const companySettings = settings.filter(s => getSettingCategory(s.key) === 'bedrijf');

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bedrijfsinformatie */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Bedrijfsinformatie</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Deze informatie verschijnt op facturen
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            {companySettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {getSettingLabel(setting.key)}
                </Label>
                {setting.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                )}
                <Input
                  id={setting.key}
                  type={getSettingType(setting.key)}
                  value={setting.value || ""}
                  onChange={(e) => handleValueChange(setting.key, e.target.value)}
                  placeholder={`Voer ${getSettingLabel(setting.key)} in`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Servicegebied Instellingen */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Servicegebied Instellingen</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Configureer uw servicegebied en reiskostenberekening
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            {serviceAreaSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {getSettingLabel(setting.key)}
                </Label>
                {setting.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                )}
                <Input
                  id={setting.key}
                  type={getSettingType(setting.key)}
                  value={setting.value || ""}
                  onChange={(e) => handleValueChange(setting.key, e.target.value)}
                  placeholder={`Voer ${getSettingLabel(setting.key)} in`}
                />
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">📍 Coördinaten vinden:</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ga naar{" "}
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Maps
              </a>
              , klik rechts op je startlocatie en kopieer de coördinaten (lat, lng).
            </p>
          </div>
        </div>
      </div>

      {/* API Instellingen */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">API Instellingen</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Configureer je API keys voor notificaties
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            {apiSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {getSettingLabel(setting.key)}
                </Label>
                {setting.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                )}
                <Input
                  id={setting.key}
                  type={getSettingType(setting.key)}
                  value={setting.value || ""}
                  onChange={(e) => handleValueChange(setting.key, e.target.value)}
                  placeholder={`Voer ${getSettingLabel(setting.key)} in`}
                />
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">📚 API Keys verkrijgen:</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <strong>Gmail App Wachtwoord:</strong> Ga naar{" "}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google App Wachtwoorden
                </a>
                {" "}en maak een app-specifiek wachtwoord aan voor 'Mail'
              </li>
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

      {/* Save Button */}
      <div className="flex gap-4">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Opslaan..." : "Alle Instellingen Opslaan"}
        </Button>
      </div>
    </div>
  );
}
