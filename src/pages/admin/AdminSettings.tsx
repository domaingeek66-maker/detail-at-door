import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, UserPlus, Trash2, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Setting {
  key: string;
  value: string | null;
  description: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [updatingAuth, setUpdatingAuth] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
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

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen admins",
        description: error.message,
      });
      return;
    }

    setAdmins(data || []);
  };


  const updatePassword = async () => {
    if (!currentPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Vul alle wachtwoordvelden in",
      });
      return;
    }

    if (currentPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Wachtwoorden komen niet overeen",
      });
      return;
    }

    if (currentPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Wachtwoord moet minimaal 6 tekens lang zijn",
      });
      return;
    }

    setUpdatingAuth(true);
    const { error } = await supabase.auth.updateUser({
      password: currentPassword,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij wijzigen wachtwoord",
        description: error.message,
      });
    } else {
      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je wachtwoord is succesvol gewijzigd",
      });
      setCurrentPassword("");
      setConfirmPassword("");
    }
    setUpdatingAuth(false);
  };

  const createAdminUser = async () => {
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Vul email en wachtwoord in",
      });
      return;
    }

    if (newAdminPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Wachtwoord moet minimaal 6 tekens lang zijn",
      });
      return;
    }

    setCreatingAdmin(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newAdminEmail,
          password: newAdminPassword,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Fout bij aanmaken admin');
      }

      toast({
        title: "Admin aangemaakt",
        description: `Admin account voor ${newAdminEmail} is succesvol aangemaakt`,
      });

      setNewAdminEmail("");
      setNewAdminPassword("");
      fetchAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fout bij aanmaken admin",
        description: error.message || "Er ging iets mis",
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const removeAdminRole = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij verwijderen",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Admin verwijderd",
      description: "Admin rechten zijn verwijderd",
    });
    fetchAdmins();
    setAdminToDelete(null);
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
      gmail_user: "Gmail E-mailadres",
      gmail_client_id: "Gmail OAuth Client ID",
      gmail_client_secret: "Gmail OAuth Client Secret",
      gmail_refresh_token: "Gmail OAuth Refresh Token",
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
    if (key.includes('secret') || key.includes('token') || key.includes('password')) {
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
      {/* Admin Account Beheer */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Account Beheer</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Wijzig je login gegevens en beheer admin accounts
          </p>
        </div>

        <div className="max-w-md">
          {/* Wachtwoord wijzigen */}
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Wachtwoord wijzigen</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input
                id="new-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Minimaal 6 tekens"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Herhaal wachtwoord"
              />
            </div>
            <Button 
              onClick={updatePassword} 
              disabled={updatingAuth || !currentPassword || !confirmPassword}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              {updatingAuth ? "Bezig..." : "Wachtwoord wijzigen"}
            </Button>
          </Card>
        </div>
      </div>

      {/* Admin Beheer */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Admin Gebruikers</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Beheer wie toegang heeft tot het admin panel
          </p>
        </div>

        <div className="space-y-4">
          {/* Huidige admins */}
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Huidige Admins ({admins.length})</h3>
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-mono">{admin.user_id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdminToDelete(admin.user_id)}
                    disabled={admins.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-sm text-muted-foreground">Geen admins gevonden</p>
              )}
            </div>
          </Card>

          {/* Nieuwe admin toevoegen */}
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Nieuwe Admin Aanmaken</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Maak een nieuwe admin gebruiker aan met e-mail en wachtwoord. 
              De gebruiker kan direct inloggen zonder e-mailbevestiging.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-admin-email">E-mailadres</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  placeholder="admin@voorbeeld.nl"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-password">Wachtwoord</Label>
                <Input
                  id="new-admin-password"
                  type="password"
                  placeholder="Minimaal 6 tekens"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createAdminUser();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={createAdminUser}
                disabled={creatingAdmin || !newAdminEmail || !newAdminPassword}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {creatingAdmin ? "Aanmaken..." : "Admin Aanmaken"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

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
            <h3 className="font-semibold mb-2 text-sm sm:text-base">📚 Gmail OAuth instellen:</h3>
            <ol className="space-y-2 text-xs sm:text-sm text-muted-foreground list-decimal list-inside">
              <li>
                Ga naar{" "}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Cloud Console
                </a>
                {" "}en maak een OAuth 2.0 Client ID aan (Web application)
              </li>
              <li>
                Voeg <code className="bg-background px-1 rounded">http://localhost</code> toe aan Authorized redirect URIs
              </li>
              <li>
                Kopieer Client ID en Client Secret naar de velden hierboven
              </li>
              <li>
                Gebruik{" "}
                <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  OAuth 2.0 Playground
                </a>
                {" "}met scope <code className="bg-background px-1 rounded">https://www.googleapis.com/auth/gmail.send</code> om een Refresh Token te verkrijgen
              </li>
              <li>
                Plak de Refresh Token in het veld hierboven
              </li>
            </ol>
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

      {/* Delete Admin Confirmation Dialog */}
      <AlertDialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin rechten verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de admin rechten wilt verwijderen van deze gebruiker?
              Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => adminToDelete && removeAdminRole(adminToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
