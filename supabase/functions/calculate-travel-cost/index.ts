import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TravelCostRequest {
  street_address: string;
  postal_code: string;
  city: string;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { street_address, postal_code, city }: TravelCostRequest = await req.json();

    // Get service area settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["service_area_lat", "service_area_lng", "service_area_radius_km", "travel_cost_per_km"]);

    if (settingsError) throw settingsError;

    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const startLat = parseFloat(settingsMap.service_area_lat || "50.8503");
    const startLng = parseFloat(settingsMap.service_area_lng || "4.3517");
    const radiusKm = parseFloat(settingsMap.service_area_radius_km || "25");
    const costPerKm = parseFloat(settingsMap.travel_cost_per_km || "0.50");

    // Geocode customer address using Nominatim (OpenStreetMap)
    const address = `${street_address}, ${postal_code} ${city}, Belgium`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        "User-Agent": "CarDetailExclusief/1.0",
      },
    });

    if (!geocodeResponse.ok) {
      throw new Error("Geocoding failed");
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData || geocodeData.length === 0) {
      throw new Error("Address not found");
    }

    const customerLat = parseFloat(geocodeData[0].lat);
    const customerLng = parseFloat(geocodeData[0].lon);

    // Calculate distance
    const distance = calculateDistance(startLat, startLng, customerLat, customerLng);

    // Calculate travel cost
    let travelCost = 0;
    let outsideServiceArea = false;

    if (distance > radiusKm) {
      const extraDistance = distance - radiusKm;
      travelCost = extraDistance * costPerKm;
      outsideServiceArea = true;
    }

    return new Response(
      JSON.stringify({
        distance: Math.round(distance * 10) / 10,
        travel_cost: Math.round(travelCost * 100) / 100,
        outside_service_area: outsideServiceArea,
        service_area_radius: radiusKm,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});