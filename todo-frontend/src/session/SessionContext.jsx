import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { loginUser, registerUser, logoutUser } from '../api/endpoints';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const SessionContext = createContext(null);

function readUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUserState] = useState(readUser);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUserState(null);
  }, []);

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUserState(data.user);
  }, []);

  // A 401 anywhere clears the session; RequireAuth then sends the user to /login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(
    async (username, password) => {
      const data = await loginUser(username, password);
      saveSession(data);
      return data;
    },
    [saveSession]
  );

  const register = useCallback(
    async (username, password, email) => {
      const data = await registerUser({ username, password, email });
      saveSession(data);
      return data;
    },
    [saveSession]
  );

  // The session is cleared whether or not the server call succeeds.
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignored: the local session is cleared regardless
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const setUser = useCallback((next) => {
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUserState(next);
  }, []);

  const value = useMemo(
    () => ({ token, user, login, register, logout, setUser, updateUser: setUser }),
    [token, user, login, register, logout, setUser]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
