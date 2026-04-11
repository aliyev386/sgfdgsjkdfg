import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setLang } from "../../store/slices/langSlice";
import { logoutAction, selectIsAuth } from "../../store/slices/authSlice";
import { logout as apiLogout } from "../../api/authApi";
import { selectCartCount } from "../../store/slices/cartSlice";
import CartDrawer from "../cart/CartDrawer";
import cartApi from "../../api/cartApi";
import { setCart } from "../../store/slices/cartSlice";
import "../../assets/pagesCss/Navbar.css";
import { useAuthModal } from "../../hooks/useAuthModal";

const LANGUAGES = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];
const IconLogin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openAuthModal } = useAuthModal();

  const isAuth = useSelector(selectIsAuth);
  const cartCount = useSelector(selectCartCount);
  const activeLng = i18n.language || "az";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isAuth) {
      cartApi.get().then(cart => { if (cart) dispatch(setCart(cart)); }).catch(() => { });
    }
  }, [isAuth, dispatch]);

  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLangChange = (code) => {
    dispatch(setLang(code));
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error(error); // istəyə görə
    }
    dispatch(logoutAction());
    navigate("/");
  };
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <>
      <nav className={`arv-nav${scrolled ? " scrolled" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        <Link to="/" className="arv-logo"><span>AMORE</span> MEBEL</Link>
        <ul className={`arv-nav-links${mobileOpen ? " mobile-visible" : ""}`}>
          <li><Link to="/collections" className={isActive("/collections")}>{t("nav.collections")}</Link></li>
          <li><Link to="/categories" className={isActive("/categories")}>{t("nav.shop")}</Link></li>
          <li><Link to="/about" className={isActive("/about")}>{t("nav.story")}</Link></li>
          <li><Link to="/contact" className={isActive("/contact")}>{t("nav.contact")}</Link></li>
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
            ? <>
              <button className="arv-nav-icon" onClick={() => navigate("/profile")}>
                <img src="/images/user (1).png" alt="" />
              </button>

              <button className="arv-nav-icon" onClick={handleLogout}>
                <IconLogout />
                {t("nav.logout") || "Çıxış"}
              </button>
            </>
            : <button className="arv-nav-icon" onClick={() => navigate("/login")}>
              <IconLogin />
              {t("nav.login") || "Giriş"}
            </button>
          }
          <button className="arv-nav-mobile-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menyu">
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {mobileOpen && <div className="arv-nav-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}