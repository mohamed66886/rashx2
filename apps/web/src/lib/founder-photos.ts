/**
 * Founder photo discovery (server only).
 *
 * Drop images into apps/web/public/images/founder/ and they appear on /founder
 * automatically. Nothing is rendered, and nothing is put into JSON-LD, for a file
 * that does not exist, so the page never ships a broken image.
 *
 *   main.jpg   the hero portrait (jpg, jpeg, png, webp or avif)
 *   og.jpg     optional 1200x630 share image (jpg or png)
 *   anything else with an image extension goes into the gallery, sorted by name
 */

import { readdirSync } from 'node:fs';
import path from 'node:path';
import {
  FOUNDER_MAIN_PHOTO,
  FOUNDER_OG_PHOTO,
  FOUNDER_PHOTO_DIR,
} from '@rashx/content';

const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

export interface FounderPhotos {
  /** Public path such as "/images/founder/main.jpg", or null when missing. */
  main: string | null;
  og: string | null;
  gallery: string[];
}

function baseName(file: string): string {
  return file.replace(/\.[^.]+$/, '').toLowerCase();
}

export function getFounderPhotos(): FounderPhotos {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), 'public', FOUNDER_PHOTO_DIR)).filter((file) =>
      IMAGE_FILE.test(file),
    );
  } catch {
    // Folder not created yet: no photos.
  }

  const toPublicPath = (file: string) => `/${FOUNDER_PHOTO_DIR}/${file}`;
  const main = files.find((file) => baseName(file) === FOUNDER_MAIN_PHOTO);
  const og = files.find((file) => baseName(file) === FOUNDER_OG_PHOTO);
  const gallery = files
    .filter((file) => file !== main && file !== og)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map(toPublicPath);

  return {
    main: main ? toPublicPath(main) : null,
    og: og ? toPublicPath(og) : null,
    gallery,
  };
}
