import { Link } from "react-router-dom";

const ICONS = {
  sofa:    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 28h36M6 28v8h36v-8M6 28c0-3.3 2.7-6 6-6h24c3.3 0 6 2.7 6 6M10 36v4M38 36v4M12 22v-6a4 4 0 014-4h16a4 4 0 014 4v6"/></svg>,
  bed:     <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 36V20M42 36V26M6 28h36M6 36h36M42 26H16a4 4 0 00-4 4v2h30v-2a4 4 0 00-4-4zM6 20h6v8"/><rect x="18" y="16" width="8" height="6" rx="1"/><rect x="28" y="16" width="8" height="6" rx="1"/><path d="M6 40v-4M42 40v-4"/></svg>,
  table:   <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="6" y="18" width="36" height="6" rx="2"/><path d="M12 24v14M36 24v14M18 38h12"/></svg>,
  chair:   <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M14 38V16a4 4 0 014-4h12a4 4 0 014 4v10M10 26h28M10 26v12M38 26v12M14 38h8M30 38h8"/></svg>,
  shelf:   <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="8" y="8" width="32" height="32" rx="2"/><path d="M8 20h32M8 32h32M16 8v12M16 32v8"/></svg>,
  dining:  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M24 8v32M8 20h32M10 36c0-8.8 6.3-16 14-16s14 7.2 14 16"/></svg>,
  desk:    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="6" y="16" width="36" height="6" rx="2"/><path d="M10 22v18M38 22v10M10 34h20M30 32h8M10 40h8"/></svg>,
  outdoor: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 36c0-8.8 7.2-16 16-16s16 7.2 16 16M6 36h36M14 36V26M34 36V26M18 36v-6a6 6 0 0112 0v6"/></svg>,
};

export default function ShopByCategory({ categories = [], t }) {
  return (
    <section className="sbc-sec hp-sec">
      <div className="hp-sec-head rv">
        <div>
          <div className="hp-ey">{t("shop_by_cat.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("shop_by_cat.title")} <em>{t("shop_by_cat.title_em")}</em>
          </h2>
          <p className="sbc-subtitle">{t("shop_by_cat.subtitle")}</p>
        </div>
        <Link to="/categories" className="hp-va">
          {t("shop_by_cat.view_all")} <span className="arr">→</span>
        </Link>
      </div>

      <div className="sbc-grid">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id || cat.slug}`}
            className="sbc-card rv"
            style={{ animationDelay: `${i * 0.07}s`, textDecoration: "none" }}
          >
            <div className="sbc-img-wrap">
              <img src={cat.image} alt={cat.name} className="sbc-img" loading="lazy"/>
              <div className="sbc-img-ov"/>
            </div>

            <div className="sbc-body">
              <div className="sbc-icon" style={{ background: cat.color }}>
                {ICONS[cat.icon]}
              </div>

              <div className="sbc-info">
                <h3 className="sbc-name">{cat.name}</h3>
              </div>

              <div className="sbc-arrow">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <span className="sbc-num">0{i + 1}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
