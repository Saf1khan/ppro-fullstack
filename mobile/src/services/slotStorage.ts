import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_SERVICE_SLOT, ServiceSlot } from '../constants/serviceIcons';

const SERVICE_SLOTS_STORAGE_KEY = 'padosipro_scheduled_service_slots';

/**
 * Manages customer preferred appointment dates and time slots for household services,
 * with persistence across web browser sessions and native mobile app restarts.
 */
export const slotStorage = {
  async getServiceSlots(): Promise<Record<string, ServiceSlot>> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(SERVICE_SLOTS_STORAGE_KEY);
          if (raw) return JSON.parse(raw);
        }
        return {};
      }
      const raw = await SecureStore.getItemAsync(SERVICE_SLOTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      return {};
    } catch (err) {
      console.warn('Could not read saved service slots:', err);
      return {};
    }
  },

  async setServiceSlots(slots: Record<string, ServiceSlot>): Promise<void> {
    try {
      const serialized = JSON.stringify(slots);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(SERVICE_SLOTS_STORAGE_KEY, serialized);
        }
        return;
      }
      await SecureStore.setItemAsync(SERVICE_SLOTS_STORAGE_KEY, serialized);
    } catch (err) {
      console.warn('Could not save service slots:', err);
    }
  },

  async setServiceSlot(taskId: string, slot: ServiceSlot): Promise<void> {
    const all = await this.getServiceSlots();
    all[taskId] = slot;
    await this.setServiceSlots(all);
  },

  async removeServiceSlot(taskId: string): Promise<void> {
    const all = await this.getServiceSlots();
    if (all[taskId]) {
      delete all[taskId];
      await this.setServiceSlots(all);
    }
  },

  async clearServiceSlots(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(SERVICE_SLOTS_STORAGE_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(SERVICE_SLOTS_STORAGE_KEY);
    } catch {}
  },
};
