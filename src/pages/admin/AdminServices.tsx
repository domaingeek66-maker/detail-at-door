import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Pencil, Trash2, Clock, Euro, Upload, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_min: "",
    image_url: "",
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name");

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    setServices(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `service-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setSelectedFile(file);
      
      toast({
        title: "Afbeelding geüpload",
        description: "De afbeelding is succesvol geüpload",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload fout",
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "" });
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_min: parseInt(formData.duration_min),
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    if (selectedService) {
      const { error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", selectedService.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij bijwerken",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Dienst bijgewerkt",
        description: "De dienst is succesvol bijgewerkt",
      });
    } else {
      const { error } = await supabase
        .from("services")
        .insert([serviceData]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij toevoegen",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Dienst toegevoegd",
        description: "De dienst is succesvol toegevoegd",
      });
    }

    setDialogOpen(false);
    resetForm();
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration_min: service.duration_min.toString(),
      image_url: service.image_url || "",
      is_active: service.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", selectedService.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij verwijderen",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Dienst verwijderd",
      description: "De dienst is succesvol verwijderd",
    });

    setDeleteDialogOpen(false);
    setSelectedService(null);
    fetchServices();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_min: "",
      image_url: "",
      is_active: true,
    });
    setSelectedService(null);
    setSelectedFile(null);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Diensten</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Beheer je diensten en prijzen
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Dienst
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedService ? "Dienst bewerken" : "Nieuwe dienst toevoegen"}
              </DialogTitle>
              <DialogDescription>
                Vul de gegevens in voor de dienst. De duur wordt gebruikt voor het berekenen van beschikbare tijdslots.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prijs (€) *</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_min">Duur (minuten) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration_min"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration_min}
                      onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                      className="pl-10"
                      required
                      placeholder="bijv. 60, 90, 120"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bepaalt hoeveel tijd wordt geblokkeerd in het boekingssysteem
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_upload">Afbeelding</Label>
                <div className="space-y-3">
                  {formData.image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.image_url} 
                        alt="Service preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="image_upload" className="cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          Klik om een afbeelding te uploaden
                        </span>
                      </Label>
                      <Input
                        id="image_upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploadingImage}
                      />
                    </div>
                  )}
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Of plak een URL"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-muted-foreground">Bezig met uploaden...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Actief (tonen op website)</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Annuleren
                </Button>
                <Button type="submit">
                  {selectedService ? "Bijwerken" : "Toevoegen"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div>
                    <div className="text-lg">{service.name}</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {service.is_active ? "✓ Actief" : "✗ Inactief"}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">€{service.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{service.duration_min} min</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(service)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead className="text-right">Prijs</TableHead>
                <TableHead className="text-right">Duur</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {service.description}
                  </TableCell>
                  <TableCell className="text-right">
                    €{service.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {service.duration_min} min
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={service.is_active ? "text-green-600" : "text-muted-foreground"}>
                      {service.is_active ? "✓ Actief" : "✗ Inactief"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. Dit zal de dienst permanent verwijderen.
              {selectedService && (
                <span className="block mt-2 font-semibold">
                  Dienst: {selectedService.name}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
