/**
 * cn — combina clases Tailwind de forma segura.
 *
 *  - clsx:  une condicionales (true/false) y arrays
 *  - twMerge: resuelve conflictos de Tailwind (e.g. "px-2 px-4" → "px-4")
 *
 * Uso:
 *   cn("px-2 py-1", isActive && "bg-primary-600", className)
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
