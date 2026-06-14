/**
 * Motion presets — Apple HIG / visionOS spring-based animations.
 *
 *  - Todos <500ms para sensación de inmediatez.
 *  - Spring con damping alto (28-32) → rebote mínimo.
 *  - Stagger de 40ms para listas.
 *  - Respeta prefers-reduced-motion automáticamente.
 */

import { useReducedMotion } from 'framer-motion';

export const STAGGER_CHILDREN = 0.04; // 40ms

/** Si el usuario prefiere reduced-motion, devolver variantes simples de fade. */
function reducedGuard(variants: any) {
  // Framer Motion's useReducedMotion hook is React-only;
  // we wrap at component level. Presets stay pure.
  return variants;
}

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const },
};

export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { type: 'spring' as const, damping: 28, stiffness: 280 },
};

export const sheet = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring' as const, damping: 30, stiffness: 300 },
};

export const liquidHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, damping: 20, stiffness: 400 },
};

export const numberTick = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.2, 0, 0, 1] as const },
};

export const listContainer = {
  animate: {
    transition: { staggerChildren: STAGGER_CHILDREN },
  },
};

export const listItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0, 0, 0.2, 1] as const },
};

/** Hook que devuelve variantes simplificadas si reduced-motion está activo. */
export function useSafeMotion() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return {
      fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } },
      slideUp: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } },
      liquidHover: {},
      numberTick: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
      listContainer: {},
      listItem: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
    };
  }

  return { fadeIn, slideUp, sheet, liquidHover, numberTick, listContainer, listItem };
}
