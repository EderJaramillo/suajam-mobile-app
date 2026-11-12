import authReducer from "@/features/auth/authSlice";
import businessReducer from "@/features/business/businessSlice";
import { deleteDraftFile, saveDraftFile } from "@/features/products/draftStorage";
import newProductReducer, {
  publishProduct,
  resetDraft,
  toSavedDraft,
} from "@/features/products/newProductSlice";
import productsReducer from "@/features/products/productsSlice";
import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

const rootReducer = {
  auth: authReducer,
  business: businessReducer,
  products: productsReducer,
  newProduct: newProductReducer,
};

// Cada cambio del borrador se guarda en el teléfono; al publicar o salir se borra.
const draftListener = createListenerMiddleware();
draftListener.startListening({
  predicate: (action) => action.type.startsWith("newProduct/"),
  effect: async (action, api) => {
    const state = api.getState() as { business: { activeSlug: string | null }; newProduct: Parameters<typeof toSavedDraft>[0] };
    const slug = state.business.activeSlug;
    if (!slug) return;
    if (resetDraft.match(action) || publishProduct.fulfilled.match(action)) {
      deleteDraftFile(slug);
      return;
    }
    // Agrupa ráfagas de cambios (por ejemplo, al escribir) en una sola escritura.
    api.cancelActiveListeners();
    await api.delay(400);
    const draft = (api.getState() as typeof state).newProduct;
    if (draft.productId && !draft.published) saveDraftFile(slug, toSavedDraft(draft));
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().prepend(draftListener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
