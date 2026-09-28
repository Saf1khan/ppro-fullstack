import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { profileApi, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { UserProfile } from '../../src/types/profile';
import { Task } from '../../src/types/task';

export default function AppHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileData, tasksData] = await Promise.all([
        profileApi.getMyProfile().catch(() => null),
        tasksApi.getMySelectedTasks().catch(() => ({ total_count: 0, tasks: [] })),
      ]);
      setProfile(profileData);
      setSelectedTasks(tasksData.tasks || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERIFIED SERVICE PROVIDER</Text>
          </View>
          <Text style={styles.title}>
            {profile ? `Welcome, ${profile.full_name}` : 'Welcome to PadosiPro'}
          </Text>
          <Text style={styles.subtitle}>
            {profile?.business_name
              ? `${profile.business_name} · Active in your local service area`
              : 'Your verified lifestyle manager account is active.'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Provider Profile Summary Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>Provider Identity</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>Verified</Text>
                </View>
              </View>

              {profile ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile Phone:</Text>
                    <Text style={[styles.detailValue, styles.monoText]}>
                      {profile.phone_number}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Address:</Text>
                    <Text style={[styles.detailValue, styles.addressText]}>
                      {profile.address}
                    </Text>
                  </View>
                  {profile.business_name ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Business:</Text>
                      <Text style={styles.detailValue}>{profile.business_name}</Text>
                    </View>
                  ) : null}
                </>
              ) : null}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Email:</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
            </Card>

            {/* Selected Tasks Section */}
            <View style={styles.tasksSectionHeader}>
              <View>
                <Text style={styles.sectionHeading}>Your Selected Services</Text>
                <Text style={styles.sectionSubheading}>
                  {selectedTasks.length} {selectedTasks.length === 1 ? 'service' : 'services'} actively offered
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editServicesButton}
                onPress={() => router.push('/(onboarding)/task-selection')}
              >
                <Text style={styles.editServicesText}>
                  {selectedTasks.length > 0 ? 'Edit' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTasks.length === 0 ? (
              <Card style={styles.emptyTasksCard}>
                <Text style={styles.emptyTasksTitle}>No Services Selected Yet</Text>
                <Text style={styles.emptyTasksDescription}>
                  Pick the household maintenance, plumbing, electrical, or cleaning services you want to deliver in your neighborhood.
                </Text>
                <Button
                  title="Browse & Select Services"
                  onPress={() => router.push('/(onboarding)/task-selection')}
                  style={styles.browseButton}
                />
              </Card>
            ) : (
              <View style={styles.tasksList}>
                {selectedTasks.map((task) => (
                  <Card key={task.id} style={styles.taskItemCard}>
                    <View style={styles.taskItemHeader}>
                      {task.category_name ? (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {task.category_name.toUpperCase()}
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.offeredBadge}>
                        <Text style={styles.offeredBadgeText}>OFFERED</Text>
                      </View>
                    </View>
                    <Text style={styles.taskItemName}>{task.name}</Text>
                    <Text style={styles.taskItemDescription}>
                      {task.short_description}
                    </Text>
                  </Card>
                ))}
              </View>
            )}

            {/* Logout Action */}
            <Button
              title="Log Out"
              variant="outline"
              onPress={handleLogout}
              loading={loggingOut}
              style={styles.logoutButton}
            />
          </>
        )}
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
    marginBottom: theme.spacing.xs,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardSectionTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
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
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  sectionHeading: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  sectionSubheading: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editServicesButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  editServicesText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptyTasksCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  emptyTasksTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptyTasksDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    minWidth: 200,
  },
  tasksList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  taskItemCard: {
    padding: theme.spacing.lg,
  },
  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  categoryBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  offeredBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  offeredBadgeText: {
    color: theme.colors.success,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  taskItemName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  taskItemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  centered: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
});
