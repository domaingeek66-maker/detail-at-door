import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimeSlot {
  time: string;
  available: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS and access all appointments
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { date, serviceIds, serviceQuantities } = await req.json();

    if (!date || !serviceIds || serviceIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Date and serviceIds are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calculating timeslots for:', { date, serviceIds, serviceQuantities });

    // Get day of week for the date
    // Parse date as local date by adding time component to avoid timezone shifts
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    const dayOfWeek = localDate.getDay();
    
    console.log('Date:', date, 'Day of week:', dayOfWeek);

    // Get availability for this day
    const { data: availability, error: availError } = await supabaseClient
      .from('availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .maybeSingle();

    if (availError) {
      console.error('Error fetching availability:', availError);
      throw availError;
    }

    if (!availability) {
      console.log('No availability for day:', dayOfWeek);
      return new Response(
        JSON.stringify({ timeslots: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get services to calculate total duration
    const { data: services, error: servicesError } = await supabaseClient
      .from('services')
      .select('id, duration_min')
      .in('id', serviceIds);

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      throw servicesError;
    }

    const totalDurationMin = services.reduce((sum, s) => {
      const quantity = serviceQuantities?.[s.id] || 1;
      return sum + (s.duration_min * quantity);
    }, 0);
    console.log('Total duration needed:', totalDurationMin, 'minutes');

    // Get existing appointments for this date
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select('appointment_time, service_ids')
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    // Calculate occupied time ranges
    const occupiedRanges: { start: number; end: number }[] = [];
    
    console.log('Processing appointments:', appointments?.length || 0);
    
    for (const apt of appointments || []) {
      try {
        // Get duration of existing appointment
        const { data: aptServices, error: servicesError } = await supabaseClient
          .from('services')
          .select('duration_min')
          .in('id', apt.service_ids);
        
        if (servicesError) {
          console.error('Error fetching appointment services:', servicesError);
          continue;
        }
        
        if (!aptServices || aptServices.length === 0) {
          console.warn('No services found for appointment:', apt.service_ids);
          continue;
        }
        
        const aptDuration = aptServices.reduce((sum, s) => sum + s.duration_min, 0);
        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + aptDuration;
        
        console.log(`Appointment at ${apt.appointment_time}: ${startMinutes}-${endMinutes} (${aptDuration}min)`);
        occupiedRanges.push({ start: startMinutes, end: endMinutes });
      } catch (error) {
        console.error('Error processing appointment:', error);
      }
    }

    console.log('Occupied ranges:', occupiedRanges);

    // Generate timeslots
    const [startHours, startMinutes] = availability.start_time.split(':').map(Number);
    const [endHours, endMinutes] = availability.end_time.split(':').map(Number);
    
    const dayStartMinutes = startHours * 60 + startMinutes;
    const dayEndMinutes = endHours * 60 + endMinutes;

    const timeslots: TimeSlot[] = [];
    
    // Generate slots every 30 minutes
    for (let minutes = dayStartMinutes; minutes <= dayEndMinutes - totalDurationMin; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Check if this slot + duration overlaps with any occupied range
      const slotEnd = minutes + totalDurationMin;
      const isAvailable = !occupiedRanges.some(range => 
        // Check if there's any overlap
        (minutes < range.end && slotEnd > range.start)
      );
      
      timeslots.push({
        time: timeStr,
        available: isAvailable,
      });
    }

    console.log('Generated timeslots:', timeslots.length);

    return new Response(
      JSON.stringify({ timeslots }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
