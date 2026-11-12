import type { BusinessRequestContext } from "@/features/products/productsApi";
import type { RootState } from "@/store/store";
import { getBusinessApiUrl } from "./businessApi";

// Arma la dirección y el token del negocio activo: las pantallas no los conocen.
export function getBusinessContext(state: RootState): BusinessRequestContext {
  const business = state.business.list.find((b) => b.tenant_slug === state.business.activeSlug);
  const baseUrl = business ? getBusinessApiUrl(business) : null;
  const authorization = state.auth.session?.authorization;
  if (!baseUrl || !authorization) {
    throw new Error("No encontramos la dirección de tu negocio.");
  }
  return { baseUrl, authorization };
}
