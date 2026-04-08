import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STOREFRONT_URL = "https://specializedsocks.myshopify.com/api/2024-01/graphql.json";
const STOREFRONT_TOKEN = "85e8e43d4385add11d8292875b2c67de";

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, tags } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If tags array is provided use it; otherwise default to "recetario"
    const tagList: string[] = Array.isArray(tags) && tags.length > 0 ? tags : ["recetario"];

    const input: Record<string, unknown> = {
      email,
      acceptsMarketing: true,
      tags: tagList,
    };

    if (firstName) {
      input.firstName = firstName;
    }

    console.log(`[CUSTOMER] Creating via Storefront API: ${email}, tags: ${tagList.join(", ")}`);

    const res = await fetch(STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: CUSTOMER_CREATE_MUTATION,
        variables: { input },
      }),
    });

    const data = await res.json();
    console.log("[CUSTOMER] Response:", JSON.stringify(data));

    const errors = data?.data?.customerCreate?.customerUserErrors || [];
    const successCodes = ["CUSTOMER_DISABLED", "TAKEN"];

    if (errors.length === 0) {
      return new Response(
        JSON.stringify({ success: true, isNew: true, message: "¡Gracias! Ya quedaste registrado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allHandled = errors.every((e: { code: string }) => successCodes.includes(e.code));
    if (allHandled) {
      console.log(`[CUSTOMER] Already exists or disabled: ${email}`);
      return new Response(
        JSON.stringify({ success: true, isNew: false, message: "Este correo ya estaba registrado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error("[CUSTOMER] Unhandled errors:", JSON.stringify(errors));
    throw new Error(errors.map((e: { message: string }) => e.message).join(", "));
  } catch (error: unknown) {
    console.error("[ERROR]:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg, message: "No se pudo guardar. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
