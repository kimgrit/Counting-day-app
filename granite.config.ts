import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'counting-day',
  brand: {
    displayName: '기념일 계산기', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#725CFF', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/2223/cab8e14d-65b7-4eb1-9778-282fa5982fe0.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: '10.243.113.94',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
