import { useEffect, useState } from 'react';
import { appLogin } from '@apps-in-toss/web-framework';
import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'tossUser';

export function useTossAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      // ignore
    }
  }, []);

  const login = async () => {
    // 1) 앱인토스 SDK로 인가 코드 받기
    const { authorizationCode, referrer } = await appLogin();

    // 2) Supabase Edge Function 등에 위임해서 토큰/유저키 발급
    //    구현 예시는 supabase/functions/toss-login 참고
    const { data, error } = await supabase.functions.invoke('toss-login', {
      body: { authorizationCode, referrer },
    });

    if (error) {
      throw error;
    }

    const loggedInUser = data;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  return { user, login };
}

