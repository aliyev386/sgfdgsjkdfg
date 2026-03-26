// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import "../../assets/css/AuthPage.css";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.5) % 95}%`,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${5 + (i * 0.9) % 8}s`,
  size: `${2 + (i * 0.3) % 4}px`,
}));

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [alert, setAlert] = useState(null);

  const validate = () => {
    if (!email.trim()) return "Email boş ola bilməz";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email formatı düzgün deyil";
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
      setAlert({ type: "error", msg: err?.userMessage || "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
    
      <div className="auth-right">
        <div className="auth-form-container">
          {!sent ? (
            <>
              <Link to="/login" className="auth-back-link">← Geri qayıt</Link>
              <div className="auth-form-header">
                <div className="auth-form-tag"><span>🔑</span> Şifrəni Sıfırla</div>
                <h1 className="auth-form-title">Şifrəni unutdunuz?</h1>
                <p className="auth-form-subtitle">Qeydiyyatdan keçmiş email ünvanınızı daxil edin. Şifrə sıfırlama linki göndərəcəyik.</p>
              </div>

              {alert && (
                <div className={`auth-alert ${alert.type}`}>
                  <span className="auth-alert-icon">⚠️</span>
                  {alert.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field" style={{ marginBottom: "24px" }}>
                  <label className="auth-field-label" htmlFor="forgot-email">Email ünvanı</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">📧</span>
                    <input
                      id="forgot-email"
                      type="email"
                      className={`auth-input${emailError ? " error" : ""}`}
                      placeholder="qeydiyyatda olan email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); setAlert(null); }}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                  {emailError && <p className="auth-error-msg">⚠ {emailError}</p>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? (<><div className="auth-spinner" />Göndərilir...</>) : "Bərpa linki göndər →"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b6375" }}>
                Şifrənizi xatırladınız? <Link to="/login" style={{ color: "#aa3bff", fontWeight: 600, textDecoration: "none" }}>Daxil olun</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Link to="/login" className="auth-back-link" style={{ justifyContent: "center" }}>← Geri qayıt</Link>
              <div className="auth-success-icon">✉️</div>
              <h1 className="auth-form-title" style={{ textAlign: "center" }}>Email göndərildi!</h1>
              <p style={{ color: "#6b6375", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
                <strong style={{ color: "#08060d" }}>{email}</strong> ünvanına şifrə sıfırlama linki göndərildi. Spam qutusunu da yoxlayın.
              </p>
              <div style={{ background: "rgba(170,59,255,0.06)", border: "1px solid rgba(170,59,255,0.2)", borderRadius: "14px", padding: "16px 20px", marginBottom: "28px" }}>
                <p style={{ fontSize: "13px", color: "#6b6375", margin: 0, lineHeight: 1.6 }}>
                  ⏱️ Link <strong>30 dəqiqə</strong> ərzində etibarlıdır.<br />
                  Email gəlmədisə, spam qutusunu yoxlayın.
                </p>
              </div>
              <button
                className="auth-btn-primary"
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ marginBottom: "12px" }}
              >
                Yenidən göndər
              </button>
              <Link to="/login" style={{ display: "block", textAlign: "center", color: "#aa3bff", fontWeight: 600, textDecoration: "none", fontSize: "14px" }}>
                Daxil ol səhifəsinə qayıt
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
