export type BusinessRole = "owner" | "admin" | "staff";

// GET /accounts/my-tenants/ (definición UserTenant del Swagger).
// Cada negocio es un tenant con su propia base de datos (schema).
export interface Business {
  tenant_id: number;
  tenant_slug: string;
  tenant_name: string;
  tenant_schema: string;
  role: BusinessRole;
  // El Swagger lo marca como string, pero puede llegar como lista.
  domains: unknown;
  subscription: string;
}

export const roleLabels: Record<BusinessRole, string> = {
  owner: "Dueño",
  admin: "Admin",
  staff: "Staff",
};
