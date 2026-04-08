import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tokenRefreshed, logoutAction, selectIsAuth } from "../../store/slices/authSlice";
import { syncWishlistFromBackend, clearWishlist } from "../../store/slices/wishlistStore";

export default function AuthEventListener() {
  const dispatch   = useDispatch();
  const isAuth     = useSelector(selectIsAuth);

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

    window.addEventListener("auth:token_refreshed", onRefreshed);
    window.addEventListener("auth:logout",          onLogout);
    window.addEventListener("auth:login_success",   onLogin);

    return () => {
      window.removeEventListener("auth:token_refreshed", onRefreshed);
      window.removeEventListener("auth:logout",          onLogout);
      window.removeEventListener("auth:login_success",   onLogin);
    };
  }, [dispatch]);

  return null;
}
