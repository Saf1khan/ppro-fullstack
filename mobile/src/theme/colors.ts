/**
 * PadosiPro Premium Color Palette
 * Designed for optical comfort and reduced eye-strain.
 */
export const colors = {
  // Primary brand / action (Forest Emerald)
  primary: '#155C49',
  primaryHover: '#104738',
  primaryLight: '#E8F5F1',
  primaryDisabled: '#93B2A9',

  // Anti-Generic Typography Colors (Never pure #000)
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  // Canvas & Surfaces (Soft #F9FAFB canvas)
  background: '#F9FAFB',
  surface: '#FFFFFF',

  // Subtle Borders
  border: '#E5E7EB',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  borderFocus: '#155C49',

  // Feedback states
  error: '#DC2626',
  errorLight: '#FEF2F2',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;
