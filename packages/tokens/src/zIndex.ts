/**
 * RASHX Z-Index Scale
 */

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 450,
  toast: 500,
  tooltip: 600,
  max: 9999,
} as const;

export type ZIndexKey = keyof typeof zIndex;
