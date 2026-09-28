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
import { Button, Card } from '../../src/components';
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
      // Brief delay so user sees success feedback, then route to Login
      setTimeout(() => {
        router.replace({
          pathname: '/(auth)/login',
          params: { email, verified: 'true' },
        });
      }, 1200);
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

      // Restart 30-second cooldown
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
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit verification code sent to:
          </Text>
          <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
        </View>

        {successMessage ? (
          <Card style={styles.successCard}>
            <Text style={styles.successText}>{successMessage}</Text>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Verification Error</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </Card>
        ) : null}

        <View style={styles.otpContainer}>
          <Text style={styles.inputLabel}>6-Digit Code</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(text) => {
              // Only allow digits up to 6 characters
              const sanitized = text.replace(/[^0-9]/g, '').slice(0, 6);
              setOtp(sanitized);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
            accessibilityLabel="6-digit verification code"
          />
          <Text style={styles.helperText}>
            Code expires in 10 minutes. Maximum 5 attempts allowed.
          </Text>
        </View>

        <Button
          title="Verify Email"
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
  emailHighlight: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  successCard: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
    borderWidth: 1,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  successText: {
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
  otpContainer: {
    marginBottom: theme.spacing['2xl'],
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  otpInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    minHeight: 56,
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 12,
    textAlign: 'center',
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
  },
  helperText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: theme.spacing.xl,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  resendQuestion: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  resendDisabled: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.regular,
  },
  backSection: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  backLink: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
