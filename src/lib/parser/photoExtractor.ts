import { extractImages, getDocumentProxy } from 'unpdf';
import sharp from 'sharp';
import { logger } from '@/lib/logger';

/**
 * Extrait la photo de profil (portrait) d'un CV PDF, si présente.
 *
 * Méthode : on récupère toutes les images embarquées via `unpdf`, on écarte les
 * logos/icônes/décorations par heuristique, et on garde le meilleur candidat
 * "portrait". Aucune IA, aucun réseau — rapide et privé.
 *
 * Renvoie une data URL JPEG (`data:image/jpeg;base64,...`) ou null si aucune
 * photo plausible n'est trouvée. Ne jette jamais : l'import du CV ne doit pas
 * échouer à cause de la photo (upload manuel possible en repli).
 */

interface Candidate {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  channels: 1 | 3 | 4;
  score: number;
}

// Une photo de portrait n'est ni minuscule (icône) ni un mince bandeau.
const MIN_SIDE = 100; // px
const MIN_AREA = 100 * 120;

/** Proportion de pixels dont la teinte ressemble à de la peau (visage probable). */
function skinRatio(data: Uint8ClampedArray, channels: number): number {
  if (channels < 3) return 0; // niveaux de gris : pas de signal couleur
  let skin = 0;
  let total = 0;
  // Échantillonnage : 1 pixel sur N pour rester rapide sur les grandes images.
  const step = channels * 17;
  for (let i = 0; i + 2 < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total++;
    // Règle classique de détection de peau en RGB (Kovac et al.).
    if (
      r > 95 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15
    ) {
      skin++;
    }
  }
  return total ? skin / total : 0;
}

function scoreCandidate(img: {
  width: number;
  height: number;
  channels: number;
  data: Uint8ClampedArray;
}): number {
  const { width, height, channels, data } = img;
  const area = width * height;

  // Éliminatoires : trop petit, ou une seule dimension trop courte.
  if (width < MIN_SIDE || height < MIN_SIDE || area < MIN_AREA) return 0;

  const ratio = width / height; // <1 = portrait
  // Une photo d'identité est en orientation portrait, ratio ~0.6–0.9.
  // On pénalise le paysage large (souvent une bannière/logo) et le carré parfait.
  let ratioScore: number;
  if (ratio <= 1.05) {
    // portrait ou quasi-carré : idéal autour de 0.75
    ratioScore = 1 - Math.min(1, Math.abs(ratio - 0.78) / 0.5);
  } else {
    // paysage : peu probable pour un portrait
    ratioScore = Math.max(0, 0.4 - (ratio - 1.05));
  }

  const skin = skinRatio(data, channels);
  // La peau est le signal le plus discriminant (logo => ~0). On la pondère fort,
  // le ratio et la taille départagent ensuite.
  const sizeScore = Math.min(1, area / (400 * 500));
  return skin * 3 + ratioScore * 1.2 + sizeScore * 0.5;
}

export async function extractPhotoFromPdf(buffer: Buffer): Promise<string | null> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const pageCount = pdf.numPages;

    let best: Candidate | null = null;

    // La photo est presque toujours sur la 1re page ; on borne à 2 pages pour
    // le coût, tout en couvrant les CV dont l'en-tête déborde.
    const pagesToScan = Math.min(pageCount, 2);
    for (let page = 1; page <= pagesToScan; page++) {
      let images: Awaited<ReturnType<typeof extractImages>>;
      try {
        images = await extractImages(pdf, page);
      } catch {
        continue; // page sans image extractible
      }

      for (const img of images) {
        const score = scoreCandidate(img);
        if (score > 0 && (!best || score > best.score)) {
          best = { ...img, score };
        }
      }
    }

    if (!best) return null;

    // Recompose l'image brute (pixels) en JPEG compact via sharp.
    const channels = best.channels;
    const jpeg = await sharp(Buffer.from(best.data.buffer), {
      raw: { width: best.width, height: best.height, channels },
    })
      .jpeg({ quality: 82 })
      .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch (error) {
    // Non bloquant : on log et on renvoie null (l'upload manuel reste possible).
    logger.warn('cv.photo_extract_failed', undefined, error);
    return null;
  }
}
