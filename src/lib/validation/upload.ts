/**
 * Validation des fichiers uploadés.
 *
 * Sans limite de taille, `await file.arrayBuffer()` charge tout en mémoire :
 * un fichier de plusieurs centaines de Mo fait tomber le worker. On vérifie
 * AVANT de lire quoi que ce soit.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 Mo

export const PDF_MIME = 'application/pdf';
export const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const;

export interface UploadError {
  error: string;
  status: number;
}

/**
 * Valide un champ `file` de FormData : présence, type MIME, taille.
 * Renvoie le File si valide, sinon un UploadError prêt à être renvoyé.
 */
export function validateUpload(
  value: FormDataEntryValue | null,
  allowedMimes: readonly string[]
): { file: File } | { error: UploadError } {
  if (!value || typeof value === 'string') {
    return { error: { error: 'Aucun fichier fourni', status: 400 } };
  }

  const file = value as File;

  if (!allowedMimes.includes(file.type)) {
    return {
      error: {
        error: `Format non supporté (${file.type || 'inconnu'}). Formats acceptés : ${allowedMimes.join(', ')}.`,
        status: 415,
      },
    };
  }

  // Contrôle de taille AVANT toute lecture en mémoire.
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0);
    return {
      error: {
        error: `Fichier trop volumineux (max ${mb} Mo).`,
        status: 413,
      },
    };
  }

  if (file.size === 0) {
    return { error: { error: 'Le fichier est vide.', status: 400 } };
  }

  return { file };
}
