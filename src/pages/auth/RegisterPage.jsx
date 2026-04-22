import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { register, googleAuth, getMe } from "../../api/authApi";
import { loginSuccess } from "../../store/slices/authSlice";
import "../../assets/pagesCss/AuthPage.css";
 
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
 
const LANGS = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];
 
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
 
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
 
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
 
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
 
const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
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
 
const DivanLogo = () => (
  <h1 className="auth-form-title">
    <img
      src="public/images/livingroom.png"
      alt="icon"
      className="auth-title-icon"
    />
  </h1>
);
 
const T = {
  az: {
    title: "Hesab yarat",
    subtitle: "Artıq hesabınız var?",
    loginLink: "Daxil olun",
    name: "Ad *", namePh: "Əli",
    surname: "Soyad *", surnamePh: "Həsənov",
    email: "Email *", emailPh: "nümunə@email.com",
    phone: "Telefon", phonePh: "+994 50 123 45 67", phoneOpt: "(isteğe bağlı)",
    password: "Şifrə *", passPh: "Ən az 8 simvol",
    confirm: "Şifrəni təkrarlayın *", confirmPh: "Şifrənizi yenidən daxil edin",
    passMatch: "✓ Şifrələr uyğundur",
    terms1: "İstifadəçi şərtlərini", and: "və", terms2: "Məxfilik Siyasətini", termsEnd: "qəbul edirəm",
    registerBtn: "Hesab yarat", registering: "Qeydiyyat olunur...",
    googleBtn: "Google ilə qeydiyyat", or: "və ya form ilə",
    successMsg: "Qeydiyyat uğurla tamamlandı! Yönləndirilirsiniz...",
    googleSuccess: "Google ilə qeydiyyat uğurlu oldu!",
    googleFail: "Google ilə qeydiyyat uğursuz oldu",
    regFail: "Qeydiyyat zamanı xəta baş verdi",
    tagline: "Mebel & Dizayn",
    passMatch: "✓ Şifrələr uyğundur",
    strengthLabels: ["", "Çox zəif", "Zəif", "Orta", "Yaxşı", "Güclü"],
  },
  en: {
    title: "Create Account",
    subtitle: "Already have an account?",
    loginLink: "Sign In",
    name: "First Name *", namePh: "John",
    surname: "Last Name *", surnamePh: "Smith",
    email: "Email *", emailPh: "example@email.com",
    phone: "Phone", phonePh: "+994 50 123 45 67", phoneOpt: "(optional)",
    password: "Password *", passPh: "At least 8 characters",
    confirm: "Confirm Password *", confirmPh: "Re-enter your password",
    passMatch: "✓ Passwords match",
    terms1: "Terms of Service", and: "and", terms2: "Privacy Policy", termsEnd: "",
    registerBtn: "Create Account", registering: "Registering...",
    googleBtn: "Sign up with Google", or: "or with form",
    successMsg: "Registration successful! Redirecting...",
    googleSuccess: "Google sign up successful!",
    googleFail: "Google sign up failed",
    regFail: "Registration failed",
    tagline: "Furniture & Design",
    passMatch: "✓ Passwords match",
    strengthLabels: ["", "Very weak", "Weak", "Fair", "Good", "Strong"],
  },
  ru: {
    title: "Создать аккаунт",
    subtitle: "Уже есть аккаунт?",
    loginLink: "Войти",
    name: "Имя *", namePh: "Иван",
    surname: "Фамилия *", surnamePh: "Иванов",
    email: "Email *", emailPh: "пример@email.com",
    phone: "Телефон", phonePh: "+994 50 123 45 67", phoneOpt: "(необязательно)",
    password: "Пароль *", passPh: "Минимум 8 символов",
    confirm: "Подтвердите пароль *", confirmPh: "Повторите пароль",
    passMatch: "✓ Пароли совпадают",
    terms1: "Условия использования", and: "и", terms2: "Политику конфиденциальности", termsEnd: "",
    registerBtn: "Создать аккаунт", registering: "Регистрация...",
    googleBtn: "Регистрация через Google", or: "или через форму",
    successMsg: "Регистрация прошла успешно! Перенаправление...",
    googleSuccess: "Регистрация через Google успешна!",
    googleFail: "Ошибка регистрации через Google",
    regFail: "Ошибка при регистрации",
    tagline: "Мебель и дизайн",
    passMatch: "✓ Пароли совпадают",
    strengthLabels: ["", "Очень слабый", "Слабый", "Средний", "Хороший", "Надёжный"],
  },
};
 
function getStrength(password) {
  if (!password) return { score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return { score };
}
 
function StrengthBar({ password, labels }) {
  const { score } = getStrength(password);
  if (!password) return null;
  const barCls = ["", "active-weak", "active-fair", "active-good", "active-strong"];
  const txtCls = ["", "strength-weak", "strength-weak", "strength-fair", "strength-good", "strength-strong"];
  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`auth-strength-bar${i <= score ? ` ${barCls[score]}` : ""}`} />
        ))}
      </div>
      <span className={`auth-strength-label ${txtCls[score]}`}>{labels[score]}</span>
    </div>
  );
}
 
export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { i18n: i18nHook } = useTranslation();
  const lang = (i18nHook.language || "az").substring(0, 2);
  const t = T[lang] || T.az;
 
  const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
 
  const changeLang = (code) => { i18n.changeLanguage(code); };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setAlert(null);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!agreed) {
      setErrors((prev) => ({ ...prev, agreed: t.termsRequired || "Şərtləri qəbul etməlisiniz" }));
      return;
    }

    setLoading(true);
    try {
      const tokenData = await register({ name: form.name, surname: form.surname, email: form.email, password: form.password, confirmPassword: form.confirmPassword, phone: form.phone });
      let user = { email: form.email, name: form.name, surname: form.surname };
      try { user = await getMe(); } catch { }
      dispatch(loginSuccess({ token: tokenData.accessToken, refreshToken: tokenData.refreshToken, user }));
      setAlert({ type: "success", msg: t.successMsg });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([field, msgs]) => {
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      }
      setAlert({ type: "error", msg: err?.userMessage || t.regFail });
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
      const btnEl = document.getElementById("google-register-btn");
      if (btnEl) {
        window.google?.accounts.id.renderButton(btnEl, {
          theme: "outline",
          size: "large",
          width: btnEl.offsetWidth || 360,
          text: "signup_with",
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
    <div className="auth-root register">
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
          <div className="auth-logo">
            <DivanLogo />
          </div>
 
          <div className="auth-form-header">
            <h1 className="auth-form-title">{t.title}</h1>
          </div>
 
 
          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}
 
 
 
 
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-row">
              <div className="auth-field">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconUser /></span>
                  <input id="reg-name" type="text" name="name"
                    className={`auth-input${errors.name ? " error" : ""}`}
                    placeholder={t.namePh} value={form.name} onChange={handleChange}
                    autoComplete="given-name" disabled={loading} />
                </div>
                {errors.name && <p className="auth-error-msg">⚠ {errors.name}</p>}
              </div>
              <div className="auth-field">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconUser /></span>
                  <input id="reg-surname" type="text" name="surname"
                    className={`auth-input${errors.surname ? " error" : ""}`}
                    placeholder={t.surnamePh} value={form.surname} onChange={handleChange}
                    autoComplete="family-name" disabled={loading} />
                </div>
                {errors.surname && <p className="auth-error-msg">⚠ {errors.surname}</p>}
              </div>
            </div>
 
            <div className="auth-field">              
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconMail /></span>
                <input id="reg-email" type="email" name="email"
                  className={`auth-input${errors.email ? " error" : ""}`}
                  placeholder={t.emailPh} value={form.email} onChange={handleChange}
                  autoComplete="email" disabled={loading} />
              </div>
              {errors.email && <p className="auth-error-msg">⚠ {errors.email}</p>}
            </div>
 
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconPhone /></span>
                <input id="reg-phone" type="tel" name="phone"
                  className={`auth-input${errors.phone ? " error" : ""}`}
                  placeholder={t.phonePh} value={form.phone} onChange={handleChange}
                  autoComplete="tel" disabled={loading} />
              </div>
              {errors.phone && <p className="auth-error-msg">⚠ {errors.phone}</p>}
            </div>
 
            <div className="auth-row">
              <div className="auth-field">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input id="reg-password" type={showPassword ? "text" : "password"} name="password"
                    className={`auth-input${errors.password ? " error" : ""}`}
                    placeholder={t.passPh} value={form.password} onChange={handleChange}
                    autoComplete="new-password" disabled={loading} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && <p className="auth-error-msg">⚠ {errors.password}</p>}
                <StrengthBar password={form.password} labels={t.strengthLabels} />
              </div>
              <div className="auth-field">              
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconKey /></span>
                  <input id="reg-confirm" type={showConfirm ? "text" : "password"} name="confirmPassword"
                    className={`auth-input${errors.confirmPassword ? " error" : form.confirmPassword && form.password === form.confirmPassword ? " success" : ""}`}
                    placeholder={t.confirmPh} value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password" disabled={loading} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="auth-error-msg">⚠ {errors.confirmPassword}</p>}
                {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                  <p style={{ fontSize: "11px", color: "#22c55e", marginTop: "4px" }}>{t.passMatch}</p>
                )}
              </div>
            </div>
 
            <div className="auth-field">
              <label className="auth-checkbox-wrap">
                <input type="checkbox" className="auth-checkbox" checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }} />
                <span className="auth-checkbox-label">
                  <a href="#" style={{ color: "#4b9c52", fontWeight: 600 }}>{t.terms1}</a> {t.and} <a href="#" style={{ color: "#4b9c52", fontWeight: 600 }}>{t.terms2}</a>
                  {t.termsEnd ? " " + t.termsEnd : ""}
                </span>
              </label>
              {errors.agreed && <p className="auth-error-msg">⚠ {errors.agreed}</p>}
            </div>
 
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (<><div className="auth-spinner" />{t.registering}</>) : t.registerBtn + " →"}
            </button>
            <div className="auth-divider"><span>{t.or}</span></div>
            <div id="google-register-btn" style={{ width: "100%", minHeight: "44px", display: "flex", justifyContent: "center", marginBottom: "8px" }}></div>
            <div className="auth-form-header">
              <p className="auth-form-subtitle">{t.subtitle} <Link to="/login">{t.loginLink}</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}