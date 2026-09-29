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

      await login(tokenResponse.access_token);
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
        <View style={styles.centerContainer}>
          <Card variant="elevated" style={styles.authCard}>
            {/* Brand Header */}
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeDot}>●</Text>
              <Text style={styles.brandBadgeText}>PADOSIPRO PARTNER</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to manage your neighbourhood service requests.
              </Text>
            </View>

            {infoBanner ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{infoBanner}</Text>
              </View>
            ) : null}

            {serverError ? (
              <View style={styles.errorCard}>
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
  infoCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#A6F4C5',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    padding: 14,
  },
  infoText: {
    color: '#027A48',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
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
  verifyRedirectButton: {
    marginTop: 12,
    borderColor: '#D92D20',
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
