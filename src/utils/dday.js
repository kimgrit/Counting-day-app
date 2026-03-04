export function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export function getMilestoneDates(base) {
  const baseMidnight = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
  );

  return [100, 200, 300].map((n) => ({
    day: n,
    date: addDays(baseMidnight, n),
  }));
}

export function calcDday(target, today = new Date()) {
  const t = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const now = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = t.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function formatKoreanDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

