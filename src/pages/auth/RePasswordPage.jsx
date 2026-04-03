// src/pages/auth/ResetPasswordPage.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { resetPassword } from "../../api/authApi";
import "../../assets/pagesCss/AuthPage.css";

const LANGS = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6"/>
    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const DivanLogo = () => (
  <svg className="auth-logo-mark" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="14" fill="#4b9c52"/>
    <path d="M12 38 C12 32 16 28 22 28 L38 28 C44 28 48 32 48 38 L48 42 C48 44 46 46 44 46 L16 46 C14 46 12 44 12 42 Z" fill="white" fillOpacity=".95"/>
    <rect x="10" y="38" width="40" height="5" rx="2.5" fill="white" fillOpacity=".6"/>
    <rect x="14" y="43" width="6" height="6" rx="2" fill="white" fillOpacity=".85"/>
    <rect x="40" y="43" width="6" height="6" rx="2" fill="white" fillOpacity=".85"/>
    <path d="M22 28 C22 22 25 16 30 14 C35 16 38 22 38 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".6"/>
    <circle cx="30" cy="11" r="3" fill="white" fillOpacity=".7"/>
  </svg>
);

const T = {
  az: {
    back: "← Daxil ol",
    invalidTitle: "Keçid etibarsızdır",
    invalidDesc: "Bu şifrə sıfırlama keçidi etibarsız və ya köhnəlmişdir.",
    getNewLink: "Yeni keçid al →",
    doneTitle: "Şifrə yeniləndi!",
    doneDesc: "Şifrəniz uğurla dəyişdirildi. İndi yeni şifrənizlə daxil ola bilərsiniz.",
    loginBtn: "Daxil ol →",
    tag: "Şifrə Yenilə",
    title: "Yeni şifrə təyin edin",
    newPass: "Yeni şifrə *",
    newPassPh: "Ən az 8 simvol",
    confirm: "Şifrəni təkrarlayın *",
    confirmPh: "Şifrənizi yenidən daxil edin",
    passMatch: "✓ Şifrələr uyğundur",
    submitBtn: "Şifrəni Yenilə →",
    submitting: "Yenilənir...",
    errPass: "Şifrə boş ola bilməz",
    errPassLen: "Şifrə ən az 8 simvol olmalıdır",
    errConfirm: "Şifrəni təkrarlayın",
    errConfirmMatch: "Şifrələr uyğun gəlmir",
    errGeneral: "Şifrə yeniləmə zamanı xəta baş verdi. Link köhnəlmiş ola bilər.",
    strengthLabels: ["", "Çox zəif", "Zəif", "Orta", "Yaxşı", "Güclü"],
    tagline: "Mebel & Dizayn",
    forEmail: "üçün yeni şifrə daxil edin",
  },
  en: {
    back: "← Sign In",
    invalidTitle: "Invalid link",
    invalidDesc: "This password reset link is invalid or has expired.",
    getNewLink: "Get a new link →",
    doneTitle: "Password updated!",
    doneDesc: "Your password has been changed successfully. You can now sign in with your new password.",
    loginBtn: "Sign In →",
    tag: "Reset Password",
    title: "Set new password",
    newPass: "New password *",
    newPassPh: "At least 8 characters",
    confirm: "Confirm password *",
    confirmPh: "Re-enter your password",
    passMatch: "✓ Passwords match",
    submitBtn: "Update Password →",
    submitting: "Updating...",
    errPass: "Password is required",
    errPassLen: "Password must be at least 8 characters",
    errConfirm: "Please confirm your password",
    errConfirmMatch: "Passwords do not match",
    errGeneral: "Failed to reset password. The link may have expired.",
    strengthLabels: ["", "Very weak", "Weak", "Fair", "Good", "Strong"],
    tagline: "Furniture & Design",
    forEmail: "Enter new password for",
  },
  ru: {
    back: "← Войти",
    invalidTitle: "Ссылка недействительна",
    invalidDesc: "Эта ссылка для сброса пароля недействительна или устарела.",
    getNewLink: "Получить новую ссылку →",
    doneTitle: "Пароль обновлён!",
    doneDesc: "Ваш пароль был успешно изменён. Теперь вы можете войти с новым паролем.",
    loginBtn: "Войти →",
    tag: "Сброс пароля",
    title: "Задайте новый пароль",
    newPass: "Новый пароль *",
    newPassPh: "Минимум 8 символов",
    confirm: "Подтвердите пароль *",
    confirmPh: "Повторите пароль",
    passMatch: "✓ Пароли совпадают",
    submitBtn: "Обновить пароль →",
    submitting: "Обновление...",
    errPass: "Введите пароль",
    errPassLen: "Пароль должен содержать минимум 8 символов",
    errConfirm: "Подтвердите пароль",
    errConfirmMatch: "Пароли не совпадают",
    errGeneral: "Не удалось сбросить пароль. Ссылка могла устареть.",
    strengthLabels: ["", "Очень слабый", "Слабый", "Средний", "Хороший", "Надёжный"],
    tagline: "Мебель и дизайн",
    forEmail: "Введите новый пароль для",
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { i18n: i18nHook } = useTranslation();
  const lang = (i18nHook.language || "az").substring(0, 2);
  const t = T[lang] || T.az;

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const isInvalidLink = !token || !email;

  const validate = () => {
    const errs = {};
    if (!form.newPassword) errs.newPassword = t.errPass;
    else if (form.newPassword.length < 8) errs.newPassword = t.errPassLen;
    if (!form.confirmPassword) errs.confirmPassword = t.errConfirm;
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = t.errConfirmMatch;
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
      await resetPassword({ token, email, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || t.errGeneral });
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <>
      <div className="auth-logo">
        <DivanLogo />
        <div className="auth-logo-name">DIVAN</div>
        <div className="auth-logo-tagline">{t.tagline}</div>
      </div>
      <div className="auth-lang-switcher">
        {LANGS.map((l) => (
          <button key={l.code} className={`auth-lang-btn${lang === l.code ? " active" : ""}`}
            onClick={() => i18n.changeLanguage(l.code)}>{l.label}</button>
        ))}
      </div>
    </>
  );

  if (isInvalidLink) {
    return (
      <div className="auth-root">
        <div className="auth-right">
          <div className="auth-form-container" style={{ textAlign: "center" }}>
            <Logo />
            <div style={{ fontSize: "42px", marginBottom: "14px" }}>⚠️</div>
            <h1 className="auth-form-title">{t.invalidTitle}</h1>
            <p style={{ color: "#6b7280", marginBottom: "22px", fontSize: "13.5px" }}>{t.invalidDesc}</p>
            <Link to="/forgot-password" className="auth-btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
              {t.getNewLink}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-root">
        <div className="auth-right">
          <div className="auth-form-container" style={{ textAlign: "center" }}>
            <Logo />
            <div style={{ fontSize: "42px", marginBottom: "14px" }}>✅</div>
            <h1 className="auth-form-title">{t.doneTitle}</h1>
            <p style={{ color: "#6b7280", marginBottom: "22px", fontSize: "13.5px" }}>{t.doneDesc}</p>
            <button className="auth-btn-primary" onClick={() => navigate("/login")}>
              {t.loginBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-right">
        <div className="auth-form-container">
          <Logo />
          <Link to="/login" className="auth-back-link">{t.back}</Link>
          <div className="auth-form-header">
            <h1 className="auth-form-title">{t.title}</h1>
            <p className="auth-form-subtitle">{t.forEmail} <strong>{email}</strong></p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="new-password">{t.newPass}</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconLock /></span>
                <input id="new-password" type={showPass ? "text" : "password"} name="newPassword"
                  className={`auth-input${errors.newPassword ? " error" : ""}`}
                  placeholder={t.newPassPh} value={form.newPassword}
                  onChange={handleChange} autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.newPassword && <p className="auth-error-msg">⚠ {errors.newPassword}</p>}
              <StrengthBar password={form.newPassword} labels={t.strengthLabels} />
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="confirm-password">{t.confirm}</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconKey /></span>
                <input id="confirm-password" type={showConfirm ? "text" : "password"} name="confirmPassword"
                  className={`auth-input${errors.confirmPassword ? " error" : form.confirmPassword && form.newPassword === form.confirmPassword ? " success" : ""}`}
                  placeholder={t.confirmPh} value={form.confirmPassword}
                  onChange={handleChange} autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="auth-error-msg">⚠ {errors.confirmPassword}</p>}
              {!errors.confirmPassword && form.confirmPassword && form.newPassword === form.confirmPassword && (
                <p style={{ fontSize: "11px", color: "#22c55e", marginTop: "4px" }}>{t.passMatch}</p>
              )}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (<><div className="auth-spinner" />{t.submitting}</>) : t.submitBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
