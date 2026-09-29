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

      await refreshUser();
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
          <View style={styles.centerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>STEP 1 OF 2 · PROVIDER SETUP</Text>
              </View>
              <Text style={styles.title}>Complete Profile</Text>
              <Text style={styles.subtitle}>
                Tell us who you are so local customers can discover and book your services.
              </Text>
            </View>

            {/* User Account Pill */}
            <View style={styles.accountPill}>
              <Text style={styles.accountCheck}>✓</Text>
              <Text style={styles.accountPillLabel}>Verified ID:</Text>
              <Text style={styles.accountPillEmail}>{user?.email}</Text>
            </View>

            {/* Form Card */}
            <Card variant="elevated" style={styles.formCard}>
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

              {/* Address */}
              <Input
                label="Service Address / Operating Area *"
                placeholder="Flat / Building, Street, Locality, City"
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
                label="Business / Trade Name (Optional)"
                placeholder="e.g. Kumar Maintenance Solutions"
                value={businessName}
                onChangeText={setBusinessName}
                helperText="Optional: Leave blank if operating independently."
                autoCapitalize="words"
              />

              <Button
                title="Save & Continue to Services →"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: '#155C49',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 20,
    gap: 8,
    ...theme.shadows.subtle,
  },
  accountCheck: {
    color: '#027A48',
    fontSize: 14,
    fontWeight: '800',
  },
  accountPillLabel: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '600',
  },
  accountPillEmail: {
    fontSize: 13,
    color: '#101828',
    fontWeight: '700',
  },
  formCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F4F7',
    ...theme.shadows.card,
  },
  multilineInput: {
    minHeight: 76,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorBanner: {
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D92D20',
  },
  errorBannerText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 12,
  },
});
