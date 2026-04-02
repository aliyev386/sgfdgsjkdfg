// src/components/common/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuth, selectUser } from "../../store/slices/authSlice";

/**
 * Qorunan route.
 * - requiredRole="Admin" ötürülsə yalnız Admin görə bilər
 * - istifadəçi login deyilsə /login-ə yönləndirir, geri qayıtmaq üçün state saxlayır
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const isAuth = useSelector(selectIsAuth);
  const user   = useSelector(selectUser);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}