/**
 * PadosiPro Border Radius Tokens
 * Soft 12px corner radius primary style.
 */
export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12, // Standard PadosiPro interactive corner radius
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
