import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { formatApiErrorMessage, profileApi } from '../../src/services/api';
import { theme } from '../../src/theme';

export default function ProfileOnboardingScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanedPhone = phoneNumber.replace(/[\s\-()]/g, '');
    const indianMobileRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!cleanedPhone) {
      newErrors.phoneNumber = 'Mobile number is required';
    } else if (!indianMobileRegex.test(cleanedPhone)) {
      newErrors.phoneNumber =
        'Enter a valid 10-digit Indian mobile number (e.g. 98765 43210)';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Please enter a complete address (min 5 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await profileApi.createProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        business_name: businessName.trim() ? businessName.trim() : undefined,
      });

      // Update session state so has_profile is now true
      await refreshUser();

      // Transition to next onboarding step: Task Selection
      router.replace('/(onboarding)/task-selection');
    } catch (err) {
      setApiError(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>STEP 1 OF 2 · ONBOARDING</Text>
            </View>
            <Text style={styles.title}>Provider Profile</Text>
            <Text style={styles.subtitle}>
              Tell us who you are so neighborhood clients and your lifestyle
              manager can connect with you.
            </Text>
          </View>

          {/* User Account Pill */}
          <View style={styles.accountPill}>
            <Text style={styles.accountPillLabel}>Verified Account:</Text>
            <Text style={styles.accountPillEmail}>{user?.email}</Text>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            {apiError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <Input
              label="Full Name *"
              placeholder="e.g. Ramesh Kumar"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: '' }));
                }
              }}
              error={errors.fullName}
              autoCapitalize="words"
            />

            {/* Indian Mobile Number */}
            <View style={styles.phoneSection}>
              <Input
                label="Mobile Number (Indian +91) *"
                placeholder="98765 43210"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) {
                    setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                  }
                }}
                error={errors.phoneNumber}
                keyboardType="phone-pad"
                helperText="10-digit number. We will prefix +91 automatically."
              />
            </View>

            {/* Address */}
            <Input
              label="Service Address / Operating Area *"
              placeholder="House/Flat No., Street, Locality, City, PIN"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: '' }));
                }
              }}
              error={errors.address}
              multiline
              numberOfLines={3}
              style={styles.multilineInput}
            />

            {/* Business Name (Optional) */}
            <Input
              label="Business / Agency Name (Optional)"
              placeholder="e.g. Kumar Home Maintenance"
              value={businessName}
              onChangeText={setBusinessName}
              helperText="Optional: Leave blank if operating as an independent pro."
              autoCapitalize="words"
            />

            <Button
              title="Save & Continue"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['4xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    lineHeight: theme.typography.lineHeight.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textSecondary,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  accountPillLabel: {
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.textSecondary,
  },
  accountPillEmail: {
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  formCard: {
    padding: theme.spacing.xl,
  },
  phoneSection: {
    marginBottom: theme.spacing.xs,
  },
  multilineInput: {
    minHeight: 76,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  errorBanner: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorBannerText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
