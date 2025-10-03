import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock } from "lucide-react";

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

export default function AdminAvailability() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .order("day_of_week");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    // Initialize all days if not present
    const allDays = DAYS.map((_, index) => {
      const existing = data?.find((a) => a.day_of_week === index);
      return existing || {
        id: crypto.randomUUID(),
        day_of_week: index,
        start_time: "09:00:00",
        end_time: "17:00:00",
        is_active: index >= 1 && index <= 5, // Monday to Friday active by default
      };
    });

    setAvailability(allDays);
    setLoading(false);
  };

  const handleTimeChange = (dayIndex: number, field: "start_time" | "end_time", value: string) => {
    setAvailability(
      availability.map((a) =>
        a.day_of_week === dayIndex ? { ...a, [field]: value + ":00" } : a
      )
    );
  };

  const handleActiveChange = (dayIndex: number, checked: boolean) => {
    setAvailability(
      availability.map((a) =>
        a.day_of_week === dayIndex ? { ...a, is_active: checked } : a
      )
    );
  };

  const saveAvailability = async () => {
    setSaving(true);

    for (const av of availability) {
      // Check if record exists
      const { data: existing } = await supabase
        .from("availability")
        .select("id")
        .eq("day_of_week", av.day_of_week)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("availability")
          .update({
            start_time: av.start_time,
            end_time: av.end_time,
            is_active: av.is_active,
          })
          .eq("day_of_week", av.day_of_week);

        if (error) {
          toast({
            variant: "destructive",
            title: "Fout bij opslaan",
            description: error.message,
          });
          setSaving(false);
          return;
        }
      } else {
        // Insert new
        const { error } = await supabase.from("availability").insert({
          day_of_week: av.day_of_week,
          start_time: av.start_time,
          end_time: av.end_time,
          is_active: av.is_active,
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Fout bij opslaan",
            description: error.message,
          });
          setSaving(false);
          return;
        }
      }
    }

    toast({
      title: "Opgeslagen",
      description: "Beschikbaarheid succesvol bijgewerkt",
    });
    setSaving(false);
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Beschikbaarheid</h2>
        <p className="text-muted-foreground mt-2">
          Stel de openingstijden in per dag van de week
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {availability.map((av) => (
          <div
            key={av.day_of_week}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background/50"
          >
            <div className="w-32 font-medium">{DAYS[av.day_of_week]}</div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={av.is_active}
                onCheckedChange={(checked) => handleActiveChange(av.day_of_week, checked)}
              />
              <span className="text-sm text-muted-foreground">
                {av.is_active ? "Open" : "Gesloten"}
              </span>
            </div>

            {av.is_active && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`start-${av.day_of_week}`} className="sr-only">
                    Start tijd
                  </Label>
                  <Input
                    id={`start-${av.day_of_week}`}
                    type="time"
                    value={av.start_time.substring(0, 5)}
                    onChange={(e) => handleTimeChange(av.day_of_week, "start_time", e.target.value)}
                    className="w-32"
                  />
                </div>

                <span className="text-muted-foreground">tot</span>

                <div className="flex items-center gap-2">
                  <Label htmlFor={`end-${av.day_of_week}`} className="sr-only">
                    Eind tijd
                  </Label>
                  <Input
                    id={`end-${av.day_of_week}`}
                    type="time"
                    value={av.end_time.substring(0, 5)}
                    onChange={(e) => handleTimeChange(av.day_of_week, "end_time", e.target.value)}
                    className="w-32"
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button onClick={saveAvailability} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Opslaan..." : "Beschikbaarheid Opslaan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
