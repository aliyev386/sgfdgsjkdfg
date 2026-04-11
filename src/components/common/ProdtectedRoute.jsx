import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuth, selectUser } from "../../store/slices/authSlice";
import { useAuthModal } from "../../hooks/useAuthModal";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const isAuth   = useSelector(selectIsAuth);
  const user     = useSelector(selectUser);
  const location = useLocation();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isAuth) openAuthModal("login");
  }, [isAuth, openAuthModal]);

  if (!isAuth) return null;

  if (user?.role === "Admin" && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}