// src/components/home/FeaturedProducts.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

function Stars({ n }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: "#C9A84C", fontSize: 11 }}>
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

const formatPrice = (price) => `$${Number(price).toLocaleString()}`;

export default function FeaturedProductsSection({ products = [], t }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { key: "all",    label: t("featured_products.tabs.all") },
    { key: "sofas",  label: t("featured_products.tabs.sofas") },
    { key: "chairs", label: t("featured_products.tabs.chairs") },
    { key: "tables", label: t("featured_products.tabs.tables") },
  ];

  const filtered = useMemo(() =>
    activeTab === "all"
      ? products
      : products.filter(p => p.category === activeTab),
    [activeTab, products]
  );

  return (
    <>
      <div className="hp-sec-head">
        <div>
          <div className="hp-ey">{t("featured_products.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("featured_products.title")} <em>{t("featured_products.title_em")}</em>
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20 }}>
          <div className="hp-prod-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`hp-prod-tab${activeTab === tab.key ? " a" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link to="/shop" className="hp-va">
            {t("featured_products.view_all")} <span className="arr">→</span>
          </Link>
        </div>
      </div>

      <div className="hp-prod-grid">
        {filtered.map((product, i) => (
          <div
            key={product.id}
            className="hp-prod-card"
            style={{ animation: `hpFadeUp .6s cubic-bezier(.25,.46,.45,.94) ${i * 0.08}s both` }}
          >
            <div className="hp-prod-iw">
              <img
                className="hp-prod-im"
                src={product.images?.[0]?.imageUrl || product.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80"}
                alt={product.name}
                loading="lazy"
              />
              <div className="hp-prod-acts">
                <button className="hp-prod-add">{t("common.add_to_cart")}</button>
                <button className="hp-prod-wish"><img src="\images\happiness (1).png" alt="" /></button>
              </div>
            </div>
            <div className="hp-prod-inf">
              <p className="hp-prod-cat">{product.categoryName || product.category || ""}</p>
              <Link to={`/details/${product.id}`} className="hp-prod-nm">
                {product.name}
              </Link>
              <div className="hp-prod-pr">
                <div>
                  <span className="hp-price">{formatPrice(product.discountPrice ?? product.price)}</span>
                  {product.discountPrice && (
                    <span className="hp-old-price">{formatPrice(product.price)}</span>
                  )}
                </div>
                <Stars n={product.rating ?? 4} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
