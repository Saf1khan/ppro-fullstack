/**
 * PadosiPro Typography Tokens
 * Pairs reference display scale with mobile system font stacks.
 */
import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    heading: 'System', // Reference: Eina01-SemiBold
    body: 'System',
    monospace: 'Courier',
  },
  fontSize: {
    caption: 11,
    label: 12,
    sm: 14,
    body: 16,
    subheading: 18,
    h3: 20,
    h2: 24,
    h1: 30,
  },
  lineHeight: {
    caption: 14,
    label: 16,
    sm: 20,
    body: 24,
    subheading: 26,
    h3: 28,
    h2: 32,
    h1: 38,
  },
  fontWeight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
} as const;

export type Typography = typeof typography;
