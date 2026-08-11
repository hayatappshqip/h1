import { useState, useEffect } from 'react';

const FONT_SIZE_STORAGE_KEY = 'hayat_dhikr_font_size';

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
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const changeScale = (delta: number) => {
    setFontScale(prev => {
      const next = Math.max(0, Math.min(3, prev + delta));
      try {
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(next));
      } catch (e) {}
      return next;
    });
  };

  return { fontScale, changeScale };
}
