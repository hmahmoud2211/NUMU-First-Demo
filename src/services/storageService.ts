/**
 * Local persistence. Swap this module for API calls when a backend exists —
 * contexts only depend on these functions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'numu.';

export const storageKeys = {
  parent: `${PREFIX}parent`,
  accounts: `${PREFIX}accounts`,
  child: `${PREFIX}child`,
  onboardingSeen: `${PREFIX}onboardingSeen`,
  progress: (childId: string) => `${PREFIX}progress.${childId}`,
} as const;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch (error) {
    console.warn(`[storage] Failed to read ${key}`, error);
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Failed to write ${key}`, error);
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove ${key}`, error);
  }
}

/** Removes every NUMU key (used by "Sign out & reset demo"). */
export async function clearAllNumuData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(PREFIX)));
  } catch (error) {
    console.warn('[storage] Failed to clear data', error);
  }
}
