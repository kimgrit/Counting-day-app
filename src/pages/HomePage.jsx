import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, Button } from '@toss/tds-mobile';
import { adaptive } from '@toss/tds-colors';
import styles from './HomePage.module.css';
import { useAnniversaries } from '../hooks/useAnniversaries';
import { formatKoreanDate, calcDday } from '../utils/dday';
import { useAppIntoss } from '../hooks/useAppIntoss';
import { registerNotificationForAnniversary } from '../utils/notifications';
import BannerAd from '../components/BannerAd';

function HomePage() {
  const navigate = useNavigate();
  const { items, toggleNotification } = useAnniversaries();
  const { logClick, logScreen } = useAppIntoss();

  useEffect(() => {
    logScreen('View_page_home');
  }, [logScreen]);

  const handleNotificationToggle = async (item, enable) => {
    logClick('Click_btn_notification', {
      enable,
      anniversaryId: item.id,
    });

    if (enable) {
      await registerNotificationForAnniversary(item);
    }

    toggleNotification(item.id, enable);
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <span className={styles.title}>
              <Text size={18} fontWeight="bold">
                나의 기념일
              </Text>
            </span>
            <Text size={13} color={adaptive.grey700}>
              등록한 기념일의 D-day와 알림을 한눈에 확인해요.
            </Text>
          </div>
          <Button className={styles.headerButton} onClick={() => navigate('/')}>
            새 기념일 계산하기
          </Button>
        </header>

        <section className={styles.listSection}>
          {items.length === 0 && (
            <div className={styles.empty}>
              <Text size={14} color={adaptive.grey700}>
                아직 저장된 기념일이 없어요.
              </Text>
              <Button
                className={styles.emptyButton}
                onClick={() => navigate('/')}
              >
                첫 기념일 등록하러 가기
              </Button>
            </div>
          )}

          {items.map((item) => {
            const base = new Date(item.baseDate);

            return (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <Text size={15} fontWeight="bold">
                    {item.title}
                  </Text>
                  <Text size={12} color={adaptive.grey700}>
                    기준일 {formatKoreanDate(base)}
                  </Text>
                </div>

                <div className={styles.cardBody}>
                  {item.milestones.map((m) => {
                    const date = new Date(m.date);
                    const dday = calcDday(date);
                    const label =
                      dday === 0
                        ? 'D-Day'
                        : dday > 0
                        ? `D-${dday}`
                        : `D+${Math.abs(dday)}`;

                    return (
                      <div key={m.day} className={styles.milestoneRow}>
                        <Text size={13}>
                          {m.day}일 · {formatKoreanDate(date)}
                        </Text>
                        <Text size={12} color={adaptive.grey700}>
                          {label}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.cardFooter}>
                  <Button
                    className={styles.notifyButton}
                    onClick={() =>
                      handleNotificationToggle(
                        item,
                        !item.notificationsEnabled,
                      )
                    }
                  >
                    {item.notificationsEnabled ? '알림 끄기' : '알림 받기'}
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <BannerAd placement="home-page-bottom" />
    </div>
  );
}

export default HomePage;


