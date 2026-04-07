import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    const { email, firstName } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerBody: Record<string, unknown> = {
      customer: {
        email,
        tags: "recetario",
        email_marketing_consent: {
          state: "subscribed",
          opt_in_level: "single_opt_in",
        },
      },
    };

    if (firstName) {
      (customerBody.customer as Record<string, unknown>).first_name = firstName;
    }

    console.log(`[CUSTOMER] Creating customer: ${email}`);
    const res = await fetch(
      "https://specializedsocks.myshopify.com/admin/api/2024-01/customers.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify(customerBody),
      }
    );

    const data = await res.json();

    if (res.ok) {
      console.log(`[CUSTOMER] Created: ${data.customer?.id}`);
      return new Response(
        JSON.stringify({ success: true, isNew: true, message: "¡Gracias! Ya quedaste registrado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 422 = customer already exists — treat as success
    if (res.status === 422) {
      console.log(`[CUSTOMER] Already exists: ${email}`);
      return new Response(
        JSON.stringify({ success: true, isNew: false, message: "Este correo ya estaba registrado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error(`[CUSTOMER] Shopify error [${res.status}]:`, JSON.stringify(data));
    throw new Error(`Shopify API error [${res.status}]`);
  } catch (error: unknown) {
    console.error("[ERROR]:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg, message: "No se pudo guardar. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
