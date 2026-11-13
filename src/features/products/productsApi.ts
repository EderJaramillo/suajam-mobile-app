import { apiRequest } from "@/config/api/api";
import { File } from "expo-file-system";
import type {
  Category,
  PaginatedResponse,
  Presentation,
  Product,
  ProductDetail,
} from "./productsTypes";

// El fetch de Expo 58 no acepta el objeto { uri, name, type } de React Native en FormData:
// pide un archivo con bytes(). File de expo-file-system lo es.
function localFile(uri: string, name: string, type: string) {
  const file = new File(uri);
  // Algunas rutas del selector no traen extensión: el nombre y el tipo van explícitos.
  try {
    Object.defineProperty(file, "name", { value: name });
    Object.defineProperty(file, "type", { value: type });
  } catch {
    // Si el objeto nativo no lo permite, se usan el nombre y tipo que deduce de la ruta.
  }
  return file as unknown as Blob;
}

// Estas peticiones van a la base de datos del negocio, no al servidor central.
export interface BusinessRequestContext {
  baseUrl: string;
  authorization: string;
}

// Campos del producto que escribe la app.
export interface ProductChanges {
  name?: string;
  category?: number;
  type?: number;
  is_active?: boolean;
  is_archived?: boolean;
  display_on_store?: boolean;
  display_on_pos?: boolean;
  description?: string;
  sku?: string;
  iva_rate?: string;
  ieps_rate?: string;
}

const PAGE_SIZE = 20;

export function getProductsRequest(context: BusinessRequestContext, page: number) {
  return apiRequest<PaginatedResponse<Product>>(
    `/catalog/products/?page=${page}&items=${PAGE_SIZE}`,
    context,
  );
}

export function getCategoriesRequest(context: BusinessRequestContext) {
  return apiRequest<PaginatedResponse<Category>>("/catalog/categories/?items=100", context);
}

// Todas las imágenes guardadas del negocio. Cada una dice a qué modelo pertenece.
export interface ModelImage {
  id: number;
  model: number;
  url: string;
  public_url: string | null;
}

export function getModelImagesRequest(context: BusinessRequestContext) {
  return apiRequest<PaginatedResponse<ModelImage>>(
    "/catalog/product_models/images/?items=100",
    context,
  );
}

// Modelos del negocio, para saber de qué producto es cada imagen.
// Ojo: aquí `product` llega como el objeto completo del producto, no como número.
export function getModelsRequest(context: BusinessRequestContext) {
  return apiRequest<
    PaginatedResponse<{ id: number; product: number | { id: number; name?: string }; name: string }>
  >(
    "/catalog/product_models/?items=100",
    context,
  );
}

export function getProductRequest(context: BusinessRequestContext, id: number) {
  return apiRequest<ProductDetail>(`/catalog/products/${id}/`, context);
}

// La API no busca por código: se recorren las presentaciones hasta encontrarlo.
// Es solo lectura; /pos/pos_items/barcode/ no sirve porque agrega a una orden de venta.
export async function findPresentationByBarcode(context: BusinessRequestContext, barcode: string) {
  let page = 1;
  while (true) {
    const data = await apiRequest<PaginatedResponse<Presentation>>(
      `/catalog/presentations/?page=${page}&items=100`,
      context,
    );
    const match = data.results.find((p) => p.barcode?.trim() === barcode);
    if (match) return match;
    if (!data.next) return null;
    page += 1;
  }
}

export function createProductRequest(context: BusinessRequestContext, data: ProductChanges) {
  return apiRequest<{ id: number }>("/catalog/products/", {
    ...context,
    method: "POST",
    body: data,
  });
}

export function createCategoryRequest(context: BusinessRequestContext, name: string) {
  return apiRequest<Category>("/catalog/categories/", {
    ...context,
    method: "POST",
    body: { name },
  });
}

export function createModelRequest(context: BusinessRequestContext, product: number, name: string) {
  return apiRequest<{ id: number }>("/catalog/product_models/", {
    ...context,
    method: "POST",
    body: { product, name },
  });
}

export function createPresentationRequest(
  context: BusinessRequestContext,
  data: {
    product: number;
    model: number;
    name: string;
    cost: string;
    price: string;
    barcode?: string;
    is_active?: boolean;
    is_discount?: boolean;
    discount?: number;
    discount_store?: boolean;
    discount_pos?: boolean;
  },
) {
  return apiRequest<{ id: number }>("/catalog/presentations/", {
    ...context,
    method: "POST",
    body: data,
  });
}

export function updateModelRequest(
  context: BusinessRequestContext,
  id: number,
  changes: { name?: string; is_active?: boolean },
) {
  return apiRequest<unknown>(`/catalog/product_models/${id}/`, {
    ...context,
    method: "PATCH",
    body: changes,
  });
}

export function updatePresentationRequest(
  context: BusinessRequestContext,
  id: number,
  changes: Record<string, unknown>,
) {
  return apiRequest<unknown>(`/catalog/presentations/${id}/`, {
    ...context,
    method: "PATCH",
    body: changes,
  });
}

// El servidor pide un archivo en "imgUploader" (foto del teléfono) o un "url"
// (enlace o foto ya subida). Lo dice su propio mensaje de error; el Swagger no lo documenta.
export function uploadModelImageRequest(
  context: BusinessRequestContext,
  modelId: number,
  photo: { uri: string; source: "device" | "url" | "existing" },
) {
  const form = new FormData();
  if (photo.source === "device") {
    const name = photo.uri.split("/").pop() ?? "foto.jpg";
    form.append("imgUploader", localFile(photo.uri, name, "image/jpeg"), name);
  } else {
    form.append("url", photo.uri);
  }
  return apiRequest<unknown>(`/catalog/product_models/${modelId}/image/`, {
    ...context,
    method: "PUT",
    body: form,
  });
}

export function updateProductRequest(
  context: BusinessRequestContext,
  id: number,
  changes: ProductChanges,
) {
  return apiRequest<unknown>(`/catalog/products/${id}/`, {
    ...context,
    method: "PATCH",
    body: changes,
  });
}

// Fase 3 / 37–38: un filtro agrupa etiquetas (Material → Algodón, Poliéster).
export interface CatalogFilter {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface CatalogLabel {
  id: number;
  name: string;
  filter: number;
  is_active?: boolean;
}

// Etiqueta aplicada a un producto.
export interface ProductFilterLink {
  id: number;
  product: number;
  filter: number;
  label: number;
}

export function getFiltersRequest(context: BusinessRequestContext) {
  return apiRequest<PaginatedResponse<CatalogFilter>>("/catalog/filters/?items=100", context);
}

export function getLabelsRequest(context: BusinessRequestContext) {
  return apiRequest<PaginatedResponse<CatalogLabel>>("/catalog/labels/?items=200", context);
}

export function createFilterRequest(context: BusinessRequestContext, name: string) {
  return apiRequest<CatalogFilter>("/catalog/filters/", {
    ...context,
    method: "POST",
    body: { name, is_active: true },
  });
}

export function createLabelRequest(context: BusinessRequestContext, filter: number, name: string) {
  return apiRequest<CatalogLabel>("/catalog/labels/", {
    ...context,
    method: "POST",
    body: { name, filter, is_active: true },
  });
}

export function createProductFilterRequest(
  context: BusinessRequestContext,
  data: { product: number; filter: number; label: number },
) {
  return apiRequest<ProductFilterLink>("/catalog/product_filters/", {
    ...context,
    method: "POST",
    body: data,
  });
}

export function deleteProductFilterRequest(context: BusinessRequestContext, id: number) {
  return apiRequest<unknown>(`/catalog/product_filters/${id}/`, { ...context, method: "DELETE" });
}

// Fase 3 / 39: PDFs del producto.
export interface ProductDocument {
  id: number;
  product: number;
  name: string;
  url?: string;
  public_url?: string;
  size_bytes?: number;
}

export function getDocumentsRequest(context: BusinessRequestContext) {
  return apiRequest<PaginatedResponse<ProductDocument>>("/catalog/documents/?items=100", context);
}

// Pendiente de confirmar con backend: el Swagger no dice en qué campo va el archivo.
// Se manda en "file", junto con el producto y el nombre.
export function uploadDocumentRequest(
  context: BusinessRequestContext,
  product: number,
  file: { uri: string; name: string },
) {
  const form = new FormData();
  form.append("product", String(product));
  form.append("name", file.name);
  form.append("file", localFile(file.uri, file.name, "application/pdf"), file.name);
  return apiRequest<ProductDocument>("/catalog/documents/", { ...context, method: "POST", body: form });
}

export function deleteDocumentRequest(context: BusinessRequestContext, id: number) {
  return apiRequest<unknown>(`/catalog/documents/${id}/`, { ...context, method: "DELETE" });
}

// La API no filtra por producto en estos listados: se traen y se filtran aquí.
export async function getProductFiltersRequest(context: BusinessRequestContext, product: number) {
  const page = await apiRequest<PaginatedResponse<ProductFilterLink>>(
    "/catalog/product_filters/?items=500",
    context,
  );
  return page.results.filter((link) => link.product === product);
}

export async function getProductDocumentsRequest(context: BusinessRequestContext, product: number) {
  const page = await getDocumentsRequest(context);
  return page.results.filter((doc) => doc.product === product);
}
