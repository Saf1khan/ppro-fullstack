import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type HouseholdTag = 'Home' | "Parents' Home" | 'Rental' | 'Office' | 'Other';

export interface HouseholdLocation {
  id: string;
  tag: HouseholdTag;
  title: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  pincode: string;
}

const STORAGE_KEY_LOCATIONS = 'padosipro_saved_household_locations';
const STORAGE_KEY_ACTIVE_ID = 'padosipro_active_household_id';

export const DEFAULT_HOUSEHOLD_LOCATIONS: HouseholdLocation[] = [
  {
    id: 'loc-1',
    tag: 'Home',
    title: 'Primary Residence',
    recipientName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    fullAddress: 'Flat 402, Sunshine Heights, MG Road, Bengaluru',
    city: 'Bengaluru',
    pincode: '560001',
    landmark: 'Opposite Metro Pillar 128',
  },
  {
    id: 'loc-2',
    tag: "Parents' Home",
    title: "Elderly Parents' Residence",
    recipientName: 'Suresh Sharma (Father)',
    phone: '+91 98450 12345',
    fullAddress: 'Villa 14, Palm Meadows, Varthur Road, Whitefield',
    city: 'Bengaluru',
    pincode: '560066',
    landmark: 'Near Phase-2 Clubhouse',
  },
  {
    id: 'loc-3',
    tag: 'Rental',
    title: 'Indiranagar Rental Apartment',
    recipientName: 'Property Caretaker / Tenant',
    phone: '+91 99001 88776',
    fullAddress: '#84, 12th Main Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    landmark: 'Near Corner House',
  },
];

export const addressStorage = {
  async getLocations(): Promise<HouseholdLocation[]> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY_LOCATIONS);
          if (raw) return JSON.parse(raw);
        }
        return DEFAULT_HOUSEHOLD_LOCATIONS;
      }
      const raw = await SecureStore.getItemAsync(STORAGE_KEY_LOCATIONS);
      if (raw) return JSON.parse(raw);
      return DEFAULT_HOUSEHOLD_LOCATIONS;
    } catch {
      return DEFAULT_HOUSEHOLD_LOCATIONS;
    }
  },

  async saveLocations(locations: HouseholdLocation[]): Promise<void> {
    try {
      const serialized = JSON.stringify(locations);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_LOCATIONS, serialized);
        }
        return;
      }
      await SecureStore.setItemAsync(STORAGE_KEY_LOCATIONS, serialized);
    } catch (err) {
      console.warn('Could not save household locations:', err);
    }
  },

  async getActiveLocationId(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
          if (id) return id;
        }
        return DEFAULT_HOUSEHOLD_LOCATIONS[0].id;
      }
      const id = await SecureStore.getItemAsync(STORAGE_KEY_ACTIVE_ID);
      return id || DEFAULT_HOUSEHOLD_LOCATIONS[0].id;
    } catch {
      return DEFAULT_HOUSEHOLD_LOCATIONS[0].id;
    }
  },

  async setActiveLocationId(id: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
        }
        return;
      }
      await SecureStore.setItemAsync(STORAGE_KEY_ACTIVE_ID, id);
    } catch (err) {
      console.warn('Could not save active location id:', err);
    }
  },

  async getActiveLocation(): Promise<HouseholdLocation> {
    const list = await this.getLocations();
    const activeId = await this.getActiveLocationId();
    const match = list.find((item) => item.id === activeId);
    return match || list[0] || DEFAULT_HOUSEHOLD_LOCATIONS[0];
  },

  async addLocation(loc: Omit<HouseholdLocation, 'id'>): Promise<HouseholdLocation> {
    const list = await this.getLocations();
    const newLocation: HouseholdLocation = {
      ...loc,
      id: `loc-${Date.now()}`,
    };
    const updated = [newLocation, ...list];
    await this.saveLocations(updated);
    await this.setActiveLocationId(newLocation.id);
    return newLocation;
  },
};
