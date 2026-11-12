export const SUAJAM_API_URL = "https://api.ukimil.com/api/v1";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  authorization?: string | null;
  baseUrl?: string;
};

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    authorization,
    baseUrl = SUAJAM_API_URL,
  }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (authorization) headers.Authorization = authorization;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Solo en desarrollo: el motivo real ayuda a distinguir red caída de un archivo ilegible.
    if (__DEV__) console.warn(`[api] ${method} ${path} falló:`, error instanceof Error ? error.message : error);
    throw new ApiError(
      "Sin conexión. Revisa tu internet e intenta nuevamente.",
      0,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status, data);
  }

  return data as T;
}

function extractErrorMessage(data: unknown): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string") return value;
    }
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
