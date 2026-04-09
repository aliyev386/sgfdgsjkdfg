import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { forgotPassword } from "../../api/authApi";
import "../../assets/pagesCss/AuthPage.css";

const LANGS = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
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
    back: "← Geri qayıt",
    tag: "Şifrəni Sıfırla",
    title: "Şifrəni unutdunuz?",
    subtitle: "Qeydiyyatdan keçmiş email ünvanınızı daxil edin. Şifrə sıfırlama linki göndərəcəyik.",
    emailLabel: "Email ünvanı",
    emailPh: "qeydiyyatda olan email",
    sendBtn: "Bərpa linki göndər →",
    sending: "Göndərilir...",
    rememberPass: "Şifrənizi xatırladınız?",
    loginLink: "Daxil olun",
    sentTitle: "Email göndərildi!",
    sentDesc1: "ünvanına şifrə sıfırlama linki göndərildi. Spam qutusunu da yoxlayın.",
    linkValid: "Link 1 saat ərzində etibarlıdır.",
    resend: "Yenidən göndər",
    backToLogin: "Daxil ol səhifəsinə qayıt",
    errEmailEmpty: "Email boş ola bilməz",
    errEmailFmt: "Email formatı düzgün deyil",
    errGeneral: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
    tagline: "Mebel & Dizayn",
  },
  en: {
    back: "← Go back",
    tag: "Reset Password",
    title: "Forgot your password?",
    subtitle: "Enter your registered email address. We'll send you a password reset link.",
    emailLabel: "Email address",
    emailPh: "your registered email",
    sendBtn: "Send reset link →",
    sending: "Sending...",
    rememberPass: "Remember your password?",
    loginLink: "Sign in",
    sentTitle: "Email sent!",
    sentDesc1: "A password reset link was sent to",
    linkValid: "The link is valid for 1 hour.",
    resend: "Send again",
    backToLogin: "Back to sign in",
    errEmailEmpty: "Email is required",
    errEmailFmt: "Invalid email format",
    errGeneral: "An error occurred. Please try again.",
    tagline: "Furniture & Design",
  },
  ru: {
    back: "← Назад",
    tag: "Сброс пароля",
    title: "Забыли пароль?",
    subtitle: "Введите ваш зарегистрированный email. Мы отправим ссылку для сброса пароля.",
    emailLabel: "Email адрес",
    emailPh: "ваш зарегистрированный email",
    sendBtn: "Отправить ссылку →",
    sending: "Отправка...",
    rememberPass: "Вспомнили пароль?",
    loginLink: "Войти",
    sentTitle: "Email отправлен!",
    sentDesc1: "Ссылка для сброса пароля отправлена на",
    linkValid: "Ссылка действительна 1 час.",
    resend: "Отправить снова",
    backToLogin: "Вернуться к входу",
    errEmailEmpty: "Введите email",
    errEmailFmt: "Неверный формат email",
    errGeneral: "Произошла ошибка. Пожалуйста, попробуйте снова.",
    tagline: "Мебель и дизайн",
  },
};

export default function ForgotPasswordPage() {
  const { i18n: i18nHook } = useTranslation();
  const lang = (i18nHook.language || "az").substring(0, 2);
  const t = T[lang] || T.az;

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [alert, setAlert] = useState(null);

  const validate = () => {
    if (!email.trim()) return t.errEmailEmpty;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t.errEmailFmt;
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }
    setLoading(true);
    setAlert(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || t.errGeneral });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-right">
        <div className="auth-form-container">
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

          {!sent ? (
            <>
              <Link to="/login" className="auth-back-link">{t.back}</Link>
              <div className="auth-form-header">
                <h1 className="auth-form-title">{t.title}</h1>
                <p className="auth-form-subtitle">{t.subtitle}</p>
              </div>

              {alert && (
                <div className={`auth-alert ${alert.type}`}>
                  <span className="auth-alert-icon">⚠️</span>
                  {alert.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field" style={{ marginBottom: "20px" }}>
                  <label className="auth-field-label" htmlFor="forgot-email">{t.emailLabel}</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><IconMail /></span>
                    <input id="forgot-email" type="email"
                      className={`auth-input${emailError ? " error" : ""}`}
                      placeholder={t.emailPh} value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); setAlert(null); }}
                      autoComplete="email" disabled={loading} />
                  </div>
                  {emailError && <p className="auth-error-msg">⚠ {emailError}</p>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? (<><div className="auth-spinner" />{t.sending}</>) : t.sendBtn}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6b7280" }}>
                {t.rememberPass} <Link to="/login" style={{ color: "#4b9c52", fontWeight: 600, textDecoration: "none" }}>{t.loginLink}</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Link to="/login" className="auth-back-link" style={{ justifyContent: "center" }}>{t.back}</Link>
              <div className="auth-success-icon">✉️</div>
              <h1 className="auth-form-title">{t.sentTitle}</h1>
              <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
                <strong style={{ color: "#111" }}>{email}</strong> {lang === "az" ? t.sentDesc1 : `${t.sentDesc1} ${email}.`}
                {lang === "az" ? "" : ""} Spam qutusunu da yoxlayın.
              </p>
              <div style={{ background: "rgba(75,156,82,.07)", border: "1px solid rgba(75,156,82,.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px" }}>
                <p style={{ fontSize: "12.5px", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
                  ⏱️ {t.linkValid}
                </p>
              </div>
              <button className="auth-btn-primary" onClick={() => { setSent(false); setEmail(""); }} style={{ marginBottom: "10px" }}>
                {t.resend}
              </button>
              <Link to="/login" style={{ display: "block", textAlign: "center", color: "#4b9c52", fontWeight: 600, textDecoration: "none", fontSize: "13px" }}>
                {t.backToLogin}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
