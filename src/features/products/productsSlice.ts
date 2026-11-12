import { ApiError } from "@/config/api/api";
import { logout } from "@/features/auth/authSlice";
import { getBusinessContext } from "@/features/business/businessContext";
import type { RootState } from "@/store/store";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  findPresentationByBarcode,
  getCategoriesRequest,
  getModelImagesRequest,
  getModelsRequest,
  getProductRequest,
  getProductsRequest,
  updateProductRequest,
  type BusinessRequestContext,
} from "./productsApi";
import { createCategory } from "./newProductSlice";
import { firstImageUrl } from "./productImages";
import type { Category, Product, VisibilityFilter } from "./productsTypes";

type LoadMode = "initial" | "refresh" | "more";

interface ProductsState {
  items: Product[];
  count: number;
  page: number;
  hasMore: boolean;
  categories: Category[];
  status: "idle" | "loading" | "refreshing" | "loadingMore" | "succeeded" | "failed";
  isOffline: boolean;
  error: string | null;
  search: string;
  visibility: VisibilityFilter;
  categoryId: number | null;
  typeId: number | null;
  barcodeLookup: {
    status: "idle" | "loading" | "found" | "notFound" | "failed";
    product: Product | null;
    error: string | null;
  };
}

const initialState: ProductsState = {
  items: [],
  count: 0,
  page: 0,
  hasMore: false,
  categories: [],
  status: "idle",
  isOffline: false,
  error: null,
  search: "",
  visibility: "all",
  categoryId: null,
  typeId: null,
  barcodeLookup: { status: "idle", product: null, error: null },
};

interface RequestError {
  message: string;
  isOffline: boolean;
}

function toRequestError(error: unknown): RequestError {
  if (error instanceof ApiError && error.status === 0) {
    return {
      message: "Sin conexión. Ves tus últimos productos guardados. Conéctate para hacer cambios.",
      isOffline: true,
    };
  }
  const message = error instanceof Error ? error.message : "No pudimos cargar tus productos.";
  return { message, isOffline: false };
}

// Agrega la URL completa de la foto. Si el producto no la trae en main_model,
// se busca en las imágenes guardadas de sus modelos.
async function withImages(items: Product[], context: BusinessRequestContext) {
  const resolved = items.map((p) => ({ ...p, imageUrl: firstImageUrl(p.main_model, context.baseUrl) }));
  if (resolved.every((p) => p.imageUrl)) return resolved;

  try {
    const [images, models] = await Promise.all([
      getModelImagesRequest(context),
      getModelsRequest(context),
    ]);
    const productOfModel = new Map(
      models.results.map((m) => [m.id, typeof m.product === "number" ? m.product : m.product?.id]),
    );
    const byProduct = new Map<number, string>();
    for (const image of images.results) {
      const productId = productOfModel.get(image.model);
      const url = firstImageUrl(image, context.baseUrl);
      if (productId && url && !byProduct.has(productId)) byProduct.set(productId, url);
    }
    return resolved.map((p) => ({ ...p, imageUrl: p.imageUrl ?? byProduct.get(p.id) ?? null }));
  } catch {
    // Sin imágenes de respaldo la lista se muestra igual, con la inicial.
    return resolved;
  }
}

export const fetchProducts = createAsyncThunk<
  { items: Product[]; count: number; hasMore: boolean; page: number; mode: LoadMode },
  LoadMode,
  { state: RootState; rejectValue: RequestError }
>("products/fetch", async (mode, { getState, rejectWithValue }) => {
  try {
    const page = mode === "more" ? getState().products.page + 1 : 1;
    const context = getBusinessContext(getState());
    const data = await getProductsRequest(context, page);
    const items = await withImages(data.results, context);
    return { items, count: data.count, hasMore: !!data.next, page, mode };
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

export const fetchCategories = createAsyncThunk<Category[], void, { state: RootState }>(
  "products/fetchCategories",
  async (_, { getState }) => {
    const data = await getCategoriesRequest(getBusinessContext(getState()));
    return data.results;
  },
);

export const setProductVisibility = createAsyncThunk<
  { id: number; isActive: boolean },
  { id: number; isActive: boolean },
  { state: RootState; rejectValue: RequestError }
>("products/setVisibility", async ({ id, isActive }, { getState, rejectWithValue }) => {
  try {
    await updateProductRequest(getBusinessContext(getState()), id, { is_active: isActive });
    return { id, isActive };
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

export const archiveProduct = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: RequestError }
>("products/archive", async (id, { getState, rejectWithValue }) => {
  try {
    await updateProductRequest(getBusinessContext(getState()), id, { is_archived: true });
    return id;
  } catch (error) {
    return rejectWithValue(toRequestError(error));
  }
});

export const lookupBarcode = createAsyncThunk<
  Product | null,
  string,
  { state: RootState; rejectValue: string }
>("products/lookupBarcode", async (barcode, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const context = getBusinessContext(state);
    const presentation = await findPresentationByBarcode(context, barcode);
    if (!presentation?.product) return null;

    const { product } = presentation;
    const id = typeof product === "number" ? product : product.id;
    const loaded = state.products.items.find((p) => p.id === id);
    if (loaded) return loaded;

    const detail = await getProductRequest(context, id);
    const category = state.products.categories.find((c) => c.id === detail.category) ?? null;
    const [withImage] = await withImages([{ ...detail, category }], context);
    return withImage;
  } catch (error) {
    return rejectWithValue(toRequestError(error).message);
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setVisibilityFilter(state, action: PayloadAction<VisibilityFilter>) {
      state.visibility = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload;
    },
    setTypeFilter(state, action: PayloadAction<number | null>) {
      state.typeId = action.payload;
    },
    clearBarcodeLookup(state) {
      state.barcodeLookup = initialState.barcodeLookup;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const mode = action.meta.arg;
        state.status =
          mode === "more" ? "loadingMore" : mode === "refresh" ? "refreshing" : "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { items, count, hasMore, page, mode } = action.payload;
        state.items = mode === "more" ? [...state.items, ...items] : items;
        state.count = count;
        state.hasMore = hasMore;
        state.page = page;
        state.status = "succeeded";
        state.isOffline = false;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.isOffline = action.payload?.isOffline ?? false;
        state.error = action.payload?.message ?? "No pudimos cargar tus productos.";
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })

      .addCase(setProductVisibility.fulfilled, (state, action) => {
        const product = state.items.find((p) => p.id === action.payload.id);
        if (product) product.is_active = action.payload.isActive;
        state.error = null;
      })
      .addCase(setProductVisibility.rejected, (state, action) => {
        state.isOffline = action.payload?.isOffline ?? false;
        state.error = action.payload?.message ?? "No pudimos guardar el cambio.";
      })

      .addCase(archiveProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        state.error = null;
      })
      .addCase(archiveProduct.rejected, (state, action) => {
        state.isOffline = action.payload?.isOffline ?? false;
        state.error = action.payload?.message ?? "No pudimos archivar el producto.";
      })

      .addCase(lookupBarcode.pending, (state) => {
        state.barcodeLookup = { status: "loading", product: null, error: null };
      })
      .addCase(lookupBarcode.fulfilled, (state, action) => {
        state.barcodeLookup = {
          status: action.payload ? "found" : "notFound",
          product: action.payload,
          error: null,
        };
      })
      .addCase(lookupBarcode.rejected, (state, action) => {
        state.barcodeLookup = {
          status: "failed",
          product: null,
          error: action.payload ?? "No pudimos buscar el código.",
        };
      })

      .addCase(logout.pending, () => initialState);
  },
});

export const {
  setSearch,
  setVisibilityFilter,
  setCategoryFilter,
  setTypeFilter,
  clearBarcodeLookup,
} = productsSlice.actions;
export default productsSlice.reducer;
