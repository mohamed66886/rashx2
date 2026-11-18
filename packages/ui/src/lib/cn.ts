/**
 * Class name utility — combines clsx + tailwind-merge
 * This is the ONLY place where cn() is defined. Import from here everywhere.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
