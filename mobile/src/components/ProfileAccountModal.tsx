import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { UserProfile } from '../types/profile';

interface ProfileAccountModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onOpenLocations?: () => void;
}

export const ProfileAccountModal: React.FC<ProfileAccountModalProps> = ({
  visible,
  onClose,
  profile,
  onOpenLocations,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = (profile?.full_name || user?.email || 'P').charAt(0).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      onClose();
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  const navigateToDashboard = () => {
    onClose();
    router.push('/(app)');
  };

  const navigateToEditProfile = () => {
    onClose();
    router.push('/(onboarding)/profile');
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
            <View style={styles.badgeRow}>
              <View style={styles.verifiedPill}>
                <View style={styles.greenDot} />
                <Text style={styles.verifiedPillText}>ACTIVE MEMBER</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* User Profile Info Card */}
            <View style={styles.profileHeroCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initial}</Text>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeIcon}>✓</Text>
                </View>
              </View>

              <View style={styles.heroTextCol}>
                <Text style={styles.userNameText}>
                  {profile?.full_name || 'Rahul Sharma'}
                </Text>
                <Text style={styles.userEmailText}>{user?.email || 'member@padosipro.in'}</Text>
                <Text style={styles.userPhoneText}>
                  📞 {profile?.phone_number || '+91 98765 43210'}
                </Text>
              </View>
            </View>

            {/* Household Membership Badge */}
            <View style={styles.tierBox}>
              <Text style={styles.tierIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tierTitle}>Priority Household Concierge</Text>
                <Text style={styles.tierSubtitle}>
                  Dedicated Lifestyle Manager assigned to your address
                </Text>
              </View>
            </View>

            {/* Primary Address Details */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeaderLabel}>SERVICE ADDRESS</Text>
              <View style={styles.addressBox}>
                <View style={styles.addressTop}>
                  <Text style={styles.addressTag}>PRIMARY RESIDENCE</Text>
                  {onOpenLocations && (
                    <TouchableOpacity onPress={() => { onClose(); onOpenLocations(); }}>
                      <Text style={styles.switchHouseLink}>Switch House ▾</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.addressDetailText}>
                  {profile?.address || 'Flat 402, Sunshine Heights, MG Road, Bengaluru'}
                </Text>
              </View>
            </View>

            {/* Quick Action Menu Links */}
            <View style={styles.actionMenu}>
              <Text style={styles.sectionHeaderLabel}>ACCOUNT SHORTCUTS</Text>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={navigateToDashboard}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.menuIconText}>📦</Text>
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>Active Requests &amp; Live Tracking</Text>
                  <Text style={styles.menuSub}>View current technician status &amp; SLA</Text>
                </View>
                <Text style={styles.menuChevron}>→</Text>
              </TouchableOpacity>

              {onOpenLocations && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => { onClose(); onOpenLocations(); }}
                  style={styles.menuItem}
                >
                  <View style={[styles.menuIconCircle, { backgroundColor: '#EFF8FF' }]}>
                    <Text style={styles.menuIconText}>🏠</Text>
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={styles.menuTitle}>Saved Households &amp; Properties</Text>
                    <Text style={styles.menuSub}>Manage parents' home or rental flats</Text>
                  </View>
                  <Text style={styles.menuChevron}>→</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={navigateToEditProfile}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Text style={styles.menuIconText}>✏️</Text>
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>Edit Member Profile</Text>
                  <Text style={styles.menuSub}>Update phone number, name or address</Text>
                </View>
                <Text style={styles.menuChevron}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Out / Logout Button */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogout}
                disabled={loggingOut}
                style={styles.logoutButton}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Sign Out from PadosiPro</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.versionText}>PadosiPro v1.2.0 · Enterprise Household Edition</Text>
            </View>

            <View style={{ height: 30 }} />
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
    paddingHorizontal: 18,
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  verifiedPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
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
    marginTop: 14,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  avatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#155C49',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...theme.shadows.subtle,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  heroTextCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  userEmailText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  userPhoneText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginTop: 3,
  },
  tierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 12,
    gap: 10,
  },
  tierIcon: {
    fontSize: 18,
  },
  tierTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
  },
  tierSubtitle: {
    fontSize: 10.5,
    color: '#065F46',
    marginTop: 1,
  },
  infoSection: {
    marginTop: 14,
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#155C49',
    letterSpacing: 0.4,
  },
  switchHouseLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  addressDetailText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  actionMenu: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconText: {
    fontSize: 16,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  menuChevron: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  logoutContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    gap: 8,
  },
  logoutIcon: {
    fontSize: 14,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
  },
});
