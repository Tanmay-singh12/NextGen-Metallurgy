
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function ProtectedAdminRoute() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
