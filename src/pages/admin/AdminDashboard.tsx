import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Trash2, FileText, Calendar as CalendarIcon, Clock, User, Car, Search } from "lucide-react";
import { InvoiceDialog } from "@/components/admin/InvoiceDialog";
import { Input } from "@/components/ui/input";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  vehicle_make: string;
  vehicle_model: string;
  notes: string;
  customer_id: string;
  service_ids: string[];
  street_address: string;
  postal_code: string;
  city: string;
  travel_cost: number;
  distance_km: number;
  customers: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        customers (name, email, phone)
      `)
      .order("appointment_date", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij ophalen",
        description: error.message,
      });
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fout bij updaten",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Status bijgewerkt",
      description: "De afspraak status is succesvol gewijzigd",
    });
    fetchAppointments();
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze afspraak wilt verwijderen?")) return;

    const { error } = await supabase
      .from("appointments")
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
      description: "De afspraak is verwijderd",
    });
    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status === "pending" && "In afwachting"}
        {status === "confirmed" && "Bevestigd"}
        {status === "completed" && "Voltooid"}
        {status === "cancelled" && "Geannuleerd"}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      appointment.customers.name.toLowerCase().includes(query) ||
      appointment.customers.email.toLowerCase().includes(query) ||
      appointment.customers.phone.toLowerCase().includes(query) ||
      appointment.vehicle_make.toLowerCase().includes(query) ||
      appointment.vehicle_model.toLowerCase().includes(query) ||
      appointment.street_address.toLowerCase().includes(query) ||
      appointment.city.toLowerCase().includes(query) ||
      appointment.postal_code.toLowerCase().includes(query) ||
      appointment.status.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Afspraken Beheer</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Bekijk en beheer alle afspraken
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zoek op klant, voertuig, adres of status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(appointment.appointment_date), "dd MMMM yyyy", { locale: nl })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.customers.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground ml-6">
                      <div>{appointment.customers.email}</div>
                      <div>{appointment.customers.phone}</div>
                      <div className="mt-1 text-xs">
                        📍 {appointment.street_address}, {appointment.postal_code} {appointment.city}
                      </div>
                      {appointment.travel_cost > 0 && (
                        <div className="text-amber-600 text-xs mt-1">
                          🚗 {appointment.distance_km} km · Reiskosten: €{appointment.travel_cost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.vehicle_make} {appointment.vehicle_model}</span>
                  </div>

                  <div className="pt-3 space-y-2">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => updateStatus(appointment.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">In afwachting</SelectItem>
                        <SelectItem value="confirmed">Bevestigd</SelectItem>
                        <SelectItem value="completed">Voltooid</SelectItem>
                        <SelectItem value="cancelled">Geannuleerd</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Factuur
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => deleteAppointment(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Verwijder
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Voertuig</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.appointment_date), "dd MMMM yyyy", { locale: nl })}
                  </TableCell>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell className="font-medium">
                    {appointment.customers.name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{appointment.customers.email}</div>
                      <div className="text-muted-foreground">{appointment.customers.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {appointment.vehicle_make} {appointment.vehicle_model}
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => updateStatus(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">In afwachting</SelectItem>
                          <SelectItem value="confirmed">Bevestigd</SelectItem>
                          <SelectItem value="completed">Voltooid</SelectItem>
                          <SelectItem value="cancelled">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAppointment(appointment)}
                        title="Factuur genereren"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAppointment(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedAppointment && (
        <InvoiceDialog
          open={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}
