import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrandLogo, Button, Card } from '../../src/components';
import { authApi, formatApiErrorMessage } from '../../src/services/api';
import { theme } from '../../src/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email || '').trim().toLowerCase();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend cooldown timer (30s default)
  const [cooldownSeconds, setCooldownSeconds] = useState(30);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start 30s cooldown on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleVerify = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setErrorMessage('Missing target email address. Please return to registration.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyEmail({
        email,
        otp: cleanOtp,
      });

      setSuccessMessage(response.message || 'Email verified successfully!');
      setTimeout(() => {
        router.replace({
          pathname: '/(auth)/login',
          params: { email, verified: 'true' },
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = formatApiErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending || !email) return;

    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authApi.resendOtp({ email });
      setSuccessMessage(response.message || 'A new 6-digit code has been sent.');
      setOtp('');

      setCooldownSeconds(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = formatApiErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setResending(false);
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
            {/* Brand Logo & Header */}
            <View style={styles.brandHeaderContainer}>
              <BrandLogo size="lg" withText tagline="Secure Authentication" />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Check Your Inbox</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to
              </Text>
              <View style={styles.emailPill}>
                <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
              </View>
            </View>

            {successMessage ? (
              <View style={styles.successCard}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Verification Error</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.otpContainer}>
              <Text style={styles.inputLabel}>Enter 6-Digit Code</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(text) => {
                  const sanitized = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setOtp(sanitized);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#D0D5DD"
                autoFocus
                accessibilityLabel="6-digit verification code"
              />
              <Text style={styles.helperText}>
                Code expires in 10 minutes · 5 attempts max
              </Text>
            </View>

            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6 || loading}
              style={styles.verifyButton}
            />

            <View style={styles.resendSection}>
              <Text style={styles.resendQuestion}>Didn't receive the email? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={cooldownSeconds > 0 || resending}
                accessibilityRole="button"
                accessibilityState={{ disabled: cooldownSeconds > 0 || resending }}
              >
                <Text
                  style={[
                    styles.resendLink,
                    cooldownSeconds > 0 && styles.resendDisabled,
                  ]}
                >
                  {cooldownSeconds > 0
                    ? `Resend in ${cooldownSeconds}s`
                    : resending
                    ? 'Sending...'
                    : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.backSection}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/register')}
                accessibilityRole="button"
              >
                <Text style={styles.backLink}>Change email address</Text>
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
    backgroundColor: '#F9FAFB',
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
    maxWidth: 440,
    alignSelf: 'center',
  },
  authCard: {
    padding: 32,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...theme.shadows.card,
  },
  brandHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  emailPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  successCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#A6F4C5',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    padding: 14,
  },
  successText: {
    color: '#027A48',
    fontSize: 14,
    fontWeight: '600',
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
  otpContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#FAFAF8',
    borderWidth: 1.5,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    minHeight: 56,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 14,
    textAlign: 'center',
    color: theme.colors.primary,
    paddingHorizontal: 16,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#667085',
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: 20,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendQuestion: {
    fontSize: 14,
    color: '#667085',
  },
  resendLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#98A2B3',
    fontWeight: '400',
  },
  backSection: {
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  backLink: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },
});
