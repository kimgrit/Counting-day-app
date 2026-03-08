import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CountPage.module.css';
import {
  getNDaysDate,
  formatKoreanDateWithWeekday,
} from '../utils/dday';
import { useAppIntoss } from '../hooks/useAppIntoss';
import BannerAd from '../components/BannerAd';

const AUTO_MILESTONE_DAYS = [100, 200, 300, 500, 1000];
const TAB_AUTO = 'auto';
const TAB_MANUAL = 'manual';

function CountPage() {
  const navigate = useNavigate();
  const { logClick, logScreen } = useAppIntoss();

  const [tab, setTab] = useState(TAB_AUTO);
  const [baseDate, setBaseDate] = useState('');
  const [countFromOne, setCountFromOne] = useState(true);
  const [nDaysInput, setNDaysInput] = useState('');

  useEffect(() => {
    logScreen('View_page_count');
  }, [logScreen]);

  const base = baseDate ? new Date(baseDate) : null;

  const nDaysNum =
    nDaysInput.trim() === '' ? null : parseInt(nDaysInput, 10);
  const nDaysValid =
    nDaysNum !== null &&
    !Number.isNaN(nDaysNum) &&
    nDaysNum >= 1 &&
    Number.isInteger(nDaysNum);
  const nDaysResult =
    base && nDaysValid ? getNDaysDate(base, nDaysNum, countFromOne) : null;

  const handleAlarm = () => {
    logClick('Click_btn_anniversary_alarm');
    navigate('/home');
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>기념일 계산기</h1>
          <p className={styles.subtitle}>
            기준 일자를 입력해서 다가오는 기념일을 계산해요.
          </p>
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
            <input
              type="date"
              className={styles.dateDisplay}
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              aria-label="기준 날짜"
            />
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
            {base && (
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
            <input
              type="date"
              className={styles.dateDisplay}
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              aria-label="기준 날짜"
            />
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
            <div className={styles.manualResultRow}>
              <button
                type="button"
                className={styles.nDayButton}
                onClick={() => {}}
              >
                +{nDaysInput.trim() || '600'}일
              </button>
              <span className={styles.manualDateText}>
                {nDaysResult
                  ? formatKoreanDateWithWeekday(nDaysResult)
                  : '—'}
              </span>
            </div>
          </section>
        )}

        <section className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAlarm}
          >
            기념일 알림 받기
          </button>
        </section>
      </div>

      <BannerAd />
    </div>
  );
}

export default CountPage;
