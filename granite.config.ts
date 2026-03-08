import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'counting-day',
  brand: {
    displayName: '기념일 계산기', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#725CFF', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "null", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: '192.168.0.45',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
