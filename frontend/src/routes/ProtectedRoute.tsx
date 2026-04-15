import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { diagnosticApi } from '@/api/diagnosticApi';
import { Spinner } from '@/components/ui/spinner';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();
  const [diagnosticDone, setDiagnosticDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    diagnosticApi.getStatus()
      .then(res => setDiagnosticDone(res.data.completed))
      .catch(() => setDiagnosticDone(true)); // fail open — don't block app on API error
  }, [token]);

  if (loading || (token && diagnosticDone === null)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  if (!diagnosticDone && location.pathname !== '/diagnostic') {
    return <Navigate to="/diagnostic" replace />;
  }

  return <Outlet />;
}
