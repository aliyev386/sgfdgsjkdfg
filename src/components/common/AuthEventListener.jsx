import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { tokenRefreshed, logoutAction } from "../../store/slices/authSlice";

export default function AuthEventListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const onRefreshed = (e) => {
      dispatch(tokenRefreshed({ accessToken: e.detail.accessToken }));
    };
    const onLogout = () => {
      dispatch(logoutAction());
    };

    window.addEventListener("auth:token_refreshed", onRefreshed);
    window.addEventListener("auth:logout", onLogout);

    return () => {
      window.removeEventListener("auth:token_refreshed", onRefreshed);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [dispatch]);

  return null;
}