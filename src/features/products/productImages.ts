// El Swagger marca `main_model` e `images` como texto sin describir su forma.
// Puede llegar una URL, una ruta relativa (/media/...), JSON, una lista o un objeto:
// aquí se aceptan todas y se devuelven URLs completas.

// La API manda { url: "tenants/…" (ruta interna), public_url: "https://…s3…" }:
// public_url es la que se puede mostrar, por eso va primero.
const IMAGE_KEYS = [
  "public_url",
  "image_url",
  "image",
  "images",
  "url",
  "file",
  "src",
  "thumbnail",
  "photo",
];
const URL_PATTERN = /(https?:\/\/[^\s'",\]}]+|\/media\/[^\s'",\]}]+)/g;

export function extractImageUrls(value: unknown): string[] {
  if (!value) return [];

  if (typeof value === "string") {
    const text = value.trim();
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        return extractImageUrls(JSON.parse(text));
      } catch {
        // No es JSON válido (por ejemplo, un dict de Python): se buscan URLs en el texto.
      }
    }
    const found = text.match(URL_PATTERN);
    if (found) return found;
    return /\.(jpe?g|png|webp|gif|heic)(\?.*)?$/i.test(text) ? [text] : [];
  }

  if (Array.isArray(value)) return value.flatMap(extractImageUrls);

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of IMAGE_KEYS) {
      const urls = extractImageUrls(record[key]);
      if (urls.length > 0) return urls;
    }
  }
  return [];
}

// Las rutas relativas se sirven desde el dominio del negocio.
export function resolveImageUrl(url: string, businessApiUrl: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  const origin = businessApiUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function firstImageUrl(value: unknown, businessApiUrl: string): string | null {
  const [url] = extractImageUrls(value);
  return url ? resolveImageUrl(url, businessApiUrl) : null;
}
