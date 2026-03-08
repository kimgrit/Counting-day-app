export function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

const MILESTONE_DAYS = [100, 200, 300, 400, 500];

export function getMilestoneDates(base) {
  const baseMidnight = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
  );

  return MILESTONE_DAYS.map((n) => ({
    day: n,
    date: addDays(baseMidnight, n),
  }));
}

/**
 * N일째 날짜 계산
 * @param {Date} base - 기준일
 * @param {number} n - N일
 * @param {boolean} countFromOne - true: 기준일=1일차, false: 기준일=0일차
 */
export function getNDaysDate(base, n, countFromOne = true) {
  const baseMidnight = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
  );
  const daysToAdd = countFromOne ? n - 1 : n;
  return addDays(baseMidnight, daysToAdd);
}

/**
 * 여러 N일째에 대한 날짜 목록 (HomePage 저장용)
 * @param {Date} base - 기준일
 * @param {number[]} days - [100, 200, 300, 500, 1000] 등
 * @param {boolean} countFromOne
 */
export function getMilestonesForDays(base, days, countFromOne = true) {
  return days.map((day) => ({
    day,
    date: getNDaysDate(base, day, countFromOne),
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

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatKoreanDateWithWeekday(date) {
  const base = formatKoreanDate(date);
  const weekday = WEEKDAY_KO[date.getDay()];
  return `${base}(${weekday})`;
}

