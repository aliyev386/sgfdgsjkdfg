// src/components/home/CtaBanner.jsx
import { Link } from "react-router-dom";
import "../../assets/css/HomeCss/CtaBanner.css";

export default function CTABanner({ t }) {
  return (
    <div className="hp-cta" id="contact">
      <div className="hp-cta-t">
        <p className="hp-cta-ey">{t("cta_banner.eyebrow")}</p>
        <h2 className="hp-cta-h">
          {t("cta_banner.title")}<br />
          <em>{t("cta_banner.title_em")}</em>
        </h2>
        <p className="hp-cta-sub">{t("cta_banner.subtitle")}</p>
      </div>
      <div className="hp-cta-acts">
        <Link to="/shop"    className="btn-white">{t("cta_banner.btn_primary")} →</Link>
        <Link to="/contact" className="btn-outline-white">{t("cta_banner.btn_secondary")}</Link>
      </div>
    </div>
  );
}
