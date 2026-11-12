import { saveActiveBusiness } from "@/features/auth/authStorage";
import { login, logout, restoreSession, type SignedInPayload } from "@/features/auth/authSlice";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Business } from "./businessTypes";

interface BusinessState {
  list: Business[];
  activeSlug: string | null;
}

const initialState: BusinessState = {
  list: [],
  activeSlug: null,
};

// Por ahora cada usuario solo tiene un negocio: si hay uno, se entra directo.
// Si llegan varios, la app muestra el selector "Elige tu negocio".
function pickInitialBusiness({ businesses, rememberedBusinessSlug }: SignedInPayload) {
  if (businesses.length === 1) return businesses[0].tenant_slug;
  const remembered = businesses.find((b) => b.tenant_slug === rememberedBusinessSlug);
  return remembered?.tenant_slug ?? null;
}

export const chooseBusiness = createAsyncThunk<
  string,
  string,
  { state: { auth: { remember: boolean } } }
>("business/choose", async (slug, { getState }) => {
  if (getState().auth.remember) await saveActiveBusiness(slug);
  return slug;
});

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearActiveBusiness(state) {
      state.activeSlug = null;
    },
    setActiveBusiness(state, action: PayloadAction<string>) {
      state.activeSlug = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.list = action.payload.businesses;
        state.activeSlug = pickInitialBusiness(action.payload);
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.list = action.payload.businesses;
        state.activeSlug = pickInitialBusiness(action.payload);
      })
      .addCase(chooseBusiness.fulfilled, (state, action) => {
        state.activeSlug = action.payload;
      })
      .addCase(logout.pending, () => initialState);
  },
});

export const { clearActiveBusiness, setActiveBusiness } = businessSlice.actions;
export default businessSlice.reducer;
