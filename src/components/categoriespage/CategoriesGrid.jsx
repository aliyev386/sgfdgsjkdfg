import { Link } from "react-router";

export default function CategoriesGrid({ t, visibleCategories, INITIAL_VISIBLE, PLACEHOLDER_IMGS }) {
  const featuredCount = Math.min(3, visibleCategories.length);
  const featured = visibleCategories.slice(0, featuredCount);
  const rest = visibleCategories.slice(3);
  
  const largeCard = featured[0];
  const smallCards = featured.slice(1, 3);

  return (
    <div className="cl-grid-container">
      {featured.length > 0 && (
        <div className="cl-featured-grid">
          {largeCard && (
            <Link
              key={largeCard.id}
              to={`/category/${largeCard.id}`}
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
          {smallCards.length > 0 && (
            <div className="cl-small-stack">
              {smallCards.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
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
              to={`/category/${cat.id}`}
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