// src/pages/auth/LoginPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { login, googleAuth, getMe } from "../../api/authApi";
import { loginSuccess } from "../../store/slices/authSlice";
import "../../assets/pagesCss/AuthPage.css";
 
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
 
const LANGS = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];
 
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
 
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
 
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
 
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
 
const GoogleIcon = () => (
  <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
 
const T = {
  az: {
    title: "Daxil ol",
    subtitle: "Hesabınız yoxdur?",
    registerLink: "Qeydiyyatdan keçin",
    email: "Email ünvanı",
    emailPh: "nümunə@email.com",
    password: "Şifrə",
    passPh: "Şifrənizi daxil edin",
    rememberMe: "Məni yadda saxla",
    forgotPass: "Şifrəni unutdunuz?",
    loginBtn: "Daxil ol",
    loggingIn: "Daxil olunur...",
    googleBtn: "Google ilə daxil ol",
    or: "və ya",
    terms: "Daxil olmaqla",
    termsLink1: "İstifadəçi şərtlərini",
    and: "və",
    termsLink2: "Məxfilik Siyasətini",
    termsEnd: "qəbul etmiş olursunuz",
    successMsg: "Uğurla daxil oldunuz! Yönləndirilirsiniz...",
    googleSuccess: "Google ilə giriş uğurlu oldu!",
    googleFail: "Google ilə giriş uğursuz oldu",
    loginFail: "Email və ya şifrə yanlışdır",
    errEmail: "Email boş ola bilməz",
    errEmailFmt: "Email formatı düzgün deyil",
    errPass: "Şifrə boş ola bilməz",
    errPassLen: "Şifrə ən az 8 simvol olmalıdır",
    tagline: "Mebel & Dizayn",
  },
  en: {
    title: "Sign In",
    subtitle: "Don't have an account?",
    registerLink: "Register",
    email: "Email address",
    emailPh: "example@email.com",
    password: "Password",
    passPh: "Enter your password",
    rememberMe: "Remember me",
    forgotPass: "Forgot password?",
    loginBtn: "Sign In",
    loggingIn: "Signing in...",
    googleBtn: "Sign in with Google",
    or: "or",
    terms: "By signing in you accept the",
    termsLink1: "Terms of Service",
    and: "and",
    termsLink2: "Privacy Policy",
    termsEnd: "",
    successMsg: "Logged in successfully! Redirecting...",
    googleSuccess: "Google sign in successful!",
    googleFail: "Google sign in failed",
    loginFail: "Invalid email or password",
    errEmail: "Email is required",
    errEmailFmt: "Invalid email format",
    errPass: "Password is required",
    errPassLen: "Password must be at least 8 characters",
    tagline: "Furniture & Design",
  },
  ru: {
    title: "Войти",
    subtitle: "Нет аккаунта?",
    registerLink: "Зарегистрироваться",
    email: "Email адрес",
    emailPh: "пример@email.com",
    password: "Пароль",
    passPh: "Введите пароль",
    rememberMe: "Запомнить меня",
    forgotPass: "Забыли пароль?",
    loginBtn: "Войти",
    loggingIn: "Вход...",
    googleBtn: "Войти через Google",
    or: "или",
    terms: "Входя, вы принимаете",
    termsLink1: "Условия использования",
    and: "и",
    termsLink2: "Политику конфиденциальности",
    termsEnd: "",
    successMsg: "Вход выполнен! Перенаправление...",
    googleSuccess: "Вход через Google выполнен!",
    googleFail: "Ошибка входа через Google",
    loginFail: "Неверный email или пароль",
    errEmail: "Введите email",
    errEmailFmt: "Неверный формат email",
    errPass: "Введите пароль",
    errPassLen: "Пароль должен содержать минимум 8 символов",
    tagline: "Мебель и дизайн",
  },
};
 
export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { i18n: i18nHook } = useTranslation();
  const lang = (i18nHook.language || "az").substring(0, 2);
  const t = T[lang] || T.az;
 
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
 
  const changeLang = (code) => {
    i18n.changeLanguage(code);
  };
 
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.errEmailFmt;
    if (!form.password) errs.password = t.errPass;
    else if (form.password.length < 8) errs.password = t.errPassLen;
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
      const tokenData = await login({ email: form.email, password: form.password });
      let user = { email: form.email };
      try { user = await getMe(); } catch { }
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      if (rememberMe) localStorage.setItem("amore_remember", "true");
      setAlert({ type: "success", msg: t.successMsg });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setAlert({ type: "error", msg: err?.userMessage || t.loginFail });
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
      try { user = await getMe(); } catch { }
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      setAlert({ type: "success", msg: t.googleSuccess });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || t.googleFail });
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate, dispatch, t]);
 
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      const btnEl = document.getElementById("google-login-btn");
      if (btnEl) {
        window.google?.accounts.id.renderButton(btnEl, {
          theme: "outline",
          size: "large",
          width: btnEl.offsetWidth || 360,
          text: "signin_with",
        });
      }
    };

    if (window.google?.accounts) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [handleGoogleResponse]);

  return (
    <div className="auth-root">
      <div className="auth-lang-switcher top-corner">
        {LANGS.map((l) => (
          <button
            key={l.code}
            className={`auth-lang-btn${lang === l.code ? " active" : ""}`}
            onClick={() => changeLang(l.code)}>
            {l.label}
          </button>
        ))}
      </div>
 
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">
              <img
                src="public/images/livingroom.png"
                alt="icon"
                className="auth-title-icon"
              />
              {t.title}
            </h1>
          </div>
 
          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}
 
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
 
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconMail /></span>
                <input id="login-email" type="email" name="email"
                  className={`auth-input${errors.email ? " error" : ""}`}
                  placeholder={t.emailPh} value={form.email}
                  onChange={handleChange} autoComplete="email" disabled={loading} />
              </div>
              {errors.email && <p className="auth-error-msg">⚠ {errors.email}</p>}
            </div>
 
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconLock /></span>
                <input id="login-password" type={showPassword ? "text" : "password"} name="password"
                  className={`auth-input${errors.password ? " error" : ""}`}
                  placeholder={t.passPh} value={form.password}
                  onChange={handleChange} autoComplete="current-password" disabled={loading} />
                <button type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && <p className="auth-error-msg">⚠ {errors.password}</p>}
            </div>
 
            <div className="auth-meta-row">
              <label className="auth-checkbox-wrap">
                <input type="checkbox" className="auth-checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="auth-checkbox-label">{t.rememberMe}</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">{t.forgotPass}</Link>
            </div>
 
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (<><div className="auth-spinner" />{t.loggingIn}</>) : t.loginBtn + " →"}
            </button>
          </form>
 
          <div className="auth-divider"><span>{t.or}</span></div>

          <div id="google-login-btn" style={{ width: "100%", minHeight: "44px", display: "flex", justifyContent: "center" }}></div>

          <div className="auth-form-header">
            <p className="auth-form-subtitle">
              {t.subtitle} <Link to="/register">{t.registerLink}</Link>
            </p>
          </div>
 
          <p className="auth-terms">
            {t.terms} <a href="#">{t.termsLink1}</a> {t.and} <a href="#">{t.termsLink2}</a>{t.termsEnd ? " " + t.termsEnd : ""}
          </p>
 
        </div>
      </div>
    </div>
  );
}
 