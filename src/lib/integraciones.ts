// Conexiones de los formularios, desde el navegador (el sitio es estático).
// Reemplazan a las funciones de supabase/functions (shopify-customer y
// klaviyo-subscribe) con la misma lógica y devuelven la misma forma
// { data, error } que supabase.functions.invoke.

// Token PÚBLICO de la Storefront API de Shopify (hecho para usarse en el navegador).
const STOREFRONT_URL = "https://specializedsocks.myshopify.com/api/2024-01/graphql.json";
const STOREFRONT_TOKEN = "85e8e43d4385add11d8292875b2c67de";

// Klaviyo: llave PÚBLICA (Site ID, 6 caracteres) e ID de la lista
// "Seedling Secret - Suscriptores". Vacías = no se suscribe a Klaviyo.
export const KLAVIYO_PUBLIC_KEY = "";
export const KLAVIYO_LIST_ID = "";
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

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email }
      customerUserErrors { code field message }
    }
  }
`;

async function shopifyCustomer({ email, firstName, tags }: Body): Promise<Result> {
  if (!email) return { data: { success: false, error: "Email es requerido" }, error: null };
  const input: Record<string, unknown> = {
    email,
    acceptsMarketing: true,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ["recetario"],
  };
  if (firstName) input.firstName = firstName;
  try {
    const res = await fetch(STOREFRONT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN },
      body: JSON.stringify({ query: CUSTOMER_CREATE_MUTATION, variables: { input } }),
    });
    const json = await res.json();
    const errors: { code: string; message: string }[] = json?.data?.customerCreate?.customerUserErrors || [];
    if (errors.length === 0) return { data: { success: true, isNew: true }, error: null };
    if (errors.every((e) => ["CUSTOMER_DISABLED", "TAKEN"].includes(e.code))) {
      return { data: { success: true, isNew: false }, error: null };
    }
    return { data: { success: false, error: errors.map((e) => e.message).join(", ") }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

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

export function invocar(nombre: "shopify-customer" | "klaviyo-subscribe", body: Body): Promise<Result> {
  return nombre === "shopify-customer" ? shopifyCustomer(body) : klaviyoSubscribe(body);
}
