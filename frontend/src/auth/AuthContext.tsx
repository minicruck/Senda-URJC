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
import type { Role } from "../types/incidents";

const STORAGE_KEY = "senda-auth-user";

// Mocked users for each role. When the real SSO URJC integration lands
// these constants disappear and login() redirects to the institutional IdP.
const MOCK_USERS: Record<Role, User> = {
  user: {
    id: "u-0001",
    displayName: "Ana García",
    email: "ana.garcia@urjc.es",
    role: "user",
  },
  admin: {
    id: "u-admin",
    displayName: "Marta Ibáñez",
    email: "admin@urjc.es",
    role: "admin",
  },
  security: {
    id: "u-security",
    displayName: "Jorge Pérez",
    email: "seguridad@urjc.es",
    role: "security",
  },
  maintenance: {
    id: "u-maintenance",
    displayName: "Raúl Campos",
    email: "mantenimiento@urjc.es",
    role: "maintenance",
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    // Back-compat: old sessions without role default to 'user'.
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string"
    ) {
      return {
        id: parsed.id,
        displayName: parsed.displayName ?? "Usuaria",
        email: parsed.email,
        role: (parsed.role as Role | undefined) ?? "user",
      };
    }
    return null;
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

  const loginAs = useCallback(async (role: Role): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(MOCK_USERS[role]);
  }, []);

  const login = useCallback(async (): Promise<void> => {
    await loginAs("user");
  }, [loginAs]);

  const logout = useCallback((): void => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, loginAs, logout }),
    [user, login, loginAs, logout],
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
