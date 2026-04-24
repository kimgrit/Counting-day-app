import { useEffect, useMemo, useState } from 'react';
import { parseDateInputToISO } from '../utils/parseDateInput';

function isoToHuman(iso) {
  if (!iso) return '';
  // ISO: YYYY-MM-DD
  return iso.replaceAll('-', '');
}

/**
 * 텍스트로 날짜 입력 (예: 20260304 / 2026-03-04 / 2026.03.04)
 * - 내부 값은 ISO(YYYY-MM-DD)로 유지
 */
export default function DateTextInput({
  value,
  onChange,
  className,
  placeholder = '예) 20260304',
  ariaLabel = '날짜 입력',
}) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);

  const parsedISO = useMemo(() => parseDateInputToISO(text), [text]);
  const showInvalid = touched && text.trim() !== '' && !parsedISO;

  useEffect(() => {
    // 외부 값이 바뀌면 입력 텍스트도 동기화 (사용자 편의: 20260304 형태)
    setText(value ? isoToHuman(value) : '');
  }, [value]);

  return (
    <div>
      <input
        className={className}
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setTouched(true);
        }}
        onBlur={() => {
          setTouched(true);
          if (!text.trim()) {
            onChange('');
            return;
          }
          const iso = parseDateInputToISO(text);
          if (iso) onChange(iso);
        }}
        aria-label={ariaLabel}
      />
      {showInvalid && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: '#ef4444',
          }}
          role="alert"
        >
          날짜 형식을 확인해 주세요. (예: 20260304)
        </div>
      )}
    </div>
  );
}

