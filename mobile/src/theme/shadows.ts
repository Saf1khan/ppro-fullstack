import { ViewStyle } from 'react-native';

/**
 * Premium Layered Depth Tokens
 * Designed to eliminate generic 1px borders using multi-layered realistic depth.
 */
export const shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  } as ViewStyle,
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,
  floatingBottom: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 8,
  } as ViewStyle,
} as const;

export type Shadows = typeof shadows;
