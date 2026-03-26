import { Link } from "react-router";

export default function CategoriesGrid({ t, visibleCategories, INITIAL_VISIBLE, PLACEHOLDER_IMGS }) {
  // İlk 3 kateqoriya üçün xüsusi grid: 1 böyük (solda), 2 balaca (sağda, üst-alt)
  const featuredCount = Math.min(3, visibleCategories.length);
  const featured = visibleCategories.slice(0, featuredCount);
  const rest = visibleCategories.slice(3);
  
  // Böyük kart — ilk element
  const largeCard = featured[0];
  // Balaca kartlar — 2-ci və 3-cü
  const smallCards = featured.slice(1, 3);

  return (
    <div className="cl-grid-container">
      {/* FEATURED SECTION — 1 böyük + 2 balaca */}
      {featured.length > 0 && (
        <div className="cl-featured-grid">
          {/* BÖYÜK KART — sol tərəf */}
          {largeCard && (
            <Link
              key={largeCard.id}
              to={`/furniture-categories/${largeCard.id}`}
              className="cl-card cl-card-large anim"
              style={{ animationDelay: `0s` }}
            >
              <div className="cl-card-iw">
                <img
                  className="cl-card-img"
                  src={
                    largeCard.image ||
                    largeCard.cover_image ||
                    largeCard.image_url ||
                    PLACEHOLDER_IMGS[0]
                  }
                  alt={largeCard.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMGS[0];
                  }}
                />
                <div className="cl-card-ov" />
              </div>
              <div className="cl-card-info">
                {largeCard.room_type && largeCard.room_type !== "other" && (
                  <p className="cl-card-room">
                    {t(`cat_list.rooms.${largeCard.room_type}`, largeCard.room_type)}
                  </p>
                )}
                <h3 className="cl-card-name">{largeCard.name}</h3>
                {largeCard.product_count != null && (
                  <p className="cl-card-cnt">
                    {largeCard.product_count} {t("cat_list.products_count")}
                  </p>
                )}
                <span className="cl-card-cta">
                  {t("cat_list.explore_btn")}
                  <span className="cl-card-cta-arrow">→</span>
                </span>
              </div>
            </Link>
          )}

          {/* BALACA KARTLAR — sağ tərəf, üst-alt */}
          {smallCards.length > 0 && (
            <div className="cl-small-stack">
              {smallCards.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/furniture-categories/${cat.id}`}
                  className="cl-card cl-card-small anim"
                  style={{ animationDelay: `${(i + 1) * 0.06}s` }}
                >
                  <div className="cl-card-iw">
                    <img
                      className="cl-card-img"
                      src={
                        cat.image ||
                        cat.cover_image ||
                        cat.image_url ||
                        PLACEHOLDER_IMGS[i + 1]
                      }
                      alt={cat.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMGS[i + 1];
                      }}
                    />
                    <div className="cl-card-ov" />
                  </div>
                  <div className="cl-card-info">
                    {cat.room_type && cat.room_type !== "other" && (
                      <p className="cl-card-room">
                        {t(`cat_list.rooms.${cat.room_type}`, cat.room_type)}
                      </p>
                    )}
                    <h3 className="cl-card-name">{cat.name}</h3>
                    {cat.product_count != null && (
                      <p className="cl-card-cnt">
                        {cat.product_count} {t("cat_list.products_count")}
                      </p>
                    )}
                    <span className="cl-card-cta">
                      {t("cat_list.explore_btn")}
                      <span className="cl-card-cta-arrow">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QALAN KARTLAR — adi 4 sütunlu grid */}
      {rest.length > 0 && (
        <div className="cl-rest-grid">
          {rest.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/furniture-categories/${cat.id}`}
              className="cl-card anim"
              style={{ animationDelay: `${(i + 3) * 0.06}s` }}
            >
              <div className="cl-card-iw">
                <img
                  className="cl-card-img"
                  src={
                    cat.image ||
                    cat.cover_image ||
                    cat.image_url ||
                    PLACEHOLDER_IMGS[(i + 3) % PLACEHOLDER_IMGS.length]
                  }
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMGS[(i + 3) % PLACEHOLDER_IMGS.length];
                  }}
                />
                <div className="cl-card-ov" />
              </div>
              <div className="cl-card-info">
                {cat.room_type && cat.room_type !== "other" && (
                  <p className="cl-card-room">
                    {t(`cat_list.rooms.${cat.room_type}`, cat.room_type)}
                  </p>
                )}
                <h3 className="cl-card-name">{cat.name}</h3>
                {cat.product_count != null && (
                  <p className="cl-card-cnt">
                    {cat.product_count} {t("cat_list.products_count")}
                  </p>
                )}
                <span className="cl-card-cta">
                  {t("cat_list.explore_btn")}
                  <span className="cl-card-cta-arrow">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}