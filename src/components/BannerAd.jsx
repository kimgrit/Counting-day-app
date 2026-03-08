import { useEffect, useRef } from 'react';
import { useTossBanner } from '../hooks/useTossBanner';
import './BannerAd.css';

/** 테스트용 배너 광고 ID (리스트형) - 문서 기준 */
const TEST_BANNER_ID = 'ait-ad-test-banner-id';

function BannerAd() {
  const containerRef = useRef(null);
  const { isInitialized, attachBanner, isBannerSupported } = useTossBanner();

  useEffect(() => {
    if (!isBannerSupported || !isInitialized || !containerRef.current) return;

    const attached = attachBanner(TEST_BANNER_ID, containerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onAdRendered: () => {},
        onAdViewable: () => {},
        onAdImpression: () => {},
        onNoFill: () => {},
        onAdFailedToRender: (payload) => {
          console.warn('배너 광고 렌더링 실패:', payload?.error?.message);
        },
      },
    });

    return () => {
      attached?.destroy?.();
    };
  }, [isBannerSupported, isInitialized, attachBanner]);

  /* 5.241.0 미만 토스앱에서는 배너 미노출 (빈 화면 방지). 지원 여부 확인 전(null)에도 영역을 두지 않음 */
  if (isBannerSupported !== true) {
    return null;
  }

  return (
    <div className="BannerAd-wrapper">
      <div
        ref={containerRef}
        className="BannerAd-root"
        style={{ width: '100%', height: '96px' }}
        aria-label="배너 광고"
      />
    </div>
  );
}

export default BannerAd;
