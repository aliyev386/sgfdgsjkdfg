import { useState, useRef, useEffect } from "react";
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
  const [touched, setTouched] = useState({});
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle("ct-visible", e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".ct-animate").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const validate = (name, value) => {
    if (name === "name" && !value.trim()) return t("contact.err_name");
    if (name === "email") {
      if (!value.trim()) return t("contact.err_email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t("contact.err_email");
    }
    if (name === "subject" && !value) return t("contact.err_subject");
    if (name === "message" && !value.trim()) return t("contact.err_message");
    return "";
  };

  const ch = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (touched[name]) {
      setErrors(p => ({ ...p, [name]: validate(name, value) }));
    }
    setServerErr("");
  };

  const blur = e => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, subject: true, message: true });
    const newErrors = {
      name: validate("name", form.name),
      email: validate("email", form.email),
      subject: validate("subject", form.subject),
      message: validate("message", form.message),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

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
        const data = await res.json().catch(() => null);
        if (data?.validationErrors) {
          const mapped = {};
          Object.entries(data.validationErrors).forEach(([field, msgs]) => {
            mapped[field.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          setErrors(mapped);
        } else {
          setServerErr(data?.message || t("contact.err_server"));
        }
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: t("contact.info_address_label"),
      value: t("contact.info_address_val"),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-8.6-3.1 19.5 19.5 0 01-6-6 20 20 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7 13 13 0 00.7 2.8 2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.7 2z"/>
        </svg>
      ),
      label: t("contact.info_phone_label"),
      value: t("contact.info_phone_val"),
      href: `tel:${t("contact.info_phone_val").replace(/\s/g, "")}`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* HERO */}
        <section className="ct-hero">
          <div className="ct-hero-noise" />
          <div className="ct-hero-orb ct-orb-1" />
          <div className="ct-hero-orb ct-orb-2" />
          <div className="ct-hero-inner">
            <span className="ct-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {t("contact.eyebrow")}
            </span>
            <h1 className="ct-title">
              {t("contact.hero_title")}<br />
              <em>{t("contact.hero_title_em")}</em>
            </h1>
            <p className="ct-subtitle">{t("contact.hero_sub")}</p>
          </div>
        </section>

        {/* BODY */}
        <div className="ct-body">

          {/* Info */}
          <aside className="ct-info">
            {INFO_ITEMS.map((item, i) => (
              <div key={i} className="ct-info-card ct-animate" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="ct-info-ico">{item.icon}</div>
                <div className="ct-info-text">
                  <p className="ct-info-label">{item.label}</p>
                  {item.href ? (
                    <a className="ct-info-val ct-info-link" href={item.href}>{item.value}</a>
                  ) : (
                    <p className="ct-info-val">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="ct-deco-card ct-animate" style={{ transitionDelay: "320ms" }}>
              <div className="ct-deco-lines">
                {[...Array(6)].map((_,i) => <div key={i} className="ct-deco-line" />)}
              </div>
              <div className="ct-deco-content">
                <p className="ct-deco-brand">Amore Mebel</p>
                <p className="ct-deco-tagline">Premium Furniture</p>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="ct-form-wrap ct-animate" style={{ transitionDelay: "100ms" }}>
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-ring">
                  <div className="ct-success-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <h3 className="ct-success-title">{t("contact.success_title")}</h3>
                <p className="ct-success-sub">{t("contact.success_sub")}</p>
                <button className="ct-btn-ghost"
                  onClick={() => { setSent(false); setForm({ name:"", email:"", phone:"", subject:"", message:"" }); setTouched({}); setErrors({}); }}>
                  {t("contact.send_again")}
                </button>
              </div>
            ) : (
              <>
                <div className="ct-form-header">
                  <h2 className="ct-form-title">{t("contact.form_title")}</h2>
                  <p className="ct-form-sub">Bütün sahələri doldurun, tezliklə cavab verəcəyik.</p>
                </div>

                <div className="ct-fg">
                  {/* Ad Soyad */}
                  <div className={`ct-field${errors.name && touched.name ? " ct-field-err" : ""}${form.name ? " ct-field-filled" : ""}`}>
                    <label className="ct-label">{t("contact.field_name")} <span className="ct-req">*</span></label>
                    <div className="ct-input-wrap">
                      <span className="ct-input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <input className="ct-input" name="name" value={form.name} onChange={ch} onBlur={blur} placeholder={t("contact.field_name_ph")} />
                    </div>
                    {errors.name && touched.name && <span className="ct-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className={`ct-field${errors.email && touched.email ? " ct-field-err" : ""}${form.email ? " ct-field-filled" : ""}`}>
                    <label className="ct-label">{t("contact.field_email")} <span className="ct-req">*</span></label>
                    <div className="ct-input-wrap">
                      <span className="ct-input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <input className="ct-input" name="email" type="email" value={form.email} onChange={ch} onBlur={blur} placeholder={t("contact.field_email_ph")} />
                    </div>
                    {errors.email && touched.email && <span className="ct-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.email}</span>}
                  </div>

                  {/* Telefon */}
                  <div className={`ct-field${form.phone ? " ct-field-filled" : ""}`}>
                    <label className="ct-label">{t("contact.field_phone")}</label>
                    <div className="ct-input-wrap">
                      <span className="ct-input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-8.6-3.1 19.5 19.5 0 01-6-6 20 20 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7 13 13 0 00.7 2.8 2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.7 2z"/></svg>
                      </span>
                      <input className="ct-input" name="phone" type="tel" value={form.phone} onChange={ch} onBlur={blur} placeholder={t("contact.field_phone_ph")} />
                    </div>
                  </div>

                  {/* Mövzu */}
                  <div className={`ct-field${errors.subject && touched.subject ? " ct-field-err" : ""}${form.subject ? " ct-field-filled" : ""}`}>
                    <label className="ct-label">{t("contact.field_subject")} <span className="ct-req">*</span></label>
                    <div className="ct-input-wrap ct-select-wrap">
                      <span className="ct-input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      </span>
                      <select className="ct-input ct-select" name="subject" value={form.subject} onChange={ch} onBlur={blur}>
                        <option value="">{t("contact.field_subject_ph")}</option>
                        <option>{t("contact.subject_product")}</option>
                        <option>{t("contact.subject_order")}</option>
                        <option>{t("contact.subject_delivery")}</option>
                        <option>{t("contact.subject_complaint")}</option>
                        <option>{t("contact.subject_other")}</option>
                      </select>
                      <span className="ct-chevron">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                    {errors.subject && touched.subject && <span className="ct-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.subject}</span>}
                  </div>

                  {/* Mesaj */}
                  <div className={`ct-field ct-fcol2${errors.message && touched.message ? " ct-field-err" : ""}${form.message ? " ct-field-filled" : ""}`}>
                    <label className="ct-label">{t("contact.field_message")} <span className="ct-req">*</span></label>
                    <div className="ct-input-wrap ct-ta-wrap">
                      <textarea className="ct-input ct-ta" name="message" value={form.message} onChange={ch} onBlur={blur} rows={5} placeholder={t("contact.field_message_ph")} />
                      <span className="ct-char-count">{form.message.length}/2000</span>
                    </div>
                    {errors.message && touched.message && <span className="ct-err"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.message}</span>}
                  </div>
                </div>

                {serverErr && (
                  <div className="ct-server-err">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {serverErr}
                  </div>
                )}

                <div className="ct-form-footer">
                  <p className="ct-privacy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Məlumatlarınız təhlükəsizdir
                  </p>
                  <button className="ct-btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <><span className="ct-spinner" />{t("contact.sending")}</>
                    ) : (
                      <>{t("contact.send_btn")}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}