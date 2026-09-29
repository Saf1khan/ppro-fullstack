import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card } from '../../src/components';
import { getCategoryVisual, getTaskVisual } from '../../src/constants/serviceIcons';
import { formatApiErrorMessage, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { CategoryWithTasks, Task } from '../../src/types/task';

export default function TaskConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskIds?: string }>();

  const selectedIds = useMemo<string[]>(() => {
    if (!params.taskIds) return [];
    return params.taskIds.split(',').filter(Boolean);
  }, [params.taskIds]);

  const [categories, setCategories] = useState<CategoryWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalogue() {
      try {
        const cats = await tasksApi.getCategories();
        setCategories(cats);
      } catch (err) {
        setError(formatApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogue();
  }, []);

  const groupedSelectedTasks = useMemo(() => {
    const idSet = new Set(selectedIds);
    const groups: { categoryName: string; slug: string; tasks: Task[] }[] = [];

    categories.forEach((cat) => {
      const matchingTasks = cat.tasks.filter((t) => idSet.has(t.id));
      if (matchingTasks.length > 0) {
        groups.push({
          categoryName: cat.name,
          slug: cat.slug,
          tasks: matchingTasks,
        });
      }
    });

    return groups;
  }, [categories, selectedIds]);

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await tasksApi.selectTasks(selectedIds);
      router.replace('/(app)');
    } catch (err) {
      setError(formatApiErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.centerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeDot}>●</Text>
              <Text style={styles.badgeText}>FINAL STEP · REVIEW & CONFIRM</Text>
            </View>
            <Text style={styles.title}>Confirm Your Services</Text>
            <Text style={styles.subtitle}>
              Review your {selectedIds.length} chosen {selectedIds.length === 1 ? 'service' : 'services'} before publishing them to neighborhood clients.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Preparing your service summary...</Text>
            </View>
          ) : groupedSelectedTasks.length === 0 ? (
            <Card variant="elevated" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Services Selected</Text>
              <Text style={styles.emptySubtitle}>
                Please go back and select at least one service to offer.
              </Text>
              <Button
                title="Return to Catalogue"
                onPress={() => router.back()}
                style={styles.backButton}
              />
            </Card>
          ) : (
            <>
              {/* Summary Stats Pill */}
              <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{selectedIds.length}</Text>
                  <Text style={styles.summaryLabel}>Total Services</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{groupedSelectedTasks.length}</Text>
                  <Text style={styles.summaryLabel}>Categories</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#027A48' }]}>Instant</Text>
                  <Text style={styles.summaryLabel}>Activation</Text>
                </View>
              </View>

              {/* Grouped Service Cards */}
              {groupedSelectedTasks.map((group, gIdx) => {
                const catVisual = getCategoryVisual(group.slug);
                return (
                  <View key={gIdx} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryTitleRow}>
                        <Text style={styles.categoryIcon}>{catVisual.icon}</Text>
                        <Text style={styles.categoryTitle}>{group.categoryName}</Text>
                      </View>
                      <View
                        style={[
                          styles.countBadge,
                          { backgroundColor: catVisual.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            { color: catVisual.textColor },
                          ]}
                        >
                          {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tasksList}>
                      {group.tasks.map((task) => {
                        const taskVisual = getTaskVisual(task.name);
                        return (
                          <View key={task.id} style={styles.taskCard}>
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
                            <View style={styles.taskDetails}>
                              <Text style={styles.taskName}>{task.name}</Text>
                              <Text
                                style={styles.taskDescription}
                                numberOfLines={2}
                              >
                                {task.short_description}
                              </Text>
                            </View>
                            <View style={styles.verifiedCheck}>
                              <Text style={styles.verifiedCheckText}>✓</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              {/* Actions Section */}
              <View style={styles.actionContainer}>
                <Button
                  title="Confirm & Launch Services →"
                  onPress={handleConfirm}
                  loading={saving}
                  style={styles.confirmButton}
                />
                <Button
                  title="Edit Selection"
                  variant="outline"
                  onPress={() => router.back()}
                  disabled={saving}
                  style={styles.editButton}
                />
              </View>
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
    paddingTop: 20,
    paddingBottom: 64,
  },
  centerContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 10,
    gap: 6,
  },
  badgeDot: {
    fontSize: 8,
    color: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 24,
    ...theme.shadows.subtle,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EAECF0',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2F4F7',
    padding: 14,
    ...theme.shadows.subtle,
  },
  taskAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskAvatarIcon: {
    fontSize: 22,
  },
  taskDetails: {
    flex: 1,
    marginRight: 12,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 17,
  },
  verifiedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheckText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  actionContainer: {
    marginTop: 16,
    gap: 12,
  },
  confirmButton: {
    width: '100%',
  },
  editButton: {
    width: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#667085',
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    minWidth: 180,
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
});
