import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { theme } from '../src/theme';

function NavigationGuard() {
  const { status, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'initializing') return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(app)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (status === 'unauthenticated' && (inProtectedGroup || inOnboardingGroup)) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated') {
      if (user && user.has_profile === false) {
        // Needs first-login profile onboarding
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)/profile');
        }
      } else if (user && user.has_profile === true) {
        // Already has completed profile
        const segs = segments as string[];
        if (inAuthGroup || (inOnboardingGroup && segs[1] === 'profile')) {
          router.replace('/(app)');
        }
      }
    }
  }, [status, segments, user]);

  if (status === 'initializing') {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.brandTitle}>PadosiPro</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.textPrimary,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(onboarding)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <AuthProvider>
        <NavigationGuard />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.5,
  },
});
