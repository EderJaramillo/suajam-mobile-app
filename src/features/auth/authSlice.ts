import { ApiError } from "@/config/api/api";
import { getMyBusinessesRequest } from "@/features/business/businessApi";
import type { Business } from "@/features/business/businessTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserRequest, loginRequest, logoutRequest, passwordResetRequest } from "./authApi";
import {
  clearStoredSession,
  loadActiveBusiness,
  loadSession,
  saveSession,
} from "./authStorage";
import type { AuthUser, BlockReason, Session } from "./authTypes";

type AuthStatus = "checking" | "idle" | "loading" | "authenticated";
type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: AuthUser | null;
  remember: boolean;
  blockReason: BlockReason | null;
  error: string | null;
  passwordReset: { status: RequestStatus; email: string | null; error: string | null };
}

const initialState: AuthState = {
  status: "checking",
  session: null,
  user: null,
  remember: true,
  blockReason: null,
  error: null,
  passwordReset: { status: "idle", email: null, error: null },
};

// Lo que regresa el login (y la restauración de sesión) para que
// businessSlice también pueda guardar la lista de negocios.
export interface SignedInPayload {
  session: Session;
  user: AuthUser;
  businesses: Business[];
  remember: boolean;
  rememberedBusinessSlug: string | null;
}

// Después de autenticar en Suajam revisamos si el usuario puede entrar
// y traemos sus negocios (tenants).
async function loadAccount(session: Session) {
  const user = await getUserRequest(session.authorization);
  if (!user.panel_access) return { user, businesses: [] };
  const businesses = await getMyBusinessesRequest(session.authorization);
  return { user, businesses };
}

function blockReasonFor(user: AuthUser, businesses: Business[]): BlockReason | null {
  if (!user.panel_access) return "no-panel-access";
  if (businesses.length === 0) return "no-business";
  return null;
}

function loginErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 0) return error.message;
  return "No se pudo iniciar sesión. Intenta nuevamente.";
}

export const login = createAsyncThunk<
  SignedInPayload,
  { email: string; password: string; remember: boolean },
  { rejectValue: string }
>("auth/login", async ({ email, password, remember }, { rejectWithValue }) => {
  try {
    const session = await loginRequest(email.trim().toLowerCase(), password);
    const { user, businesses } = await loadAccount(session);
    const canEnter = blockReasonFor(user, businesses) === null;
    if (remember && canEnter) await saveSession(session);
    return { session, user, businesses, remember, rememberedBusinessSlug: null };
  } catch (error) {
    return rejectWithValue(loginErrorMessage(error));
  }
});

// Al abrir la app: si el usuario marcó "Recordarme", recuperamos su sesión.
export const restoreSession = createAsyncThunk<SignedInPayload | null>(
  "auth/restoreSession",
  async () => {
    const session = await loadSession();
    if (!session) return null;
    try {
      const { user, businesses } = await loadAccount(session);
      if (blockReasonFor(user, businesses)) {
        await clearStoredSession();
        return null;
      }
      const rememberedBusinessSlug = await loadActiveBusiness();
      return { session, user, businesses, remember: true, rememberedBusinessSlug };
    } catch (error) {
      // Token vencido o inválido: se borra y se pide login de nuevo.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await clearStoredSession();
      }
      return null;
    }
  },
);

export const logout = createAsyncThunk<void, void, { state: { auth: AuthState } }>(
  "auth/logout",
  async (_, { getState }) => {
    const authorization = getState().auth.session?.authorization;
    await clearStoredSession();
    if (authorization) {
      // Si falla (sin conexión) igual cerramos la sesión local.
      await logoutRequest(authorization).catch(() => undefined);
    }
  },
);

export const requestPasswordReset = createAsyncThunk<string, string, { rejectValue: string }>(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    const normalized = email.trim().toLowerCase();
    try {
      await passwordResetRequest(normalized);
      return normalized;
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) return rejectWithValue(error.message);
      return rejectWithValue("No pudimos enviar el enlace. Intenta nuevamente.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    resetPasswordReset(state) {
      state.passwordReset = initialState.passwordReset;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { session, user, businesses, remember } = action.payload;
        state.status = "authenticated";
        state.session = session;
        state.user = user;
        state.remember = remember;
        state.blockReason = blockReasonFor(user, businesses);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "No se pudo iniciar sesión. Intenta nuevamente.";
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        if (!action.payload) {
          state.status = "idle";
          return;
        }
        state.status = "authenticated";
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.remember = true;
        state.blockReason = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = "idle";
      })

      // Se limpia en pending para que la pantalla cambie al instante.
      .addCase(logout.pending, (state) => {
        return { ...initialState, status: "idle", remember: state.remember };
      })

      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordReset = { status: "loading", email: null, error: null };
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.passwordReset = { status: "succeeded", email: action.payload, error: null };
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordReset = {
          status: "failed",
          email: null,
          error: action.payload ?? "No pudimos enviar el enlace. Intenta nuevamente.",
        };
      });
  },
});

export const { clearAuthError, resetPasswordReset } = authSlice.actions;
export default authSlice.reducer;
