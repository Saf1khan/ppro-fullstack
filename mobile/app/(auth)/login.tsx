import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Input } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { authApi, formatApiErrorMessage } from '../../src/services/api';
import { theme } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ email?: string; verified?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [infoBanner, setInfoBanner] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
    if (params.verified === 'true') {
      setInfoBanner('Email verified successfully! Please sign in with your credentials.');
    }
  }, [params.email, params.verified]);

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setServerError('');
    setIsUnverified(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    setServerError('');
    setIsUnverified(false);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const tokenResponse = await authApi.login({
        email: normalizedEmail,
        password,
      });

      // Save token in SecureStore and update AuthContext
      await login(tokenResponse.access_token);
      // Navigation to (app) is automatically handled by the root route protection hook
    } catch (err: unknown) {
      const msg = formatApiErrorMessage(err);
      setServerError(msg);
      if (msg.toLowerCase().includes('verification required') || msg.toLowerCase().includes('not verified')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to your PadosiPro account.
          </Text>
        </View>

        {infoBanner ? (
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>{infoBanner}</Text>
          </Card>
        ) : null}

        {serverError ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Sign In Failed</Text>
            <Text style={styles.errorMessage}>{serverError}</Text>
            {isUnverified && (
              <Button
                title="Verify Email Now"
                variant="outline"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: '/(auth)/verify-email',
                    params: { email: email.trim().toLowerCase() },
                  })
                }
                style={styles.verifyRedirectButton}
              />
            )}
          </Card>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
              if (serverError) setServerError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="Your account password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
              if (serverError) setServerError('');
            }}
            isPassword
            autoCapitalize="none"
            error={passwordError}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/register')}
            accessibilityRole="button"
            accessibilityLabel="Sign up"
          >
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['4xl'],
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    lineHeight: theme.typography.lineHeight.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
    borderWidth: 1,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  infoText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorCard: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
    borderWidth: 1,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    lineHeight: theme.typography.lineHeight.sm,
  },
  verifyRedirectButton: {
    marginTop: theme.spacing.md,
    borderColor: theme.colors.error,
  },
  form: {
    marginBottom: theme.spacing['2xl'],
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
  linkText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
