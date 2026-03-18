import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory token cache (per isolate)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(storeUrl: string, clientId: string, clientSecret: string): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    console.log("[TOKEN] Using cached access token");
    return cachedToken;
  }

  console.log("[TOKEN] Requesting new access token via client_credentials...");
  const tokenUrl = `https://${storeUrl}/admin/oauth/access_token`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const body = await res.text();
  console.log(`[TOKEN] Response status: ${res.status}`);

  if (!res.ok) {
    console.error(`[TOKEN] Failed to obtain token: ${body}`);
    throw new Error(`Token request failed [${res.status}]: ${body}`);
  }

  const data = JSON.parse(body);
  cachedToken = data.access_token;
  // Default 24h expiry if not provided
  const expiresIn = data.expires_in || 86400;
  tokenExpiresAt = Date.now() + expiresIn * 1000;

  console.log("[TOKEN] Access token obtained successfully");
  return cachedToken!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_API_KEY");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_API_SECRET");

    if (!SHOPIFY_STORE_URL || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
      throw new Error("Shopify credentials not configured (SHOPIFY_STORE_URL, SHOPIFY_API_KEY, SHOPIFY_API_SECRET)");
    }

    const { email, firstName, code, acceptsMarketing } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email y código son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token via client_credentials
    const storeUrl = SHOPIFY_STORE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
    let accessToken: string;
    try {
      accessToken = await getAccessToken(storeUrl, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET);
    } catch (err) {
      console.error("[TOKEN] Error obtaining access token:", err);
      // Clear cache on failure
      cachedToken = null;
      tokenExpiresAt = 0;
      return new Response(
        JSON.stringify({ success: false, error: "Error al conectar con Shopify (token)", isNew: false }),
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
    console.log(`[CUSTOMER] Searching for customer with email: ${email}`);
    const searchRes = await fetch(
      `${apiBase}/customers/search.json?query=email:${encodeURIComponent(email)}`,
      { headers }
    );
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      // If 401/403, token may have expired — clear cache and retry once
      if (searchRes.status === 401 || searchRes.status === 403) {
        console.warn("[CUSTOMER] Token rejected, clearing cache and retrying...");
        cachedToken = null;
        tokenExpiresAt = 0;
        accessToken = await getAccessToken(storeUrl, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET);
        headers["X-Shopify-Access-Token"] = accessToken;

        const retryRes = await fetch(
          `${apiBase}/customers/search.json?query=email:${encodeURIComponent(email)}`,
          { headers }
        );
        const retryData = await retryRes.json();
        if (!retryRes.ok) {
          console.error(`[CUSTOMER] Search failed after retry [${retryRes.status}]: ${JSON.stringify(retryData)}`);
          throw new Error(`Shopify search failed [${retryRes.status}]`);
        }
        Object.assign(searchData, retryData);
      } else {
        console.error(`[CUSTOMER] Search failed [${searchRes.status}]: ${JSON.stringify(searchData)}`);
        throw new Error(`Shopify search failed [${searchRes.status}]`);
      }
    }

    if (searchData.customers && searchData.customers.length > 0) {
      // Update existing customer
      const customer = searchData.customers[0];
      console.log(`[CUSTOMER] Found existing customer: ${customer.id}`);

      const existingTags = customer.tags ? customer.tags.split(", ") : [];
      if (!existingTags.includes(tag)) {
        existingTags.push(tag);
      }

      const metafields = [{
        namespace: "custom",
        key: "promo_code",
        value: code,
        type: "single_line_text_field",
      }];

      const updateBody: Record<string, unknown> = {
        customer: {
          id: customer.id,
          tags: existingTags.join(", "),
          email_marketing_consent: {
            state: acceptsMarketing ? "subscribed" : "not_subscribed",
            opt_in_level: "single_opt_in",
          },
          metafields,
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

      console.log(`[CUSTOMER] Customer ${customer.id} updated successfully`);
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
      console.log("[CUSTOMER] No existing customer found, creating new...");

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
    console.error("[ERROR] Shopify error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg, message: "No se pudo guardar. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
