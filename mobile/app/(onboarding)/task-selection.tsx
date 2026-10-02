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
import { formatApiErrorMessage, profileApi, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { UserProfile } from '../../src/types/profile';
import { CategoryWithTasks, Task } from '../../src/types/task';

export default function TaskSelectionScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryWithTasks[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, mySelection, profileData] = await Promise.all([
        tasksApi.getCategories(),
        tasksApi.getMySelectedTasks().catch(() => ({ total_count: 0, tasks: [] })),
        profileApi.getMyProfile().catch(() => null),
      ]);
      setCategories(cats);
      setProfile(profileData);

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

  // Cart total and selected tasks stack
  const { cartTotal, selectedTasksList } = useMemo(() => {
    let total = 0;
    const selected: Task[] = [];
    allTasks.forEach((t) => {
      if (selectedTaskIds.has(t.id)) {
        const v = getTaskVisual(t.name);
        total += v.priceNumeric;
        selected.push(t);
      }
    });
    return { cartTotal: total, selectedTasksList: selected };
  }, [allTasks, selectedTaskIds]);

  const handleReviewSelection = () => {
    if (selectedTaskIds.size === 0) return;
    const idsString = Array.from(selectedTaskIds).join(',');
    router.push({
      pathname: '/(onboarding)/task-confirmation',
      params: { taskIds: idsString },
    });
  };

  const deliveryAddress = profile?.address || 'Flat 402, Sunshine Heights, Bengaluru';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentWrapper}>
        {/* Top Brand Bar with Delivery Address Pill */}
        <View style={styles.topBrandBar}>
          <BrandLogo size="xs" withText horizontal tagline="Quick Service" />
          <View style={styles.deliveryLocationPill}>
            <View style={styles.locationDot} />
            <Text style={styles.deliveryLabel} numberOfLines={1}>
              {deliveryAddress}
            </Text>
          </View>
        </View>

        {/* Blinkit-Style Quick Commerce Search Header */}
        <View style={styles.headerSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInner}>
              <View style={styles.searchGlyphContainer}>
                <View style={styles.searchCircle} />
                <View style={styles.searchHandle} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search 'cleaning', 'plumbing', 'fan repair'..."
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
        </View>

        {/* Horizontal Category Bar */}
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
                  activeOpacity={0.85}
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

        {/* Main Content: 2-Column Blinkit Product Grid */}
        {loading ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Fetching available services...</Text>
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
                ? `No services match "${searchQuery}". Try searching for plumbing, cleaning or AC.`
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
            key="blinkit-2col-grid"
            data={filteredTasks}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => {
              const isSelected = selectedTaskIds.has(item.id);
              const taskVisual = getTaskVisual(item.name);

              return (
                <View style={styles.cardWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => toggleTask(item.id)}
                    style={[styles.productCard, isSelected && styles.selectedProductCard]}
                  >
                    {/* Image with Badges */}
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: taskVisual.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      {/* Blinkit Quick ETA Badge */}
                      <View style={styles.etaBadge}>
                        <Text style={styles.etaBadgeText}>{taskVisual.etaBadge}</Text>
                      </View>
                      {/* Rating Overlay */}
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingBadgeText}>★ {taskVisual.ratingScore}</Text>
                      </View>
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardBody}>
                      {/* Micro Category Tag */}
                      <View
                        style={[
                          styles.cardTag,
                          {
                            backgroundColor: taskVisual.accentBg,
                            borderColor: taskVisual.borderColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.cardTagDot,
                            { backgroundColor: taskVisual.dotColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.cardTagText,
                            { color: taskVisual.textColor },
                          ]}
                          numberOfLines={1}
                        >
                          {taskVisual.badge}
                        </Text>
                      </View>

                      {/* Service Title */}
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.name}
                      </Text>

                      {/* Specs / Short Description */}
                      <Text style={styles.productDesc} numberOfLines={1}>
                        {item.short_description}
                      </Text>

                      {/* Pricing & Add Button Row */}
                      <View style={styles.priceActionRow}>
                        <View style={styles.priceColumn}>
                          <Text style={styles.priceText}>
                            {taskVisual.priceFormatted}
                          </Text>
                          {taskVisual.originalPriceFormatted && (
                            <Text style={styles.originalPriceText}>
                              {taskVisual.originalPriceFormatted}
                            </Text>
                          )}
                        </View>

                        {/* Tactile Add Button */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleTask(item.id)}
                          style={[
                            styles.addButton,
                            isSelected && styles.addButtonSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.addButtonText,
                              isSelected && styles.addButtonTextSelected,
                            ]}
                          >
                            {isSelected ? 'ADDED ✓' : '+ ADD'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Blinkit-Style Persistent Floating Bottom Checkout Bar */}
      {selectedTaskIds.size > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleReviewSelection}
            style={styles.floatingCartBar}
          >
            {/* Left: Thumbnail Stack + Item Count & Total */}
            <View style={styles.cartLeft}>
              <View style={styles.thumbStack}>
                {selectedTasksList.slice(0, 3).map((task, idx) => {
                  const visual = getTaskVisual(task.name);
                  return (
                    <Image
                      key={task.id}
                      source={{ uri: visual.image }}
                      style={[
                        styles.stackThumb,
                        { marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx },
                      ]}
                    />
                  );
                })}
              </View>

              <View style={styles.cartPriceDetails}>
                <View style={styles.cartTitleRow}>
                  <Text style={styles.cartItemCount}>
                    {selectedTaskIds.size} {selectedTaskIds.size === 1 ? 'Service' : 'Services'}
                  </Text>
                  <Text style={styles.cartDotSeparator}>·</Text>
                  <Text style={styles.cartTotalAmount}>₹{cartTotal}</Text>
                </View>
                <Text style={styles.cartSubtext}>PadosiPro Guarantee Included</Text>
              </View>
            </View>

            {/* Right: Checkout Button */}
            <View style={styles.cartRight}>
              <View style={styles.checkoutActionPill}>
                <Text style={styles.checkoutActionText}>View Cart</Text>
                <Text style={styles.checkoutArrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...theme.shadows.subtle,
  },
  deliveryLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    maxWidth: 220,
    gap: 6,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#155C49',
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  headerSection: {
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  searchContainer: {
    width: '100%',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    ...theme.shadows.subtle,
  },
  searchGlyphContainer: {
    width: 18,
    height: 18,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircle: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
  },
  searchHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 5,
    height: 2,
    backgroundColor: '#64748B',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearSearchButton: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoryChipsList: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#155C49',
    borderColor: '#155C49',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 16,
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    minWidth: 130,
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 110, // padding for floating bottom checkout bar
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
    padding: 4,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...theme.shadows.subtle,
  },
  selectedProductCard: {
    borderColor: '#155C49',
    borderWidth: 1.5,
    backgroundColor: '#FAFCFB',
  },
  cardImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  etaBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 30, 25, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  etaBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  ratingBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: 10,
  },
  cardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
    gap: 4,
    maxWidth: '100%',
  },
  cardTagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  cardTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    minHeight: 36,
  },
  productDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceColumn: {
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  originalPriceText: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: -1,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#155C49',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addButtonSelected: {
    backgroundColor: '#155C49',
    borderColor: '#155C49',
  },
  addButtonText: {
    color: '#155C49',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  addButtonTextSelected: {
    color: '#FFFFFF',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    maxWidth: 652,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingCartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1E19',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(21, 92, 73, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0F1E19',
  },
  cartPriceDetails: {
    justifyContent: 'center',
  },
  cartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cartItemCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cartDotSeparator: {
    fontSize: 13,
    color: '#64748B',
  },
  cartTotalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34D399',
  },
  cartSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  cartRight: {
    alignItems: 'center',
  },
  checkoutActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#155C49',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  checkoutActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  checkoutArrow: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
