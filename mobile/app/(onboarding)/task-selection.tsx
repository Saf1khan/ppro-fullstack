import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrandLogo, Button, Card, HouseLocationModal, ProfileAccountModal } from '../../src/components';
import {
  DATE_OPTIONS,
  DEFAULT_SERVICE_SLOT,
  getCategoryVisual,
  getTaskHighlights,
  getTaskVisual,
  ServiceSlot,
  TIME_SLOT_OPTIONS,
} from '../../src/constants/serviceIcons';
import { useAuth } from '../../src/context/AuthContext';
import { addressStorage, HouseholdLocation } from '../../src/services/addressStorage';
import { formatApiErrorMessage, profileApi, tasksApi } from '../../src/services/api';
import { slotStorage } from '../../src/services/slotStorage';
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

  // Active task opened in the detailed inspection modal ("see the point what is actually")
  const [activeDetailTask, setActiveDetailTask] = useState<Task | null>(null);

  // Per-service chosen appointment slot mapping: taskId -> ServiceSlot
  const [selectedSlots, setSelectedSlots] = useState<Record<string, ServiceSlot>>({});

  // Active modal date & time slot draft selections
  const [modalDateId, setModalDateId] = useState<string>('tomorrow');
  const [modalSlotId, setModalSlotId] = useState<string>('morning');
  const [modalInstructions, setModalInstructions] = useState<string>('');

  // Household location management
  const [activeLocation, setActiveLocation] = useState<HouseholdLocation | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Profile & Account view modal
  const { user } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const userInitial = (profile?.full_name || user?.email || 'P').charAt(0).toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, mySelection, profileData, savedSlots, activeLoc] = await Promise.all([
        tasksApi.getCategories(),
        tasksApi.getMySelectedTasks().catch(() => ({ total_count: 0, tasks: [] })),
        profileApi.getMyProfile().catch(() => null),
        slotStorage.getServiceSlots().catch(() => ({})),
        addressStorage.getActiveLocation().catch(() => null),
      ]);
      setCategories(cats);
      setProfile(profileData);
      if (activeLoc) {
        setActiveLocation(activeLoc);
      }
      if (savedSlots) {
        setSelectedSlots(savedSlots);
      }

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

  const openTaskModal = (task: Task) => {
    const existing = selectedSlots[task.id] || DEFAULT_SERVICE_SLOT;
    setModalDateId(existing.dateId || 'tomorrow');
    setModalSlotId(existing.slotId || 'morning');
    setModalInstructions(existing.specialInstructions || '');
    setActiveDetailTask(task);
  };

  const toggleTask = async (taskId: string) => {
    const isAdding = !selectedTaskIds.has(taskId);
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });

    if (isAdding) {
      if (!selectedSlots[taskId]) {
        const newSlots = { ...selectedSlots, [taskId]: DEFAULT_SERVICE_SLOT };
        setSelectedSlots(newSlots);
        await slotStorage.setServiceSlot(taskId, DEFAULT_SERVICE_SLOT);
      }
    } else {
      await slotStorage.removeServiceSlot(taskId);
      setSelectedSlots((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  };

  const handleSaveModalSlot = async () => {
    if (!activeDetailTask) return;
    const dateObj = DATE_OPTIONS.find((d) => d.id === modalDateId) || DATE_OPTIONS[1];
    const slotObj = TIME_SLOT_OPTIONS.find((s) => s.id === modalSlotId) || TIME_SLOT_OPTIONS[0];

    const slotData: ServiceSlot = {
      dateId: dateObj.id,
      dateLabel: `${dateObj.dayName} (${dateObj.dateLabel})`,
      slotId: slotObj.id,
      timeRange: slotObj.timeRange,
      period: slotObj.period,
      specialInstructions: modalInstructions.trim() || undefined,
    };

    const newSlots = { ...selectedSlots, [activeDetailTask.id]: slotData };
    setSelectedSlots(newSlots);
    await slotStorage.setServiceSlot(activeDetailTask.id, slotData);

    if (!selectedTaskIds.has(activeDetailTask.id)) {
      setSelectedTaskIds((prev) => new Set(prev).add(activeDetailTask.id));
    }
    setActiveDetailTask(null);
  };

  const handleRemoveFromModal = async () => {
    if (!activeDetailTask) return;
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(activeDetailTask.id);
      return next;
    });
    await slotStorage.removeServiceSlot(activeDetailTask.id);
    setSelectedSlots((prev) => {
      const next = { ...prev };
      delete next[activeDetailTask.id];
      return next;
    });
    setActiveDetailTask(null);
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

  const handleReviewSelection = async () => {
    if (selectedTaskIds.size === 0) return;
    const updatedSlots = { ...selectedSlots };
    selectedTaskIds.forEach((id) => {
      if (!updatedSlots[id]) {
        updatedSlots[id] = DEFAULT_SERVICE_SLOT;
      }
    });
    await slotStorage.setServiceSlots(updatedSlots);

    const idsString = Array.from(selectedTaskIds).join(',');
    router.push({
      pathname: '/(onboarding)/task-confirmation',
      params: { taskIds: idsString },
    });
  };

  const deliveryAddress = profile?.address || 'Flat 402, Sunshine Heights, Bengaluru';

  // Details for the currently opened modal task
  const activeVisual = activeDetailTask ? getTaskVisual(activeDetailTask.name) : null;
  const activeHighlights = activeDetailTask ? getTaskHighlights(activeDetailTask.name) : [];
  const isActiveSelected = activeDetailTask ? selectedTaskIds.has(activeDetailTask.id) : false;

  const currentModalDate = DATE_OPTIONS.find((d) => d.id === modalDateId) || DATE_OPTIONS[1];
  const currentModalSlot = TIME_SLOT_OPTIONS.find((s) => s.id === modalSlotId) || TIME_SLOT_OPTIONS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentWrapper}>
        {/* Top Brand Bar with Household Switcher & User Profile Avatar */}
        <View style={styles.topBrandBar}>
          <BrandLogo size="xs" withText horizontal tagline="Quick Service" />

          <View style={styles.topBarRightGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setLocationModalVisible(true)}
              style={styles.deliveryLocationPill}
            >
              <View style={styles.locationDot} />
              <View style={styles.deliveryTextCol}>
                <Text style={styles.deliveryHouseholdTitle} numberOfLines={1}>
                  {activeLocation?.title || 'Deliver to'} ▾
                </Text>
                <Text style={styles.deliveryLabel} numberOfLines={1}>
                  {activeLocation?.fullAddress || deliveryAddress}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setProfileModalVisible(true)}
              style={styles.userProfileAvatarBtn}
            >
              <Text style={styles.userProfileAvatarInitial}>{userInitial}</Text>
              <View style={styles.userProfileActiveDot} />
            </TouchableOpacity>
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
              const assignedSlot = selectedSlots[item.id];

              return (
                <View style={styles.cardWrapper}>
                  {/* Tapping anywhere on the card opens the detailed scope & appointment slot sheet */}
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => openTaskModal(item)}
                    style={[styles.productCard, isSelected && styles.selectedProductCard]}
                  >
                    {/* Image with Badges */}
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: taskVisual.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      {/* Realistic Service Duration Badge */}
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

                      {/* Tap to inspect hint / Scheduled Slot Badge */}
                      {isSelected && assignedSlot ? (
                        <View style={styles.cardScheduledPill}>
                          <Text style={styles.cardScheduledText} numberOfLines={1}>
                            📅 {assignedSlot.dateLabel.split(' ')[0]} · {assignedSlot.timeRange.split(' - ')[0]}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.viewDetailsText}>Select slot & details →</Text>
                      )}

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

                        {/* Tactile Quick Add Button (toggles directly without opening modal) */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            toggleTask(item.id);
                          }}
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
                            {isSelected ? '✓ ADDED' : '+ ADD'}
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

      {/* ============================================================== */}
      {/* SERVICE DETAIL INSPECTION MODAL ("See the point what is actually") */}
      {/* ============================================================== */}
      <Modal
        visible={Boolean(activeDetailTask)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDetailTask(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Modal Drag/Close Header */}
            <View style={styles.modalTopHeader}>
              <View style={styles.modalCategoryRow}>
                {activeVisual && (
                  <View
                    style={[
                      styles.modalCategoryTag,
                      {
                        backgroundColor: activeVisual.accentBg,
                        borderColor: activeVisual.borderColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalTagDot,
                        { backgroundColor: activeVisual.dotColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.modalCategoryText,
                        { color: activeVisual.textColor },
                      ]}
                    >
                      {activeVisual.badge}
                    </Text>
                  </View>
                )}
                {activeVisual && (
                  <Text style={styles.modalEtaText}>{activeVisual.etaBadge}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setActiveDetailTask(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Scope & Bullet Points */}
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Full Image Banner */}
              {activeVisual && (
                <View style={styles.modalBannerContainer}>
                  <Image
                    source={{ uri: activeVisual.image }}
                    style={styles.modalBannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalRatingPill}>
                    <Text style={styles.modalRatingPillText}>★ {activeVisual.ratingScore} · 1.2k bookings</Text>
                  </View>
                </View>
              )}

              {/* Title & Pricing Block */}
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalServiceTitle}>
                  {activeDetailTask?.name}
                </Text>
                <Text style={styles.modalShortDesc}>
                  {activeDetailTask?.short_description}
                </Text>

                <View style={styles.modalPriceRow}>
                  <Text style={styles.modalPriceMain}>
                    {activeVisual?.priceFormatted}
                  </Text>
                  {activeVisual?.originalPriceFormatted && (
                    <Text style={styles.modalPriceOriginal}>
                      {activeVisual.originalPriceFormatted}
                    </Text>
                  )}
                  <View style={styles.modalDiscountPill}>
                    <Text style={styles.modalDiscountText}>33% OFF</Text>
                  </View>
                </View>
              </View>

              {/* 1. BULLET POINTS: What's Included / Scope of Work */}
              <View style={styles.scopeSection}>
                <View style={styles.scopeSectionHeader}>
                  <Text style={styles.scopeSectionTitle}>What is Included in this Service</Text>
                  <Text style={styles.scopeSectionSub}>Verified checklist executed by certified technician</Text>
                </View>

                <View style={styles.highlightsCard}>
                  {activeHighlights.map((point, pIdx) => (
                    <View key={pIdx} style={styles.highlightItem}>
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkIconText}>✓</Text>
                      </View>
                      <Text style={styles.highlightText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 2. APPOINTMENT TIME SLOT PICKER FOR THIS SERVICE */}
              <View style={styles.scheduleSlotSection}>
                <View style={styles.scopeSectionHeader}>
                  <View style={styles.slotHeaderRow}>
                    <Text style={styles.scopeSectionTitle}>Select Appointment Slot</Text>
                    <View style={styles.slotDurationBadge}>
                      <Text style={styles.slotDurationText}>{activeVisual?.etaBadge}</Text>
                    </View>
                  </View>
                  <Text style={styles.scopeSectionSub}>
                    Choose the exact date &amp; arrival window that fits your schedule
                  </Text>
                </View>

                {/* Date Selection Horizontal Scroll */}
                <Text style={styles.slotSubHeader}>1. SELECT PREFERRED DATE</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateSelectorRow}
                >
                  {DATE_OPTIONS.map((d) => {
                    const isSelected = modalDateId === d.id;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        activeOpacity={0.8}
                        onPress={() => setModalDateId(d.id)}
                        style={[styles.dateCard, isSelected && styles.dateCardActive]}
                      >
                        {d.badge && (
                          <View style={[styles.dateBadgePill, isSelected && styles.dateBadgePillActive]}>
                            <Text style={[styles.dateBadgeText, isSelected && styles.dateBadgeTextActive]}>
                              {d.badge}
                            </Text>
                          </View>
                        )}
                        <Text style={[styles.dateCardDay, isSelected && styles.dateCardDayActive]}>
                          {d.dayName}
                        </Text>
                        <Text style={[styles.dateCardDate, isSelected && styles.dateCardDateActive]}>
                          {d.dateLabel}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Arrival Window Grid */}
                <Text style={[styles.slotSubHeader, { marginTop: 14 }]}>2. SELECT TIME WINDOW</Text>
                <View style={styles.timeSlotsGrid}>
                  {TIME_SLOT_OPTIONS.map((s) => {
                    const isSelected = modalSlotId === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.85}
                        onPress={() => setModalSlotId(s.id)}
                        style={[styles.timeSlotCard, isSelected && styles.timeSlotCardActive]}
                      >
                        <View style={styles.timeSlotTopRow}>
                          <Text style={styles.timeSlotIcon}>{s.icon}</Text>
                          <Text style={[styles.timeSlotPeriod, isSelected && styles.timeSlotPeriodActive]}>
                            {s.period}
                          </Text>
                        </View>
                        <Text style={[styles.timeSlotRange, isSelected && styles.timeSlotRangeActive]}>
                          {s.timeRange}
                        </Text>
                        <Text style={[styles.timeSlotDesc, isSelected && styles.timeSlotDescActive]} numberOfLines={1}>
                          {s.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Live Slot Confirmation Chip */}
                <View style={styles.slotConfirmedChip}>
                  <Text style={styles.slotConfirmedIcon}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotConfirmedTitle}>
                      Scheduled for: {currentModalDate.dayName}, {currentModalDate.dateLabel} ({currentModalSlot.timeRange})
                    </Text>
                    <Text style={styles.slotConfirmedNote}>
                      Estimated on-site execution: {activeVisual?.estimatedDuration}
                    </Text>
                  </View>
                </View>

                {/* Optional Instructions Input */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsLabel}>Special Instructions for Lifestyle Manager (Optional)</Text>
                  <TextInput
                    style={styles.instructionsInput}
                    placeholder="e.g. Ring secondary bell, senior parents at home, parking info"
                    placeholderTextColor="#94A3B8"
                    value={modalInstructions}
                    onChangeText={setModalInstructions}
                    maxLength={150}
                  />
                </View>
              </View>

              {/* 3. HOW IT WORKS: Step by Step */}
              <View style={styles.howItWorksSection}>
                <Text style={styles.howTitle}>How PadosiPro Handles It</Text>
                <View style={styles.stepRow}>
                  <Text style={styles.stepNum}>1</Text>
                  <Text style={styles.stepText}>Dedicated Lifestyle Manager verifies your chosen slot &amp; equipment.</Text>
                </View>
                <View style={styles.stepRow}>
                  <Text style={styles.stepNum}>2</Text>
                  <Text style={styles.stepText}>Certified background-checked pro arrives on-time with genuine supplies.</Text>
                </View>
                <View style={styles.stepRow}>
                  <Text style={styles.stepNum}>3</Text>
                  <Text style={styles.stepText}>Post-service cleanup, safety sign-off &amp; 30-day warranty.</Text>
                </View>
              </View>

              {/* PadosiPro Guarantee Box */}
              <View style={styles.modalGuaranteeBox}>
                <Text style={styles.modalGuaranteeIcon}>🛡️</Text>
                <View style={styles.modalGuaranteeTextCol}>
                  <Text style={styles.modalGuaranteeTitle}>PadosiPro Service Guarantee</Text>
                  <Text style={styles.modalGuaranteeDesc}>
                    30-Day Revisit Warranty · Certified Insurance · Free Slot Rescheduling
                  </Text>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>

            {/* Modal Bottom Sticky Decision Bar */}
            <View style={styles.modalBottomBar}>
              <View style={styles.modalBottomPriceCol}>
                <Text style={styles.modalBottomPriceLabel}>TOTAL PRICE</Text>
                <Text style={styles.modalBottomPriceValue}>{activeVisual?.priceFormatted}</Text>
              </View>

              <View style={styles.modalBottomButtonsRow}>
                {isActiveSelected && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleRemoveFromModal}
                    style={styles.modalRemoveButton}
                  >
                    <Text style={styles.modalRemoveButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSaveModalSlot}
                  style={[
                    styles.modalDecisionButton,
                    isActiveSelected && styles.modalDecisionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalDecisionButtonText,
                      isActiveSelected && styles.modalDecisionButtonTextActive,
                    ]}
                  >
                    {isActiveSelected ? '✓ Update Slot' : '+ Confirm Slot & Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Persistent Floating Bottom Checkout Bar */}
      {selectedTaskIds.size > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleReviewSelection}
            style={styles.floatingCartBar}
          >
            <View style={styles.cartLeft}>
              <View style={styles.thumbStack}>
                {selectedTasksList.slice(0, 3).map((item, idx) => {
                  const v = getTaskVisual(item.name);
                  return (
                    <Image
                      key={item.id}
                      source={{ uri: v.image }}
                      style={[
                        styles.stackThumb,
                        { marginLeft: idx > 0 ? -10 : 0, zIndex: 10 - idx },
                      ]}
                      resizeMode="cover"
                    />
                  );
                })}
              </View>

              <View style={styles.cartPriceDetails}>
                <View style={styles.cartTitleRow}>
                  <Text style={styles.cartItemCount}>
                    {selectedTasksList.length} {selectedTasksList.length === 1 ? 'Service' : 'Services'}
                  </Text>
                  <Text style={styles.cartDotSeparator}>•</Text>
                  <Text style={styles.cartTotalAmount}>₹{cartTotal}</Text>
                </View>
                <Text style={styles.cartSubtext} numberOfLines={1}>
                  📅 {selectedTasksList.length} slot{selectedTasksList.length === 1 ? '' : 's'} set · Tap to review
                </Text>
              </View>
            </View>

            <View style={styles.cartRight}>
              <View style={styles.checkoutActionPill}>
                <Text style={styles.checkoutActionText}>Review &amp; Book</Text>
                <Text style={styles.checkoutArrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* House / Service Location Switcher Modal */}
      <HouseLocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={(loc) => setActiveLocation(loc)}
        activeLocationId={activeLocation?.id}
      />

      {/* User Profile & Account Logout Modal */}
      <ProfileAccountModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        profile={profile}
        onOpenLocations={() => setLocationModalVisible(true)}
      />
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
  topBarRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userProfileAvatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#155C49',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...theme.shadows.subtle,
  },
  userProfileAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userProfileActiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  deliveryLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 160,
    gap: 6,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#155C49',
  },
  deliveryTextCol: {
    flex: 1,
  },
  deliveryHouseholdTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#155C49',
  },
  deliveryLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
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
    marginBottom: 2,
    minHeight: 36,
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#155C49',
    fontWeight: '600',
    marginBottom: 8,
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

  /* ===================== */
  /* MODAL STYLES          */
  /* ===================== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  modalTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  modalCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalEtaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  modalScrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalBannerContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  modalBannerImage: {
    width: '100%',
    height: '100%',
  },
  modalRatingPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalRatingPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modalTitleBlock: {
    marginBottom: 16,
  },
  modalServiceTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  modalShortDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 10,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalPriceMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPriceOriginal: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  modalDiscountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalDiscountText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },
  scopeSection: {
    marginBottom: 18,
  },
  scopeSectionHeader: {
    marginBottom: 8,
  },
  scopeSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scopeSectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  highlightsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#155C49',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  highlightText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  howItWorksSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 8,
  },
  howTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  stepText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  modalGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
    marginBottom: 12,
  },
  modalGuaranteeIcon: {
    fontSize: 20,
  },
  modalGuaranteeTextCol: {
    flex: 1,
  },
  modalGuaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
  },
  modalGuaranteeDesc: {
    fontSize: 10,
    color: '#065F46',
    marginTop: 1,
  },
  modalBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  modalBottomPriceCol: {
    justifyContent: 'center',
  },
  modalBottomPriceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  modalBottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDecisionButton: {
    backgroundColor: '#155C49',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  modalDecisionButtonActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#155C49',
  },
  modalDecisionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalDecisionButtonTextActive: {
    color: '#155C49',
  },

  /* Card Scheduled Slot Badge */
  cardScheduledPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cardScheduledText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },

  /* ================================= */
  /* MODAL APPOINTMENT SCHEDULING      */
  /* ================================= */
  scheduleSlotSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  slotDurationBadge: {
    backgroundColor: '#EFF8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  slotDurationText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  slotSubHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
    marginBottom: 8,
    marginTop: 4,
  },
  dateSelectorRow: {
    gap: 8,
    paddingBottom: 4,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    minWidth: 70,
  },
  dateCardActive: {
    borderColor: '#155C49',
    backgroundColor: '#ECFDF5',
  },
  dateBadgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 3,
  },
  dateBadgePillActive: {
    backgroundColor: '#155C49',
  },
  dateBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  dateBadgeTextActive: {
    color: '#FFFFFF',
  },
  dateCardDay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  dateCardDayActive: {
    color: '#155C49',
  },
  dateCardDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  dateCardDateActive: {
    color: '#047857',
  },
  timeSlotsGrid: {
    gap: 8,
  },
  timeSlotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  timeSlotCardActive: {
    borderColor: '#155C49',
    backgroundColor: '#ECFDF5',
  },
  timeSlotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  timeSlotIcon: {
    fontSize: 14,
  },
  timeSlotPeriod: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  timeSlotPeriodActive: {
    color: '#155C49',
  },
  timeSlotRange: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  timeSlotRangeActive: {
    color: '#047857',
  },
  timeSlotDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  timeSlotDescActive: {
    color: '#065F46',
  },
  slotConfirmedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 12,
    gap: 8,
  },
  slotConfirmedIcon: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '900',
  },
  slotConfirmedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  slotConfirmedNote: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 1,
  },
  instructionsContainer: {
    marginTop: 12,
  },
  instructionsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
  },
  instructionsInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0F172A',
  },
  modalBottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRemoveButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalRemoveButtonText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },

  /* ===================== */
  /* CART BAR STYLES       */
  /* ===================== */
  floatingCartContainer: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    right: 8,
    maxWidth: 652,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingCartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1E19',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 10,
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
    gap: 8,
    flex: 1,
    marginRight: 6,
    overflow: 'hidden',
  },
  thumbStack: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  stackThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F1E19',
  },
  cartPriceDetails: {
    justifyContent: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  cartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartItemCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cartDotSeparator: {
    fontSize: 11,
    color: '#64748B',
  },
  cartTotalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34D399',
  },
  cartSubtext: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  cartRight: {
    alignItems: 'center',
    flexShrink: 0,
  },
  checkoutActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#155C49',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
    flexShrink: 0,
  },
  checkoutActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  checkoutArrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
