// Client pour l'API publique Open Food Facts. Cette source ne fait jamais
// autorité (AD-5) : elle n'est consultée qu'en complément explicite via
// `scripts/off-matching-table.json`. Endpoint vérifié en direct pendant la
// préparation de cette story :
// https://world.openfoodfacts.org/api/v2/search?brands_tags=brets&fields=code,product_name,image_url,brands&page_size=100
const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/search";
const PAGE_SIZE = 100;

interface OffRawProduct {
  code: string;
  product_name?: string;
  image_url?: string;
  brands?: string;
}

interface OffSearchResponse {
  page: number;
  page_count: number;
  products: OffRawProduct[];
}

export interface OffProduct {
  code: string;
  name: string;
  image: string;
}

async function fetchPage(page: number): Promise<OffSearchResponse> {
  const url = `${OFF_API_BASE}?brands_tags=brets&fields=code,product_name,image_url,brands&page_size=${PAGE_SIZE}&page=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Échec du fetch Open Food Facts (page ${page}) : réponse HTTP ${response.status} depuis ${url}`,
    );
  }

  return (await response.json()) as OffSearchResponse;
}

function normalize(raw: OffRawProduct): OffProduct | null {
  if (!raw.product_name || !raw.image_url) {
    return null;
  }

  return { code: raw.code, name: raw.product_name, image: raw.image_url };
}

export async function fetchOffProducts(): Promise<OffProduct[]> {
  const first = await fetchPage(1);
  const allRaw = [...first.products];

  for (let page = 2; page <= first.page_count; page += 1) {
    const next = await fetchPage(page);
    allRaw.push(...next.products);
  }

  return allRaw
    .map(normalize)
    .filter((product): product is OffProduct => product !== null);
}

// La seule voie autorisée par laquelle une Saveur peut consulter Open Food
// Facts (AD-5) : le `bretsId` doit être explicitement listé dans la table de
// correspondance maintenue manuellement (`scripts/off-matching-table.json`).
// Jamais de rapprochement automatique par proximité de nom.
export function resolveOffMatch(
  bretsId: number,
  matchingTable: Record<string, string>,
  offProducts: OffProduct[],
): OffProduct | null {
  const code = matchingTable[String(bretsId)];

  if (!code) {
    return null;
  }

  return offProducts.find((product) => product.code === code) ?? null;
}
