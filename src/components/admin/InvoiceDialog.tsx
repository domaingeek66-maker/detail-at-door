import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_min: number;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    vehicle_make: string;
    vehicle_model: string;
    notes: string;
    service_ids: string[];
    customers: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export function InvoiceDialog({ open, onOpenChange, appointment }: InvoiceDialogProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && appointment.service_ids?.length > 0) {
      fetchServices();
    }
  }, [open, appointment.service_ids]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .in("id", appointment.service_ids);

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const total = services.reduce((sum, service) => sum + Number(service.price), 0);
  const btw = total * 0.21;
  const totalWithBtw = total + btw;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl sm:text-2xl">Factuur</DialogTitle>
          <DialogDescription className="sr-only">
            Bekijk en download de factuur voor deze afspraak
          </DialogDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handlePrint} variant="outline" size="sm" className="w-full sm:w-auto">
              <Printer className="h-4 w-4 mr-2" />
              Afdrukken
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Downloaden als PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="invoice-content p-4 sm:p-8 bg-white text-black print:p-12" id="invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">FACTUUR</h1>
              <p className="text-xs sm:text-sm text-gray-600">Factuurnummer: {appointment.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs sm:text-sm text-gray-600">Datum: {format(new Date(), "dd MMMM yyyy", { locale: nl })}</p>
            </div>
            <div className="sm:text-right">
              <h2 className="font-bold text-lg sm:text-xl mb-2">Car Detail Exclusief</h2>
              <p className="text-xs sm:text-sm text-gray-600">Adres bedrijf</p>
              <p className="text-xs sm:text-sm text-gray-600">Postcode, Stad</p>
              <p className="text-xs sm:text-sm text-gray-600">BTW: BE0123456789</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Factuuradres:</h3>
            <p className="text-xs sm:text-sm">{appointment.customers.name}</p>
            <p className="text-xs sm:text-sm text-gray-600">{appointment.customers.email}</p>
            <p className="text-xs sm:text-sm text-gray-600">{appointment.customers.phone}</p>
          </div>

          {/* Appointment Details */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Afspraak Details:</h3>
            <p className="text-xs sm:text-sm">
              Datum: {format(new Date(appointment.appointment_date), "dd MMMM yyyy", { locale: nl })} om {appointment.appointment_time}
            </p>
            <p className="text-xs sm:text-sm">
              Voertuig: {appointment.vehicle_make} {appointment.vehicle_model}
            </p>
          </div>

          {/* Services Table */}
          <div className="overflow-x-auto mb-6 sm:mb-8">
            <table className="w-full">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="text-left py-2 text-xs sm:text-sm">Dienst</th>
                  <th className="text-right py-2 text-xs sm:text-sm">Duur</th>
                  <th className="text-right py-2 text-xs sm:text-sm">Prijs</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-xs sm:text-sm">Laden...</td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="border-b border-gray-200">
                      <td className="py-3 text-xs sm:text-sm">{service.name}</td>
                      <td className="text-right py-3 text-xs sm:text-sm">{service.duration_min} min</td>
                      <td className="text-right py-3 text-xs sm:text-sm">€ {Number(service.price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:w-64">
              <div className="flex justify-between py-2 text-xs sm:text-sm">
                <span>Subtotaal:</span>
                <span>€ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-xs sm:text-sm">
                <span>BTW (21%):</span>
                <span>€ {btw.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-sm sm:text-lg">
                <span>Totaal:</span>
                <span>€ {totalWithBtw.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Opmerkingen:</h3>
              <p className="text-xs sm:text-sm text-gray-600">{appointment.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600">
            <p>Bedankt voor uw vertrouwen in Car Detail Exclusief</p>
            <p className="mt-2">Betaling binnen 14 dagen na factuurdatum</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
