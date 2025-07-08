export const getStoredData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultValue, ...parsed };
    }
  } catch (error) {
    console.error(`Failed to parse stored data for key "${key}":`, error);
  }

  return defaultValue;
};

export const saveDataToStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}":`, error);
  }
};

export const removeStoredData = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data from localStorage for key "${key}":`, error);
  }
};

export const hasStoredData = (key: string): boolean => {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Failed to check localStorage for key "${key}":`, error);
    return false;
  }
};
