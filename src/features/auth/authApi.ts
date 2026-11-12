import { apiRequest } from "@/config/api/api";
import type { AuthUser, LoginResponse, Session } from "./authTypes";

export async function loginRequest(email: string, password: string): Promise<Session> {
  const data = await apiRequest<LoginResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
  });

  const jwt = data.access ?? data.access_token;
  if (jwt) {
    // Swagger: "Use Authorization: JWT <token>"
    return { authorization: `JWT ${jwt}`, refresh: data.refresh ?? data.refresh_token ?? null };
  }

  const key = data.key ?? data.token;
  if (key) {
    return { authorization: `Token ${key}`, refresh: null };
  }

  throw new Error("El servidor no devolvió un token de sesión.");
}

export function getUserRequest(authorization: string) {
  return apiRequest<AuthUser>("/auth/user/", { authorization });
}

export function logoutRequest(authorization: string) {
  return apiRequest<unknown>("/auth/logout/", { method: "POST", authorization });
}

export function passwordResetRequest(email: string) {
  return apiRequest<unknown>("/auth/password/reset/", {
    method: "POST",
    body: { email },
  });
}
