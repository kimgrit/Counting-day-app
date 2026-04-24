import { useEffect, useRef, useState } from 'react';
import { getMilestonesForDays } from '../utils/dday';
import { Storage } from '@apps-in-toss/web-framework';

const STORAGE_KEY = 'anniversaries';
const DEFAULT_MILESTONE_DAYS = [100, 200, 300, 500, 1000];

async function persistGet(key) {
  try {
    if (Storage?.getItem) {
      return await Storage.getItem(key);
    }
  } catch {
    // ignore
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function persistSet(key, value) {
  try {
    if (Storage?.setItem) {
      await Storage.setItem(key, value);
      return;
    }
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function useAnniversaries() {
  const [items, setItems] = useState([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await persistGet(STORAGE_KEY);
      if (cancelled) return;
      if (!raw) {
        hydratedRef.current = true;
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        // ignore parsing error
      } finally {
        hydratedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const payload = JSON.stringify(items);
    // fire and forget (native storage)
    persistSet(STORAGE_KEY, payload);
  }, [items]);

  /**
   * @param {string} title
   * @param {string} baseDateStr - YYYY-MM-DD
   * @param {{ countFromOne?: boolean, extraDays?: number[], customName?: string | null }} [options]
   *   - countFromOne: 기준일을 1일차로 셀지 (기본 true)
   *   - extraDays: 수동 계산기에서 추가한 N일 (예: [77])
   *   - customName: 사용자 지정 일정 이름 (HomePage에서 추가할 때 사용)
   */
  const addAnniversary = (title, baseDateStr, options = {}) => {
    const { countFromOne = true, extraDays = [], customName = null } = options;
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
      customName: customName?.trim?.() ? customName.trim() : null,
      countFromOne,
    };

    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateAnniversary = (id, patch = {}) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const nextBaseDate = patch.baseDate ?? item.baseDate;
        const nextCountFromOne =
          typeof patch.countFromOne === 'boolean'
            ? patch.countFromOne
            : item.countFromOne ?? true;
        const nextCustomName =
          typeof patch.customName === 'string'
            ? patch.customName.trim() || null
            : patch.customName === null
              ? null
              : item.customName ?? null;

        const base = new Date(nextBaseDate);
        const milestones = getMilestonesForDays(
          base,
          DEFAULT_MILESTONE_DAYS,
          nextCountFromOne,
        ).map((m) => ({
          day: m.day,
          date: m.date.toISOString(),
        }));

        return {
          ...item,
          baseDate: nextBaseDate,
          countFromOne: nextCountFromOne,
          customName: nextCustomName,
          milestones,
        };
      }),
    );
  };

  const updateAnniversaryName = (id, customName) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, customName: customName || null } : item,
      ),
    );
  };

  const deleteAnniversary = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const replaceAll = (nextItems) => {
    setItems(Array.isArray(nextItems) ? nextItems : []);
  };

  const toggleNotification = (id, enabled) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notificationsEnabled: enabled } : item,
      ),
    );
  };

  return {
    items,
    addAnniversary,
    updateAnniversary,
    updateAnniversaryName,
    deleteAnniversary,
    replaceAll,
    toggleNotification,
  };
}

