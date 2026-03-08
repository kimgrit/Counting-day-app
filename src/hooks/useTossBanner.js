import { useCallback, useEffect, useState } from 'react';
import { TossAds, getTossAppVersion } from '@apps-in-toss/web-framework';

let initStarted = false;
let adsInitialized = false;

/** 배너 광고 지원 최소 토스앱 버전 (5.241.0 미만에서는 빈 화면 노출 가능) */
const MIN_TOSS_APP_VERSION = '5.241.0';

/**
 * 버전 문자열 비교: current >= minimum 이면 true
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/환경 확인/getTossAppVersion.html
 */
function isVersionAtLeast(current, minimum) {
  if (!current || typeof current !== 'string') return false;
  const a = current.split('.').map((n) => parseInt(n, 10) || 0);
  const b = minimum.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

/** 토스앱 5.241.0 이상에서만 배너 사용 가능 */
function isBannerSupportedByVersion() {
  try {
    const version = getTossAppVersion?.();
    if (!version) return false;
    return isVersionAtLeast(version, MIN_TOSS_APP_VERSION);
  } catch {
    return false;
  }
}

/**
 * 앱인토스 배너 광고 SDK 초기화 및 부착 훅.
 * 5.241.0 미만 토스앱에서는 초기화하지 않아 빈 화면을 방지합니다.
 * 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/BannerAd.html
 */
export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(adsInitialized);
  const [isSupported, setIsSupported] = useState(null);

  useEffect(() => {
    const supportedByVersion = isBannerSupportedByVersion();
    setIsSupported(supportedByVersion);

    if (!supportedByVersion) {
      return;
    }
    if (adsInitialized) return;
    if (initStarted) return;
    if (!TossAds.initialize?.isSupported?.()) {
      return;
    }
    initStarted = true;
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          adsInitialized = true;
          setIsInitialized(true);
        },
        onInitializationFailed: (error) => {
          console.warn('Toss Ads SDK 초기화 실패:', error);
        },
      },
    });
  }, []);

  const attachBanner = useCallback((adGroupId, element, options) => {
    if (!isInitialized || !element) return null;
    if (!TossAds.attachBanner?.isSupported?.()) return null;
    return TossAds.attachBanner(adGroupId, element, options);
  }, [isInitialized]);

  return { isInitialized, attachBanner, isBannerSupported: isSupported };
}
