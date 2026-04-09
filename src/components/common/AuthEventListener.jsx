import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tokenRefreshed, logoutAction, selectIsAuth } from "../../store/slices/authSlice";
import { syncWishlistFromBackend, clearWishlist } from "../../store/slices/wishlistStore";
import { useAuthModal } from "../../hooks/useAuthModal";

export default function AuthEventListener() {
  const dispatch   = useDispatch();
  const isAuth     = useSelector(selectIsAuth);
  const { openAuthModal } = useAuthModal();

  // App ilk açılanda istifadəçi artıq login-dirsə wishlist-i sync et
  useEffect(() => {
    if (isAuth) {
      dispatch(syncWishlistFromBackend());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onRefreshed = (e) => {
      dispatch(tokenRefreshed({ accessToken: e.detail.accessToken }));
    };

    const onLogout = () => {
      dispatch(logoutAction());
      dispatch(clearWishlist());
    };

    // Login uğurlu olanda wishlist-i backend-dən yüklə
    const onLogin = () => {
      dispatch(syncWishlistFromBackend());
    };

    // Token yoxdursa və ya expire olubsa — modal aç, redirect yox
    const onRequireLogin = () => {
      openAuthModal("login");
    };

    window.addEventListener("auth:token_refreshed", onRefreshed);
    window.addEventListener("auth:logout",          onLogout);
    window.addEventListener("auth:login_success",   onLogin);
    window.addEventListener("auth:require_login",   onRequireLogin);

    return () => {
      window.removeEventListener("auth:token_refreshed", onRefreshed);
      window.removeEventListener("auth:logout",          onLogout);
      window.removeEventListener("auth:login_success",   onLogin);
      window.removeEventListener("auth:require_login",   onRequireLogin);
    };
  }, [dispatch, openAuthModal]);

  return null;
}
