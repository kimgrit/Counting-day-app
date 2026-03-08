import { useEffect, useState } from 'react';
import { getMilestonesForDays } from '../utils/dday';

const STORAGE_KEY = 'anniversaries';
const DEFAULT_MILESTONE_DAYS = [100, 200, 300, 500, 1000];

const ORDINAL_KO = [
  '첫',
  '두',
  '세',
  '네',
  '다섯',
  '여섯',
  '일곱',
  '여덟',
  '아홉',
  '열',
];

function getOrdinalKo(n) {
  if (n >= 1 && n <= 10) return ORDINAL_KO[n - 1] + '번째';
  return `${n}번째`;
}

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
   * @param {string} baseDateStr - YYYY-MM-DD
   * @param {{ countFromOne?: boolean, extraDays?: number[] }} [options]
   *   - countFromOne: 기준일을 1일차로 셀지 (기본 true)
   *   - extraDays: 수동 계산기에서 추가한 N일 (예: [77])
   * 제목은 자동으로 "첫번째 기념일", "두번째 기념일" ... 로 설정됨 (수정 가능)
   */
  const addAnniversary = (baseDateStr, options = {}) => {
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

    const nextOrder = items.length + 1;
    const title = getOrdinalKo(nextOrder) + ' 기념일';

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

  const updateTitle = (id, newTitle) => {
    const trimmed = String(newTitle).trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: trimmed } : item,
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

  return { items, addAnniversary, updateTitle, toggleNotification };
}

