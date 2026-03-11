import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_API_SECRET = Deno.env.get("SHOPIFY_API_SECRET");

    if (!SHOPIFY_STORE_URL || !SHOPIFY_API_SECRET) {
      throw new Error("Shopify credentials not configured");
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email y código son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tag = `Planta-${code}`;
    const baseUrl = SHOPIFY_STORE_URL.replace(/\/$/, "");
    const apiBase = `https://${baseUrl}/admin/api/2024-01`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_API_SECRET,
    };

    // Search for existing customer
    const searchRes = await fetch(
      `${apiBase}/customers/search.json?query=email:${encodeURIComponent(email)}`,
      { headers }
    );
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      throw new Error(`Shopify search failed [${searchRes.status}]: ${JSON.stringify(searchData)}`);
    }

    if (searchData.customers && searchData.customers.length > 0) {
      // Customer exists — update tags
      const customer = searchData.customers[0];
      const existingTags = customer.tags ? customer.tags.split(", ") : [];

      if (!existingTags.includes(tag)) {
        existingTags.push(tag);
      }

      const updateRes = await fetch(`${apiBase}/customers/${customer.id}.json`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          customer: { id: customer.id, tags: existingTags.join(", ") },
        }),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(`Shopify update failed [${updateRes.status}]: ${JSON.stringify(updateData)}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Cliente actualizado", customer_id: customer.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new customer
      const createRes = await fetch(`${apiBase}/customers.json`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: {
            email,
            tags: tag,
            accepts_marketing: true,
          },
        }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(`Shopify create failed [${createRes.status}]: ${JSON.stringify(createData)}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Cliente creado", customer_id: createData.customer?.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Shopify error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
