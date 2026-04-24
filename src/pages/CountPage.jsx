import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CountPage.module.css';
import {
  getNDaysDate,
  formatKoreanDateWithWeekday,
} from '../utils/dday';
import { useAppIntoss } from '../hooks/useAppIntoss';
import { useAnniversaries } from '../hooks/useAnniversaries';
import DateTextInput from '../components/DateTextInput';

const BannerAd = lazy(() => import('../components/BannerAd'));

const AUTO_MILESTONE_DAYS = [100, 200, 300, 500, 1000];
const TAB_AUTO = 'auto';
const TAB_MANUAL = 'manual';

function CountPage() {
  const navigate = useNavigate();
  const { logClick, logScreen } = useAppIntoss();
  const { items, addAnniversary } = useAnniversaries();

  const [tab, setTab] = useState(TAB_AUTO);
  const [baseDate, setBaseDate] = useState('');
  const [countFromOne, setCountFromOne] = useState(true);
  const [nDaysInput, setNDaysInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [autoCalculated, setAutoCalculated] = useState(false);
  const [manualCalculated, setManualCalculated] = useState(false);

  useEffect(() => {
    logScreen('View_page_count');
  }, [logScreen]);

  useEffect(() => {
    setAutoCalculated(false);
    setManualCalculated(false);
  }, [baseDate, countFromOne, tab]);

  useEffect(() => {
    if (tab === TAB_MANUAL) {
      setManualCalculated(false);
    }
  }, [nDaysInput, tab]);

  useEffect(() => {
    // 첫 페인트 이후 광고 로드 (초기 로딩 체감 개선)
    const w = typeof window !== 'undefined' ? window : null;
    if (w?.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShowBanner(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShowBanner(true), 700);
    return () => clearTimeout(t);
  }, []);

  const base = baseDate ? new Date(baseDate) : null;
  const isBaseValid = !!baseDate && base instanceof Date && !Number.isNaN(base.getTime());

  const nDaysNum =
    nDaysInput.trim() === '' ? null : parseInt(nDaysInput, 10);
  const nDaysValid =
    nDaysNum !== null &&
    !Number.isNaN(nDaysNum) &&
    nDaysNum >= 1 &&
    Number.isInteger(nDaysNum);
  const nDaysResult =
    base && nDaysValid ? getNDaysDate(base, nDaysNum, countFromOne) : null;

  const handleAlarmClick = () => {
    logClick('Click_btn_anniversary_alarm');
    if (!baseDate) return;
    setShowConfirmModal(true);
  };

  const handleConfirmYes = () => {
    if (!baseDate) {
      setShowConfirmModal(false);
      return;
    }
    const title = '기념일';
    if (tab === TAB_AUTO) {
      addAnniversary(title, baseDate, { countFromOne });
    } else {
      const extraDays = nDaysValid ? [nDaysNum] : [];
      addAnniversary(title, baseDate, { countFromOne, extraDays });
    }
    setShowConfirmModal(false);
    navigate('/home');
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const showRegister =
    (tab === TAB_AUTO && isBaseValid && autoCalculated) ||
    (tab === TAB_MANUAL && isBaseValid && manualCalculated && nDaysValid);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>기념일 계산기</h1>
              <p className={styles.subtitle}>
                기준 일자를 입력해서 다가오는 기념일을 계산해요.
              </p>
            </div>
            <button
              type="button"
              className={styles.homeButton}
              aria-label="내 기념일"
              onClick={() => {
                navigate('/home');
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 10.5L12 4l8 6.5v9.5a2 2 0 0 1-2 2h-4.5v-6.5h-3V22H6a2 2 0 0 1-2-2v-9.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.modeTabs}>
          <button
            type="button"
            className={
              tab === TAB_AUTO
                ? `${styles.modeTab} ${styles.modeTabActive}`
                : styles.modeTab
            }
            onClick={() => setTab(TAB_AUTO)}
          >
            자동 계산기
          </button>
          <button
            type="button"
            className={
              tab === TAB_MANUAL
                ? `${styles.modeTab} ${styles.modeTabManualActive}`
                : styles.modeTab
            }
            onClick={() => setTab(TAB_MANUAL)}
          >
            수동 계산기
          </button>
        </div>

        {tab === TAB_AUTO && (
          <section className={styles.panel}>
            <p className={styles.panelLabel}>기준 날짜는?</p>
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <DateTextInput
                  className={styles.dateDisplay}
                  value={baseDate}
                  onChange={setBaseDate}
                  ariaLabel="기준 날짜"
                  placeholder="예) 20260304"
                />
              </div>
              <button
                type="button"
                className={[
                  styles.calcButton,
                  isBaseValid ? styles.calcButtonEnabled : '',
                  autoCalculated ? styles.calcButtonDone : '',
                ].filter(Boolean).join(' ')}
                disabled={!isBaseValid || autoCalculated}
                onClick={() => setAutoCalculated(true)}
              >
                계산하기
              </button>
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={countFromOne}
                onChange={(e) => setCountFromOne(e.target.checked)}
              />
              <span className={styles.checkboxText}>
                기준일을 1일로 계산
              </span>
            </label>
            {base && autoCalculated && (
              <div className={styles.autoList}>
                {AUTO_MILESTONE_DAYS.map((n) => {
                  const date = getNDaysDate(base, n, countFromOne);
                  return (
                    <div key={n} className={styles.autoRow}>
                      <button
                        type="button"
                        className={styles.autoDayButton}
                        onClick={() => {}}
                      >
                        {n}일
                      </button>
                      <span className={styles.autoDateText}>
                        {formatKoreanDateWithWeekday(date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === TAB_MANUAL && (
          <section className={styles.panel}>
            <p className={styles.panelLabel}>기준 날짜는?</p>
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <DateTextInput
                  className={styles.dateDisplay}
                  value={baseDate}
                  onChange={setBaseDate}
                  ariaLabel="기준 날짜"
                  placeholder="예) 20260304"
                />
              </div>
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={countFromOne}
                onChange={(e) => setCountFromOne(e.target.checked)}
              />
              <span className={styles.checkboxText}>
                기준일을 1일로 계산
              </span>
            </label>
            <p className={styles.panelLabel}>
              기준 날짜의 며칠 뒤가 궁금한가요?
            </p>
            <input
              className={styles.input}
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="600일 뒤"
              value={nDaysInput}
              onChange={(e) => setNDaysInput(e.target.value)}
            />
            <button
              type="button"
              className={[
                styles.calcButtonBottom,
                isBaseValid && nDaysValid ? styles.calcButtonEnabled : '',
                manualCalculated ? styles.calcButtonDone : '',
              ].filter(Boolean).join(' ')}
              disabled={!isBaseValid || !nDaysValid || manualCalculated}
              onClick={() => setManualCalculated(true)}
            >
              계산하기
            </button>
            {manualCalculated && nDaysValid && (
              <div className={styles.manualResultRow}>
                {nDaysInput.trim() !== '' && (
                  <button
                    type="button"
                    className={styles.nDayButton}
                    onClick={() => {}}
                  >
                    {nDaysInput.trim()}일
                  </button>
                )}
                <span className={styles.manualDateText}>
                  {nDaysResult ? formatKoreanDateWithWeekday(nDaysResult) : '—'}
                </span>
              </div>
            )}
          </section>
        )}

        {showRegister && (
          <section className={styles.registerBar}>
            <button
              type="button"
              className={styles.registerButton}
              onClick={() => {
                const isFirst = (items?.length ?? 0) === 0;
                const item = addAnniversary('기념일', baseDate, {
                  countFromOne,
                  customName: isFirst ? '첫번째 기념일' : null,
                });
                logClick('Click_btn_register_anniversary', { anniversaryId: item?.id });
                navigate('/home');
              }}
            >
              기념일 등록
            </button>
          </section>
        )}

        {/*
        <section className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAlarmClick}
            disabled={!baseDate}
          >
            기념일 알림 받기
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/home')}
          >
            내 기념일 보러가기
          </button>
        </section>
        */}
      </div>

      {showBanner && (
        <Suspense fallback={null}>
          <BannerAd />
        </Suspense>
      )}

      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={handleConfirmNo}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <p id="confirm-modal-title" className={styles.modalMessage}>
              현재 기준 날짜 기준으로 디데이 알림을 보내드릴까요?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalButtonNo}
                onClick={handleConfirmNo}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalButtonYes}
                onClick={handleConfirmYes}
              >
                알림 받기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountPage;
