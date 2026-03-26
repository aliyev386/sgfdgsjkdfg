import { Link } from "react-router";

export default function CategoriesGrid({ t, visibleCategories, INITIAL_VISIBLE, PLACEHOLDER_IMGS }) {
  return (
    <div className="cl-grid">
      {visibleCategories.map((cat, i) => (
        <Link
          key={cat.id}
          to={`/furniture-categories/${cat.id}`}
          className="cl-card anim"
          style={{ animationDelay: `${(i % INITIAL_VISIBLE) * 0.06}s` }}
        >
          <div className="cl-card-iw">
            <img
              className="cl-card-img"
              src={
                cat.image ||
                cat.cover_image ||
                PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]
              }
              alt={cat.name}
              loading="lazy"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length];
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
  );
}