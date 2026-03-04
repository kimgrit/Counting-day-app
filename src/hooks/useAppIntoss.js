import { Analytics } from '@apps-in-toss/web-framework';

export function useAppIntoss() {
  const logClick = (log_name, extras) => {
    try {
      Analytics.click({ log_name, ...(extras || {}) });
    } catch (e) {
      console.warn('Analytics.click error', e);
    }
  };

  const logScreen = (log_name, extras) => {
    try {
      Analytics.screen({ log_name, ...(extras || {}) });
    } catch (e) {
      console.warn('Analytics.screen error', e);
    }
  };

  return { logClick, logScreen };
}

