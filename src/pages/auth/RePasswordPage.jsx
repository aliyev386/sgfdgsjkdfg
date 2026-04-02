// src/pages/auth/ResetPasswordPage.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import "../../assets/pagesCss/AuthPage.css";

function getStrength(password) {
  if (!password) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: "Çox zəif", cls: "strength-weak" },
    { label: "Zəif",     cls: "strength-weak" },
    { label: "Orta",     cls: "strength-fair" },
    { label: "Yaxşı",   cls: "strength-good" },
    { label: "Güclü",   cls: "strength-strong" },
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  // Token və ya email yoxdursa xəbərdar et
  const isInvalidLink = !token || !email;

  const validate = () => {
    const errs = {};
    if (!form.newPassword) errs.newPassword = "Şifrə boş ola bilməz";
    else if (form.newPassword.length < 8) errs.newPassword = "Şifrə ən az 8 simvol olmalıdır";
    if (!form.confirmPassword) errs.confirmPassword = "Şifrəni təkrarlayın";
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Şifrələr uyğun gəlmir";
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
      setAlert({ type: "error", msg: err?.userMessage || "Şifrə yeniləmə zamanı xəta baş verdi. Link köhnəlmiş ola bilər." });
    } finally {
      setLoading(false);
    }
  };

  if (isInvalidLink) {
    return (
      <div className="auth-root">
        <div className="auth-right">
          <div className="auth-form-container" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h1 className="auth-form-title">Keçid etibarsızdır</h1>
            <p style={{ color: "#6b6375", marginBottom: "24px" }}>
              Bu şifrə sıfırlama keçidi etibarsız və ya köhnəlmişdir.
            </p>
            <Link to="/forgot-password" className="auth-btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
              Yeni keçid al →
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
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h1 className="auth-form-title">Şifrə yeniləndi!</h1>
            <p style={{ color: "#6b6375", marginBottom: "24px" }}>
              Şifrəniz uğurla dəyişdirildi. İndi yeni şifrənizlə daxil ola bilərsiniz.
            </p>
            <button className="auth-btn-primary" onClick={() => navigate("/login")}>
              Daxil ol →
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
          <Link to="/login" className="auth-back-link">← Daxil ol</Link>
          <div className="auth-form-header">
            <div className="auth-form-tag"><span>🔒</span> Şifrə Yenilə</div>
            <h1 className="auth-form-title">Yeni şifrə təyin edin</h1>
            <p className="auth-form-subtitle">{email} üçün yeni şifrə daxil edin</p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <span className="auth-alert-icon">{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="new-password">Yeni şifrə *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="new-password"
                  type={showPass ? "text" : "password"}
                  name="newPassword"
                  className={`auth-input${errors.newPassword ? " error" : ""}`}
                  placeholder="Ən az 8 simvol"
                  value={form.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.newPassword && <p className="auth-error-msg">⚠ {errors.newPassword}</p>}
              <StrengthBar password={form.newPassword} />
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="confirm-password">Şifrəni təkrarlayın *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔑</span>
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  className={`auth-input${errors.confirmPassword ? " error" : form.confirmPassword && form.newPassword === form.confirmPassword ? " success" : ""}`}
                  placeholder="Şifrənizi yenidən daxil edin"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <p className="auth-error-msg">⚠ {errors.confirmPassword}</p>}
              {!errors.confirmPassword && form.confirmPassword && form.newPassword === form.confirmPassword && (
                <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "6px" }}>✓ Şifrələr uyğundur</p>
              )}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (<><div className="auth-spinner" />Yenilənir...</>) : "Şifrəni Yenilə →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}