import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import styles from './CountPage.module.css';
import { getMilestoneDates, formatKoreanDate } from '../utils/dday';
import { useAnniversaries } from '../hooks/useAnniversaries';
import { useAppIntoss } from '../hooks/useAppIntoss';
import BannerAd from '../components/BannerAd';

function CountPage() {
  const navigate = useNavigate();
  const { addAnniversary } = useAnniversaries();
  const { logClick, logScreen } = useAppIntoss();

  const [title, setTitle] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [selectedDay, setSelectedDay] = useState(100);

  useEffect(() => {
    logScreen('View_page_count');
  }, [logScreen]);

  const base = baseDate ? new Date(baseDate) : null;
  const milestones = base ? getMilestoneDates(base) : [];

  const handleSave = () => {
    if (!base || !title.trim()) return;
    logClick('Click_btn_save_anniversary');
    addAnniversary(title.trim(), baseDate);
    navigate('/home');
  };

  const isSaveDisabled = !base || !title.trim();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <Text size={18} fontWeight="bold">
            기념일 계산기
          </Text>
          <Text size={13} color={adaptive.grey700}>
            기준이 되는 날을 입력하면 100일, 200일, 300일을 바로 알려드려요.
          </Text>
        </header>

        <section className={styles.formSection}>
          <div className={styles.field}>
            <label className={styles.label}>기념일 이름</label>
            <input
              className={styles.input}
              placeholder="예: 우리 사귄 날"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>기준 날짜</label>
            <input
              className={styles.input}
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
            />
          </div>
        </section>

        {base && (
          <section className={styles.milestoneSection}>
            <div className={styles.tabs}>
              {[100, 200, 300].map((n) => (
                <Button
                  key={n}
                  className={
                    selectedDay === n
                      ? `${styles.tabButton} ${styles.tabButtonActive}`
                      : styles.tabButton
                  }
                  onClick={() => setSelectedDay(n)}
                >
                  {n}일
                </Button>
              ))}
            </div>

            <div className={styles.cards}>
              {milestones.map((m) => (
                <div
                  key={m.day}
                  className={
                    m.day === selectedDay
                      ? `${styles.card} ${styles.cardActive}`
                      : styles.card
                  }
                >
                  <Text size={13} color={adaptive.grey700}>
                    {m.day}일 되는 날
                  </Text>
                  <Text size={18} fontWeight="bold">
                    {formatKoreanDate(m.date)}
                  </Text>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.actions}>
          <Button
            className={styles.primaryButton}
            disabled={isSaveDisabled}
            onClick={handleSave}
          >
            나만의 기념일 등록하기
          </Button>
        </section>
      </div>

      <BannerAd placement="count-page-bottom" />
    </div>
  );
}

export default CountPage;


