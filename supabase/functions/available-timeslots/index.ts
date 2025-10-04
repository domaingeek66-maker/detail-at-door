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

    const { date, serviceIds } = await req.json();

    if (!date || !serviceIds || serviceIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Date and serviceIds are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calculating timeslots for:', { date, serviceIds });

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

    // Fixed 30 minute booking slot duration
    const bookingSlotDuration = 30;
    console.log('Booking slot duration:', bookingSlotDuration, 'minutes');

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
        // Each appointment blocks 30 minutes regardless of service duration
        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + bookingSlotDuration;
        
        console.log(`Appointment at ${apt.appointment_time}: ${startMinutes}-${endMinutes} (${bookingSlotDuration}min)`);
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
    for (let minutes = dayStartMinutes; minutes <= dayEndMinutes - bookingSlotDuration; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Check if this slot overlaps with any occupied range
      const slotEnd = minutes + bookingSlotDuration;
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
