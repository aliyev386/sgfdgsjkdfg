// src/components/home/CollectionsSection.jsx
import { Link } from "react-router-dom";
import "../../assets/css/HomeCss/Collections.css";

export default function CollectionsSection({ collections = [], t }) {
  return (
    <section className="hp-sec" id="collections">
      <div className="hp-sec-head">
        <div>
          <div className="hp-ey">{t("collections.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("collections.title")} <em>{t("collections.title_em")}</em>
          </h2>
        </div>
        <Link to="/collections" className="hp-va">
          {t("collections.view_all")} <span className="arr">→</span>
        </Link>
      </div>

      <div className="hp-col-grid">
        {collections.map((col, i) => (
          <Link
            key={col.id}
            to={`/collections/${col.slug}`}
            className="hp-col-card"
            style={{
              animation: `hpFadeUp .7s cubic-bezier(.25,.46,.45,.94) ${i * 0.12}s both`,
              textDecoration: "none",
            }}
          >
            <div className="hp-col-iw">
              {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
              <img className="hp-col-img" src={col.image} alt={col.name} loading="lazy" />
            </div>
            <div
              className="hp-col-bar"
              style={{ background: col.accent || "#7A9E7E", marginTop: 20 }}
            />
            <div className="hp-col-inf">
              <h3 className="hp-col-nm">{col.name}</h3>
              <p className="hp-col-cnt">{col.product_count} pieces</p>
              {/* CTA — i18n */}
              <span className="hp-col-cta">{t("collections.explore")} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
