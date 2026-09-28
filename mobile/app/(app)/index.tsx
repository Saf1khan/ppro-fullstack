import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { profileApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { UserProfile } from '../../src/types/profile';

export default function AppHomeScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function fetchProfile() {
      try {
        const data = await profileApi.getMyProfile();
        if (!isCancelled) {
          setProfile(data);
        }
      } catch {
        // Profile might not exist if navigated here directly
      } finally {
        if (!isCancelled) {
          setLoadingProfile(false);
        }
      }
    }

    fetchProfile();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AUTHENTICATED & VERIFIED</Text>
          </View>
          <Text style={styles.title}>
            {profile ? `Welcome, ${profile.full_name}` : 'Welcome to PadosiPro'}
          </Text>
          <Text style={styles.subtitle}>
            {profile?.business_name
              ? `${profile.business_name} · Active Service Partner`
              : 'Your verified lifestyle manager account is active.'}
          </Text>
        </View>

        {/* Profile Details Card */}
        <Card style={styles.userCard}>
          <Text style={styles.cardSectionTitle}>Provider Profile</Text>

          {loadingProfile ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : profile ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name:</Text>
                <Text style={styles.detailValue}>{profile.full_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile Number:</Text>
                <Text style={[styles.detailValue, styles.monoText]}>
                  {profile.phone_number}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Operating Address:</Text>
                <Text style={[styles.detailValue, styles.addressText]}>
                  {profile.address}
                </Text>
              </View>
              {profile.business_name ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Business Name:</Text>
                  <Text style={styles.detailValue}>{profile.business_name}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Email:</Text>
              <Text style={styles.detailValue}>{user?.email}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Verified</Text>
            </View>
          </View>
        </Card>

        {/* Next Step Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Phase 4 Complete: First-Login Profile</Text>
          <Text style={styles.infoBody}>
            Profile details (Name, Indian +91 mobile, address, and optional business name) are saved and synchronized with your account.
          </Text>
          <Text style={styles.infoFooter}>
            Next: Phase 5 (Task Catalogue with 20+ tasks across 4 categories, search & multi-select).
          </Text>
        </Card>

        {/* Logout */}
        <Button
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          loading={loggingOut}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['4xl'],
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing['2xl'],
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
  userCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  cardSectionTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  addressText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  monoText: {
    fontFamily: theme.typography.fontFamily.monospace,
    fontSize: theme.typography.fontSize.sm,
  },
  statusPill: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusPillText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.label,
    fontWeight: theme.typography.fontWeight.bold,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing['2xl'],
    padding: theme.spacing.xl,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  infoBody: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.body,
    marginBottom: theme.spacing.sm,
  },
  infoFooter: {
    fontSize: theme.typography.fontSize.label,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});
