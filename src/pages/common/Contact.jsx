import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/ContactPage.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5147";

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "az";

  const [form, setForm]     = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const ch = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setServerErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                              e.name    = t("contact.err_name");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = t("contact.err_email");
    if (!form.message.trim())                           e.message = t("contact.err_message");
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setServerErr("");
    try {
      const res = await fetch(`${API_BASE}/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": lang },
        body: JSON.stringify({ ...form, lang }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setServerErr(t("contact.err_server"));
      }
    } catch {
      setServerErr(t("contact.err_server"));
    } finally {
      setLoading(false);
    }
  };

  const INFO_ITEMS = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: t("contact.info_address_label"),
      value: t("contact.info_address_val"),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-8.6-3.1 19.5 19.5 0 01-6-6 20 20 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7 13 13 0 00.7 2.8 2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.7 2z"/>
        </svg>
      ),
      label: t("contact.info_phone_label"),
      value: t("contact.info_phone_val"),
      href: `tel:${t("contact.info_phone_val").replace(/\s/g, "")}`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: t("contact.info_email_label"),
      value: t("contact.info_email_val"),
      href: `mailto:${t("contact.info_email_val")}`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      label: t("contact.info_hours_label"),
      value: t("contact.info_hours_val"),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="ct-page">
        {/* Hero */}
        <div className="ct-hero">
          <div className="ct-hero-inner">
            <p className="ct-eyebrow">{t("contact.eyebrow")}</p>
            <h1 className="ct-title">
              {t("contact.hero_title")}<br />
              <em>{t("contact.hero_title_em")}</em>
            </h1>
            <p className="ct-subtitle">{t("contact.hero_sub")}</p>
          </div>
        </div>

        <div className="ct-body">
          {/* Info kartları */}
          <div className="ct-info">
            {INFO_ITEMS.map((item, i) => (
              <div key={i} className="ct-info-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="ct-info-ico">{item.icon}</div>
                <div>
                  <p className="ct-info-label">{item.label}</p>
                  {item.href ? (
                    <a className="ct-info-val ct-info-link" href={item.href}>{item.value}</a>
                  ) : (
                    <p className="ct-info-val">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="ct-form-wrap">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="ct-success-title">{t("contact.success_title")}</h3>
                <p className="ct-success-sub">{t("contact.success_sub")}</p>
                <button className="ct-btn-primary" style={{ marginTop: 16 }}
                  onClick={() => { setSent(false); setForm({ name:"", email:"", phone:"", subject:"", message:"" }); }}>
                  {t("contact.send_again")}
                </button>
              </div>
            ) : (
              <>
                <h2 className="ct-form-title">{t("contact.form_title")}</h2>
                <div className="ct-fg">
                  {/* Ad Soyad */}
                  <div className="ct-field">
                    <label className="ct-label">{t("contact.field_name")}</label>
                    <input
                      className={`ct-input${errors.name ? " ct-input-err" : ""}`}
                      name="name" value={form.name} onChange={ch}
                      placeholder={t("contact.field_name_ph")}
                    />
                    {errors.name && <span className="ct-err">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className="ct-field">
                    <label className="ct-label">{t("contact.field_email")}</label>
                    <input
                      className={`ct-input${errors.email ? " ct-input-err" : ""}`}
                      name="email" type="email" value={form.email} onChange={ch}
                      placeholder={t("contact.field_email_ph")}
                    />
                    {errors.email && <span className="ct-err">{errors.email}</span>}
                  </div>

                  {/* Telefon */}
                  <div className="ct-field">
                    <label className="ct-label">{t("contact.field_phone")}</label>
                    <input
                      className="ct-input"
                      name="phone" type="tel" value={form.phone} onChange={ch}
                      placeholder={t("contact.field_phone_ph")}
                    />
                  </div>

                  {/* Mövzu */}
                  <div className="ct-field">
                    <label className="ct-label">{t("contact.field_subject")}</label>
                    <select className="ct-input" name="subject" value={form.subject} onChange={ch}>
                      <option value="">{t("contact.field_subject_ph")}</option>
                      <option>{t("contact.subject_product")}</option>
                      <option>{t("contact.subject_order")}</option>
                      <option>{t("contact.subject_delivery")}</option>
                      <option>{t("contact.subject_complaint")}</option>
                      <option>{t("contact.subject_other")}</option>
                    </select>
                  </div>

                  {/* Mesaj */}
                  <div className="ct-field ct-fcol2">
                    <label className="ct-label">{t("contact.field_message")}</label>
                    <textarea
                      className={`ct-input ct-ta${errors.message ? " ct-input-err" : ""}`}
                      name="message" value={form.message} onChange={ch}
                      rows={5} placeholder={t("contact.field_message_ph")}
                    />
                    {errors.message && <span className="ct-err">{errors.message}</span>}
                  </div>
                </div>

                {serverErr && <p className="ct-server-err">{serverErr}</p>}

                <button
                  className="ct-btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? t("contact.sending") : t("contact.send_btn")}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
