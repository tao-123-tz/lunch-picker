import { useState, useEffect, useCallback } from 'react';

const NICKNAME_KEY = 'lunch_nickname';

export function useAuth() {
  const [nickname, setNickname] = useState<string | null>(() =>
    localStorage.getItem(NICKNAME_KEY)
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const login = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    localStorage.setItem(NICKNAME_KEY, trimmed);
    setNickname(trimmed);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(NICKNAME_KEY);
    setNickname(null);
  }, []);

  return {
    nickname,
    isLoggedIn: !!nickname,
    ready,
    login,
    logout,
  };
}
