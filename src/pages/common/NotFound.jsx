import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="nf-page">
        <div className="nf-bg-text">404</div>
        <div className="nf-inner">
          <div className="nf-label">{t("notfound.label")}</div>
          <h1 className="nf-title" dangerouslySetInnerHTML={{ __html: t("notfound.title") }}></h1>
          <p className="nf-desc">
            {t("notfound.desc")}
          </p>
          <div className="nf-actions">
            <button className="nf-btn-primary" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {t("notfound.home")}
            </button>
            <button className="nf-btn-ghost" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              {t("notfound.back")}
            </button>
          </div>
          <div className="nf-links">
            <span>{t("notfound.links.title")}</span>
            <a href="/categories">{t("notfound.links.products")}</a>
            <a href="/collections">{t("notfound.links.collections")}</a>
            <a href="/about">{t("notfound.links.about")}</a>
            <a href="/contact">{t("notfound.links.contact")}</a>
          </div>
        </div>
        <div className="nf-deco">
          <div className="nf-chair">
            <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="30" width="120" height="80" rx="12" fill="#EAE5DE" stroke="#D4C9BC" strokeWidth="2"/>
              <rect x="55" y="110" width="90" height="16" rx="6" fill="#D4C9BC"/>
              <rect x="50" y="126" width="10" height="64" rx="5" fill="#C4B9AC"/>
              <rect x="140" y="126" width="10" height="64" rx="5" fill="#C4B9AC"/>
              <rect x="68" y="150" width="10" height="40" rx="5" fill="#C4B9AC"/>
              <rect x="122" y="150" width="10" height="40" rx="5" fill="#C4B9AC"/>
              <rect x="40" y="30" width="120" height="50" rx="12" fill="#F2EDE7"/>
              <ellipse cx="100" cy="80" rx="45" ry="8" fill="#E8E1D9" opacity=".5"/>
            </svg>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
