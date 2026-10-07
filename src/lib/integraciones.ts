// Conexión del formulario con Klaviyo, desde el navegador (el sitio es estático).
// Reemplaza a la función supabase/functions/klaviyo-subscribe con la misma lógica
// y devuelve la misma forma { data, error } que supabase.functions.invoke.
// El alta de clientes en Shopify se quitó: no se usa.

// Klaviyo: llave PÚBLICA (Site ID, 6 caracteres) e ID de la lista
// "Seedling Secret - Suscriptores". Vacías = no se suscribe a Klaviyo.
export const KLAVIYO_PUBLIC_KEY = "H6mKTg";
export const KLAVIYO_LIST_ID = "WthbWD";
const KLAVIYO_REVISION = "2024-10-15";

type Body = {
  email: string;
  firstName?: string;
  tags?: string[];
  papel_semilla?: string | null;
  origen?: string;
  code?: string;
};
type Result = { data: { success: boolean; [k: string]: unknown } | null; error: Error | null };

async function klaviyoSubscribe({ email, firstName, tags, papel_semilla, origen }: Body): Promise<Result> {
  if (!email) return { data: { success: false, error: "Email es requerido" }, error: null };
  if (!KLAVIYO_PUBLIC_KEY || !KLAVIYO_LIST_ID) {
    return { data: { success: false, error: "Klaviyo not configured" }, error: null };
  }
  const tagList = Array.isArray(tags) ? tags : [];
  const body = {
    data: {
      type: "subscription",
      attributes: {
        profile: {
          data: {
            type: "profile",
            attributes: {
              email,
              ...(firstName ? { first_name: firstName } : {}),
              subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              properties: {
                ...(tagList.length > 0 ? { tags: tagList } : {}),
                papel_semilla: typeof papel_semilla === "string" && papel_semilla.trim() ? papel_semilla.trim() : null,
                origen: typeof origen === "string" && origen.trim() ? origen.trim() : "plantita",
              },
            },
          },
        },
      },
      relationships: { list: { data: { type: "list", id: KLAVIYO_LIST_ID } } },
    },
  };
  try {
    const res = await fetch(
      `https://a.klaviyo.com/client/subscriptions?company_id=${encodeURIComponent(KLAVIYO_PUBLIC_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: KLAVIYO_REVISION },
        body: JSON.stringify(body),
      },
    );
    if (res.ok) return { data: { success: true, message: "Suscrito a Klaviyo" }, error: null };
    return { data: { success: false, error: `Klaviyo ${res.status}: ${await res.text()}` }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export function invocar(_nombre: "klaviyo-subscribe", body: Body): Promise<Result> {
  return klaviyoSubscribe(body);
}
