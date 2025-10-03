import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";
import { nl } from "date-fns/locale";
import { Trash2, FileText, Calendar as CalendarIcon, Clock, User, Car, Search, Euro, Users, CheckCircle2, AlertTriangle } from "lucide-react";
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

interface Service {
  id: string;
  price: number;
}

type PeriodFilter = "all" | "week" | "month" | "year";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchCustomersCount();
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

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("id, price");

    if (error) {
      console.error("Error fetching services:", error);
      return;
    }

    setServices(data || []);
  };

  const fetchCustomersCount = async () => {
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching customers count:", error);
      return;
    }

    setTotalCustomers(count || 0);
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

  const getFilteredAppointmentsByPeriod = () => {
    const now = new Date();
    let startDate: Date;

    switch (periodFilter) {
      case "week":
        startDate = startOfWeek(now, { locale: nl });
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
      default:
        return appointments;
    }

    return appointments.filter((appointment) =>
      isAfter(new Date(appointment.appointment_date), startDate)
    );
  };

  const filteredAppointmentsByPeriod = getFilteredAppointmentsByPeriod();

  const filteredAppointments = filteredAppointmentsByPeriod.filter((appointment) => {
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

  const calculateRevenue = () => {
    return filteredAppointmentsByPeriod.reduce((total, appointment) => {
      if (appointment.status === "cancelled") return total;
      
      const servicesTotal = appointment.service_ids.reduce((sum, serviceId) => {
        const service = services.find((s) => s.id === serviceId);
        return sum + (service?.price || 0);
      }, 0);

      return total + servicesTotal + (appointment.travel_cost || 0);
    }, 0);
  };

  const getCompletedAppointments = () => {
    return filteredAppointmentsByPeriod.filter(
      (appointment) => appointment.status === "completed"
    ).length;
  };

  const handleResetData = async () => {
    try {
      // Delete all appointments
      const { error: appointmentsError } = await supabase
        .from("appointments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (appointmentsError) throw appointmentsError;

      // Delete all customers
      const { error: customersError } = await supabase
        .from("customers")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (customersError) throw customersError;

      toast({
        title: "Data gereset",
        description: "Alle afspraken en klanten zijn verwijderd",
      });

      // Refresh data
      fetchAppointments();
      fetchCustomersCount();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fout bij resetten",
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Overzicht van je bedrijf
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reset Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Weet je het zeker?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold text-foreground">
                  Deze actie kan NIET ongedaan worden gemaakt!
                </p>
                <p>
                  Alle volgende data wordt permanent verwijderd:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Alle afspraken</li>
                  <li>Alle klantgegevens</li>
                </ul>
                <p className="text-destructive font-medium mt-4">
                  Ben je absoluut zeker dat je door wilt gaan?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Nee, annuleren</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ja, alles verwijderen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-6">
        <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecteer periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle tijd</SelectItem>
            <SelectItem value="week">Deze week</SelectItem>
            <SelectItem value="month">Deze maand</SelectItem>
            <SelectItem value="year">Dit jaar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{calculateRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodFilter === "all" ? "Sinds het begin" : 
               periodFilter === "week" ? "Deze week" :
               periodFilter === "month" ? "Deze maand" : "Dit jaar"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Alle tijd</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afspraken</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppointmentsByPeriod.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodFilter === "all" ? "Alle afspraken" : 
               periodFilter === "week" ? "Deze week" :
               periodFilter === "month" ? "Deze maand" : "Dit jaar"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedAppointments()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodFilter === "all" ? "Sinds het begin" : 
               periodFilter === "week" ? "Deze week" :
               periodFilter === "month" ? "Deze maand" : "Dit jaar"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Afspraken</h3>
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
