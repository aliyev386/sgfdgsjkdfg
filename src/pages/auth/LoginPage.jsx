// src/pages/auth/LoginPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, googleAuth, getMe } from "../../api/authApi";
import { loginSuccess } from "../../store/slices/authSlice";
import "../../assets/pagesCss/AuthPage.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email boş ola bilməz";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email formatı düzgün deyil";
    if (!form.password) errs.password = "Şifrə boş ola bilməz";
    else if (form.password.length < 8) errs.password = "Şifrə ən az 8 simvol olmalıdır";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setAlert(null);
    try {
      // login funksiyası artıq tokenləri localStorage-ə saxlayır
      const tokenData = await login({ email: form.email, password: form.password });

      // İstifadəçi məlumatlarını al
      let user = { email: form.email };
      try {
        user = await getMe();
      } catch {
        // getMe uğursuz olsa belə davam et
        user = { email: form.email };
      }

      dispatch(loginSuccess({
        token:        tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        user,
      }));

      if (rememberMe) localStorage.setItem("amore_remember", "true");
      setAlert({ type: "success", msg: "Uğurla daxil oldunuz! Yönləndirilirsiniz..." });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setAlert({ type: "error", msg: err?.userMessage || "Email və ya şifrə yanlışdır" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(async (response) => {
    setGoogleLoading(true);
    setAlert(null);
    try {
      const tokenData = await googleAuth(response.credential);
      let user = {};
      try { user = await getMe(); } catch { user = {}; }
      dispatch(loginSuccess({
        token:        tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        user,
      }));
      setAlert({ type: "success", msg: "Google ilə giriş uğurlu oldu!" });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || "Google ilə giriş uğursuz oldu" });
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [handleGoogleResponse]);

  const triggerGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setAlert({ type: "error", msg: "Google Client ID konfiqurasiya edilməyib (.env faylına VITE_GOOGLE_CLIENT_ID əlavə edin)" });
      return;
    }
    window.google?.accounts.id.prompt();
  };

  return (
    <div className="auth-root">
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-form-tag"><span>🔐</span> Daxil ol</div>
            <h1 className="auth-form-title">Hesabınıza daxil olun</h1>
            <p className="auth-form-subtitle">Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link></p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-email">Email ünvanı</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📧</span>
                <input id="login-email" type="email" name="email" className={`auth-input${errors.email ? " error" : ""}`} placeholder="nümunə@email.com" value={form.email} onChange={handleChange} autoComplete="email" disabled={loading} />
              </div>
              {errors.email && <p className="auth-error-msg">⚠ {errors.email}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-password">Şifrə</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input id="login-password" type={showPassword ? "text" : "password"} name="password" className={`auth-input${errors.password ? " error" : ""}`} placeholder="Şifrənizi daxil edin" value={form.password} onChange={handleChange} autoComplete="current-password" disabled={loading} />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
              {errors.password && <p className="auth-error-msg">⚠ {errors.password}</p>}
            </div>

            <div className="auth-meta-row">
              <label className="auth-checkbox-wrap">
                <input type="checkbox" className="auth-checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="auth-checkbox-label">Məni yadda saxla</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">Şifrəni unutdunuz?</Link>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (<><div className="auth-spinner" /> Daxil olunur...</>) : "Daxil ol →"}
            </button>
          </form>

          <div className="auth-divider"><span>və ya</span></div>

          <button type="button" className="auth-btn-google" onClick={triggerGoogleLogin} disabled={googleLoading}>
            {googleLoading
              ? (<><div className="auth-spinner" style={{ borderTopColor: "#aa3bff", borderColor: "#e5e4e7" }} />Google ilə daxil olunur...</>)
              : (<><GoogleIcon />Google ilə daxil ol</>)}
          </button>

          <p className="auth-terms">Daxil olmaqla <a href="#">İstifadəçi şərtlərini</a> və <a href="#">Məxfilik Siyasətini</a> qəbul etmiş olursunuz</p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}