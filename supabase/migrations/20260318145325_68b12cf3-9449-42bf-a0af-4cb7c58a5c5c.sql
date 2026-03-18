CREATE TABLE public.shopify_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text NOT NULL UNIQUE,
  access_token text NOT NULL,
  scopes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.shopify_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access" ON public.shopify_tokens
  FOR ALL TO anon, authenticated
  USING (false);
