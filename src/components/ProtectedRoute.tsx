import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string;
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [roleChecked, setRoleChecked] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    // Wait until auth is fully resolved
    if (loading) return;

    // No role required — just need to be logged in
    if (!requireRole) {
      setRoleChecked(true);
      return;
    }

    // Role required but no user — mark as checked (will redirect to login)
    if (!user) {
      setRoleChecked(true);
      return;
    }

    // User exists and role required — run query
    const checkRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', requireRole as any)
        .maybeSingle();
      setHasRole(!error && !!data);
      setRoleChecked(true);
    };

    checkRole();
  }, [user, loading, requireRole]);

  // Still loading auth or role check pending — show nothing
  if (loading || !roleChecked) return null;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no required role
  if (requireRole && !hasRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
