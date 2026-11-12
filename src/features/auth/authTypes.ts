// GET /auth/user/ (definición LoginUser del Swagger)
export interface AuthUser {
  pk: string;
  email: string;
  first_name: string;
  last_name: string;
  has_tenant: boolean;
  panel_access: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  tenants: string[];
}

// POST /auth/login/ — el Swagger no documenta la respuesta, así que aceptamos
// las formas comunes de dj-rest-auth (JWT o token simple).
export interface LoginResponse {
  access?: string;
  access_token?: string;
  refresh?: string;
  refresh_token?: string;
  key?: string;
  token?: string;
  user?: AuthUser;
}

export interface Session {
  // Valor completo del header Authorization, ej. "JWT eyJ..."
  authorization: string;
  refresh: string | null;
}

export type BlockReason = "no-panel-access" | "no-business";
