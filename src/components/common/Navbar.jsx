import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import CartDrawer from "../cart/CartDrawer";
import "../../assets/pagesCss/Navbar.css";

const LANGUAGES = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export default function Navbar() {
  const { t }    = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled,  setScrolled]  = useState(false);
  const [activeLng, setActiveLng] = useState(i18n.language || "az");
  const [cartOpen,  setCartOpen]  = useState(false);

  const cartCount = 3;
  const isAuth    = false;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    setActiveLng(code);
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <>
      <nav className={`arv-nav${scrolled ? " scrolled" : ""}`}>
        <Link to="/" className="arv-logo"><span>AMORE</span> MEBEL</Link>
        <ul className="arv-nav-links">
          <li><Link to="/collections" className={isActive("/collections")}>{t("nav.collections")}</Link></li>
          <li><Link to="/categories"  className={isActive("/categories")}>{t("nav.shop")}</Link></li>
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
              >
                {lng.label}
              </button>
            ))}
          </div>
          <button
            className="arv-nav-icon"
            aria-label={t("nav.cart")}
            onClick={() => setCartOpen(true)}
            style={{ position: "relative" }}
          >
            <img src="/images/online-shopping (1).png" alt="" />
            {cartCount > 0 && (
              <span className="arv-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </button>
          {isAuth
            ? <button className="arv-nav-icon" onClick={() => navigate("/profile")}><img src="/images/user (1).png" alt=""/></button>
            : <button className="arv-nav-icon" onClick={() => navigate("/login")}>Login</button>
          }
          <button className="arv-nav-mobile-toggle">☰</button>
        </div>
      </nav>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
