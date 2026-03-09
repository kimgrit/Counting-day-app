import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { useAnniversaries } from '../hooks/useAnniversaries';
import { formatKoreanDateWithWeekday } from '../utils/dday';
import { useAppIntoss } from '../hooks/useAppIntoss';
import { registerNotificationForAnniversary } from '../utils/notifications';
import BannerAd from '../components/BannerAd';

const ORDINALS = ['첫', '두', '세', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

function getDisplayName(item, index) {
  if (item.customName && item.customName.trim()) {
    return item.customName.trim();
  }
  const ord = ORDINALS[index] ?? `${index + 1}`;
  return `${ord}번째 기념일`;
}

function HomePage() {
  const navigate = useNavigate();
  const { items, updateAnniversaryName, toggleNotification } = useAnniversaries();
  const { logClick, logScreen } = useAppIntoss();

  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    logScreen('View_page_home');
  }, [logScreen]);

  const handleNotificationToggle = async (item, enable) => {
    logClick('Click_btn_notification', { enable, anniversaryId: item.id });
    if (enable) {
      await registerNotificationForAnniversary(item);
    }
    toggleNotification(item.id, enable);
  };

  const handleEditStart = (item, displayName, e) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditingValue(displayName);
  };

  const handleEditSave = (id) => {
    updateAnniversaryName(id, editingValue.trim() || null);
    setEditingId(null);
    setEditingValue('');
  };

  const handleCardClick = (itemId) => {
    setExpandedId((prev) => (prev === itemId ? null : itemId));
  };

  const displayOrder = [...items].reverse();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>나의 기념일</h1>
          <button
            type="button"
            className={styles.headerButton}
            onClick={() => navigate('/')}
          >
            새 기념일 계산하기
          </button>
        </header>

        <section className={styles.listSection}>
          {items.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>아직 저장된 기념일이 없어요.</p>
              <button
                type="button"
                className={styles.emptyButton}
                onClick={() => navigate('/')}
              >
                첫 기념일 등록하러 가기
              </button>
            </div>
          )}

          {displayOrder.map((item, index) => {
            const base = new Date(item.baseDate);
            const displayName = getDisplayName(item, index);
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;

            return (
              <article
                key={item.id}
                className={styles.card}
                onClick={() => !isEditing && handleCardClick(item.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.editInput}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleEditSave(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        aria-label="기념일 이름"
                      />
                    ) : (
                      <span className={styles.cardName}>{displayName}</span>
                    )}
                    {!isEditing && (
                      <button
                        type="button"
                        className={styles.modifyButton}
                        onClick={(e) => handleEditStart(item, displayName, e)}
                      >
                        수정
                      </button>
                    )}
                  </div>
                  <p className={styles.cardBaseDate}>
                    {formatKoreanDateWithWeekday(base)}
                  </p>
                </div>

                {isExpanded && (
                  <>
                    <div
                      className={styles.cardBody}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.milestones.map((m) => {
                        const date = new Date(m.date);
                        return (
                          <div key={m.day} className={styles.milestoneRow}>
                            <span className={styles.milestoneButton}>
                              {m.day}일
                            </span>
                            <span className={styles.milestoneDate}>
                              {formatKoreanDateWithWeekday(date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className={styles.cardFooter}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={
                          item.notificationsEnabled
                            ? styles.notiButtonOff
                            : styles.notiButtonOn
                        }
                        onClick={() =>
                          handleNotificationToggle(
                            item,
                            !item.notificationsEnabled,
                          )
                        }
                      >
                        {item.notificationsEnabled ? '알림 끄기' : '알림 받기'}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </section>
      </div>

      <BannerAd />
    </div>
  );
}

export default HomePage;
