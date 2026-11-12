import { isIncomplete } from "@/features/products/productsTypes";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export const selectIsLoggedIn = (state: RootState) =>
  state.auth.status === "authenticated" && state.auth.session !== null;

export const selectActiveBusiness = (state: RootState) =>
  state.business.list.find((b) => b.tenant_slug === state.business.activeSlug) ?? null;

// Solo se entra a la tienda cuando hay sesión, no hay bloqueo y hay negocio elegido.
export const selectIsInsideBusiness = (state: RootState) =>
  selectIsLoggedIn(state) && state.auth.blockReason === null && selectActiveBusiness(state) !== null;

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// La API no documenta búsqueda ni filtros: se aplican sobre lo ya cargado.
export const selectFilteredProducts = createSelector(
  [(state: RootState) => state.products],
  ({ items, search, visibility, categoryId, typeId }) => {
    const term = normalize(search.trim());
    return items.filter((product) => {
      if (product.is_archived) return false;
      if (visibility === "visible" && !product.is_active) return false;
      if (visibility === "hidden" && product.is_active) return false;
      if (visibility === "incomplete" && !isIncomplete(product)) return false;
      if (categoryId !== null && product.category?.id !== categoryId) return false;
      if (typeId !== null && product.type !== typeId) return false;
      return !term || normalize(`${product.name} ${product.sku ?? ""}`).includes(term);
    });
  },
);

export const selectHasActiveFilters = (state: RootState) => {
  const { search, visibility, categoryId, typeId } = state.products;
  return search.trim() !== "" || visibility !== "all" || categoryId !== null || typeId !== null;
};
