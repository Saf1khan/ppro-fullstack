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

  // Filter tasks to only those selected, grouped by category
  const groupedSelectedTasks = useMemo(() => {
    const idSet = new Set(selectedIds);
    const groups: { categoryName: string; tasks: Task[] }[] = [];

    categories.forEach((cat) => {
      const matchingTasks = cat.tasks.filter((t) => idSet.has(t.id));
      if (matchingTasks.length > 0) {
        groups.push({
          categoryName: cat.name,
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
      // Onboarding complete! Navigate to the authenticated app dashboard
      router.replace('/(app)');
    } catch (err) {
      setError(formatApiErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FINAL STEP · CONFIRMATION</Text>
          </View>
          <Text style={styles.title}>Confirm Your Services</Text>
          <Text style={styles.subtitle}>
            Please review the {selectedIds.length} {selectedIds.length === 1 ? 'service' : 'services'} you have selected to offer on PadosiPro.
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
            <Text style={styles.loadingText}>Preparing confirmation...</Text>
          </View>
        ) : groupedSelectedTasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Services Selected</Text>
            <Text style={styles.emptySubtitle}>
              Please go back and select at least one service to continue.
            </Text>
            <Button
              title="Return to Catalogue"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </Card>
        ) : (
          <>
            {/* Grouped Service Cards */}
            {groupedSelectedTasks.map((group, gIdx) => (
              <View key={gIdx} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{group.categoryName}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{group.tasks.length}</Text>
                  </View>
                </View>

                {group.tasks.map((task) => (
                  <Card key={task.id} style={styles.taskCard}>
                    <View style={styles.taskRow}>
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                      <View style={styles.taskDetails}>
                        <Text style={styles.taskName}>{task.name}</Text>
                        <Text style={styles.taskDescription}>
                          {task.short_description}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ))}

            {/* Actions */}
            <View style={styles.actionContainer}>
              <Button
                title="Confirm & Launch Services"
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
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
  },
  taskCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkIcon: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDetails: {
    flex: 1,
  },
  taskName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  confirmButton: {},
  editButton: {
    borderColor: theme.colors.border,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    minWidth: 180,
  },
});
