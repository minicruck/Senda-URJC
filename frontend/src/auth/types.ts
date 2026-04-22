export type UserRole =
  | "user"
  | "volunteer"
  | "admin"
  | "security"
  | "maintenance";

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
}
