import { calcDday } from './dday';

// 실제 푸시 발송은 백엔드/Apps-in-Toss 인프라에서 처리한다고 가정하고,
// 여기서는 D-5, D-day 정보를 계산해 전달하는 레이어만 구성합니다.
export async function registerNotificationForAnniversary(anniv) {
  const payload = anniv.milestones.map((m) => {
    const target = new Date(m.date);
    const dday = calcDday(target);
    const dminus5 = new Date(
      target.getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      day: m.day,
      dateISO: target.toISOString(),
      dday,
      dminus5DateISO: dminus5,
    };
  });

  // TODO: 실제 백엔드 엔드포인트 주소로 교체
  try {
    await fetch('/api/anniversary-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anniversaryId: anniv.id,
        title: anniv.title,
        baseDate: anniv.baseDate,
        payload,
      }),
    });
  } catch (e) {
    console.warn('registerNotificationForAnniversary error', e);
  }
}

