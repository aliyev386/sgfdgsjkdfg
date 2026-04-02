// src/pages/public/AboutPage.jsx
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "80px", minHeight: "60vh", maxWidth: 900, margin: "0 auto", padding: "120px 40px 80px", fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ fontSize: 11, letterSpacing: "3.5px", textTransform: "uppercase", color: "#7A9E7E", marginBottom: 16 }}>
          HAQQIMIZDA
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px,5vw,64px)", fontWeight: 300, color: "#1C1C1C", lineHeight: 1.1, marginBottom: 32 }}>
          Amore Mebel — <em style={{ fontStyle: "italic", color: "#7A9E7E" }}>Sənətkarlıq</em>
        </h1>
        <p style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.9, maxWidth: 640, marginBottom: 24 }}>
          2015-ci ildən bəri Azərbaycanın ən keyfiyyətli mebel brendlərindən biri kimi fəaliyyət göstəririk.
          Hər bir parça zövqlə seçilmiş materiallardan, peşəkar ustalar tərəfindən hazırlanır.
        </p>
        <p style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.9, maxWidth: 640 }}>
          Missiyamız — hər evin hər guşəsini daha gözəl, daha funksional etməkdir.
          Müştəri məmnuniyyəti bizim üçün hər şeydən önəmlidir.
        </p>
      </div>
      <Footer />
    </>
  );
}