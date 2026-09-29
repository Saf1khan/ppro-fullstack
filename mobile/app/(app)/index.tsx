import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
                  <Text style={styles.metricLabel}>SERVICES</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#059669' }]}>100%</Text>
                  <Text style={styles.metricLabel}>VERIFIED</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#155C49' }]}>Active</Text>
                  <Text style={styles.metricLabel}>ACCOUNT</Text>
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
                    {selectedTasks.length} {selectedTasks.length === 1 ? 'service' : 'services'} available for neighbourhood booking
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editServicesButton}
                  onPress={() => router.push('/(onboarding)/task-selection')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.editServicesText}>
                    {selectedTasks.length > 0 ? 'Edit Services' : '+ Add Services'}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedTasks.length === 0 ? (
                <Card variant="elevated" style={styles.emptyTasksCard}>
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
                        {/* Real Photographic Service Thumbnail */}
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: taskVisual.image }}
                            style={styles.taskImage}
                            resizeMode="cover"
                          />
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
                                  {taskVisual.badge}
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
    backgroundColor: '#F9FAFB',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  brandInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
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
    borderColor: 'rgba(0, 0, 0, 0.04)',
    marginBottom: 20,
    ...theme.shadows.subtle,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...theme.shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  idBadge: {
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#155C49',
    letterSpacing: 0.6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
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
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  editServicesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5F1',
  },
  editServicesText: {
    color: '#155C49',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTasksCard: {
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptyTasksDescription: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    padding: 12,
    ...theme.shadows.card,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  taskImage: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  offeredBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offeredBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  taskItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  taskItemDescription: {
    fontSize: 12,
    color: '#4B5563',
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
    color: '#4B5563',
    fontSize: 14,
  },
});
