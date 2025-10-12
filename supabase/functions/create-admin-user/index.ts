import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminRequest {
  email: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password }: CreateAdminRequest = await req.json();

    if (!email || !password) {
      throw new Error('Email en wachtwoord zijn verplicht');
    }

    if (password.length < 6) {
      throw new Error('Wachtwoord moet minimaal 6 tekens lang zijn');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create user with admin client
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      throw new Error(`Fout bij aanmaken gebruiker: ${createError.message}`);
    }

    if (!userData.user) {
      throw new Error('Gebruiker kon niet worden aangemaakt');
    }

    console.log(`Created user with ID: ${userData.user.id}`);

    // Add admin role to user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin',
      });

    if (roleError) {
      // If role creation fails, try to clean up the user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(`Fout bij toekennen admin rol: ${roleError.message}`);
    }

    console.log(`Assigned admin role to user ${userData.user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: userData.user.id,
        email: userData.user.email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout opgetreden';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
