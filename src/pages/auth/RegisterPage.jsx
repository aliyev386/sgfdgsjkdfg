// src/pages/auth/RegisterPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, googleAuth } from "../../api/authApi";
import "../../assets/PagesCss/AuthPage.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.5) % 95}%`,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${5 + (i * 0.9) % 8}s`,
  size: `${2 + (i * 0.3) % 4}px`,
}));

// Şifrə gücünü hesabla
function getStrength(password) {
  if (!password) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: "Çox zəif", cls: "strength-weak" },
    { label: "Zəif", cls: "strength-weak" },
    { label: "Orta", cls: "strength-fair" },
    { label: "Yaxşı", cls: "strength-good" },
    { label: "Güclü", cls: "strength-strong" },
  ];
  return { score, ...map[score] };
}

function StrengthBar({ password }) {
  const { score, label, cls } = getStrength(password);
  if (!password) return null;
  const barCls = ["", "active-weak", "active-fair", "active-good", "active-strong"];
  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`auth-strength-bar${i <= score ? ` ${barCls[score]}` : ""}`} />
        ))}
      </div>
      <span className={`auth-strength-label ${cls}`}>{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Ad Soyad boş ola bilməz";
    else if (form.fullName.trim().length < 3) errs.fullName = "Ad Soyad ən az 3 simvol olmalıdır";

    if (!form.email.trim()) errs.email = "Email boş ola bilməz";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email formatı düzgün deyil";

    if (form.phone && !/^[+]?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = "Telefon nömrəsi düzgün deyil";

    if (!form.password) errs.password = "Şifrə boş ola bilməz";
    else if (form.password.length < 8) errs.password = "Şifrə ən az 8 simvol olmalıdır";

    if (!form.confirmPassword) errs.confirmPassword = "Şifrəni təkrarlayın";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Şifrələr uyğun gəlmir";

    if (!agreed) errs.agreed = "Şərtləri qəbul etməlisiniz";
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
      await register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone });
      setAlert({ type: "success", msg: "Qeydiyyat uğurla tamamlandı! Yönləndirilirsiniz..." });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || "Qeydiyyat zamanı xəta baş verdi" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(async (response) => {
    setGoogleLoading(true);
    setAlert(null);
    try {
      await googleAuth(response.credential);
      setAlert({ type: "success", msg: "Google ilə qeydiyyat uğurlu oldu!" });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err?.userMessage || "Google ilə qeydiyyat uğursuz oldu" });
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate]);

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
    <div className="auth-root register">
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Hesab yaradın</h1>
            <p className="auth-form-subtitle">Artıq hesabınız var? <Link to="/login">Daxil olun</Link></p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}

          {/* Google */}
          <button type="button" className="auth-btn-google" onClick={triggerGoogleLogin} disabled={googleLoading} style={{ marginBottom: "8px" }}>
            {googleLoading ? (<><div className="auth-spinner" style={{ borderTopColor: "#aa3bff", borderColor: "#e5e4e7" }} />Google ilə qeydiyyat...</>) : (<><GoogleIcon />Google ilə qeydiyyat</>)}
          </button>

          <div className="auth-divider"><span>və ya form ilə</span></div>

<form onSubmit={handleSubmit} noValidate>
  {/* Full Name + Email */}
  <div className="auth-row">
    <div className="auth-field">
      <label className="auth-field-label" htmlFor="reg-name">Ad Soyad</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">👤</span>
        <input id="reg-name" type="text" name="fullName" className={`auth-input${errors.fullName ? " error" : ""}`} placeholder="Əli Həsənov" value={form.fullName} onChange={handleChange} autoComplete="name" disabled={loading} />
      </div>
      {errors.fullName && <p className="auth-error-msg">⚠ {errors.fullName}</p>}
    </div>

    <div className="auth-field">
      <label className="auth-field-label" htmlFor="reg-email">Email ünvanı</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">📧</span>
        <input id="reg-email" type="email" name="email" className={`auth-input${errors.email ? " error" : ""}`} placeholder="nümunə@email.com" value={form.email} onChange={handleChange} autoComplete="email" disabled={loading} />
      </div>
      {errors.email && <p className="auth-error-msg">⚠ {errors.email}</p>}
    </div>
  </div>

  {/* Phone */}
  <div className="auth-field">
    <label className="auth-field-label" htmlFor="reg-phone">Telefon <span style={{ color: "#9ca3af", fontWeight: 400 }}>(isteğe bağlı)</span></label>
    <div className="auth-input-wrap">
      <span className="auth-input-icon">📱</span>
      <input id="reg-phone" type="tel" name="phone" className={`auth-input${errors.phone ? " error" : ""}`} placeholder="+994 50 123 45 67" value={form.phone} onChange={handleChange} autoComplete="tel" disabled={loading} />
    </div>
    {errors.phone && <p className="auth-error-msg">⚠ {errors.phone}</p>}
  </div>

  {/* Password + Confirm Password */}
  <div className="auth-row">
    <div className="auth-field">
      <label className="auth-field-label" htmlFor="reg-password">Şifrə</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">🔒</span>
        <input id="reg-password" type={showPassword ? "text" : "password"} name="password" className={`auth-input${errors.password ? " error" : ""}`} placeholder="Ən az 8 simvol" value={form.password} onChange={handleChange} autoComplete="new-password" disabled={loading} />
        <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>{showPassword ? "🙈" : "👁️"}</button>
      </div>
      {errors.password && <p className="auth-error-msg">⚠ {errors.password}</p>}
      <StrengthBar password={form.password} />
    </div>

    <div className="auth-field">
      <label className="auth-field-label" htmlFor="reg-confirm">Şifrəni təkrarlayın</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">🔑</span>
        <input id="reg-confirm" type={showConfirm ? "text" : "password"} name="confirmPassword" className={`auth-input${errors.confirmPassword ? " error" : form.confirmPassword && form.password === form.confirmPassword ? " success" : ""}`} placeholder="Şifrənizi yenidən daxil edin" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" disabled={loading} />
        <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>{showConfirm ? "🙈" : "👁️"}</button>
      </div>
      {errors.confirmPassword && <p className="auth-error-msg">⚠ {errors.confirmPassword}</p>}
      {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
        <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "6px" }}>✓ Şifrələr uyğundur</p>
      )}
    </div>
  </div>

  {/* Terms */}
  <div className="auth-field">
    <label className="auth-checkbox-wrap">
      <input type="checkbox" className="auth-checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }} />
      <span className="auth-checkbox-label">
        <a href="#" style={{ color: "#aa3bff", fontWeight: 600 }}>İstifadəçi şərtlərini</a> və <a href="#" style={{ color: "#aa3bff", fontWeight: 600 }}>Məxfilik Siyasətini</a> qəbul edirəm
      </span>
    </label>
    {errors.agreed && <p className="auth-error-msg">⚠ {errors.agreed}</p>}
  </div>

  <button type="submit" className="auth-btn-primary" disabled={loading}>
    {loading ? (<><div className="auth-spinner" />Qeydiyyat olunur...</>) : "Hesab yarat →"}
  </button>
</form>
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
