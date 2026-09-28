/**
 * PadosiPro Color Palette Tokens
 * Reference values observed from PadosiPro design system.
 */
export const colors = {
  // Primary brand / action
  primary: '#155C49',
  primaryHover: '#104738',
  primaryLight: '#E8F2EE',

  // Text
  textPrimary: '#101828',
  textSecondary: '#667085',
  textInverse: '#FFFFFF',

  // Canvas & Surfaces
  background: '#FAFAF7',
  surface: '#FFFFFF',

  // Borders & Dividers
  border: '#E4E7EC',
  borderFocus: '#155C49',

  // Feedback states
  error: '#D92D20',
  errorLight: '#FEF3F2',
  success: '#079455',
  successLight: '#ECFDF3',
  warning: '#F79009',
  warningLight: '#FFFAEB',
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;
