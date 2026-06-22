import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      <p className="text-sm text-stone-500 font-medium">Verifying your session...</p>
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

/** Blocks route until auth is validated with the server — never trusts stale localStorage alone. */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/** Redirect authenticated users away from login/register. */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/** Customer-only actions (book, wishlist) — redirect to login if guest. */
export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'customer') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
}
