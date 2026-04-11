import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { login, register, googleAuth, getMe } from "../../api/authApi";
import { loginSuccess } from "../../store/slices/authSlice";
import "../../assets/pagesCss/AuthModal.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const IconMail  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconLock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUser  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconKey   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>;
const IconEye   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const GoogleIcon= () => <svg className="am-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

const T = {
  az: {
    loginTitle: "Daxil ol",
    registerTitle: "Hesab yarat",
    noAccount: "Hesabınız yoxdur?",
    hasAccount: "Artıq hesabınız var?",
    registerLink: "Qeydiyyatdan keçin",
    loginLink: "Daxil olun",
    email: "Email", emailPh: "nümunə@email.com",
    password: "Şifrə", passPh: "Şifrənizi daxil edin",
    name: "Ad", namePh: "Əli",
    surname: "Soyad", surnamePh: "Həsənov",
    phone: "Telefon", phonePh: "+994 50 123 45 67",
    newPass: "Yeni şifrə", newPassPh: "Ən az 8 simvol",
    confirm: "Şifrəni təkrarlayın", confirmPh: "Yenidən daxil edin",
    passMatch: "✓ Şifrələr uyğundur",
    forgot: "Şifrəni unutdunuz?",
    loginBtn: "Daxil ol", loggingIn: "Daxil olunur...",
    registerBtn: "Hesab yarat", registering: "Qeydiyyat...",
    googleLogin: "Google ilə daxil ol",
    googleRegister: "Google ilə qeydiyyat",
    or: "və ya",
    terms1: "İstifadəçi şərtlərini", and: "və",
    terms2: "Məxfilik Siyasətini", termsEnd: "qəbul edirəm",
    successLogin: "Uğurla daxil oldunuz!",
    successRegister: "Qeydiyyat tamamlandı!",
    googleFail: "Google ilə giriş uğursuz oldu",
    loginFail: "Email və ya şifrə yanlışdır",
    regFail: "Qeydiyyat zamanı xəta baş verdi",
    errEmail: "Email boş ola bilməz",
    errEmailFmt: "Email formatı düzgün deyil",
    errPass: "Şifrə boş ola bilməz",
    errPassLen: "Şifrə ən az 8 simvol olmalıdır",
    errName: "Ad boş ola bilməz",
    errNameLen: "Ad ən az 2 simvol olmalıdır",
    errSurname: "Soyad boş ola bilməz",
    errPhone: "Telefon nömrəsi düzgün deyil",
    errConfirm: "Şifrəni təkrarlayın",
    errConfirmMatch: "Şifrələr uyğun gəlmir",
    errAgreed: "Şərtləri qəbul etməlisiniz",
    strengthLabels: ["", "Çox zəif", "Zəif", "Orta", "Yaxşı", "Güclü"],
  },
  en: {
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerLink: "Register",
    loginLink: "Sign In",
    email: "Email", emailPh: "example@email.com",
    password: "Password", passPh: "Enter your password",
    name: "First Name", namePh: "John",
    surname: "Last Name", surnamePh: "Smith",
    phone: "Phone", phonePh: "+994 50 123 45 67",
    newPass: "Password", newPassPh: "At least 8 characters",
    confirm: "Confirm Password", confirmPh: "Re-enter password",
    passMatch: "✓ Passwords match",
    forgot: "Forgot password?",
    loginBtn: "Sign In", loggingIn: "Signing in...",
    registerBtn: "Create Account", registering: "Registering...",
    googleLogin: "Sign in with Google",
    googleRegister: "Sign up with Google",
    or: "or",
    terms1: "Terms of Service", and: "and",
    terms2: "Privacy Policy", termsEnd: "",
    successLogin: "Signed in successfully!",
    successRegister: "Registration complete!",
    googleFail: "Google sign in failed",
    loginFail: "Invalid email or password",
    regFail: "Registration failed",
    errEmail: "Email is required",
    errEmailFmt: "Invalid email format",
    errPass: "Password is required",
    errPassLen: "Password must be at least 8 characters",
    errName: "First name is required",
    errNameLen: "First name must be at least 2 characters",
    errSurname: "Last name is required",
    errPhone: "Invalid phone number",
    errConfirm: "Please confirm password",
    errConfirmMatch: "Passwords do not match",
    errAgreed: "You must accept the terms",
    strengthLabels: ["", "Very weak", "Weak", "Fair", "Good", "Strong"],
  },
  ru: {
    loginTitle: "Войти",
    registerTitle: "Создать аккаунт",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    registerLink: "Зарегистрироваться",
    loginLink: "Войти",
    email: "Email", emailPh: "пример@email.com",
    password: "Пароль", passPh: "Введите пароль",
    name: "Имя", namePh: "Иван",
    surname: "Фамилия", surnamePh: "Иванов",
    phone: "Телефон", phonePh: "+994 50 123 45 67",
    newPass: "Пароль", newPassPh: "Минимум 8 символов",
    confirm: "Подтвердите пароль", confirmPh: "Повторите пароль",
    passMatch: "✓ Пароли совпадают",
    forgot: "Забыли пароль?",
    loginBtn: "Войти", loggingIn: "Вход...",
    registerBtn: "Создать аккаунт", registering: "Регистрация...",
    googleLogin: "Войти через Google",
    googleRegister: "Регистрация через Google",
    or: "или",
    terms1: "Условия использования", and: "и",
    terms2: "Политику конфиденциальности", termsEnd: "",
    successLogin: "Вход выполнен!",
    successRegister: "Регистрация завершена!",
    googleFail: "Ошибка входа через Google",
    loginFail: "Неверный email или пароль",
    regFail: "Ошибка при регистрации",
    errEmail: "Введите email",
    errEmailFmt: "Неверный формат email",
    errPass: "Введите пароль",
    errPassLen: "Пароль должен содержать минимум 8 символов",
    errName: "Введите имя",
    errNameLen: "Имя должно содержать минимум 2 символа",
    errSurname: "Введите фамилию",
    errPhone: "Неверный номер телефона",
    errConfirm: "Подтвердите пароль",
    errConfirmMatch: "Пароли не совпадают",
    errAgreed: "Примите условия",
    strengthLabels: ["", "Очень слабый", "Слабый", "Средний", "Хороший", "Надёжный"],
  },
};

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function StrengthBar({ password, labels }) {
  const score = getStrength(password);
  if (!password) return null;
  const cls = ["", "am-str-weak", "am-str-weak", "am-str-fair", "am-str-good"];
  return (
    <div className="am-strength">
      <div className="am-strength-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`am-strength-bar${i <= score ? ` active score-${score}` : ""}`} />
        ))}
      </div>
      <span className={`am-strength-label ${cls[score] || ""}`}>{labels[score]}</span>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login", onSuccess }) {
  const dispatch = useDispatch();
  const { i18n: i18nHook } = useTranslation();
  const lang = (i18nHook.language || "az").substring(0, 2);
  const t = T[lang] || T.az;

  const [tab, setTab] = useState(defaultTab);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const overlayRef = useRef(null);
  const googleLoginBtnRef = useRef(null);
  const googleRegBtnRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [regForm, setRegForm] = useState({ name: "", surname: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [regErrors, setRegErrors] = useState({});
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setTab(defaultTab);
    setAlert(null);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleGoogleResponse = useCallback(async (response) => {
    setGoogleLoading(true);
    setAlert(null);
    try {
      const tokenData = await googleAuth(response.credential);
      let user = {};
      try { user = await getMe(); } catch {}
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      setAlert({ type: "success", msg: tab === "login" ? t.successLogin : t.successRegister });
      setTimeout(() => { onClose(); onSuccess?.(); }, 700);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || t.googleFail });
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, onClose, onSuccess, t, tab]);

  const renderGoogleButtons = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts) return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
    [googleLoginBtnRef.current, googleRegBtnRef.current].forEach(el => {
      if (el) {
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, {
          theme: "outline", size: "large", width: el.offsetWidth || 340, text: "continue_with",
        });
      }
    });
  }, [handleGoogleResponse]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !isOpen) return;
    const existing = document.getElementById("google-gsi-script");
    if (existing && window.google?.accounts) {
      setTimeout(renderGoogleButtons, 50);
      return;
    }
    if (existing) return;
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true;
    script.onload = () => setTimeout(renderGoogleButtons, 50);
    document.head.appendChild(script);
  }, [isOpen, renderGoogleButtons]);

  // Re-render button when tab changes (refs may have changed)
  useEffect(() => {
    if (isOpen && GOOGLE_CLIENT_ID) {
      setTimeout(renderGoogleButtons, 80);
    }
  }, [tab, isOpen, renderGoogleButtons]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const tokenData = await login({ email: loginForm.email, password: loginForm.password });
      let user = { email: loginForm.email };
      try { user = await getMe(); } catch {}
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      setAlert({ type: "success", msg: t.successLogin });
      setTimeout(() => { onClose(); onSuccess?.(); }, 700);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setLoginErrors(mapped);
      }
      setAlert({ type: "error", msg: err?.userMessage || t.loginFail });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const tokenData = await register({
        name: regForm.name, surname: regForm.surname,
        email: regForm.email, password: regForm.password,
        phone: regForm.phone || undefined,
      });
      let user = { email: regForm.email, name: regForm.name, surname: regForm.surname };
      try { user = await getMe(); } catch {}
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      setAlert({ type: "success", msg: t.successRegister });
      setTimeout(() => { onClose(); onSuccess?.(); }, 700);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setRegErrors(mapped);
      }
      setAlert({ type: "error", msg: err?.userMessage || t.regFail });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setAlert(null);
    setLoginErrors({});
    setRegErrors({});
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="am-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="am-modal" role="dialog" aria-modal="true">
        <button className="am-close" onClick={onClose} aria-label="Close"><IconClose /></button>

        <div className="am-tabs">
          <button
            className={`am-tab${tab === "login" ? " active" : ""}`}
            onClick={() => switchTab("login")}
          >
            {t.loginTitle}
          </button>
          <button
            className={`am-tab${tab === "register" ? " active" : ""}`}
            onClick={() => switchTab("register")}
          >
            {t.registerTitle}
          </button>
        </div>

        {alert && (
          <div className={`am-alert ${alert.type}`}>
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
            {alert.msg}
          </div>
        )}

        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} noValidate className="am-form">
            <div className="am-field">
              <div className="am-input-wrap">
                <span className="am-icon"><IconMail /></span>
                <input
                  type="email" name="email" placeholder={t.emailPh}
                  className={`am-input${loginErrors.email ? " error" : ""}`}
                  value={loginForm.email}
                  onChange={e => {
                    setLoginForm(p => ({ ...p, email: e.target.value }));
                    if (loginErrors.email) setLoginErrors(p => ({ ...p, email: "" }));
                    setAlert(null);
                  }}
                  autoComplete="email" disabled={loading}
                />
              </div>
              {loginErrors.email && <p className="am-err">⚠ {loginErrors.email}</p>}
            </div>

            <div className="am-field">
              <div className="am-input-wrap">
                <span className="am-icon"><IconLock /></span>
                <input
                  type={showLoginPass ? "text" : "password"} name="password"
                  placeholder={t.passPh}
                  className={`am-input${loginErrors.password ? " error" : ""}`}
                  value={loginForm.password}
                  onChange={e => {
                    setLoginForm(p => ({ ...p, password: e.target.value }));
                    if (loginErrors.password) setLoginErrors(p => ({ ...p, password: "" }));
                    setAlert(null);
                  }}
                  autoComplete="current-password" disabled={loading}
                />
                <button type="button" className="am-eye" onClick={() => setShowLoginPass(v => !v)} tabIndex={-1}>
                  {showLoginPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {loginErrors.password && <p className="am-err">⚠ {loginErrors.password}</p>}
            </div>

            <div className="am-forgot-row">
              <a href="/forgot-password" className="am-forgot-link" onClick={onClose}>{t.forgot}</a>
            </div>

            <button type="submit" className="am-btn-primary" disabled={loading}>
              {loading ? <><span className="am-spinner" />{t.loggingIn}</> : `${t.loginBtn} →`}
            </button>

            <div className="am-divider"><span>{t.or}</span></div>

            <div
              ref={googleLoginBtnRef}
              style={{ width: "100%", minHeight: "44px", display: "flex", justifyContent: "center" }}
            />

            <p className="am-switch-text">
              {t.noAccount}{" "}
              <button type="button" className="am-switch-link" onClick={() => switchTab("register")}>
                {t.registerLink}
              </button>
            </p>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} noValidate className="am-form">
            <div className="am-row">
              <div className="am-field">
                <div className="am-input-wrap">
                  <span className="am-icon"><IconUser /></span>
                  <input type="text" name="name" placeholder={t.namePh}
                    className={`am-input${regErrors.name ? " error" : ""}`}
                    value={regForm.name}
                    onChange={e => { setRegForm(p => ({ ...p, name: e.target.value })); if (regErrors.name) setRegErrors(p => ({ ...p, name: "" })); setAlert(null); }}
                    autoComplete="given-name" disabled={loading}
                  />
                </div>
                {regErrors.name && <p className="am-err">⚠ {regErrors.name}</p>}
              </div>
              <div className="am-field">
                <div className="am-input-wrap">
                  <span className="am-icon"><IconUser /></span>
                  <input type="text" name="surname" placeholder={t.surnamePh}
                    className={`am-input${regErrors.surname ? " error" : ""}`}
                    value={regForm.surname}
                    onChange={e => { setRegForm(p => ({ ...p, surname: e.target.value })); if (regErrors.surname) setRegErrors(p => ({ ...p, surname: "" })); setAlert(null); }}
                    autoComplete="family-name" disabled={loading}
                  />
                </div>
                {regErrors.surname && <p className="am-err">⚠ {regErrors.surname}</p>}
              </div>
            </div>

            <div className="am-field">
              <div className="am-input-wrap">
                <span className="am-icon"><IconMail /></span>
                <input type="email" name="email" placeholder={t.emailPh}
                  className={`am-input${regErrors.email ? " error" : ""}`}
                  value={regForm.email}
                  onChange={e => { setRegForm(p => ({ ...p, email: e.target.value })); if (regErrors.email) setRegErrors(p => ({ ...p, email: "" })); setAlert(null); }}
                  autoComplete="email" disabled={loading}
                />
              </div>
              {regErrors.email && <p className="am-err">⚠ {regErrors.email}</p>}
            </div>

            <div className="am-field">
              <div className="am-input-wrap">
                <span className="am-icon"><IconPhone /></span>
                <input type="tel" name="phone" placeholder={t.phonePh}
                  className={`am-input${regErrors.phone ? " error" : ""}`}
                  value={regForm.phone}
                  onChange={e => { setRegForm(p => ({ ...p, phone: e.target.value })); if (regErrors.phone) setRegErrors(p => ({ ...p, phone: "" })); setAlert(null); }}
                  autoComplete="tel" disabled={loading}
                />
              </div>
              {regErrors.phone && <p className="am-err">⚠ {regErrors.phone}</p>}
            </div>

            <div className="am-row">
              <div className="am-field">
                <div className="am-input-wrap">
                  <span className="am-icon"><IconLock /></span>
                  <input type={showRegPass ? "text" : "password"} name="password" placeholder={t.newPassPh}
                    className={`am-input${regErrors.password ? " error" : ""}`}
                    value={regForm.password}
                    onChange={e => { setRegForm(p => ({ ...p, password: e.target.value })); if (regErrors.password) setRegErrors(p => ({ ...p, password: "" })); setAlert(null); }}
                    autoComplete="new-password" disabled={loading}
                  />
                  <button type="button" className="am-eye" onClick={() => setShowRegPass(v => !v)} tabIndex={-1}>
                    {showRegPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {regErrors.password && <p className="am-err">⚠ {regErrors.password}</p>}
                <StrengthBar password={regForm.password} labels={t.strengthLabels} />
              </div>
              <div className="am-field">
                <div className="am-input-wrap">
                  <span className="am-icon"><IconKey /></span>
                  <input
                    type={showRegConfirm ? "text" : "password"} name="confirmPassword" placeholder={t.confirmPh}
                    className={`am-input${regErrors.confirmPassword ? " error" : regForm.confirmPassword && regForm.password === regForm.confirmPassword ? " success" : ""}`}
                    value={regForm.confirmPassword}
                    onChange={e => { setRegForm(p => ({ ...p, confirmPassword: e.target.value })); if (regErrors.confirmPassword) setRegErrors(p => ({ ...p, confirmPassword: "" })); setAlert(null); }}
                    autoComplete="new-password" disabled={loading}
                  />
                  <button type="button" className="am-eye" onClick={() => setShowRegConfirm(v => !v)} tabIndex={-1}>
                    {showRegConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {regErrors.confirmPassword && <p className="am-err">⚠ {regErrors.confirmPassword}</p>}
                {!regErrors.confirmPassword && regForm.confirmPassword && regForm.password === regForm.confirmPassword && (
                  <p className="am-pass-match">{t.passMatch}</p>
                )}
              </div>
            </div>

            <div className="am-field">
              <label className="am-check-wrap">
                <input type="checkbox" className="am-checkbox" checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setRegErrors(p => ({ ...p, agreed: "" })); }}
                />
                <span className="am-check-label">
                  <a href="#" className="am-terms-link">{t.terms1}</a> {t.and}{" "}
                  <a href="#" className="am-terms-link">{t.terms2}</a>
                  {t.termsEnd ? ` ${t.termsEnd}` : ""}
                </span>
              </label>
              {regErrors.agreed && <p className="am-err">⚠ {regErrors.agreed}</p>}
            </div>

            <button type="submit" className="am-btn-primary" disabled={loading}>
              {loading ? <><span className="am-spinner" />{t.registering}</> : `${t.registerBtn} →`}
            </button>

            <div className="am-divider"><span>{t.or}</span></div>

            <div
              ref={googleRegBtnRef}
              style={{ width: "100%", minHeight: "44px", display: "flex", justifyContent: "center" }}
            />

            <p className="am-switch-text">
              {t.hasAccount}{" "}
              <button type="button" className="am-switch-link" onClick={() => switchTab("login")}>
                {t.loginLink}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}