import { ViewStyle } from 'react-native';

/**
 * Zepto-style subtle elevation shadows
 * Provides soft, layered depth without harsh outlines.
 */
export const shadows = {
  subtle: {
    shadowColor: '#00000F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  card: {
    shadowColor: '#00000F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  } as ViewStyle,
  cardHover: {
    shadowColor: '#00000F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 5,
  } as ViewStyle,
  floatingBottom: {
    shadowColor: '#00000F',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 10,
  } as ViewStyle,
} as const;

export type Shadows = typeof shadows;
