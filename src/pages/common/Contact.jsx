// src/pages/public/ContactPage.jsx
import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "80px", minHeight: "60vh", maxWidth: 700, margin: "0 auto", padding: "120px 40px 80px", fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ fontSize: 11, letterSpacing: "3.5px", textTransform: "uppercase", color: "#7A9E7E", marginBottom: 16 }}>
          ƏLAQƏ
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px,5vw,64px)", fontWeight: 300, color: "#1C1C1C", lineHeight: 1.1, marginBottom: 48 }}>
          Bizimlə <em style={{ fontStyle: "italic", color: "#7A9E7E" }}>əlaqə</em>
        </h1>
        {sent ? (
          <div style={{ background: "#EAF3EB", border: "1px solid #C8DBC9", padding: "24px 32px", fontSize: 15, color: "#2E6B32" }}>
            ✓ Mesajınız göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { name: "name", label: "Ad Soyad", type: "text", ph: "Adınız" },
              { name: "email", label: "E-poçt", type: "email", ph: "email@example.com" },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>{f.label}</label>
                <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.ph} required
                  style={{ width: "100%", padding: "13px 16px", border: "1px solid #E5DDD4", background: "#F7F3EE", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>Mesaj</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={5} placeholder="Mesajınızı yazın..." required
                style={{ width: "100%", padding: "13px 16px", border: "1px solid #E5DDD4", background: "#F7F3EE", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", resize: "vertical" }} />
            </div>
            <button type="submit"
              style={{ padding: "15px 40px", background: "#1C1C1C", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", alignSelf: "flex-start", transition: "background .3s" }}
              onMouseEnter={e => e.target.style.background = "#7A9E7E"}
              onMouseLeave={e => e.target.style.background = "#1C1C1C"}>
              Göndər →
            </button>
          </form>
        )}
        <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {[
            { label: "Ünvan", value: "Bakı, Nizami küçəsi 12" },
            { label: "Telefon", value: "+994 12 345 67 89" },
            { label: "E-poçt", value: "info@amoremebel.az" },
            { label: "İş saatları", value: "B.e – Ş: 09:00 – 19:00" },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>{item.label}</p>
              <p style={{ fontSize: 14, color: "#1C1C1C" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}