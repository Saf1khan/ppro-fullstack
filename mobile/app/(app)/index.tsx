import React, { useState } from 'react';
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
import { theme } from '../../src/theme';

export default function AppHomeScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

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
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AUTHENTICATED</Text>
          </View>
          <Text style={styles.title}>Welcome to PadosiPro</Text>
          <Text style={styles.subtitle}>
            Your account is verified and securely authenticated.
          </Text>
        </View>

        <Card style={styles.userCard}>
          <Text style={styles.cardSectionTitle}>Active Session</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{user?.email || 'Loading...'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Status:</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Verified</Text>
            </View>
          </View>
          {user?.id ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User ID:</Text>
              <Text style={[styles.detailValue, styles.monoText]}>
                {user.id.slice(0, 8)}...{user.id.slice(-4)}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Phase 3 Authentication Complete</Text>
          <Text style={styles.infoBody}>
            Native registration, OTP verification, local email delivery, and JWT session persistence via hardware-backed SecureStore are fully operational.
          </Text>
          <Text style={styles.infoFooter}>
            Next phase: First-login profile setup & task selection onboarding.
          </Text>
        </Card>

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
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
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
