import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Trash2, FileText } from "lucide-react";
import { InvoiceDialog } from "@/components/admin/InvoiceDialog";

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
  const { toast } = useToast();

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

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Afspraken Beheer</h2>
        <p className="text-muted-foreground mt-2">
          Bekijk en beheer alle afspraken
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
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
            {appointments.map((appointment) => (
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
