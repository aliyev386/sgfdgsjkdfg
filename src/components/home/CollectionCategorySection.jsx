import { Link } from "react-router-dom";

export function CollectionCategorySection({ categories = [], t, onNavigate }) {
  const [first, ...rest] = categories;

  return (
    <section className="hp-sec hp-cream" id="categories">
      <div className="hp-sec-head">
        <div>
          <div className="hp-ey">{t("categories.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("categories.title")} <em>{t("categories.title_em")}</em>
          </h2>
        </div>
        <Link to="/collections" className="hp-va">
          {t("categories.view_all")} <span className="arr">→</span>
        </Link>
      </div>

      <div className="hp-cat-grid">
        {/* Böyük kart — ilk kateqoriya */}
        {first && (
          <Link
            to={`/category/${first.slug}`}
            className="hp-cat-card hp-cat-big"
            style={{ textDecoration: "none" }}
          >
            {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
            <img className="hp-cat-img" src={first.image} alt={first.name} loading="lazy" />
            <div className="hp-cat-ov" />
            <div className="hp-cat-inf">
              <p className="hp-cat-tag">{t("categories.eyebrow")}</p>
              <h3 className="hp-cat-nm">{first.name}</h3>
              <p className="hp-cat-cnt">{first.product_count} pieces</p>
              <button className="hp-cat-cta">{t("categories.explore")} →</button>
            </div>
          </Link>
        )}

        {/* Qalan kartlar */}
        {rest.slice(0, 4).map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="hp-cat-card"
            style={{ textDecoration: "none" }}
          >
            <img className="hp-cat-img" src={cat.image} alt={cat.name} loading="lazy" />
            <div className="hp-cat-ov" />
            <div className="hp-cat-inf">
              <p className="hp-cat-tag">{t("categories.eyebrow")}</p>
              <h3 className="hp-cat-nm">{cat.name}</h3>
              <p className="hp-cat-cnt">{cat.product_count} pieces</p>
              <button className="hp-cat-cta">{t("categories.explore")} →</button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
