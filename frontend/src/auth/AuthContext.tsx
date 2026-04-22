import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthContextValue, User } from "./types";

const STORAGE_KEY = "senda-auth-user";

// Mocked user returned by the simulated SSO flow. When the real SSO URJC
// integration lands this constant disappears and `login` will redirect to
// the institutional identity provider (RF-01, RNF-14).
const MOCK_USER: User = {
  id: "u-0001",
  displayName: "Ana García",
  email: "ana.garcia@urjc.es",
  role: "user",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (): Promise<void> => {
    // Small delay to mimic the SSO roundtrip.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser(MOCK_USER);
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
