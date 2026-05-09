export const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
export const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
export const SCOPES = process.env.SCOPES || 'read_customers,read_orders,read_products';
export const SHOP_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

export function isValidShop(shop: string): boolean {
  return SHOP_REGEX.test(shop);
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const json = await res.json();
  if (!json.access_token) throw new Error('No access_token in response');
  return json.access_token as string;
}

async function shopifyFetch(shop: string, token: string, path: string) {
  const res = await fetch(`https://${shop}/admin/api/2026-04/${path}`, {
    headers: { 'X-Shopify-Access-Token': token, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Shopify ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchShopifyAuditData(shop: string, token: string) {
  const [products, orders, customers] = await Promise.all([
    shopifyFetch(shop, token, 'products.json?limit=250').catch(() => ({ products: [] })),
    shopifyFetch(shop, token, 'orders.json?status=any&limit=250&created_at_min=' + new Date(Date.now() - 60 * 86400000).toISOString()).catch(() => ({ orders: [] })),
    shopifyFetch(shop, token, 'customers.json?limit=250').catch(() => ({ customers: [] })),
  ]);
  return { products: products.products || [], orders: orders.orders || [], customers: customers.customers || [] };
}
