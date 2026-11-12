import { apiRequest } from "@/config/api/api";
import type { Business } from "./businessTypes";

export function getMyBusinessesRequest(authorization: string) {
  return apiRequest<Business[]>("/accounts/my-tenants/", { authorization });
}

// Cada negocio tiene su propia base de datos y se llega a ella por su dominio.
function getBusinessHost(domains: unknown): string | null {
  const first = Array.isArray(domains) ? domains[0] : domains;
  const value =
    typeof first === "string" ? first : (first as { domain?: string } | null | undefined)?.domain;
  const host = value?.split(",")[0].trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host || null;
}

export function getBusinessApiUrl(business: Business): string | null {
  const host = getBusinessHost(business.domains);
  return host ? `https://${host}/api/v1` : null;
}
