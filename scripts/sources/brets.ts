import { decodeHtmlEntities } from "../html-entities";

// Client pour l'API REST WordPress publique et non authentifiée de brets.fr.
// C'est la source d'autorité (AD-5) : nom, visuel, statut proviennent de là.
// Endpoint vérifié en direct pendant la préparation de cette story :
// https://cms.brets.fr/wp-json/wp/v2/product?per_page=100&_fields=id,slug,title,link,acf
const BRETS_API_BASE = "https://cms.brets.fr/wp-json/wp/v2/product";
const PER_PAGE = 100;

interface BretsRawProduct {
  id: number;
  slug: string;
  title: { rendered: string };
  acf?: {
    packaging?: { url: string } | null;
  };
}

export interface BretsProduct {
  // Identifiant numérique WordPress — STABLE même si le produit est renommé.
  // Ne jamais utiliser `slug` comme clé technique du registre d'identité
  // (Task 4) : seul `bretsId` garantit la non-régression exigée par AD-1.
  bretsId: number;
  slug: string;
  name: string;
  image: string;
}

// Servi par l'app elle-même (public/placeholder-flavor.svg) quand brets.fr
// ne fournit pas de visuel de packaging — évite qu'un produit sans image
// ne fasse échouer tout le scrape (voir revue de code story 1.9).
const PLACEHOLDER_IMAGE = "/placeholder-flavor.svg";

async function fetchPage(page: number): Promise<{ products: BretsRawProduct[]; totalPages: number }> {
  const url = `${BRETS_API_BASE}?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,title,link,acf`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Échec du fetch brets.fr (page ${page}) : réponse HTTP ${response.status} depuis ${url}`,
    );
  }

  const products = (await response.json()) as BretsRawProduct[];
  const totalPagesHeader = response.headers.get("x-wp-totalpages");
  const totalPages = Number.parseInt(totalPagesHeader ?? "1", 10);

  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error(
      `Pagination brets.fr invalide (page ${page}) : en-tête X-WP-TotalPages="${totalPagesHeader}" inexploitable`,
    );
  }

  return { products, totalPages };
}

function normalize(raw: BretsRawProduct): BretsProduct {
  if (typeof raw.title?.rendered !== "string" || raw.title.rendered.length === 0) {
    throw new Error(`Produit brets.fr "${raw.slug}" (id ${raw.id}) sans titre exploitable`);
  }

  return {
    bretsId: raw.id,
    slug: raw.slug,
    name: decodeHtmlEntities(raw.title.rendered),
    image: raw.acf?.packaging?.url ?? PLACEHOLDER_IMAGE,
  };
}

export async function fetchBretsProducts(): Promise<BretsProduct[]> {
  const first = await fetchPage(1);
  const allRaw = [...first.products];

  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPage(page);
    allRaw.push(...next.products);
  }

  return allRaw.map(normalize);
}
