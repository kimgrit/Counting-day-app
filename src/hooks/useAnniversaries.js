import { useEffect, useState } from 'react';
import { getMilestoneDates } from '../utils/dday';

const STORAGE_KEY = 'anniversaries';

export function useAnniversaries() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addAnniversary = (title, baseDateStr) => {
    const base = new Date(baseDateStr);
    const milestones = getMilestoneDates(base).map((m) => ({
      day: m.day,
      date: m.date.toISOString(),
    }));

    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      baseDate: baseDateStr,
      milestones,
      notificationsEnabled: false,
    };

    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const toggleNotification = (id, enabled) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notificationsEnabled: enabled } : item,
      ),
    );
  };

  return { items, addAnniversary, toggleNotification };
}

