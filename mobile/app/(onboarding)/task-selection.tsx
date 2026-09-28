import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../src/components';
import { formatApiErrorMessage, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { CategoryWithTasks, Task } from '../../src/types/task';

export default function TaskSelectionScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryWithTasks[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load catalogue and any pre-existing selections
  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, mySelection] = await Promise.all([
        tasksApi.getCategories(),
        tasksApi.getMySelectedTasks().catch(() => ({ total_count: 0, tasks: [] })),
      ]);
      setCategories(cats);

      // Pre-select any tasks user already picked previously
      if (mySelection.tasks && mySelection.tasks.length > 0) {
        setSelectedTaskIds(new Set(mySelection.tasks.map((t) => t.id)));
      }
    } catch (err) {
      setError(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogue();
  }, []);

  // Flatten all tasks with category label
  const allTasks = useMemo<Task[]>(() => {
    const list: Task[] = [];
    categories.forEach((cat) => {
      cat.tasks.forEach((t) => {
        list.push({ ...t, category_name: cat.name });
      });
    });
    return list;
  }, [categories]);

  // Filter tasks by active category and search query
  const filteredTasks = useMemo<Task[]>(() => {
    let result = allTasks;

    if (activeCategorySlug !== 'all') {
      const targetCat = categories.find((c) => c.slug === activeCategorySlug);
      if (targetCat) {
        result = result.filter((t) => t.category_id === targetCat.id);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.short_description.toLowerCase().includes(q) ||
          (t.category_name && t.category_name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allTasks, categories, activeCategorySlug, searchQuery]);

  const toggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleReviewSelection = () => {
    if (selectedTaskIds.size === 0) return;
    const idsString = Array.from(selectedTaskIds).join(',');
    router.push({
      pathname: '/(onboarding)/task-confirmation',
      params: { taskIds: idsString },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>STEP 2 OF 2 · TASK CATALOGUE</Text>
        </View>
        <Text style={styles.title}>Select Your Services</Text>
        <Text style={styles.subtitle}>
          Choose the tasks you want to handle as a verified provider. You can pick multiple tasks.
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services (e.g., plumbing, cleaning, AC)..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ slug: 'all', name: 'All Services' }, ...categories]}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.categoryChipsList}
          renderItem={({ item }) => {
            const isActive = activeCategorySlug === item.slug;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                onPress={() => setActiveCategorySlug(item.slug)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.activeCategoryChipText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading service catalogue...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Catalogue Unavailable</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button title="Retry" onPress={loadCatalogue} style={styles.retryButton} />
          </Card>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyTitle}>No Services Found</Text>
          <Text style={styles.emptyMessage}>
            {searchQuery
              ? `No services match "${searchQuery}". Try a different keyword.`
              : 'No services available in this category.'}
          </Text>
          {searchQuery ? (
            <Button
              title="Clear Search"
              variant="outline"
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            />
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
          renderItem={({ item }) => {
            const isSelected = selectedTaskIds.has(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleTask(item.id)}
              >
                <Card style={[styles.taskCard, isSelected && styles.selectedTaskCard]}>
                  <View style={styles.taskCardRow}>
                    {/* Checkbox Icon */}
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected ? (
                        <Text style={styles.checkmarkText}>✓</Text>
                      ) : null}
                    </View>

                    {/* Task Info */}
                    <View style={styles.taskInfo}>
                      {item.category_name ? (
                        <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>
                            {item.category_name.toUpperCase()}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={styles.taskName}>{item.name}</Text>
                      <Text style={styles.taskDescription}>
                        {item.short_description}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.selectedCountLabel}>Selection:</Text>
          <Text style={styles.selectedCountValue}>
            {selectedTaskIds.size} {selectedTaskIds.size === 1 ? 'task' : 'tasks'} selected
          </Text>
        </View>
        <Button
          title="Review Selection"
          onPress={handleReviewSelection}
          disabled={selectedTaskIds.size === 0}
          style={styles.reviewButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
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
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textPrimary,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 36,
    top: 14,
    padding: 4,
  },
  clearSearchText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  categoriesWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoryChipsList: {
    paddingHorizontal: theme.spacing['2xl'],
    gap: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  activeCategoryChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  activeCategoryChipText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  tasksList: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: 110,
    gap: theme.spacing.md,
  },
  taskCard: {
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  selectedTaskCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F5FAF8',
  },
  taskCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmarkText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginBottom: 4,
  },
  categoryTagText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  taskName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 19,
    color: theme.colors.textSecondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
  },
  errorCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    minWidth: 140,
    width: 'auto',
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  clearButton: {
    minWidth: 140,
    width: 'auto',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bottomInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  selectedCountLabel: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  selectedCountValue: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  reviewButton: {
    width: 'auto',
    flexShrink: 0,
    minWidth: 160,
    paddingHorizontal: theme.spacing.xl,
  },
});
