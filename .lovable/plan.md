

## Plan: Use existing access token secret as fallback + test customer creation

### Problem
The OAuth flow hasn't been completed (redirect URL whitelisting issue), so no token exists in the `shopify_tokens` table. However, there's already a `SHOPIFY_ACCESS_TOKEN` secret configured.

### Changes

**1. Update `supabase/functions/shopify-customer/index.ts`**
- Modify the `getAccessToken` function to first check the database, then fall back to the `SHOPIFY_ACCESS_TOKEN` environment variable if no database record exists.

```typescript
async function getAccessToken(storeUrl: string): Promise<string> {
  // Try database first
  // ... existing db lookup ...
  
  // Fallback to env secret
  const envToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  if (envToken) {
    console.log("[TOKEN] Using SHOPIFY_ACCESS_TOKEN from env");
    return envToken;
  }
  
  throw new Error("No token found");
}
```

**2. Update `supabase/functions/shopify-oauth/index.ts`**
- Same fallback pattern in the `status` check — report connected if either DB token or env secret exists.

**3. Redeploy both edge functions and test**
- Call `shopify-customer` with test data to create a real customer in Shopify.

### Why this approach
- Unblocks testing immediately without requiring OAuth redirect URL whitelisting
- OAuth still works as primary path when completed later
- Uses the already-configured `SHOPIFY_ACCESS_TOKEN` secret

