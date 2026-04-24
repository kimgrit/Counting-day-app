function pad2(n) {
  return String(n).padStart(2, '0');
}

function isValidDateParts(y, m, d) {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return false;
  }
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

/**
 * 사용자 입력을 YYYY-MM-DD로 파싱합니다.
 * 지원 예: 20260304, 2026-03-04, 2026.03.04, 2026/03/04
 */
export function parseDateInputToISO(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;

  // 1) YYYY-MM-DD (or with ., /)
  const m1 = s.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (m1) {
    const y = parseInt(m1[1], 10);
    const mo = parseInt(m1[2], 10);
    const d = parseInt(m1[3], 10);
    if (!isValidDateParts(y, mo, d)) return null;
    return `${y}-${pad2(mo)}-${pad2(d)}`;
  }

  // 2) YYYYMMDD
  const digits = s.replace(/\D/g, '');
  if (digits.length === 8) {
    const y = parseInt(digits.slice(0, 4), 10);
    const mo = parseInt(digits.slice(4, 6), 10);
    const d = parseInt(digits.slice(6, 8), 10);
    if (!isValidDateParts(y, mo, d)) return null;
    return `${y}-${pad2(mo)}-${pad2(d)}`;
  }

  return null;
}

