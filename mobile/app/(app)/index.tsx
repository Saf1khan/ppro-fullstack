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
import { getCategoryVisual, getTaskVisual } from '../../src/constants/serviceIcons';
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

  const initial = (profile?.full_name || user?.email || 'P').charAt(0).toUpperCase();

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
        <View style={styles.centerContainer}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
              <View style={styles.brandInfo}>
                <View style={styles.badgeRow}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillDot}>●</Text>
                    <Text style={styles.statusPillText}>ACTIVE PRO</Text>
                  </View>
                </View>
                <Text style={styles.title}>
                  {profile ? profile.full_name : 'Welcome Pro'}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {profile?.business_name || profile?.address || user?.email}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Syncing your profile & services...</Text>
            </View>
          ) : (
            <>
              {/* Quick Metrics Bar */}
              <View style={styles.metricsBar}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{selectedTasks.length}</Text>
                  <Text style={styles.metricLabel}>Services</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#027A48' }]}>100%</Text>
                  <Text style={styles.metricLabel}>Verified</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#155C49' }]}>Active</Text>
                  <Text style={styles.metricLabel}>Status</Text>
                </View>
              </View>

              {/* Provider Identity Card */}
              <Card variant="elevated" style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardSectionTitle}>Provider Details</Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID VERIFIED</Text>
                  </View>
                </View>

                {profile ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mobile</Text>
                      <Text style={styles.detailValue}>{profile.phone_number}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Operating Area</Text>
                      <Text style={[styles.detailValue, styles.addressText]}>
                        {profile.address}
                      </Text>
                    </View>
                    {profile.business_name ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Business</Text>
                        <Text style={styles.detailValue}>{profile.business_name}</Text>
                      </View>
                    ) : null}
                  </>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </Card>

              {/* Selected Tasks Section */}
              <View style={styles.tasksSectionHeader}>
                <View>
                  <Text style={styles.sectionHeading}>Your Active Services</Text>
                  <Text style={styles.sectionSubheading}>
                    {selectedTasks.length} {selectedTasks.length === 1 ? 'service' : 'services'} available for neighborhood booking
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editServicesButton}
                  onPress={() => router.push('/(onboarding)/task-selection')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editServicesText}>
                    {selectedTasks.length > 0 ? 'Edit Services' : '+ Add Services'}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedTasks.length === 0 ? (
                <Card variant="elevated" style={styles.emptyTasksCard}>
                  <Text style={styles.emptyIcon}>🛠️</Text>
                  <Text style={styles.emptyTasksTitle}>No Services Added Yet</Text>
                  <Text style={styles.emptyTasksDescription}>
                    Pick the household maintenance, plumbing, electrical, or cleaning services you want to deliver in your neighborhood.
                  </Text>
                  <Button
                    title="Browse & Select Services →"
                    onPress={() => router.push('/(onboarding)/task-selection')}
                    style={styles.browseButton}
                  />
                </Card>
              ) : (
                <View style={styles.tasksList}>
                  {selectedTasks.map((task) => {
                    const taskVisual = getTaskVisual(task.name);
                    const catVisual = getCategoryVisual(task.category_name);

                    return (
                      <View key={task.id} style={styles.taskItemCard}>
                        {/* Service Visual Avatar */}
                        <View
                          style={[
                            styles.taskAvatar,
                            { backgroundColor: taskVisual.accentBg },
                          ]}
                        >
                          <Text style={styles.taskAvatarIcon}>
                            {taskVisual.icon}
                          </Text>
                        </View>

                        {/* Content */}
                        <View style={styles.taskItemInfo}>
                          <View style={styles.taskItemHeader}>
                            {task.category_name ? (
                              <View
                                style={[
                                  styles.categoryBadge,
                                  { backgroundColor: catVisual.badgeBg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.categoryBadgeText,
                                    { color: catVisual.textColor },
                                  ]}
                                >
                                  {task.category_name.toUpperCase()}
                                </Text>
                              </View>
                            ) : null}
                            <View style={styles.offeredBadge}>
                              <Text style={styles.offeredBadgeText}>OFFERED</Text>
                            </View>
                          </View>

                          <Text style={styles.taskItemName}>{task.name}</Text>
                          <Text
                            style={styles.taskItemDescription}
                            numberOfLines={2}
                          >
                            {task.short_description}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Logout Action */}
              <Button
                title="Log Out of Account"
                variant="outline"
                onPress={handleLogout}
                loading={loggingOut}
                style={styles.logoutButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 64,
  },
  centerContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  brandInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    gap: 4,
  },
  statusPillDot: {
    color: '#027A48',
    fontSize: 8,
  },
  statusPillText: {
    color: '#027A48',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#667085',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 20,
    ...theme.shadows.subtle,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  metricLabel: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EAECF0',
  },
  card: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F4F7',
    ...theme.shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },
  idBadge: {
    backgroundColor: '#E8F8F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#101828',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  addressText: {
    maxWidth: 240,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    fontSize: 13,
    color: '#667085',
    marginTop: 2,
  },
  editServicesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F8F2',
  },
  editServicesText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTasksCard: {
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 4,
  },
  emptyTasksDescription: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  browseButton: {
    width: 'auto',
    minWidth: 200,
  },
  tasksList: {
    gap: 12,
    marginBottom: 24,
  },
  taskItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F2F4F7',
    padding: 14,
    ...theme.shadows.card,
  },
  taskAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskAvatarIcon: {
    fontSize: 22,
  },
  taskItemInfo: {
    flex: 1,
  },
  taskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  offeredBadge: {
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offeredBadgeText: {
    color: '#027A48',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  taskItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 2,
  },
  taskItemDescription: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 17,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
  },
  loadingText: {
    marginTop: 12,
    color: '#667085',
    fontSize: 14,
  },
});
