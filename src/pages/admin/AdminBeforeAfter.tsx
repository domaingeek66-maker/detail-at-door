import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, MoveUp, MoveDown } from "lucide-react";

interface BeforeAfterItem {
  id: string;
  title: string;
  before_image_url: string;
  after_image_url: string;
  sort_order: number;
  is_active: boolean;
}

const AdminBeforeAfter = () => {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<BeforeAfterItem> | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("before_after_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Fout bij laden items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    if (!editingItem.title || !editingItem.before_image_url || !editingItem.after_image_url) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    try {
      if (editingItem.id) {
        const { error } = await supabase
          .from("before_after_items")
          .update({
            title: editingItem.title,
            before_image_url: editingItem.before_image_url,
            after_image_url: editingItem.after_image_url,
            is_active: editingItem.is_active ?? true,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Item bijgewerkt");
      } else {
        const maxOrder = items.length > 0 
          ? Math.max(...items.map(item => item.sort_order))
          : 0;

        const { error } = await supabase
          .from("before_after_items")
          .insert([{
            title: editingItem.title,
            before_image_url: editingItem.before_image_url,
            after_image_url: editingItem.after_image_url,
            sort_order: maxOrder + 1,
            is_active: editingItem.is_active ?? true,
          }]);

        if (error) throw error;
        toast.success("Item toegevoegd");
      }

      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error("Fout bij opslaan: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) return;

    try {
      const { error } = await supabase
        .from("before_after_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Item verwijderd");
      fetchItems();
    } catch (error: any) {
      toast.error("Fout bij verwijderen: " + error.message);
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const currentItem = newItems[index];
    const targetItem = newItems[targetIndex];

    try {
      await supabase
        .from("before_after_items")
        .update({ sort_order: targetItem.sort_order })
        .eq("id", currentItem.id);

      await supabase
        .from("before_after_items")
        .update({ sort_order: currentItem.sort_order })
        .eq("id", targetItem.id);

      fetchItems();
      toast.success("Volgorde bijgewerkt");
    } catch (error: any) {
      toast.error("Fout bij wijzigen volgorde: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Voor & Na Slider Beheer</h1>
        <Button onClick={() => setEditingItem({})}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Slider
        </Button>
      </div>

      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem.id ? "Bewerk Slider" : "Nieuwe Slider"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={editingItem.title || ""}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="bijv. Exterieur Reiniging"
              />
            </div>

            <div>
              <Label htmlFor="before_image">Voor Foto URL *</Label>
              <Input
                id="before_image"
                value={editingItem.before_image_url || ""}
                onChange={(e) => setEditingItem({ ...editingItem, before_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="after_image">Na Foto URL *</Label>
              <Input
                id="after_image"
                value={editingItem.after_image_url || ""}
                onChange={(e) => setEditingItem({ ...editingItem, after_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editingItem.is_active ?? true}
                onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_active: checked })}
              />
              <Label htmlFor="is_active">Actief</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Opslaan</Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {!item.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inactief</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Voor:</p>
                      <img 
                        src={item.before_image_url} 
                        alt="Before" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Na:</p>
                      <img 
                        src={item.after_image_url} 
                        alt="After" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingItem(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && !editingItem && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nog geen voor & na sliders toegevoegd</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBeforeAfter;
