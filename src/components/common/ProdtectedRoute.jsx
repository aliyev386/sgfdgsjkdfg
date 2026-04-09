// src/components/common/ProtectedRoute.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsAuth, selectUser } from "../../store/slices/authSlice";
import { useAuthModal } from "../../hooks/useAuthModal";

/**
 * Qorunan route.
 * - requiredRole="Admin" ötürülsə yalnız Admin görə bilər
 * - istifadəçi login deyilsə modal açılır, səhifə null qaytarır
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const isAuth = useSelector(selectIsAuth);
  const user   = useSelector(selectUser);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isAuth) openAuthModal("login");
  }, [isAuth, openAuthModal]);

  if (!isAuth) return null;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
