import { useState, useEffect } from 'react';

export const FONT_SIZE_STORAGE_KEY = 'hayat_dhikr_font_size';
const EVENT_NAME = 'hayat_font_size_change';

export function useDhikrFontSize() {
  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= 3) return val;
      }
    } catch (e) {
      // ignore
    }
    return 1; // Default scale level 1
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FONT_SIZE_STORAGE_KEY && e.newValue !== null) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val) && val >= 0 && val <= 3) {
          setFontScale(val);
        }
      }
    };
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === 'number') {
        setFontScale(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_NAME, handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
    };
  }, []);

  const updateScale = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(3, nextVal));
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(clamped));
      window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: clamped }));
    } catch (e) {}
    setFontScale(clamped);
  };

  const changeScale = (delta: number) => {
    updateScale(fontScale + delta);
  };

  const setScale = (val: number) => {
    updateScale(val);
  };

  return { fontScale, changeScale, setScale };
}
