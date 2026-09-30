/**
 * PadosiPro Typography Tokens
 * Powered by Plus Jakarta Sans for premium geometric clarity.
 */
import { Platform, TextStyle } from 'react-native';

const FONT_FAMILY = Platform.OS === 'web'
  ? '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  : 'System';

export const typography = {
  fontFamily: {
    heading: FONT_FAMILY,
    body: FONT_FAMILY,
    monospace: 'Courier',
  },
  fontSize: {
    caption: 11,
    label: 12,
    sm: 14,
    body: 15,
    subheading: 18,
    h3: 20,
    h2: 24,
    h1: 28,
  },
  lineHeight: {
    caption: 15,
    label: 17,
    sm: 21,
    body: 23,
    subheading: 26,
    h3: 28,
    h2: 32,
    h1: 36,
  },
  fontWeight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
  },
} as const;

export type Typography = typeof typography;
