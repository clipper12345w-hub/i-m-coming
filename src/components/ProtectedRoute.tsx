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
  const [roleChecked, setRoleChecked] = useState(!requireRole);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    if (!requireRole || !user) {
      setRoleChecked(true);
      return;
    }

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
  }, [user, requireRole]);

  if (loading || !roleChecked) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && !hasRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
