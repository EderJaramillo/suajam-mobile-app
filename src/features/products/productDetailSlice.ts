import { getBusinessContext } from "@/features/business/businessContext";
import { extractImageUrls, resolveImageUrl } from "@/features/products/productImages";
import type { RootState } from "@/store/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "@/config/api/api";
import { updateModelRequest, updateProductRequest } from "./productsApi";

// Fase 4: detalle de un producto ya creado, con sus modelos y presentaciones.
export interface DetailPresentation {
  id: number;
  name: string;
  price: string;
  cost: string;
  is_active: boolean;
  barcode: string | null;
}

export interface DetailModel {
  id: number;
  name: string;
  is_active: boolean;
  presentations: DetailPresentation[];
  images?: unknown;
}

export interface FullProductDetail {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  type: number | null;
  // Puede llegar como id o como objeto, según el endpoint.
  category: number | { id: number; name: string } | null;
  is_active: boolean;
  display_on_store: boolean;
  display_on_pos: boolean;
  iva_rate: string | null;
  ieps_rate: string | null;
  created_at: string;
  updated_at: string;
  main_model?: unknown;
  product_models: DetailModel[];
}

export interface DetailPhoto {
  url: string;
  modelName: string;
}

interface ProductDetailState {
  detail: FullProductDetail | null;
  photos: DetailPhoto[];
  status: "idle" | "loading" | "ready" | "error";
  isSaving: boolean;
  error: string | null;
}

const initialState: ProductDetailState = {
  detail: null,
  photos: [],
  status: "idle",
  isSaving: false,
  error: null,
};

type ThunkConfig = { state: RootState; rejectValue: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No pudimos completar la acción. Intenta de nuevo.";

// Fotos de todos los modelos, en orden: la primera es la principal.
function collectPhotos(detail: FullProductDetail, baseUrl: string): DetailPhoto[] {
  const seen = new Set<string>();
  const photos: DetailPhoto[] = [];
  for (const model of detail.product_models ?? []) {
    for (const raw of extractImageUrls(model.images)) {
      const url = resolveImageUrl(raw, baseUrl);
      if (seen.has(url)) continue;
      seen.add(url);
      photos.push({ url, modelName: model.name });
    }
  }
  if (photos.length === 0) {
    const [raw] = extractImageUrls(detail.main_model);
    if (raw) photos.push({ url: resolveImageUrl(raw, baseUrl), modelName: "" });
  }
  return photos;
}

export const fetchProductDetail = createAsyncThunk<
  { detail: FullProductDetail; photos: DetailPhoto[] },
  number,
  ThunkConfig
>("productDetail/fetch", async (id, { getState, rejectWithValue }) => {
  try {
    const context = getBusinessContext(getState());
    const detail = await apiRequest<FullProductDetail>(`/catalog/products/${id}/`, context);
    return { detail, photos: collectPhotos(detail, context.baseUrl) };
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

// Interruptor "Visible" del detalle.
export const setDetailVisibility = createAsyncThunk<boolean, boolean, ThunkConfig>(
  "productDetail/visibility",
  async (isActive, { getState, rejectWithValue }) => {
    const { detail } = getState().productDetail;
    try {
      if (!detail) throw new Error("No encontramos el producto.");
      const context = getBusinessContext(getState());
      // La API no activa un producto sin modelos activos: se activan los que tienen precio.
      const models = detail.product_models ?? [];
      if (isActive && !models.some((m) => m.is_active)) {
        const priced = models.filter((m) =>
          (m.presentations ?? []).some((p) => p.is_active && Number(p.price) > 0),
        );
        if (priced.length === 0) {
          throw new Error("Para hacerlo visible, agrega un precio a al menos un modelo.");
        }
        for (const model of priced) {
          await updateModelRequest(context, model.id, { is_active: true });
        }
      }
      await updateProductRequest(context, detail.id, { is_active: isActive });
      return isActive;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    clearDetailError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetail.pending, (state, action) => {
        // Si es el mismo producto se deja lo que ya se ve mientras se actualiza.
        if (state.detail?.id !== action.meta.arg) {
          state.detail = null;
          state.photos = [];
        }
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detail = action.payload.detail;
        state.photos = action.payload.photos;
        state.status = "ready";
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "No pudimos cargar el producto.";
      })
      .addCase(setDetailVisibility.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(setDetailVisibility.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.detail) {
          state.detail.is_active = action.payload;
          // Igual que en el servidor: solo se activaron modelos si no había ninguno visible.
          const models = state.detail.product_models ?? [];
          if (action.payload && !models.some((m) => m.is_active)) {
            for (const model of models) {
              if ((model.presentations ?? []).some((p) => p.is_active && Number(p.price) > 0)) {
                model.is_active = true;
              }
            }
          }
        }
      })
      .addCase(setDetailVisibility.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? "No pudimos cambiar la visibilidad.";
      });
  },
});

export const { clearDetailError } = productDetailSlice.actions;
export default productDetailSlice.reducer;
