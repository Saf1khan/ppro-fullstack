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
import { BrandLogo, Button, Card } from '../../src/components';
import { getCategoryVisual, getTaskVisual } from '../../src/constants/serviceIcons';
import { useAuth } from '../../src/context/AuthContext';
import { profileApi, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { UserProfile } from '../../src/types/profile';
import { Task } from '../../src/types/task';

type PipelineStatus = 'submitted' | 'in_progress' | 'done';

export default function AppHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Enterprise status simulation state: 'submitted' | 'in_progress' | 'done'
  const [currentStatus, setCurrentStatus] = useState<PipelineStatus>('in_progress');

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

  // Calculate order total
  const orderTotal = selectedTasks.reduce((acc, t) => {
    const v = getTaskVisual(t.name);
    return acc + v.priceNumeric;
  }, 0) + (selectedTasks.length > 0 ? 29 : 0);

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
          {/* Top Navigation Brand Bar */}
          <View style={styles.topBrandBar}>
            <BrandLogo size="xs" withText horizontal tagline="Lifestyle Management" />
            <TouchableOpacity
              style={styles.topLogoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <Text style={styles.topLogoutText}>{loggingOut ? '...' : 'Sign Out'}</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Bar */}
          <View style={styles.profileBar}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>ACTIVE HOUSEHOLD</Text>
                </View>
              </View>
              <Text style={styles.userName}>
                {profile ? profile.full_name : 'Welcome Member'}
              </Text>
              <Text style={styles.userLocation} numberOfLines={1}>
                📍 {profile?.address || user?.email}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Syncing your service request...</Text>
            </View>
          ) : (
            <>
              {/* ============================================================== */}
              {/* ENTERPRISE REAL-TIME STATUS TRACKER (Submitted -> In Progress -> Done) */}
              {/* ============================================================== */}
              <View style={styles.statusTrackerCard}>
                {/* Tracker Card Header */}
                <View style={styles.trackerHeader}>
                  <View>
                    <View style={styles.requestNumRow}>
                      <Text style={styles.requestNumber}>REQUEST #PP-84920</Text>
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE TRACKING</Text>
                      </View>
                    </View>
                    <Text style={styles.trackerTimestamp}>
                      Placed Today · Guaranteed Neighborhood SLA
                    </Text>
                  </View>
                </View>

                {/* Interactive Status Pipeline Switcher */}
                <View style={styles.pipelineSwitcher}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setCurrentStatus('submitted')}
                    style={[
                      styles.pipelineTab,
                      currentStatus === 'submitted' && styles.pipelineTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pipelineTabText,
                        currentStatus === 'submitted' && styles.pipelineTabTextActive,
                      ]}
                    >
                      1. Submitted
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setCurrentStatus('in_progress')}
                    style={[
                      styles.pipelineTab,
                      currentStatus === 'in_progress' && styles.pipelineTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pipelineTabText,
                        currentStatus === 'in_progress' && styles.pipelineTabTextActive,
                      ]}
                    >
                      2. In Progress
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setCurrentStatus('done')}
                    style={[
                      styles.pipelineTab,
                      currentStatus === 'done' && styles.pipelineTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pipelineTabText,
                        currentStatus === 'done' && styles.pipelineTabTextActive,
                      ]}
                    >
                      3. Completed
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Bar Indicator */}
                <View style={styles.pipelineBarContainer}>
                  <View
                    style={[
                      styles.pipelineBarFill,
                      {
                        width:
                          currentStatus === 'submitted'
                            ? '33%'
                            : currentStatus === 'in_progress'
                            ? '66%'
                            : '100%',
                      },
                    ]}
                  />
                </View>

                {/* Stage 1: SUBMITTED VIEW */}
                {currentStatus === 'submitted' && (
                  <View style={styles.stageContent}>
                    <View style={styles.stageHeaderRow}>
                      <View style={[styles.stageIconBadge, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={styles.stageIconText}>✓</Text>
                      </View>
                      <View style={styles.stageTitleCol}>
                        <Text style={styles.stageTitle}>Service Request Received</Text>
                        <Text style={styles.stageDesc}>
                          Logged in system and assigned priority queuing in your neighborhood.
                        </Text>
                      </View>
                    </View>

                    {/* Timeline steps */}
                    <View style={styles.timelineList}>
                      <View style={styles.timelineItem}>
                        <View style={styles.timelineBulletDone} />
                        <Text style={styles.timelineTextDone}>
                          7:30 PM — Request received via customer portal
                        </Text>
                      </View>
                      <View style={styles.timelineItem}>
                        <View style={styles.timelineBulletDone} />
                        <Text style={styles.timelineTextDone}>
                          7:31 PM — Email OTP & Indian Mobile verified (+91)
                        </Text>
                      </View>
                      <View style={styles.timelineItem}>
                        <View style={styles.timelineBulletActive} />
                        <Text style={styles.timelineTextActive}>
                          Allocating verified Lifestyle Manager (ETA &lt; 10 mins)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Stage 2: IN PROGRESS VIEW */}
                {currentStatus === 'in_progress' && (
                  <View style={styles.stageContent}>
                    <View style={styles.stageHeaderRow}>
                      <View style={[styles.stageIconBadge, { backgroundColor: '#EFF8FF' }]}>
                        <Text style={styles.stageIconText}>⚡</Text>
                      </View>
                      <View style={styles.stageTitleCol}>
                        <Text style={styles.stageTitle}>Lifestyle Manager Assigned</Text>
                        <Text style={styles.stageDesc}>
                          Your dedicated manager is actively coordinating technician arrival on-site.
                        </Text>
                      </View>
                    </View>

                    {/* Dedicated Lifestyle Manager Card */}
                    <View style={styles.managerCard}>
                      <View style={styles.managerAvatar}>
                        <Text style={styles.managerAvatarText}>VM</Text>
                      </View>
                      <View style={styles.managerDetails}>
                        <View style={styles.managerNameRow}>
                          <Text style={styles.managerName}>Vikram Mehta</Text>
                          <View style={styles.managerVerifiedPill}>
                            <Text style={styles.managerVerifiedText}>VERIFIED PRO</Text>
                          </View>
                        </View>
                        <Text style={styles.managerRole}>
                          Dedicated Lifestyle Manager · ★ 4.9 (184 tasks)
                        </Text>
                      </View>
                    </View>

                    {/* Manager Contact Shortcuts */}
                    <View style={styles.managerActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.actionContactButton}
                        onPress={() => alert('Dialing Vikram Mehta (+91 98765 43210)...')}
                      >
                        <Text style={styles.actionContactText}>📞 Call Manager</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.actionChatButton}
                        onPress={() => alert('Opening PadosiPro WhatsApp coordination channel...')}
                      >
                        <Text style={styles.actionChatText}>💬 WhatsApp Updates</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Live arrival ETA banner */}
                    <View style={styles.etaAlertBox}>
                      <View style={styles.etaPulseDot} />
                      <Text style={styles.etaAlertText}>
                        Technician dispatched to {profile?.address || 'your address'}. Estimated arrival in 25 mins.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Stage 3: DONE VIEW */}
                {currentStatus === 'done' && (
                  <View style={styles.stageContent}>
                    <View style={styles.stageHeaderRow}>
                      <View style={[styles.stageIconBadge, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={styles.stageIconText}>🛡️</Text>
                      </View>
                      <View style={styles.stageTitleCol}>
                        <Text style={styles.stageTitle}>Service Completed &amp; Signed Off</Text>
                        <Text style={styles.stageDesc}>
                          All tasks executed with 100% neighborhood quality guarantee.
                        </Text>
                      </View>
                    </View>

                    {/* Completion Quality Guarantee Badge */}
                    <View style={styles.completedBadgeBox}>
                      <Text style={styles.completedScore}>★ 5.0 / 5.0 Quality Rating</Text>
                      <Text style={styles.completedNote}>
                        Inspected by Vikram Mehta · 30-Day Service Warranty Active
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.managerActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.actionContactButton}
                        onPress={() => alert('Invoice #INV-84920 downloaded successfully!')}
                      >
                        <Text style={styles.actionContactText}>📄 Download Invoice</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.actionChatButton}
                        onPress={() => alert('Thank you for rating PadosiPro!')}
                      >
                        <Text style={styles.actionChatText}>⭐ Rate Experience</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* ============================================================== */}
              {/* ORDER DETAILS & ACTIVE SERVICES BREAKDOWN */}
              {/* ============================================================== */}
              <View style={styles.servicesSection}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Requested Services ({selectedTasks.length})
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Covered under PadosiPro Lifestyle Management
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/task-selection')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addMoreLink}>+ Modify Services</Text>
                  </TouchableOpacity>
                </View>

                {selectedTasks.length === 0 ? (
                  <Card variant="elevated" style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Active Services</Text>
                    <Text style={styles.emptySubtitle}>
                      You haven’t selected any household services yet.
                    </Text>
                    <Button
                      title="Explore Service Catalogue"
                      onPress={() => router.push('/(onboarding)/task-selection')}
                    />
                  </Card>
                ) : (
                  selectedTasks.map((task) => {
                    const visual = getTaskVisual(task.name);
                    return (
                      <View key={task.id} style={styles.taskCardItem}>
                        <Image
                          source={{ uri: visual.image }}
                          style={styles.taskThumb}
                          resizeMode="cover"
                        />
                        <View style={styles.taskDetails}>
                          <View style={styles.taskTagRow}>
                            <View
                              style={[
                                styles.taskMicroTag,
                                {
                                  backgroundColor: visual.accentBg,
                                  borderColor: visual.borderColor,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.taskTagDot,
                                  { backgroundColor: visual.dotColor },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.taskTagText,
                                  { color: visual.textColor },
                                ]}
                              >
                                {visual.badge}
                              </Text>
                            </View>
                            <Text style={styles.taskEtaText}>{visual.etaBadge}</Text>
                          </View>

                          <Text style={styles.taskTitle}>{task.name}</Text>
                          <Text style={styles.taskShortDesc} numberOfLines={1}>
                            {task.short_description}
                          </Text>
                        </View>

                        <View style={styles.taskPriceColumn}>
                          <Text style={styles.taskPrice}>{visual.priceFormatted}</Text>
                          <View style={styles.taskStatusPill}>
                            <Text style={styles.taskStatusText}>
                              {currentStatus === 'done' ? 'DONE ✓' : 'ACTIVE'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Order Invoice Summary */}
              {selectedTasks.length > 0 && (
                <View style={styles.invoiceCard}>
                  <View style={styles.invoiceHeader}>
                    <Text style={styles.invoiceTitle}>Order Bill Details</Text>
                    <Text style={styles.invoiceStatus}>PAID / PRE-AUTHORIZED</Text>
                  </View>

                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Services Subtotal</Text>
                    <Text style={styles.invoiceValue}>₹{orderTotal - 29}</Text>
                  </View>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Lifestyle Manager Coordination</Text>
                    <Text style={[styles.invoiceValue, { color: '#059669' }]}>FREE</Text>
                  </View>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Neighborhood Safety &amp; Insurance</Text>
                    <Text style={styles.invoiceValue}>₹29</Text>
                  </View>

                  <View style={styles.invoiceDivider} />

                  <View style={styles.invoiceRowTotal}>
                    <Text style={styles.invoiceTotalLabel}>Grand Total</Text>
                    <Text style={styles.invoiceTotalValue}>₹{orderTotal}</Text>
                  </View>
                </View>
              )}
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 48,
  },
  centerContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  topBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 10,
    ...theme.shadows.subtle,
  },
  topLogoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  topLogoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.subtle,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#155C49',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusTrackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...theme.shadows.card,
  },
  trackerHeader: {
    marginBottom: 12,
  },
  requestNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  requestNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
  },
  trackerTimestamp: {
    fontSize: 11,
    color: '#64748B',
  },
  pipelineSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  pipelineTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  pipelineTabActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.subtle,
  },
  pipelineTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  pipelineTabTextActive: {
    color: '#155C49',
    fontWeight: '800',
  },
  pipelineBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  pipelineBarFill: {
    height: '100%',
    backgroundColor: '#155C49',
    borderRadius: 2,
  },
  stageContent: {
    marginTop: 4,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stageIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#155C49',
  },
  stageTitleCol: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stageDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  timelineList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineBulletDone: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  timelineBulletActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  timelineTextDone: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  timelineTextActive: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  managerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  managerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  managerDetails: {
    flex: 1,
  },
  managerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  managerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  managerVerifiedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  managerVerifiedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#047857',
  },
  managerRole: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  managerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  actionContactButton: {
    flex: 1,
    backgroundColor: '#155C49',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionContactText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionChatButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionChatText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  etaAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  etaPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  etaAlertText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    flex: 1,
  },
  completedBadgeBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  completedScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  completedNote: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 2,
  },
  servicesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...theme.shadows.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  addMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#155C49',
  },
  taskCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  taskThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  taskDetails: {
    flex: 1,
  },
  taskTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  taskMicroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  taskTagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  taskTagText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskEtaText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  taskShortDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  taskPriceColumn: {
    alignItems: 'flex-end',
  },
  taskPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  taskStatusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.subtle,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  invoiceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  invoiceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  invoiceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  invoiceTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#155C49',
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
});
