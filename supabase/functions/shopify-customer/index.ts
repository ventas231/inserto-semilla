import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizeShopDomain(raw: string): string {
  let s = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const adminMatch = s.match(/admin\.shopify\.com\/store\/([^\/]+)/);
  if (adminMatch) {
    s = `${adminMatch[1]}.myshopify.com`;
  }
  if (!s.includes(".myshopify.com")) {
    s = `${s}.myshopify.com`;
  }
  return s;
}

async function getAccessToken(storeUrl: string): Promise<string> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("shopify_tokens")
    .select("access_token")
    .eq("shop_domain", storeUrl)
    .maybeSingle();

  if (error || !data?.access_token) {
    console.error("[TOKEN] No token found in database for:", storeUrl);
    throw new Error("No Shopify access token found. Please authorize the app first via /shopify-oauth?action=start");
  }

  console.log("[TOKEN] Retrieved access token from database");
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");

    if (!SHOPIFY_STORE_URL) {
      throw new Error("SHOPIFY_STORE_URL not configured");
    }

    const { email, firstName, code, acceptsMarketing } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email y código son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storeUrl = normalizeShopDomain(SHOPIFY_STORE_URL);

    // Get access token from database
    let accessToken: string;
    try {
      accessToken = await getAccessToken(storeUrl);
    } catch (err) {
      console.error("[TOKEN] Error:", err);
      return new Response(
        JSON.stringify({ success: false, message: "No se pudo guardar. Intenta de nuevo.", error: "Token not available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiBase = `https://${storeUrl}/admin/api/2024-01`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    };

    const tag = "landing_prelaunch";

    // Search for existing customer
    console.log(`[CUSTOMER] Searching for customer: ${email}`);
    const searchRes = await fetch(
      `${apiBase}/customers/search.json?query=email:${encodeURIComponent(email)}`,
      { headers }
    );
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      console.error(`[CUSTOMER] Search failed [${searchRes.status}]: ${JSON.stringify(searchData)}`);
      throw new Error(`Shopify search failed [${searchRes.status}]`);
    }

    if (searchData.customers && searchData.customers.length > 0) {
      // Update existing customer
      const customer = searchData.customers[0];
      console.log(`[CUSTOMER] Found existing customer: ${customer.id}`);

      const existingTags = customer.tags ? customer.tags.split(", ") : [];
      if (!existingTags.includes(tag)) existingTags.push(tag);

      const updateBody: Record<string, unknown> = {
        customer: {
          id: customer.id,
          tags: existingTags.join(", "),
          email_marketing_consent: {
            state: acceptsMarketing ? "subscribed" : "not_subscribed",
            opt_in_level: "single_opt_in",
          },
          metafields: [{
            namespace: "custom",
            key: "promo_code",
            value: code,
            type: "single_line_text_field",
          }],
        },
      };

      if (firstName) {
        (updateBody.customer as Record<string, unknown>).first_name = firstName;
      }

      console.log(`[CUSTOMER] Updating customer ${customer.id}...`);
      const updateRes = await fetch(`${apiBase}/customers/${customer.id}.json`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updateBody),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        console.error(`[CUSTOMER] Update failed [${updateRes.status}]: ${JSON.stringify(updateData)}`);
        throw new Error(`Shopify update failed [${updateRes.status}]`);
      }

      console.log(`[CUSTOMER] Customer ${customer.id} updated`);
      return new Response(
        JSON.stringify({
          success: true,
          isNew: false,
          message: "Este correo ya estaba registrado. Ya actualizamos tu información.",
          customer_id: customer.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new customer
      console.log("[CUSTOMER] Creating new customer...");

      const createBody: Record<string, unknown> = {
        customer: {
          email,
          tags: tag,
          email_marketing_consent: {
            state: acceptsMarketing ? "subscribed" : "not_subscribed",
            opt_in_level: "single_opt_in",
          },
          metafields: [{
            namespace: "custom",
            key: "promo_code",
            value: code,
            type: "single_line_text_field",
          }],
        },
      };

      if (firstName) {
        (createBody.customer as Record<string, unknown>).first_name = firstName;
      }

      const createRes = await fetch(`${apiBase}/customers.json`, {
        method: "POST",
        headers,
        body: JSON.stringify(createBody),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        console.error(`[CUSTOMER] Create failed [${createRes.status}]: ${JSON.stringify(createData)}`);
        throw new Error(`Shopify create failed [${createRes.status}]`);
      }

      console.log(`[CUSTOMER] Customer created: ${createData.customer?.id}`);
      return new Response(
        JSON.stringify({
          success: true,
          isNew: true,
          message: "Gracias, ya quedaste registrado.",
          customer_id: createData.customer?.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("[ERROR]:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg, message: "No se pudo guardar. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
