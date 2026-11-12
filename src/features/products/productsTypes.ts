export interface Category {
  id: number;
  name: string;
}

// GET /catalog/products/ (definición ProductList del Swagger).
export interface Product {
  id: number;
  name: string;
  sku: string | null;
  type: number | null;
  is_active: boolean;
  is_archived?: boolean;
  category: Category | null;
  // El Swagger no documenta su forma: se lee con getProductImage y getProductPrice.
  main_model: unknown;
  // URL completa de la foto principal; la arma la app al cargar la lista.
  imageUrl?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  results: T[];
}

// GET /catalog/presentations/ (definición Presentation del Swagger).
export interface Presentation {
  id: number;
  barcode: string | null;
  product: number | { id: number } | null;
}

// GET /catalog/products/{id}/: aquí category llega como id, no como objeto.
export type ProductDetail = Omit<Product, "category"> & { category: number | null };

export type VisibilityFilter = "all" | "visible" | "hidden" | "incomplete";

// Pendiente de confirmar con backend: el Swagger no dice qué número es cada tipo.
export const SIMPLE_TYPE = 1;
export const MODELS_TYPE = 2;
export const VARIANTS_TYPE = 3;

export const productTypes = [
  { id: 1, label: "Simple" },
  { id: 2, label: "Con modelos" },
  { id: 3, label: "Modelos con variantes" },
];

// Figma: 25 productos. La API no expone el límite del plan.
export const PRODUCT_LIMIT = 25;

export const isIncomplete = (product: Product) => !product.type;

export function getProductImage(product: Product): string | null {
  return product.imageUrl ?? null;
}

// main_model puede llegar como objeto o como texto con JSON.
function parseMainModel(product: Product): unknown {
  const model = product.main_model;
  if (typeof model !== "string") return model;
  try {
    return JSON.parse(model);
  } catch {
    return null;
  }
}

export function getProductPrice(product: Product): number | null {
  const model = parseMainModel(product) as { presentations?: unknown; price?: unknown } | null;
  if (!model || typeof model !== "object") return null;
  const presentations = Array.isArray(model.presentations) ? model.presentations : [model];
  const prices = presentations
    .map((p: { price?: unknown }) => Number(p?.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}
