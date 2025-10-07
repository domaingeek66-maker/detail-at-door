import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
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
import { CheckCircle2, Calendar as CalendarIcon, User, Car as CarIcon, Tag, X, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const bookingSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn").max(100),
  email: z.string().email("Ongeldig e-mailadres").max(255),
  phone: z.string().min(10, "Ongeldig telefoonnummer").max(20),
  streetAddress: z.string().min(5, "Straat en huisnummer is verplicht").max(200),
  postalCode: z.string().min(4, "Postcode is verplicht").max(10),
  city: z.string().min(2, "Plaats is verplicht").max(100),
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
  const [travelInfo, setTravelInfo] = useState<{
    distance: number;
    travel_cost: number;
    outside_service_area: boolean;
  } | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
        const errorMessages: string[] = [];
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof BookingForm] = err.message;
            errorMessages.push(err.message);
          }
        });
        setErrors(newErrors);
        setSubmitError(`Controleer de volgende velden: ${errorMessages.join(', ')}`);
        throw new Error("Validatie mislukt");
      }
      
      setErrors({});
      setSubmitError(null);

      // Calculate prices
      const originalPrice = (services?.filter(s => selectedServices.includes(s.id))
        .reduce((sum, s) => sum + Number(s.price), 0) || 0) + (travelInfo?.travel_cost || 0);
      
      const discountAmount = appliedDiscount?.amount || 0;
      const finalPrice = originalPrice - discountAmount;

      // Create customer using secure RPC function with validation
      const { data: customerId, error: customerError } = await supabase
        .rpc('create_customer', {
          _name: formData.name!,
          _email: formData.email!,
          _phone: formData.phone!,
          _address: `${formData.streetAddress}, ${formData.postalCode} ${formData.city}`,
        });

      if (customerError) {
        let errorMsg = "Fout bij aanmaken klantgegevens. ";
        if (customerError.message.includes("email")) {
          errorMsg += "Controleer uw e-mailadres.";
        } else if (customerError.message.includes("phone")) {
          errorMsg += "Controleer uw telefoonnummer (formaat: +31612345678).";
        } else if (customerError.message.includes("Name")) {
          errorMsg += "Controleer uw naam (minimaal 2 karakters).";
        } else if (customerError.message.includes("Address")) {
          errorMsg += "Controleer uw adres (minimaal 5 karakters).";
        } else {
          errorMsg += customerError.message;
        }
        throw new Error(errorMsg);
      }

      // Create appointment with separated address fields and travel cost
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          customer_id: customerId,
          service_ids: selectedServices,
          vehicle_make: formData.vehicleMake!,
          vehicle_model: formData.vehicleModel!,
          appointment_date: format(selectedDate!, 'yyyy-MM-dd'),
          appointment_time: selectedTime + ':00',
          notes: formData.notes || null,
          status: 'pending',
          street_address: formData.streetAddress!,
          postal_code: formData.postalCode!,
          city: formData.city!,
          travel_cost: travelInfo?.travel_cost || 0,
          distance_km: travelInfo?.distance || 0,
          discount_code_id: appliedDiscount?.id || null,
          original_price: originalPrice,
          discount_amount: discountAmount,
          final_price: finalPrice,
        });

      if (appointmentError) {
        let errorMsg = "Fout bij aanmaken afspraak. ";
        if (appointmentError.message.includes("vehicle")) {
          errorMsg += "Controleer het automerk en -model.";
        } else {
          errorMsg += "Probeer het opnieuw of neem contact met ons op.";
        }
        throw new Error(errorMsg);
      }

      // Update discount code usage if applied
      if (appliedDiscount) {
        const { data: currentDiscount } = await supabase
          .from('discount_codes')
          .select('times_used')
          .eq('id', appliedDiscount.id)
          .single();
        
        if (currentDiscount) {
          await supabase
            .from('discount_codes')
            .update({ times_used: currentDiscount.times_used + 1 })
            .eq('id', appliedDiscount.id);
        }
      }
    },
    onSuccess: () => {
      setStep(5);
      setSubmitError(null);
      toast.success("Afspraak succesvol ingepland!");
    },
    onError: (error: Error) => {
      console.error('Booking error:', error);
      if (error.message !== "Validatie mislukt") {
        setSubmitError(error.message);
        toast.error(error.message);
      } else {
        toast.error("Controleer alle verplichte velden");
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

  const calculateTotalPrice = () => {
    const serviceTotal = services?.filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + Number(s.price), 0) || 0;
    const travelCost = travelInfo?.travel_cost || 0;
    return serviceTotal + travelCost;
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;

    setIsValidatingDiscount(true);
    setDiscountError("");

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setDiscountError("Ongeldige kortingscode");
        setAppliedDiscount(null);
        return;
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom) {
        setDiscountError("Deze kortingscode is nog niet geldig");
        setAppliedDiscount(null);
        return;
      }

      if (validUntil && now > validUntil) {
        setDiscountError("Deze kortingscode is verlopen");
        setAppliedDiscount(null);
        return;
      }

      if (data.max_uses && data.times_used >= data.max_uses) {
        setDiscountError("Deze kortingscode is niet meer geldig");
        setAppliedDiscount(null);
        return;
      }

      const totalPrice = calculateTotalPrice();
      
      if (totalPrice < data.min_order_amount) {
        setDiscountError(`Minimaal bestelbedrag is €${data.min_order_amount}`);
        setAppliedDiscount(null);
        return;
      }

      const discountAmount = data.discount_type === 'percentage'
        ? (totalPrice * data.discount_value) / 100
        : data.discount_value;

      setAppliedDiscount({
        id: data.id,
        code: data.code,
        type: data.discount_type as 'percentage' | 'fixed',
        value: data.discount_value,
        amount: Math.min(discountAmount, totalPrice),
      });

      toast.success(`Kortingscode toegepast! €${Math.min(discountAmount, totalPrice).toFixed(2)} korting`);
    } catch (error) {
      console.error("Error validating discount:", error);
      setDiscountError("Fout bij valideren kortingscode");
      setAppliedDiscount(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode("");
    setAppliedDiscount(null);
    setDiscountError("");
  };

  const handleNext = async () => {
    if (step === 1 && selectedServices.length === 0) {
      toast.error("Selecteer minimaal één dienst");
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.error("Selecteer een datum en tijd");
      return;
    }
    if (step === 3) {
      // Validate address fields and calculate travel cost
      if (!formData.streetAddress || !formData.postalCode || !formData.city) {
        toast.error("Vul alle adresvelden in");
        return;
      }

      try {
        toast.loading("Afstand berekenen...");
        const { data, error } = await supabase.functions.invoke('calculate-travel-cost', {
          body: {
            street_address: formData.streetAddress,
            postal_code: formData.postalCode,
            city: formData.city,
          },
        });

        toast.dismiss();

        if (error) throw error;

        setTravelInfo(data);

        if (data.outside_service_area) {
          toast.warning(
            `Dit adres ligt ${data.distance} km van ons (${data.service_area_radius} km radius). Extra reiskosten: €${data.travel_cost}`,
            { duration: 6000 }
          );
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Kon afstand niet berekenen. Controleer het adres.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    createBooking.mutate();
  };

  if (step === 5) {
    return (
      <>
        <SEO 
          title="Afspraak Bevestigd - Bedankt voor Uw Boeking"
          description="Uw car detailing afspraak is succesvol bevestigd. U ontvangt een bevestiging via WhatsApp."
          url="https://cardetail-exclusief.nl/boeking"
        />
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
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Boek Een Afspraak - Plan Direct Uw Car Detailing"
        description="Plan uw car detailing afspraak aan huis in enkele stappen. Kies uw dienst, datum en locatie. Direct online boeken met WhatsApp bevestiging."
        keywords="car detailing boeken, afspraak maken, online booking, mobiel car wash"
        url="https://cardetail-exclusief.nl/boeking"
      />
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
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fout bij invullen</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
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
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">📍 Uw Adres (waar mogen we langskomen?)</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="streetAddress">Straat en Huisnummer *</Label>
                        <Input 
                          id="streetAddress"
                          value={formData.streetAddress || ''}
                          onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                          placeholder="Hoofdstraat 123"
                        />
                        {errors.streetAddress && <p className="text-sm text-destructive mt-1">{errors.streetAddress}</p>}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode">Postcode *</Label>
                          <Input 
                            id="postalCode"
                            value={formData.postalCode || ''}
                            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                            placeholder="1100 AA"
                          />
                          {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>}
                        </div>
                        <div>
                          <Label htmlFor="city">Plaats *</Label>
                          <Input 
                            id="city"
                            value={formData.city || ''}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            placeholder="Eindhoven"
                          />
                          {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                        </div>
                      </div>
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
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Kan boeking niet plaatsen</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Gekozen Diensten</h3>
                    <ul className="space-y-1">
                      {services?.filter(s => selectedServices.includes(s.id)).map(s => (
                        <li key={s.id} className="text-muted-foreground flex justify-between">
                          <span>• {s.name}</span>
                          <span>€{s.price}</span>
                        </li>
                      ))}
                      {travelInfo && travelInfo.travel_cost > 0 && (
                        <li className="text-amber-600 flex justify-between border-t border-border pt-1 mt-1">
                          <span>• Reiskosten ({travelInfo.distance} km)</span>
                          <span>€{travelInfo.travel_cost.toFixed(2)}</span>
                        </li>
                      )}
                    </ul>

                    {!appliedDiscount ? (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <Label htmlFor="discountCode" className="text-sm">Kortingscode (optioneel)</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="discountCode"
                            value={discountCode}
                            onChange={(e) => {
                              setDiscountCode(e.target.value.toUpperCase());
                              setDiscountError("");
                            }}
                            placeholder="KORTINGSCODE"
                            className="flex-1"
                          />
                          <Button 
                            onClick={validateDiscountCode}
                            disabled={!discountCode.trim() || isValidatingDiscount}
                            size="sm"
                          >
                            {isValidatingDiscount ? "..." : "Toepassen"}
                          </Button>
                        </div>
                        {discountError && (
                          <p className="text-sm text-destructive mt-2">{discountError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                              Kortingscode toegepast: {appliedDiscount.code}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              {appliedDiscount.type === 'percentage' 
                                ? `${appliedDiscount.value}% korting` 
                                : `€${appliedDiscount.value} korting`}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={removeDiscount}>
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    )}

                    {appliedDiscount && (
                      <div className="mt-3 pt-3 border-t border-border space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotaal:</span>
                          <span>€{calculateTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Korting:</span>
                          <span>- €{appliedDiscount.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-border flex justify-between font-bold text-lg">
                      <span>Totaal:</span>
                      <span>
                        €{(calculateTotalPrice() - (appliedDiscount?.amount || 0)).toFixed(2)}
                      </span>
                    </div>
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
                    <p className="text-muted-foreground">
                      {formData.streetAddress}, {formData.postalCode} {formData.city}
                    </p>
                    {travelInfo && travelInfo.travel_cost > 0 && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Dit adres ligt {travelInfo.distance} km van ons. Extra reiskosten: €{travelInfo.travel_cost.toFixed(2)}
                      </p>
                    )}
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
    </>
  );
};

export default Booking;
