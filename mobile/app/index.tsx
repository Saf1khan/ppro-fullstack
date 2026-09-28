import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { theme } from '../src/theme';
import { Button, Card } from '../src/components';
import { api } from '../src/services/api';

export default function IndexScreen() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const testHealthCheck = async () => {
    setLoadingHealth(true);
    try {
      const data = await api.checkHealth();
      setHealthStatus(`Online: ${data.status} (v${data.version})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setHealthStatus(`Error: ${msg}`);
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>PHASE 1 FOUNDATION</Text>
          <Text style={styles.title}>PadosiPro</Text>
          <Text style={styles.subtitle}>
            Full-Stack Mobile Application & Backend Architecture
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>System Architecture</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Mobile Engine:</Text>
            <Text style={styles.statusValue}>Expo SDK 52 + React Native</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Routing:</Text>
            <Text style={styles.statusValue}>Expo Router (Typed Routes)</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Security:</Text>
            <Text style={styles.statusValue}>Expo SecureStore</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Backend Target:</Text>
            <Text style={styles.statusValue}>FastAPI + PostgreSQL</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Design System Tokens</Text>
          <View style={styles.paletteRow}>
            <View style={[styles.colorChip, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.chipText}>#155C49</Text>
            </View>
            <View style={[styles.colorChip, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }]}>
              <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>#FAFAF7</Text>
            </View>
            <View style={[styles.colorChip, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
              <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>#FFFFFF</Text>
            </View>
          </View>
          <Text style={styles.tokenDescription}>
            Visual tokens calibrated to PadosiPro reference guidelines (12px soft corner radius, custom palette, crisp system typography).
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Backend Connectivity</Text>
          <Text style={styles.cardDescription}>
            Verify connectivity from the mobile app to the FastAPI service.
          </Text>
          <Button
            title="Check API Health"
            onPress={testHealthCheck}
            loading={loadingHealth}
            style={styles.healthButton}
          />
          {healthStatus && (
            <Text style={styles.healthResultText}>{healthStatus}</Text>
          )}
        </Card>
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
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    lineHeight: theme.typography.lineHeight.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.subheading,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  colorChip: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textInverse,
  },
  tokenDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  healthButton: {
    marginTop: theme.spacing.xs,
  },
  healthResultText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
