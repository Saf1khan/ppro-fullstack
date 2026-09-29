import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input } from '../../src/components';
import { authApi, formatApiErrorMessage } from '../../src/services/api';
import { theme } from '../../src/theme';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setServerError('');

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    setServerError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authApi.register({
        email: normalizedEmail,
        password,
        confirm_password: confirmPassword,
      });

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: normalizedEmail },
      });
    } catch (err: unknown) {
      const message = formatApiErrorMessage(err);
      setServerError(message);
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
        <View style={styles.centerContainer}>
          <Card variant="elevated" style={styles.authCard}>
            {/* Header Badge */}
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeDot}>●</Text>
              <Text style={styles.brandBadgeText}>JOIN PADOSIPRO</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Start offering verified home and local services in your neighborhood.
              </Text>
            </View>

            {serverError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Registration Failed</Text>
                <Text style={styles.errorMessage}>{serverError}</Text>
              </View>
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
                placeholder="At least 8 characters"
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

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                  if (serverError) setServerError('');
                }}
                isPassword
                autoCapitalize="none"
                error={confirmPasswordError}
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
    minHeight: '100%',
  },
  centerContainer: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  authCard: {
    padding: 28,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F4F7',
    ...theme.shadows.card,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 16,
    gap: 6,
  },
  brandBadgeDot: {
    fontSize: 8,
    color: theme.colors.primary,
  },
  brandBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#667085',
  },
  errorCard: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    padding: 14,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D92D20',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#B42318',
    lineHeight: 18,
  },
  form: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  footerText: {
    fontSize: 14,
    color: '#667085',
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
