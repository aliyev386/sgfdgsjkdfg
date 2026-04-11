import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../assets/pagesCss/Footer.css";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo"><span>Amore</span> mebel</div>
          <p className="footer-desc">{t("footer.desc")}</p>
        </div>
        <div className="footer-col">
          <h4>{t("footer.quick_links")}</h4>
          <Link to="/">{t("footer.home")}</Link>
          <Link to="/about">{t("footer.about")}</Link>
          <Link to="/categories">{t("footer.products")}</Link>
          <Link to="/collections">{t("footer.collections")}</Link>
          <Link to="/contact">{t("footer.contact")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer.explore")}</h4>
          <Link to="/campaigns">{t("footer.campaigns")}</Link>
          <Link to="/categories">{t("footer.categories")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer.account")}</h4>
          <Link to="/profile">{t("footer.my_profile")}</Link>
          <Link to="/cart">{t("footer.cart")}</Link>
          <Link to="/login">{t("footer.login")}</Link>
          <Link to="/register">{t("footer.register")}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t("footer.copyright")}</p>
        <div className="socials">
          <a className="social-btn" href="#" aria-label="X (Twitter)">𝕏</a>
          <a className="social-btn" href="#" aria-label="Facebook">f</a>
          <a className="social-btn" href="#" aria-label="LinkedIn">in</a>
          <a className="social-btn" href="#" aria-label="YouTube">▶</a>
        </div>
      </div>
    </footer>
  );
}
