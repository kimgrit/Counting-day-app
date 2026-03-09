import { useEffect, useState } from 'react';
import { getMilestonesForDays } from '../utils/dday';

const STORAGE_KEY = 'anniversaries';
const DEFAULT_MILESTONE_DAYS = [100, 200, 300, 500, 1000];

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

  /**
   * @param {string} title
   * @param {string} baseDateStr - YYYY-MM-DD
   * @param {{ countFromOne?: boolean, extraDays?: number[] }} [options]
   *   - countFromOne: 기준일을 1일차로 셀지 (기본 true)
   *   - extraDays: 수동 계산기에서 추가한 N일 (예: [77])
   */
  const addAnniversary = (title, baseDateStr, options = {}) => {
    const { countFromOne = true, extraDays = [] } = options;
    const base = new Date(baseDateStr);

    const allDays = [...new Set([...DEFAULT_MILESTONE_DAYS, ...extraDays])].sort(
      (a, b) => a - b,
    );
    const milestones = getMilestonesForDays(base, allDays, countFromOne).map(
      (m) => ({
        day: m.day,
        date: m.date.toISOString(),
      }),
    );

    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      baseDate: baseDateStr,
      milestones,
      notificationsEnabled: false,
      customName: null,
    };

    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateAnniversaryName = (id, customName) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, customName: customName || null } : item,
      ),
    );
  };

  const toggleNotification = (id, enabled) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notificationsEnabled: enabled } : item,
      ),
    );
  };

  return { items, addAnniversary, updateAnniversaryName, toggleNotification };
}

