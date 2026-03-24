// src/components/common/Navbar.jsx
// ─────────────────────────────────────────────────────────────
// Qlobal navbar.
// - Scroll-da frosted glass effekti
// - Dil seçici (AZ / EN / RU) → i18n.changeLanguage()
// - Cart badge → cartSlice-dan gəlir (store/cartSlice.js)
// - Auth vəziyyəti → authSlice-dan gəlir (store/authSlice.js)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import "../../assets/css/common/Navbar.css";

// TODO: Redux/Zustand store qoşulduqda bu import-ları açın
// import { useSelector } from "react-redux";
// import { selectCartCount } from "@/store/cartSlice";
// import { selectIsAuthenticated } from "@/store/authSlice";

const LANGUAGES = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled,  setScrolled]  = useState(false);
  const [activeLng, setActiveLng] = useState(i18n.language || "az");

  // TODO: Redux bağlandıqda bu line-ları açın:
  // const cartCount = useSelector(selectCartCount);
  // const isAuth    = useSelector(selectIsAuthenticated);
  const cartCount = 3;    // placeholder
  const isAuth    = false; // placeholder

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    setActiveLng(code);
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <>
      <nav className={`arv-nav${scrolled ? " scrolled" : ""}`}>

        <Link to="/" className="arv-logo">ARV<span>A</span>NA</Link>

        <ul className="arv-nav-links">
          <li><Link to="/collections" className={isActive("/collections")}>{t("nav.collections")}</Link></li>
          <li><Link to="/shop"        className={isActive("/shop")}>{t("nav.shop")}</Link></li>
          <li><Link to="/about"       className={isActive("/about")}>{t("nav.story")}</Link></li>
          <li><Link to="/contact"     className={isActive("/contact")}>{t("nav.contact")}</Link></li>
        </ul>
        <div className="arv-nav-right">

          <div className="arv-lang-switcher">
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                className={`arv-lang-btn${activeLng === lng.code ? " active" : ""}`}
                onClick={() => handleLangChange(lng.code)}
                aria-label={`Switch to ${lng.label}`}
              >
                {lng.label}
              </button>
            ))}
          </div>

          <button
            className="arv-nav-icon"
            aria-label={t("nav.search")}
            onClick={() => navigate("/search")}
          >🔍</button>

          <button
            className="arv-nav-icon"
            aria-label={t("nav.cart")}
            onClick={() => navigate("/cart")}
            style={{ position: "relative" }}
          >
            🛍
            {cartCount > 0 && (
              <span className="arv-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </button>

          {isAuth
            ? <button className="arv-nav-icon" onClick={() => navigate("/profile")}>👤</button>
            : <button className="arv-nav-icon" onClick={() => navigate("/login")}>👤</button>
          }

          <button className="arv-nav-mobile-toggle">☰</button>
        </div>
      </nav>
    </>
  );
}