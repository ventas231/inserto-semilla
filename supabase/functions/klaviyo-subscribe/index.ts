import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KLAVIYO_REVISION = "2024-10-15";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const KLAVIYO_API_KEY = Deno.env.get("KLAVIYO_API_KEY");
    const KLAVIYO_LIST_ID = Deno.env.get("KLAVIYO_LIST_ID");

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      console.error("[KLAVIYO] Missing credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Klaviyo not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, firstName, tags } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tagList: string[] = Array.isArray(tags) ? tags : [];

    console.log(`[KLAVIYO] Subscribing ${email} to list ${KLAVIYO_LIST_ID}, tags: ${tagList.join(", ")}`);

    const headers = {
      "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "revision": KLAVIYO_REVISION,
    };

    // Subscribe profile to list (creates profile if it doesn't exist + sets consent)
    const subscribeBody = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  ...(firstName ? { first_name: firstName } : {}),
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "SUBSCRIBED",
                      },
                    },
                  },
                  ...(tagList.length > 0
                    ? { properties: { tags: tagList, papel_semilla: tagList[0] } }
                    : {}),
                },
              },
            ],
          },
          historical_import: false,
        },
        relationships: {
          list: {
            data: {
              type: "list",
              id: KLAVIYO_LIST_ID,
            },
          },
        },
      },
    };

    const subRes = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
      {
        method: "POST",
        headers,
        body: JSON.stringify(subscribeBody),
      }
    );

    const subText = await subRes.text();
    console.log(`[KLAVIYO] Subscribe status: ${subRes.status}, body: ${subText}`);

    if (!subRes.ok && subRes.status !== 202) {
      return new Response(
        JSON.stringify({ success: false, error: `Klaviyo subscribe failed: ${subText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also upsert profile properties (tags) so they are searchable in Klaviyo
    if (tagList.length > 0 || firstName) {
      const upsertBody = {
        data: {
          type: "profile",
          attributes: {
            email,
            ...(firstName ? { first_name: firstName } : {}),
            properties: {
              tags: tagList,
              papel_semilla: tagList[0] || null,
            },
          },
        },
      };

      const upsertRes = await fetch("https://a.klaviyo.com/api/profile-import", {
        method: "POST",
        headers,
        body: JSON.stringify(upsertBody),
      });
      const upsertText = await upsertRes.text();
      console.log(`[KLAVIYO] Profile upsert status: ${upsertRes.status}, body: ${upsertText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Suscrito a Klaviyo" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[KLAVIYO] Error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
