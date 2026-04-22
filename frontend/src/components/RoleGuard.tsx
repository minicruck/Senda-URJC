import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../types/incidents";
import { rolePath } from "../types/incidents";

export interface RoleGuardProps {
  allowedRoles: readonly Role[];
}

/**
 * Protects child routes: unauthenticated users are redirected to /login,
 * authenticated users whose role is not allowed are redirected to the
 * landing page that corresponds to their role.
 */
export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={rolePath(user.role)} replace />;
  }
  return <Outlet />;
}
