// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import '@toss/tds-colors/colors.light.css';
import './index.css';
import App from './App.tsx';

// 로컬 웹 환경에서 AppsInToss 객체가 없을 때를 위한 기본값
if (typeof window !== 'undefined' && typeof (window as any).AppsInToss === 'undefined') {
  (window as any).AppsInToss = {
    deploymentId: 'local',
    serviceId: 'counting-day',
    appScheme: 'intoss',
    userId: 'local-user',
  };
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </React.StrictMode>,
);
