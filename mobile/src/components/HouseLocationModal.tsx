import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addressStorage,
  HouseholdLocation,
  HouseholdTag,
} from '../services/addressStorage';
import { theme } from '../theme';

interface HouseLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: HouseholdLocation) => void;
  activeLocationId?: string;
}

const TAG_OPTIONS: { tag: HouseholdTag; icon: string }[] = [
  { tag: 'Home', icon: '🏠' },
  { tag: "Parents' Home", icon: '👵' },
  { tag: 'Rental', icon: '🏢' },
  { tag: 'Office', icon: '💼' },
  { tag: 'Other', icon: '📍' },
];

export const HouseLocationModal: React.FC<HouseLocationModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  activeLocationId,
}) => {
  const [locations, setLocations] = useState<HouseholdLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form fields
  const [selectedTag, setSelectedTag] = useState<HouseholdTag>('Home');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loadSavedLocations = async () => {
    setLoading(true);
    try {
      const list = await addressStorage.getLocations();
      setLocations(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadSavedLocations();
      setShowAddForm(false);
      setFormError(null);
    }
  }, [visible]);

  const handleSelect = async (loc: HouseholdLocation) => {
    await addressStorage.setActiveLocationId(loc.id);
    onSelectLocation(loc);
    onClose();
  };

  const handleAddNew = async () => {
    if (!title.trim()) {
      setFormError('Please enter a title for this property (e.g. "Parents\' Home")');
      return;
    }
    if (!recipientName.trim()) {
      setFormError('Please enter contact resident name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!fullAddress.trim()) {
      setFormError('Please enter complete address details');
      return;
    }

    try {
      const newLoc = await addressStorage.addLocation({
        tag: selectedTag,
        title: title.trim(),
        recipientName: recipientName.trim(),
        phone: phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        fullAddress: fullAddress.trim(),
        landmark: landmark.trim() || undefined,
        city: 'Bengaluru',
        pincode: pincode.trim() || '560001',
      });

      // Reset form
      setTitle('');
      setRecipientName('');
      setPhone('');
      setFullAddress('');
      setLandmark('');
      setPincode('');
      setShowAddForm(false);

      onSelectLocation(newLoc);
      onClose();
    } catch {
      setFormError('Could not save address. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>SERVICE LOCATION</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Select Household Property</Text>
              <Text style={styles.headerSubtitle}>
                Schedule services for your home or elderly parents' residence
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Fetching saved households...</Text>
              </View>
            ) : (
              <>
                {/* Saved Households List */}
                <Text style={styles.sectionLabel}>SAVED HOUSEHOLDS ({locations.length})</Text>

                {locations.map((loc) => {
                  const isSelected = activeLocationId === loc.id;
                  const tagIcon =
                    TAG_OPTIONS.find((t) => t.tag === loc.tag)?.icon || '🏠';

                  return (
                    <TouchableOpacity
                      key={loc.id}
                      activeOpacity={0.85}
                      onPress={() => handleSelect(loc)}
                      style={[styles.locationCard, isSelected && styles.locationCardActive]}
                    >
                      <View style={styles.locCardTop}>
                        <View style={styles.locTagRow}>
                          <View
                            style={[
                              styles.locTagPill,
                              isSelected && styles.locTagPillActive,
                            ]}
                          >
                            <Text style={styles.locTagIcon}>{tagIcon}</Text>
                            <Text
                              style={[
                                styles.locTagText,
                                isSelected && styles.locTagTextActive,
                              ]}
                            >
                              {loc.tag.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.locTitleText}>{loc.title}</Text>
                        </View>

                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                      </View>

                      <Text style={styles.locResident}>
                        👤 {loc.recipientName} · 📞 {loc.phone}
                      </Text>
                      <Text style={styles.locAddress}>{loc.fullAddress}</Text>
                      {loc.landmark ? (
                        <Text style={styles.locLandmark}>📍 Landmark: {loc.landmark}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                {/* Add New House Toggle */}
                {!showAddForm ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowAddForm(true)}
                    style={styles.addHouseBtn}
                  >
                    <Text style={styles.addHouseBtnIcon}>＋</Text>
                    <Text style={styles.addHouseBtnText}>
                      Add Another House / Property (e.g. Parents' Home)
                    </Text>
                  </TouchableOpacity>
                ) : (
                  /* Add Household Form */
                  <View style={styles.addFormCard}>
                    <View style={styles.addFormHeader}>
                      <Text style={styles.addFormTitle}>Add New Property / Household</Text>
                      <TouchableOpacity onPress={() => setShowAddForm(false)}>
                        <Text style={styles.cancelLink}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    {formError ? (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>{formError}</Text>
                      </View>
                    ) : null}

                    {/* Tag Selector */}
                    <Text style={styles.inputLabel}>Property Type</Text>
                    <View style={styles.tagChipsRow}>
                      {TAG_OPTIONS.map((t) => {
                        const isTagSel = selectedTag === t.tag;
                        return (
                          <TouchableOpacity
                            key={t.tag}
                            activeOpacity={0.8}
                            onPress={() => setSelectedTag(t.tag)}
                            style={[styles.tagChip, isTagSel && styles.tagChipActive]}
                          >
                            <Text style={styles.tagChipIcon}>{t.icon}</Text>
                            <Text
                              style={[
                                styles.tagChipText,
                                isTagSel && styles.tagChipTextActive,
                              ]}
                            >
                              {t.tag}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Property Title */}
                    <Text style={styles.inputLabel}>Property Name / Label *</Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="e.g. Parents' House, Villa 12, Whitefield Flat"
                      placeholderTextColor="#94A3B8"
                      value={title}
                      onChangeText={setTitle}
                    />

                    {/* Resident Name & Phone */}
                    <View style={styles.formRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Resident / Contact Name *</Text>
                        <TextInput
                          style={styles.inputField}
                          placeholder="e.g. Father, Caretaker"
                          placeholderTextColor="#94A3B8"
                          value={recipientName}
                          onChangeText={setRecipientName}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Contact Phone *</Text>
                        <TextInput
                          style={styles.inputField}
                          placeholder="10-digit number"
                          placeholderTextColor="#94A3B8"
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                        />
                      </View>
                    </View>

                    {/* Full Address */}
                    <Text style={styles.inputLabel}>Complete Address (Flat / House, Building, Street) *</Text>
                    <TextInput
                      style={[styles.inputField, { height: 60 }]}
                      placeholder="e.g. Villa 14, Palm Meadows, Varthur Road, Whitefield"
                      placeholderTextColor="#94A3B8"
                      multiline
                      value={fullAddress}
                      onChangeText={setFullAddress}
                    />

                    {/* Landmark & Pincode */}
                    <View style={styles.formRow}>
                      <View style={{ flex: 1.5 }}>
                        <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                        <TextInput
                          style={styles.inputField}
                          placeholder="e.g. Near Clubhouse"
                          placeholderTextColor="#94A3B8"
                          value={landmark}
                          onChangeText={setLandmark}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Pincode</Text>
                        <TextInput
                          style={styles.inputField}
                          placeholder="560066"
                          placeholderTextColor="#94A3B8"
                          keyboardType="numeric"
                          value={pincode}
                          onChangeText={setPincode}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleAddNew}
                      style={styles.saveAddressBtn}
                    >
                      <Text style={styles.saveAddressBtnText}>
                        Save Property &amp; Deliver Here
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ height: 40 }} />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 16,
    paddingHorizontal: 16,
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    marginBottom: 4,
  },
  headerBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '800',
  },
  scrollBody: {
    marginTop: 12,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  locationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  locationCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#155C49',
  },
  locCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  locTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  locTagPillActive: {
    backgroundColor: '#155C49',
  },
  locTagIcon: {
    fontSize: 10,
  },
  locTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  locTagTextActive: {
    color: '#FFFFFF',
  },
  locTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#155C49',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#155C49',
  },
  locResident: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 3,
  },
  locAddress: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  locLandmark: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  addHouseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
    marginTop: 4,
  },
  addHouseBtnIcon: {
    fontSize: 16,
    color: '#155C49',
    fontWeight: '800',
  },
  addHouseBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#155C49',
  },
  addFormCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  addFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addFormTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
  },
  tagChipActive: {
    backgroundColor: '#155C49',
    borderColor: '#155C49',
  },
  tagChipIcon: {
    fontSize: 11,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  tagChipTextActive: {
    color: '#FFFFFF',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveAddressBtn: {
    backgroundColor: '#155C49',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
