import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrandLogo, Button, Card } from '../../src/components';
import { getCategoryVisual, getTaskVisual } from '../../src/constants/serviceIcons';
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

  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, mySelection] = await Promise.all([
        tasksApi.getCategories(),
        tasksApi.getMySelectedTasks().catch(() => ({ total_count: 0, tasks: [] })),
      ]);
      setCategories(cats);

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

  const allTasks = useMemo<Task[]>(() => {
    const list: Task[] = [];
    categories.forEach((cat) => {
      cat.tasks.forEach((t) => {
        list.push({ ...t, category_name: cat.name });
      });
    });
    return list;
  }, [categories]);

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
      <View style={styles.contentWrapper}>
        {/* Top Brand Bar */}
        <View style={styles.topBrandBar}>
          <BrandLogo size="sm" withText horizontal tagline="Service Catalogue" />
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 2 of 2</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgePulseDot} />
            <Text style={styles.badgeText}>SERVICE SELECTION</Text>
          </View>
          <Text style={styles.title}>Select Your Services</Text>
          <Text style={styles.subtitle}>
            Choose the household and maintenance tasks you can deliver in your neighbourhood.
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInner}>
            <View style={styles.searchGlyphContainer}>
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search services (e.g. plumbing, degreasing, AC)..."
              placeholderTextColor="#9CA3AF"
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
              const catVisual = getCategoryVisual(item.slug);

              return (
                <TouchableOpacity
                  style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                  onPress={() => setActiveCategorySlug(item.slug)}
                  activeOpacity={0.82}
                >
                  <View
                    style={[
                      styles.chipDot,
                      {
                        backgroundColor: isActive
                          ? '#FFFFFF'
                          : item.slug === 'all'
                          ? '#10B981'
                          : catVisual.dotColor,
                      },
                    ]}
                  />
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
            <Text style={styles.loadingText}>Loading verified services...</Text>
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
              const taskVisual = getTaskVisual(item.name);

              return (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => toggleTask(item.id)}
                >
                  <View
                    style={[
                      styles.taskCard,
                      isSelected && styles.selectedTaskCard,
                    ]}
                  >
                    {/* Real Photographic Service Image */}
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: taskVisual.image }}
                        style={styles.serviceImage}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Task Info with Vibrant Two-Tone Tag UI */}
                    <View style={styles.taskInfo}>
                      <View style={styles.tagRow}>
                        {/* Two-Tone Category Tag with Micro-Dot Accent */}
                        <View
                          style={[
                            styles.categoryTag,
                            {
                              backgroundColor: taskVisual.accentBg,
                              borderColor: taskVisual.borderColor,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.tagDot,
                              { backgroundColor: taskVisual.dotColor },
                            ]}
                          />
                          <Text
                            style={[
                              styles.categoryTagText,
                              { color: taskVisual.textColor },
                            ]}
                          >
                            {taskVisual.badge}
                          </Text>
                        </View>

                        {/* Rating & Metric Micro-Pill */}
                        <View style={styles.ratingTag}>
                          <Text style={styles.ratingTagText}>
                            {taskVisual.tagSecondary}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.taskName}>{item.name}</Text>
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {item.short_description}
                      </Text>
                    </View>

                    {/* Action Pill */}
                    <View style={styles.actionPillContainer}>
                      <View
                        style={[
                          styles.actionPill,
                          isSelected && styles.actionPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionPillText,
                            isSelected && styles.actionPillTextSelected,
                          ]}
                        >
                          {isSelected ? '✓ Added' : '+ Add'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          <View style={styles.bottomInfo}>
            <Text style={styles.selectedCountLabel}>SELECTION</Text>
            <Text style={styles.selectedCountValue}>
              {selectedTaskIds.size} {selectedTaskIds.size === 1 ? 'service' : 'services'} selected
            </Text>
          </View>
          <Button
            title="Review Selection →"
            onPress={handleReviewSelection}
            disabled={selectedTaskIds.size === 0}
            style={styles.reviewButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  topBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...theme.shadows.subtle,
  },
  stepBadge: {
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C6EADE',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#155C49',
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F1',
    borderWidth: 1,
    borderColor: '#C6EADE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 8,
    gap: 6,
  },
  badgePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#155C49',
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
    letterSpacing: -0.5,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    ...theme.shadows.subtle,
  },
  searchGlyphContainer: {
    width: 18,
    height: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  searchHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 6,
    height: 2,
    backgroundColor: '#6B7280',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
    paddingVertical: 10,
  },
  clearSearchButton: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  categoriesWrapper: {
    marginBottom: 14,
  },
  categoryChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
    ...theme.shadows.subtle,
  },
  activeCategoryChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tasksList: {
    paddingHorizontal: 16,
    paddingBottom: 140,
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    padding: 12,
    ...theme.shadows.card,
  },
  selectedTaskCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F5FAF8',
  },
  imageContainer: {
    width: 78,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  taskInfo: {
    flex: 1,
    marginRight: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 5,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  ratingTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  ratingTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  taskName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
    marginBottom: 3,
    lineHeight: 20,
  },
  taskDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  actionPillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
    minWidth: 72,
    alignItems: 'center',
  },
  actionPillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionPillTextSelected: {
    color: '#FFFFFF',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#4B5563',
    fontSize: 14,
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 140,
    width: 'auto',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptyMessage: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...theme.shadows.floatingBottom,
  },
  bottomBarInner: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bottomInfo: {
    flex: 1,
  },
  selectedCountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  selectedCountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  reviewButton: {
    width: 'auto',
    flexShrink: 0,
    minWidth: 170,
    paddingHorizontal: 20,
  },
});
