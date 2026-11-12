import { File, Paths } from "expo-file-system";

// El borrador del producto se guarda en el teléfono para poder retomarlo si la app se cierra.
// Un archivo por negocio, así no se mezclan borradores entre negocios.
const draftFile = (businessSlug: string) =>
  new File(Paths.document, `borrador-producto-${businessSlug.replace(/[^a-z0-9_-]/gi, "_")}.json`);

export function saveDraftFile(businessSlug: string, draft: object) {
  try {
    draftFile(businessSlug).write(JSON.stringify(draft));
  } catch {
    // Si no se puede guardar, la app sigue funcionando; solo no se podrá retomar.
  }
}

export function loadDraftFile<T>(businessSlug: string): T | null {
  try {
    const file = draftFile(businessSlug);
    if (!file.exists) return null;
    return JSON.parse(file.textSync()) as T;
  } catch {
    return null;
  }
}

export function deleteDraftFile(businessSlug: string) {
  try {
    const file = draftFile(businessSlug);
    if (file.exists) file.delete();
  } catch {
    // Nada que hacer: el archivo ya no está o no se puede tocar.
  }
}
