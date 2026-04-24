import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { useAnniversaries } from '../hooks/useAnniversaries';
import { calcDday, formatKoreanDateWithWeekday } from '../utils/dday';
import { useAppIntoss } from '../hooks/useAppIntoss';
import DateTextInput from '../components/DateTextInput';
const BannerAd = lazy(() => import('../components/BannerAd'));

const ORDINALS = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

function getDisplayName(item, index) {
  if (item.customName && item.customName.trim()) {
    return item.customName.trim();
  }
  const ord = ORDINALS[index] ?? `${index + 1}`;
  return `${ord}번째 기념일`;
}

function getDdayText(date) {
  const diff = calcDday(date);
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function HomePage() {
  const navigate = useNavigate();
  const { items, addAnniversary, updateAnniversary, deleteAnniversary, replaceAll } =
    useAnniversaries();
  const { logClick, logScreen } = useAppIntoss();

  const [showBanner, setShowBanner] = useState(false);

  // add / edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCountFromOne, setNewCountFromOne] = useState(true);
  const [editingTargetId, setEditingTargetId] = useState(null);

  // long press action sheet
  const [actionTargetId, setActionTargetId] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const longPressTimerRef = useRef(null);
  const suppressClickRef = useRef(false);

  // reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [displayItems, setDisplayItems] = useState([]);
  const displayItemsRef = useRef([]);
  const listRefs = useRef(new Map());
  const dragRef = useRef({ draggingId: null, pointerId: null, targetEl: null });
  const lastPointerRef = useRef(null);

  useEffect(() => {
    logScreen('View_page_home');
  }, [logScreen]);

  useEffect(() => {
    const w = typeof window !== 'undefined' ? window : null;
    if (w?.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShowBanner(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShowBanner(true), 700);
    return () => clearTimeout(t);
  }, []);

  const displayOrder = useMemo(() => [...items].reverse(), [items]);

  useEffect(() => {
    if (reorderMode) return;
    setDisplayItems(displayOrder);
  }, [displayOrder, reorderMode]);

  useEffect(() => {
    displayItemsRef.current = displayItems;
  }, [displayItems]);

  const newDateObj = newDate ? new Date(newDate) : null;
  const newDateValid = !!newDateObj && !Number.isNaN(newDateObj.getTime());
  const newDateDiff = newDateValid ? calcDday(newDateObj) : null;

  const isEditMode = editingTargetId !== null;

  const openAddModal = () => {
    setEditingTargetId(null);
    setNewName('');
    setNewDate('');
    setNewCountFromOne(true);
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setEditingTargetId(item.id);
    setNewName(item.customName || item.title || '기념일');
    setNewDate(item.baseDate);
    setNewCountFromOne(item.countFromOne ?? true);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingTargetId(null);
  };

  const openActionSheet = (itemId) => {
    setActionTargetId(itemId);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    setShowActionSheet(false);
    setActionTargetId(null);
  };

  const startLongPress = (itemId) => {
    if (reorderMode) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      // long-press on the item itself -> start reordering immediately
      suppressClickRef.current = true;
      setReorderMode(true);
      setDisplayItems(displayOrder);
      dragRef.current.draggingId = itemId;
      dragRef.current.pointerId = lastPointerRef.current?.pointerId ?? null;
      dragRef.current.targetEl = lastPointerRef.current?.targetEl ?? null;
      try {
        if (dragRef.current.targetEl && dragRef.current.pointerId != null) {
          dragRef.current.targetEl.setPointerCapture?.(dragRef.current.pointerId);
        }
      } catch {
        // ignore
      }
      // allow click again after gesture starts
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 300);
    }, 450);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimerRef.current);
  };

  const actionTarget = displayOrder.find((x) => x.id === actionTargetId) || null;

  const commitReorder = (nextDisplayItems) => {
    // storage is newest-first, display is oldest-first
    const nextStorage = [...nextDisplayItems].reverse();
    replaceAll(nextStorage);
  };

  const moveItemByPointerY = (pointerY) => {
    const draggingId = dragRef.current.draggingId;
    if (!draggingId) return;
    const currentItems = displayItemsRef.current;
    const els = currentItems
      .map((it) => ({ id: it.id, el: listRefs.current.get(it.id) }))
      .filter((x) => x.el);
    if (els.length === 0) return;

    let targetIndex = els.length - 1;
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (pointerY < mid) {
        targetIndex = i;
        break;
      }
    }

    const fromIndex = currentItems.findIndex((x) => x.id === draggingId);
    if (fromIndex < 0) return;
    if (targetIndex === fromIndex) return;

    const next = [...currentItems];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDisplayItems(next);
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.calcIconButton}
            onClick={() => navigate('/')}
            aria-label="계산기로 돌아가기"
            title="계산기"
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
                d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M8 7h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 11h3M13 11h3M8 15h3M13 15h3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <h1 className={styles.pageTitle}>내 기념일</h1>
          <button
            type="button"
            className={styles.addIconButton}
            onClick={openAddModal}
            aria-label="기념일 추가"
            title="추가"
          >
            +
          </button>
        </header>

        <section className={styles.listSection}>
          {items.length === 0 && (
            <div className={styles.emptyCenter}>
              <div className={styles.emptyBlob} aria-hidden="true" />
              <p className={styles.emptyText}>등록된 기념일이 없어요</p>
              <p className={styles.emptyHint}>오른쪽 위의 + 버튼으로 추가해 보세요.</p>
            </div>
          )}

          {(reorderMode ? displayItems : displayOrder).map((item, index) => {
            const base = new Date(item.baseDate);
            const displayName = getDisplayName(item, index);
            const isDragging = reorderMode && dragRef.current.draggingId === item.id;

            return (
              <article
                key={item.id}
                className={isDragging ? `${styles.rowCard} ${styles.rowCardDragging}` : styles.rowCard}
                ref={(el) => {
                  if (!el) {
                    listRefs.current.delete(item.id);
                    return;
                  }
                  listRefs.current.set(item.id, el);
                }}
                onPointerDown={(e) => {
                  lastPointerRef.current = {
                    pointerId: e.pointerId,
                    targetEl: e.currentTarget,
                  };
                  startLongPress(item.id);
                }}
                onPointerMove={(e) => {
                  if (!reorderMode) {
                    cancelLongPress();
                    return;
                  }
                  if (dragRef.current.draggingId) {
                    moveItemByPointerY(e.clientY);
                  }
                }}
                onPointerUp={(e) => {
                  cancelLongPress();
                  if (!reorderMode) return;
                  if (!dragRef.current.draggingId) return;
                  const nextItems = displayItemsRef.current;
                  try {
                    e.currentTarget.releasePointerCapture?.(e.pointerId);
                  } catch {
                    // ignore
                  }
                  dragRef.current.draggingId = null;
                  dragRef.current.pointerId = null;
                  dragRef.current.targetEl = null;
                  commitReorder(nextItems);
                  setReorderMode(false);
                }}
                onPointerCancel={() => {
                  cancelLongPress();
                  if (!reorderMode) return;
                  dragRef.current.draggingId = null;
                  dragRef.current.pointerId = null;
                  dragRef.current.targetEl = null;
                  setReorderMode(false);
                }}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  if (reorderMode) return;
                  // 탭/하위 펼침 UI는 우선 제외
                }}
              >
                <div className={styles.rowMain}>
                  <div className={styles.purpleDot} aria-hidden="true" />
                  <div className={styles.rowText}>
                    <div className={styles.rowTop}>
                      <span className={styles.rowTitle}>{displayName}</span>
                      <button
                        type="button"
                        className={styles.inlineEdit}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openActionSheet(item.id);
                        }}
                      >
                        edit
                      </button>
                    </div>
                    <div className={styles.rowBottom}>
                      <span className={styles.rowMeta}>
                        {formatKoreanDateWithWeekday(base)}
                      </span>
                      <span className={styles.rowMetaDivider}>·</span>
                      <span className={styles.rowMetaStrong}>
                        {getDdayText(base)}
                      </span>
                    </div>
                  </div>
                  {/* 하위 탭 숨김 처리했으므로 chevron도 숨김 */}
                </div>

                {/*
                  알림/하위 탭(100~1000일) UI는 우선 주석 처리.
                */}
              </article>
            );
          })}
        </section>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={closeAddModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={isEditMode ? '기념일 편집' : '기념일 추가'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{isEditMode ? '일정 편집' : '새 일정'}</div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeAddModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>이름</label>
              <input
                className={styles.fieldInput}
                placeholder="예) 첫 만난 날"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <label className={styles.fieldLabel}>일자</label>
              <DateTextInput
                className={styles.fieldInput}
                value={newDate}
                onChange={setNewDate}
                placeholder="예) 20260304"
                ariaLabel="일자"
              />

              {newDateValid && (
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>오늘 기준</span>
                  <span className={styles.previewValue}>
                    {getDdayText(newDateObj)}
                  </span>
                </div>
              )}

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={newCountFromOne}
                  onChange={(e) => setNewCountFromOne(e.target.checked)}
                />
                <span>기준일을 1일로 계산</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.saveButton}
                disabled={!newDateValid}
                onClick={() => {
                  if (isEditMode) {
                    updateAnniversary(editingTargetId, {
                      baseDate: newDate,
                      customName: newName,
                      countFromOne: newCountFromOne,
                    });
                    logClick('Click_btn_edit_anniversary', { anniversaryId: editingTargetId });
                    closeAddModal();
                    return;
                  }
                  const item = addAnniversary('기념일', newDate, {
                    countFromOne: newCountFromOne,
                    customName: newName,
                  });
                  logClick('Click_btn_add_anniversary', { anniversaryId: item?.id });
                  closeAddModal();
                }}
              >
                {isEditMode ? '저장하기' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionSheet && actionTarget && (
        <div className={styles.modalOverlay} onClick={closeActionSheet}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetTitle}>선택한 기념일</div>
            <div className={styles.sheetSubtitle}>
              {actionTarget.customName || actionTarget.title || '기념일'}
            </div>
            <div className={styles.sheetButtons}>
              <button
                type="button"
                className={styles.sheetButton}
                onClick={() => {
                  openEditModal(actionTarget);
                  closeActionSheet();
                }}
              >
                편집
              </button>
              <button
                type="button"
                className={styles.sheetButtonDanger}
                onClick={() => {
                  deleteAnniversary(actionTarget.id);
                  closeActionSheet();
                }}
              >
                삭제
              </button>
              <button type="button" className={styles.sheetButtonGhost} onClick={closeActionSheet}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/*
        순서 변경은 "하나 자체를 꾹 누르고 드래그"로 바로 조정합니다.
        별도 탭/완료 바는 사용하지 않아요.
      */}

      {showBanner && (
        <Suspense fallback={null}>
          <BannerAd />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;
