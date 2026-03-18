import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizeShopDomain(raw: string): string {
  let s = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  // Convert admin.shopify.com/store/HANDLE to HANDLE.myshopify.com
  const adminMatch = s.match(/admin\.shopify\.com\/store\/([^\/]+)/);
  if (adminMatch) {
    s = `${adminMatch[1]}.myshopify.com`;
  }
  // Ensure .myshopify.com suffix
  if (!s.includes(".myshopify.com")) {
    s = `${s}.myshopify.com`;
  }
  return s;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_API_KEY");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_API_SECRET");
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET || !SHOPIFY_STORE_URL) {
      throw new Error("Shopify credentials not configured");
    }

    const storeUrl = normalizeShopDomain(SHOPIFY_STORE_URL);
    console.log("[OAUTH] Normalized store domain:", storeUrl);
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || url.searchParams.get("step");

    // Step 1: Generate authorization URL
    if (action === "start") {
      const redirectUri = `${SUPABASE_URL}/functions/v1/shopify-oauth?step=callback`;
      const scopes = "read_customers,write_customers";
      const nonce = crypto.randomUUID();

      const authUrl = `https://${storeUrl}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;

      console.log("[OAUTH] Generated auth URL for store:", storeUrl);

      return new Response(
        JSON.stringify({ success: true, authUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Handle OAuth callback
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const shop = url.searchParams.get("shop");

      if (!code) {
        return new Response("Missing authorization code", { status: 400 });
      }

      console.log(`[OAUTH] Exchanging code for token. Shop: ${shop || storeUrl}`);

      const tokenRes = await fetch(`https://${storeUrl}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code,
        }),
      });

      const tokenBody = await tokenRes.text();
      console.log(`[OAUTH] Token response status: ${tokenRes.status}`);

      if (!tokenRes.ok) {
        console.error(`[OAUTH] Token exchange failed: ${tokenBody}`);
        return new Response(`Token exchange failed: ${tokenBody}`, { status: 500 });
      }

      const tokenData = JSON.parse(tokenBody);
      const accessToken = tokenData.access_token;
      const scopes = tokenData.scope;

      console.log(`[OAUTH] Token obtained. Scopes: ${scopes}`);

      // Store token in database using service role
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: dbError } = await supabase
        .from("shopify_tokens")
        .upsert(
          {
            shop_domain: storeUrl,
            access_token: accessToken,
            scopes: scopes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "shop_domain" }
        );

      if (dbError) {
        console.error("[OAUTH] Failed to store token:", dbError);
        return new Response(`Failed to store token: ${dbError.message}`, { status: 500 });
      }

      console.log("[OAUTH] Token stored successfully in database");

      // Return success HTML page
      return new Response(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1>✅ Shopify conectado exitosamente</h1>
        <p>El token de acceso ha sido guardado. Puedes cerrar esta ventana.</p>
        </body></html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    // Step 3: Check if token exists
    if (action === "status") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error: dbError } = await supabase
        .from("shopify_tokens")
        .select("shop_domain, scopes, updated_at")
        .eq("shop_domain", storeUrl)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          connected: !!data && !dbError,
          shop: data?.shop_domain,
          scopes: data?.scopes,
          updatedAt: data?.updated_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use ?action=start, callback, or status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[OAUTH] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
