import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Image as ImageIcon, Star, ArrowUp, ArrowDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
  customer_name: string;
  rating: number;
  review: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    setItems(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const { title, image_url, customer_name, rating, review, is_active, sort_order } = editingItem;

    if (!title || !image_url || !customer_name || !review) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Vul alle verplichte velden in",
      });
      return;
    }

    if (editingItem.id) {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ title, image_url, customer_name, rating, review, is_active, sort_order })
        .eq("id", editingItem.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij updaten",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Bijgewerkt",
        description: "Portfolio item is bijgewerkt",
      });
    } else {
      const { error } = await supabase
        .from("portfolio_items")
        .insert([{ title, image_url, customer_name, rating, review, is_active, sort_order }]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij toevoegen",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Toegevoegd",
        description: "Portfolio item is toegevoegd",
      });
    }

    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) return;

    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij verwijderen",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Verwijderd",
      description: "Portfolio item is verwijderd",
    });
    fetchItems();
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === items.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentItem = items[currentIndex];
    const swapItem = items[newIndex];

    const { error } = await supabase
      .from("portfolio_items")
      .update({ sort_order: swapItem.sort_order })
      .eq("id", currentItem.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error.message,
      });
      return;
    }

    const { error: error2 } = await supabase
      .from("portfolio_items")
      .update({ sort_order: currentItem.sort_order })
      .eq("id", swapItem.id);

    if (error2) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: error2.message,
      });
      return;
    }

    fetchItems();
  };

  if (loading) return <div>Laden...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Portfolio Beheer</h2>
          <p className="text-muted-foreground">Beheer je portfolio items en reviews</p>
        </div>
        <Button onClick={() => setEditingItem({
          id: "",
          title: "",
          image_url: "",
          customer_name: "",
          rating: 5,
          review: "",
          sort_order: items.length,
          is_active: true,
        })}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuw Item
        </Button>
      </div>

      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem.id ? "Item Bewerken" : "Nieuw Item"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titel *</Label>
              <Input
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="Volvo Premium Detailing"
              />
            </div>

            <div>
              <Label>Afbeelding URL *</Label>
              <Input
                value={editingItem.image_url}
                onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                placeholder="https://..."
              />
              {editingItem.image_url && (
                <img src={editingItem.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
              )}
            </div>

            <div>
              <Label>Klantnaam *</Label>
              <Input
                value={editingItem.customer_name}
                onChange={(e) => setEditingItem({ ...editingItem, customer_name: e.target.value })}
                placeholder="Jan de Vries"
              />
            </div>

            <div>
              <Label>Rating (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setEditingItem({ ...editingItem, rating: star })}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= editingItem.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Review *</Label>
              <Textarea
                value={editingItem.review}
                onChange={(e) => setEditingItem({ ...editingItem, review: e.target.value })}
                placeholder="Fantastisch werk! Mijn auto ziet er weer uit als nieuw..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editingItem.is_active}
                onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_active: checked })}
              />
              <Label>Actief</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Opslaan</Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Annuleren</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(item.id, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(item.id, "down")}
                  disabled={index === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="h-24 w-24 object-cover rounded" />
              ) : (
                <div className="h-24 w-24 bg-muted rounded flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.customer_name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.review}</p>
                {!item.is_active && (
                  <span className="text-xs text-destructive">Inactief</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                  Bewerken
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
