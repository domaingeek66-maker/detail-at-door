import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Calendar as CalendarIcon, User, Car as CarIcon } from "lucide-react";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn").max(100),
  email: z.string().email("Ongeldig e-mailadres").max(255),
  phone: z.string().min(10, "Ongeldig telefoonnummer").max(20),
  address: z.string().min(5, "Adres moet minimaal 5 karakters zijn").max(200),
  vehicleMake: z.string().min(2, "Merk is verplicht").max(50),
  vehicleModel: z.string().min(2, "Model is verplicht").max(50),
  notes: z.string().max(500).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<Partial<BookingForm>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const navigate = useNavigate();

  // Clear selected time when services or date changes
  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
    setSelectedTime(""); // Reset time when services change
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: availability } = useQuery({
    queryKey: ['availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Get available timeslots based on selected services and date
  const { data: timeslots, isLoading: timeslotsLoading } = useQuery({
    queryKey: ['timeslots', selectedDate, selectedServices],
    queryFn: async () => {
      if (!selectedDate || selectedServices.length === 0) return [];
      
      const { data, error } = await supabase.functions.invoke('available-timeslots', {
        body: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          serviceIds: selectedServices,
        },
      });

      if (error) throw error;
      return data.timeslots || [];
    },
    enabled: !!selectedDate && selectedServices.length > 0,
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      // Validate form
      const validationResult = bookingSchema.safeParse(formData);
      if (!validationResult.success) {
        const newErrors: Partial<Record<keyof BookingForm, string>> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof BookingForm] = err.message;
          }
        });
        setErrors(newErrors);
        throw new Error("Validatie mislukt");
      }
      
      setErrors({});

      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.name!,
          email: formData.email!,
          phone: formData.phone!,
          address: formData.address!,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          customer_id: customer.id,
          service_ids: selectedServices,
          vehicle_make: formData.vehicleMake!,
          vehicle_model: formData.vehicleModel!,
          appointment_date: format(selectedDate!, 'yyyy-MM-dd'),
          appointment_time: selectedTime + ':00',
          notes: formData.notes || null,
          status: 'pending',
        });

      if (appointmentError) throw appointmentError;
    },
    onSuccess: () => {
      setStep(5);
      toast.success("Afspraak succesvol ingepland!");
    },
    onError: (error: Error) => {
      console.error('Booking error:', error);
      if (error.message !== "Validatie mislukt") {
        toast.error("Er ging iets mis. Probeer het opnieuw.");
      }
    },
  });

  const getAvailableDays = () => {
    if (!availability) return [];
    return availability.map(a => a.day_of_week);
  };

  const isDateDisabled = (date: Date) => {
    const availableDays = getAvailableDays();
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !availableDays.includes(dayOfWeek) || date < today;
  };

  // Calculate total duration for display
  const getTotalDuration = () => {
    if (!services || selectedServices.length === 0) return 0;
    return services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.duration_min, 0);
  };

  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) {
      toast.error("Selecteer minimaal één dienst");
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.error("Selecteer een datum en tijd");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    createBooking.mutate();
  };

  if (step === 5) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Afspraak Bevestigd!
              </h1>
              <div className="gradient-card p-8 rounded-lg border border-border space-y-4">
                <p className="text-lg text-muted-foreground">
                  Uw afspraak is succesvol ingepland. U ontvangt binnen enkele minuten een bevestiging via WhatsApp en e-mail.
                </p>
                <p className="text-lg text-muted-foreground">
                  <strong className="text-foreground">Belangrijk:</strong> Betaling gebeurt bij uitvoering van de dienst op locatie (contant of pin).
                </p>
                <p className="text-muted-foreground">
                  U ontvangt 24 uur voor uw afspraak een herinnering.
                </p>
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <Button onClick={() => navigate('/')} size="lg">
                  Terug naar Home
                </Button>
                <Button onClick={() => navigate('/diensten')} variant="outline" size="lg">
                  Bekijk Diensten
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
                Plan Uw <span className="text-primary">Afspraak</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                In enkele stappen naar een perfect gereinigde auto
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-max px-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2 sm:gap-4">
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-smooth ${
                        step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && <div className={`w-8 sm:w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Select Services */}
            {step === 1 && (
              <Card className="gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Kies Uw Diensten</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Selecteer één of meerdere diensten</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services?.map((service) => (
                    <div 
                      key={service.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary transition-smooth cursor-pointer"
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <Checkbox 
                        checked={selectedServices.includes(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg">{service.name}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-primary font-bold text-sm sm:text-base">€{service.price},-</span>
                          <span className="text-xs sm:text-sm text-muted-foreground">{service.duration_min} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleNext} className="w-full gradient-primary shadow-glow" size="lg">
                    Volgende Stap
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <Card className="gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Kies Datum & Tijd
                  </CardTitle>
                  <CardDescription>Selecteer wanneer wij langs mogen komen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base sm:text-lg mb-4 block">Datum</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={isDateDisabled}
                        locale={nl}
                        className="rounded-md border border-border p-2 sm:p-3 scale-90 sm:scale-100 origin-top"
                      />
                    </div>
                  </div>
                  
                  {selectedDate && (
                    <>
                      <div className="bg-primary/10 rounded-lg p-4 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Totale duur:</strong> {getTotalDuration()} minuten
                          <br />
                          <span className="text-xs">We plannen voldoende tijd in voor uw diensten</span>
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-lg mb-4 block">Beschikbare tijden</Label>
                        {timeslotsLoading ? (
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Beschikbare tijden laden...</p>
                          </div>
                        ) : timeslots && timeslots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {timeslots.map((slot: { time: string; available: boolean }) => (
                              <Button
                                key={slot.time}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                disabled={!slot.available}
                                size="sm"
                                className={`${selectedTime === slot.time ? "gradient-primary" : ""} text-xs sm:text-sm`}
                              >
                                {slot.time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/50 rounded-lg">
                            <p className="text-muted-foreground">Geen beschikbare tijden voor deze dag</p>
                            <p className="text-sm text-muted-foreground mt-1">Kies een andere datum</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                      Vorige
                    </Button>
                    <Button onClick={handleNext} className="flex-1 gradient-primary shadow-glow">
                      Volgende Stap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Customer Details */}
            {step === 3 && (
              <Card className="gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" />
                    Uw Gegevens
                  </CardTitle>
                  <CardDescription>Vul uw contactgegevens en voertuiginformatie in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Naam *</Label>
                      <Input 
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Jan Jansen"
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="jan@example.com"
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">WhatsApp Nummer *</Label>
                      <Input 
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+31 6 12345678"
                      />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="address">Adres *</Label>
                      <Input 
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Straat 123, Stad"
                      />
                      {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CarIcon className="w-5 h-5 text-primary" />
                      Voertuig Informatie
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleMake">Merk *</Label>
                        <Input 
                          id="vehicleMake"
                          value={formData.vehicleMake || ''}
                          onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                          placeholder="BMW, Mercedes, etc."
                        />
                        {errors.vehicleMake && <p className="text-sm text-destructive mt-1">{errors.vehicleMake}</p>}
                      </div>
                      <div>
                        <Label htmlFor="vehicleModel">Model *</Label>
                        <Input 
                          id="vehicleModel"
                          value={formData.vehicleModel || ''}
                          onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                          placeholder="3 Serie, C-Klasse, etc."
                        />
                        {errors.vehicleModel && <p className="text-sm text-destructive mt-1">{errors.vehicleModel}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
                    <Textarea 
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Bijzondere wensen of opmerkingen..."
                      rows={4}
                    />
                    {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes}</p>}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                      Vorige
                    </Button>
                    <Button onClick={handleNext} className="flex-1 gradient-primary shadow-glow">
                      Volgende Stap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <Card className="gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Controleer Uw Gegevens</CardTitle>
                  <CardDescription>Kijk alles na voordat u bevestigt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Gekozen Diensten</h3>
                    <ul className="space-y-1">
                      {services?.filter(s => selectedServices.includes(s.id)).map(s => (
                        <li key={s.id} className="text-muted-foreground">
                          • {s.name} (€{s.price})
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Datum & Tijd</h3>
                    <p className="text-muted-foreground">
                      {selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale: nl })} om {selectedTime}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Contact Gegevens</h3>
                    <p className="text-muted-foreground">{formData.name}</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                    <p className="text-muted-foreground">{formData.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Voertuig</h3>
                    <p className="text-muted-foreground">{formData.vehicleMake} {formData.vehicleModel}</p>
                  </div>
                  
                  {formData.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Opmerkingen</h3>
                      <p className="text-muted-foreground">{formData.notes}</p>
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Let op:</strong> Betaling gebeurt pas bij uitvoering van de dienst op locatie (contant of pin). 
                      U ontvangt een bevestiging via WhatsApp en e-mail.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                      Vorige
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-1 gradient-primary shadow-glow"
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? "Bezig..." : "Bevestig Afspraak"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;
