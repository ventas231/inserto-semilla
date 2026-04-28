import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KLAVIYO_REVISION = "2024-10-15";
const TARGET_LIST_NAME = "Selling Secret-Suscriptores";
let cachedTargetListId: string | null = null;

const normalizeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const resolveTargetListId = async (headers: Record<string, string>, fallbackListId: string | null) => {
  if (cachedTargetListId) return cachedTargetListId;

  const listUrl = new URL("https://a.klaviyo.com/api/lists");
  listUrl.searchParams.set("filter", `equals(name,"${TARGET_LIST_NAME}")`);

  const listRes = await fetch(listUrl.toString(), { method: "GET", headers });
  const listText = await listRes.text();
  console.log(`[KLAVIYO] List lookup (${TARGET_LIST_NAME}) status: ${listRes.status}, body: ${listText}`);

  if (listRes.ok) {
    const listData = listText ? JSON.parse(listText) : null;
    const targetList = Array.isArray(listData?.data) ? listData.data[0] : null;

    if (targetList?.id) {
      cachedTargetListId = targetList.id;
      return cachedTargetListId;
    }
  }

  const allListsUrl = new URL("https://a.klaviyo.com/api/lists");
  allListsUrl.searchParams.set("page[size]", "100");
  const allListsRes = await fetch(allListsUrl.toString(), { method: "GET", headers });
  const allListsText = await allListsRes.text();
  console.log(`[KLAVIYO] List scan status: ${allListsRes.status}, body: ${allListsText}`);

  if (allListsRes.ok) {
    const allListsData = allListsText ? JSON.parse(allListsText) : null;
    const targetSlug = normalizeName(TARGET_LIST_NAME);
    const targetList = Array.isArray(allListsData?.data)
      ? allListsData.data.find((list: { attributes?: { name?: string } }) => normalizeName(list.attributes?.name || "") === targetSlug)
      : null;

    if (targetList?.id) {
      cachedTargetListId = targetList.id;
      return cachedTargetListId;
    }
  }

  if (fallbackListId) {
    console.warn(`[KLAVIYO] Target list name not resolved; using KLAVIYO_LIST_ID fallback: ${fallbackListId}`);
    return fallbackListId;
  }

  throw new Error(`No se encontró la lista de Klaviyo: ${TARGET_LIST_NAME}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const KLAVIYO_API_KEY = Deno.env.get("KLAVIYO_API_KEY");
    const KLAVIYO_LIST_ID = Deno.env.get("KLAVIYO_LIST_ID") || null;

    if (!KLAVIYO_API_KEY) {
      console.error("[KLAVIYO] Missing credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Klaviyo not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, firstName, tags, papel_semilla, origen } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tagList: string[] = Array.isArray(tags) ? tags : [];
    const papelSemillaClean = typeof papel_semilla === "string" && papel_semilla.trim() ? papel_semilla.trim() : null;
    const origenClean = typeof origen === "string" && origen.trim() ? origen.trim() : "plantita";

    console.log(`[KLAVIYO] Subscribing ${email} to list ${KLAVIYO_LIST_ID}, tags: ${tagList.join(", ")}, papel_semilla: ${papelSemillaClean}, origen: ${origenClean}`);

    const headers = {
      "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "revision": KLAVIYO_REVISION,
    };

    const targetListId = await resolveTargetListId(headers, KLAVIYO_LIST_ID);
    console.log(`[KLAVIYO] Using target list ${TARGET_LIST_NAME} (${targetListId})`);

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
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "SUBSCRIBED",
                      },
                    },
                  },
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
              id: targetListId,
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
      console.error(`[KLAVIYO] Subscribe failed (continuing to profile-import): ${subText}`);
    }

    // Also upsert profile properties so they are searchable in Klaviyo
    {
      const upsertBody = {
        data: {
          type: "profile",
          attributes: {
            email,
            ...(firstName ? { first_name: firstName } : {}),
            properties: {
              ...(tagList.length > 0 ? { tags: tagList } : {}),
              papel_semilla: papelSemillaClean,
              origen: origenClean,
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
