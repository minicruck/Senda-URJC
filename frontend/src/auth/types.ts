import type { Role } from "../types/incidents";

export type UserRole = Role;

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  /** Login as the default user role (backwards compatible). */
  login: () => Promise<void>;
  /** Login as a specific mocked role (prototype only). */
  loginAs: (role: Role) => Promise<void>;
  logout: () => void;
}
