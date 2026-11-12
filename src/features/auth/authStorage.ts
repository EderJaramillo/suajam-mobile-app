import * as SecureStore from "expo-secure-store";
import type { Session } from "./authTypes";

// Solo se guarda cuando el usuario marca "Recordarme".
const SESSION_KEY = "suajam.session";
const ACTIVE_BUSINESS_KEY = "suajam.activeBusiness";

export async function saveSession(session: Session) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function saveActiveBusiness(slug: string) {
  await SecureStore.setItemAsync(ACTIVE_BUSINESS_KEY, slug);
}

export function loadActiveBusiness() {
  return SecureStore.getItemAsync(ACTIVE_BUSINESS_KEY);
}

export async function clearStoredSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  await SecureStore.deleteItemAsync(ACTIVE_BUSINESS_KEY);
}
