import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

// Require the official PadosiPro logo asset
const logoSource = require('../../assets/logo.png');

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  withText?: boolean;
  tagline?: string;
  horizontal?: boolean;
  style?: ViewStyle;
}

export function BrandLogo({
  size = 'md',
  withText = false,
  tagline,
  horizontal = false,
  style,
}: BrandLogoProps) {
  let dimension = 48;
  let radius = 12;

  if (typeof size === 'number') {
    dimension = size;
    radius = Math.round(size * 0.24);
  } else {
    switch (size) {
      case 'xs':
        dimension = 28;
        radius = 7;
        break;
      case 'sm':
        dimension = 36;
        radius = 9;
        break;
      case 'md':
        dimension = 48;
        radius = 12;
        break;
      case 'lg':
        dimension = 64;
        radius = 16;
        break;
      case 'xl':
        dimension = 84;
        radius = 20;
        break;
    }
  }

  const imageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radius,
  };

  return (
    <View
      style={[
        styles.container,
        horizontal ? styles.containerHorizontal : styles.containerVertical,
        style,
      ]}
    >
      <View
        style={[
          styles.logoWrapper,
          {
            width: dimension,
            height: dimension,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={logoSource}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </View>

      {withText && (
        <View
          style={[
            styles.textContainer,
            horizontal ? styles.textContainerHorizontal : styles.textContainerVertical,
          ]}
        >
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.brandTitle,
                dimension >= 64 ? styles.brandTitleLg : dimension <= 36 ? styles.brandTitleSm : null,
              ]}
            >
              Padosi<Text style={styles.brandTitleAccent}>Pro</Text>
            </Text>
          </View>
          {tagline ? (
            <Text
              style={[
                styles.brandTagline,
                dimension <= 36 ? styles.brandTaglineSm : null,
              ]}
            >
              {tagline}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    overflow: 'hidden',
    backgroundColor: '#0F1E19',
    shadowColor: '#155C49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(21, 92, 73, 0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    justifyContent: 'center',
  },
  textContainerVertical: {
    alignItems: 'center',
    marginTop: 10,
  },
  textContainerHorizontal: {
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandTitleLg: {
    fontSize: 26,
    letterSpacing: -0.8,
  },
  brandTitleSm: {
    fontSize: 16,
    letterSpacing: -0.4,
  },
  brandTitleAccent: {
    color: '#155C49',
  },
  brandTagline: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  brandTaglineSm: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
