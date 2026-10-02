import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrandLogo, Button, Card } from '../../src/components';
import { getCategoryVisual, getTaskVisual } from '../../src/constants/serviceIcons';
import { formatApiErrorMessage, profileApi, tasksApi } from '../../src/services/api';
import { theme } from '../../src/theme';
import { UserProfile } from '../../src/types/profile';
import { CategoryWithTasks, Task } from '../../src/types/task';

const TIME_SLOTS = [
  { id: 'instant', label: '⚡ Instant', desc: 'Within 45 mins' },
  { id: 'morning', label: '🌅 Morning', desc: '9:00 AM - 12:00 PM' },
  { id: 'afternoon', label: '☀️ Afternoon', desc: '2:00 PM - 5:00 PM' },
  { id: 'evening', label: '🌙 Evening', desc: '6:00 PM - 9:00 PM' },
];

export default function TaskConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskIds?: string }>();

  const selectedIds = useMemo<string[]>(() => {
    if (!params.taskIds) return [];
    return params.taskIds.split(',').filter(Boolean);
  }, [params.taskIds]);

  const [categories, setCategories] = useState<CategoryWithTasks[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('instant');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, prof] = await Promise.all([
          tasksApi.getCategories(),
          profileApi.getMyProfile().catch(() => null),
        ]);
        setCategories(cats);
        setProfile(prof);
      } catch (err) {
        setError(formatApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const allTasksMap = useMemo(() => {
    const map = new Map<string, Task>();
    categories.forEach((cat) => {
      cat.tasks.forEach((t) => {
        map.set(t.id, { ...t, category_name: cat.name });
      });
    });
    return map;
  }, [categories]);

  const selectedTasksList = useMemo(() => {
    return selectedIds
      .map((id) => allTasksMap.get(id))
      .filter((t): t is Task => Boolean(t));
  }, [selectedIds, allTasksMap]);

  // Billing calculations
  const itemsTotal = useMemo(() => {
    return selectedTasksList.reduce((acc, item) => {
      const v = getTaskVisual(item.name);
      return acc + v.priceNumeric;
    }, 0);
  }, [selectedTasksList]);

  const platformFee = 29;
  const grandTotal = itemsTotal + platformFee;

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await tasksApi.selectTasks(selectedIds);
      // Route immediately into the enterprise status dashboard!
      router.replace('/(app)');
    } catch (err) {
      setError(formatApiErrorMessage(err));
      setSaving(false);
    }
  };

  const deliveryAddress = profile?.address || 'Flat 402, Sunshine Heights, MG Road, Bengaluru';
  const deliveryPhone = profile?.phone_number || '+91 98765 43210';
  const customerName = profile?.full_name || 'Rahul Sharma';

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/task-selection');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Top Brand Navigation Header with Prominent Back Action */}
          <View style={styles.topNavHeader}>
            <TouchableOpacity
              style={styles.backButtonTop}
              onPress={handleGoBack}
              activeOpacity={0.75}
            >
              <View style={styles.backIconCircle}>
                <Text style={styles.backIconText}>←</Text>
              </View>
              <View style={styles.backTextCol}>
                <Text style={styles.backButtonTopText}>Back to Services</Text>
                <Text style={styles.backButtonSubText}>Add or remove items</Text>
              </View>
            </TouchableOpacity>

            <BrandLogo size="xs" withText horizontal tagline="Checkout" />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Preparing your checkout summary...</Text>
            </View>
          ) : selectedTasksList.length === 0 ? (
            <Card variant="elevated" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Cart is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Please go back and select at least one household service.
              </Text>
              <Button
                title="← Return to Catalogue"
                onPress={handleGoBack}
                style={styles.backButton}
              />
            </Card>
          ) : (
            <>
              {/* 1. Delivery & Service Address Card (Blinkit style) */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.locationPinBadge}>
                      <Text style={styles.locationPinIcon}>📍</Text>
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Service Address</Text>
                      <Text style={styles.sectionSubtitle}>Verified Neighborhood Pro Coverage</Text>
                    </View>
                  </View>
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>VERIFIED</Text>
                  </View>
                </View>

                <View style={styles.addressBox}>
                  <Text style={styles.addressName}>{customerName} · {deliveryPhone}</Text>
                  <Text style={styles.addressDetails}>{deliveryAddress}</Text>
                </View>
              </View>

              {/* 2. Service Schedule / Time Slot Selector */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.sectionTitle}>Preferred Time Slot</Text>
                  <Text style={styles.slotHint}>Guaranteed arrival</Text>
                </View>

                <View style={styles.slotsGrid}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        activeOpacity={0.82}
                        onPress={() => setSelectedSlot(slot.id)}
                        style={[styles.slotPill, isSelected && styles.selectedSlotPill]}
                      >
                        <Text style={[styles.slotLabel, isSelected && styles.selectedSlotLabel]}>
                          {slot.label}
                        </Text>
                        <Text style={[styles.slotDesc, isSelected && styles.selectedSlotDesc]}>
                          {slot.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Items Ordered Breakdown */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Selected Services ({selectedTasksList.length})
                  </Text>
                  <TouchableOpacity onPress={handleGoBack} activeOpacity={0.7}>
                    <Text style={styles.addMoreLink}>+ Add / Edit Services</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemsList}>
                  {selectedTasksList.map((item, idx) => {
                    const visual = getTaskVisual(item.name);
                    return (
                      <View key={item.id} style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}>
                        <Image
                          source={{ uri: visual.image }}
                          style={styles.itemThumb}
                          resizeMode="cover"
                        />
                        <View style={styles.itemInfo}>
                          <View style={styles.itemTagRow}>
                            <View
                              style={[
                                styles.itemMicroTag,
                                {
                                  backgroundColor: visual.accentBg,
                                  borderColor: visual.borderColor,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.itemTagDot,
                                  { backgroundColor: visual.dotColor },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.itemTagText,
                                  { color: visual.textColor },
                                ]}
                              >
                                {visual.badge}
                              </Text>
                            </View>
                            <Text style={styles.itemEtaText}>{visual.etaBadge}</Text>
                          </View>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemDesc} numberOfLines={1}>
                            {item.short_description}
                          </Text>
                        </View>
                        <View style={styles.itemPriceColumn}>
                          <Text style={styles.itemPrice}>{visual.priceFormatted}</Text>
                          {visual.originalPriceFormatted && (
                            <Text style={styles.itemOriginalPrice}>
                              {visual.originalPriceFormatted}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* 4. Bill Details Card (Blinkit style) */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Bill Summary</Text>

                <View style={styles.billTable}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Service Items Total</Text>
                    <Text style={styles.billValue}>₹{itemsTotal}</Text>
                  </View>

                  <View style={styles.billRow}>
                    <View style={styles.managerFeeRow}>
                      <Text style={styles.billLabel}>Lifestyle Manager Allocation</Text>
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    </View>
                    <Text style={[styles.billValue, { color: '#059669', fontWeight: '700' }]}>
                      ₹0
                    </Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Neighborhood Insurance & Safety Guarantee</Text>
                    <Text style={styles.billValue}>₹{platformFee}</Text>
                  </View>

                  <View style={styles.billDivider} />

                  <View style={styles.billRowTotal}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalAmount}>₹{grandTotal}</Text>
                  </View>
                </View>

                {/* Trust guarantee pill */}
                <View style={styles.guaranteeBox}>
                  <Text style={styles.guaranteeIcon}>🛡️</Text>
                  <Text style={styles.guaranteeText}>
                    100% Satisfaction Guarantee · Verified Professionals · Free Cancellation
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Footer with Both Back & Confirm Actions */}
      {!loading && selectedTasksList.length > 0 && (
        <View style={styles.stickyFooter}>
          <View style={styles.footerInner}>
            <View style={styles.footerPriceColumn}>
              <Text style={styles.footerTotalLabel}>TO PAY</Text>
              <Text style={styles.footerTotalAmount}>₹{grandTotal}</Text>
              <Text style={styles.footerItemsCount}>
                {selectedTasksList.length} {selectedTasksList.length === 1 ? 'service' : 'services'}
              </Text>
            </View>

            <View style={styles.footerButtonsGroup}>
              <TouchableOpacity
                style={styles.footerBackSecondary}
                onPress={handleGoBack}
                activeOpacity={0.75}
              >
                <Text style={styles.footerBackSecondaryText}>← Add Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirm}
                disabled={saving}
                style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.confirmButtonContent}>
                    <Text style={styles.confirmButtonText}>Place Request</Text>
                    <Text style={styles.confirmArrow}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 120, // space for sticky checkout bar
  },
  centerContainer: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  topNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 8,
  },
  backIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#155C49',
  },
  backTextCol: {
    justifyContent: 'center',
  },
  backButtonTopText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  backButtonSubText: {
    fontSize: 10,
    color: '#64748B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPinBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPinIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  slotHint: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedSlotPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#155C49',
    borderWidth: 1.5,
  },
  slotLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  selectedSlotLabel: {
    color: '#155C49',
    fontWeight: '800',
  },
  slotDesc: {
    fontSize: 10,
    color: '#64748B',
  },
  selectedSlotDesc: {
    color: '#047857',
  },
  addMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#155C49',
  },
  itemsList: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  itemMicroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  itemTagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  itemTagText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemEtaText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  itemPriceColumn: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemOriginalPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  billTable: {
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  billValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  managerFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#155C49',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  guaranteeIcon: {
    fontSize: 13,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...theme.shadows.subtle,
  },
  footerInner: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPriceColumn: {
    justifyContent: 'center',
  },
  footerTotalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  footerTotalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  footerItemsCount: {
    fontSize: 11,
    color: '#64748B',
  },
  footerButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerBackSecondary: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerBackSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  confirmButton: {
    backgroundColor: '#155C49',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  confirmArrow: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    minWidth: 180,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
});
