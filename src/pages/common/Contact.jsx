import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/ContactPage.css";

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name:"", email:"", phone:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);

  const ch = e => setForm(p=>({...p,[e.target.name]:e.target.value}));

  const handleSubmit = async () => {
    if(!form.name||!form.email||!form.message) return;
    await new Promise(r=>setTimeout(r,600));
    setSent(true);
  };

  return (
    <>
      <Navbar/>
      <div className="ct-page">
        <div className="ct-hero">
          <div className="ct-hero-inner">
            <p className="ct-eyebrow">Əlaqə</p>
            <h1 className="ct-title">Sizinlə danışmağa<br/>hazırıq</h1>
            <p className="ct-subtitle">Sualınız, təklifiniz və ya sifarişiniz üçün bizimlə əlaqə saxlayın.</p>
          </div>
        </div>

        <div className="ct-body">
          <div className="ct-info">
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                label:"Ünvan",
                value:"Nizami küçəsi 65, Bakı, Azərbaycan"
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-8.6-3.1 19.5 19.5 0 01-6-6 20 20 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7 13 13 0 00.7 2.8 2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.7 2z"/></svg>,
                label:"Telefon",
                value:"+994 12 555 00 11"
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                label:"E-poçt",
                value:"info@amoremebel.az"
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                label:"İş saatları",
                value:"B.e – Şənbə: 09:00 – 19:00"
              },
            ].map((item,i) => (
              <div key={i} className="ct-info-card" style={{animationDelay:`${i*.07}s`}}>
                <div className="ct-info-ico">{item.icon}</div>
                <div>
                  <p className="ct-info-label">{item.label}</p>
                  <p className="ct-info-val">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="ct-form-wrap">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="ct-success-title">Mesajınız göndərildi</h3>
                <p className="ct-success-sub">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
                <button className="ct-btn-primary" style={{marginTop:16}} onClick={()=>setSent(false)}>Yenidən göndər</button>
              </div>
            ) : (
              <>
                <h2 className="ct-form-title">Mesaj göndərin</h2>
                <div className="ct-fg">
                  <div className="ct-field">
                    <label className="ct-label">Ad Soyad</label>
                    <input className="ct-input" name="name" value={form.name} onChange={ch} placeholder="Adınız"/>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">E-poçt</label>
                    <input className="ct-input" name="email" type="email" value={form.email} onChange={ch} placeholder="email@domain.az"/>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Telefon</label>
                    <input className="ct-input" name="phone" type="tel" value={form.phone} onChange={ch} placeholder="+994 50 ..."/>
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Mövzu</label>
                    <select className="ct-input" name="subject" value={form.subject} onChange={ch}>
                      <option value="">Seçin...</option>
                      <option>Məhsul haqqında sual</option>
                      <option>Sifariş statusu</option>
                      <option>Çatdırılma</option>
                      <option>Şikayət</option>
                      <option>Digər</option>
                    </select>
                  </div>
                  <div className="ct-field ct-fcol2">
                    <label className="ct-label">Mesaj</label>
                    <textarea className="ct-input ct-ta" name="message" value={form.message} onChange={ch} rows={5} placeholder="Mesajınızı yazın..."/>
                  </div>
                </div>
                <button className="ct-btn-primary" onClick={handleSubmit} disabled={!form.name||!form.email||!form.message}>
                  Göndər
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}