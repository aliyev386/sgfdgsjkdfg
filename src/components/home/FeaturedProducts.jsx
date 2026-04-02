// src/components/home/FeaturedProducts.jsx
import { useState, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import cartApi from "../../api/cartApi";
import { setCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistStore";

const ITEMS_PER_PAGE = 8;
const fmt = (p) => `₼${Number(p).toLocaleString()}`;

function Stars({ n }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: "#C9A84C", fontSize: 11 }}>{i < n ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default function FeaturedProductsSection({ products = [], categories = [], t }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const wishlist  = useSelector(s => s.wishlist.items);
  const [activeTab, setActiveTab] = useState("all");
  const [addingId,  setAddingId]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [visCount,  setVisCount]  = useState(ITEMS_PER_PAGE);
  const timerRef = useRef(null);

  // Dynamic tabs from API categories (max 4)
  const tabs = useMemo(() => [
    { key: "all", label: t("featured_products.tabs.all"), catId: null },
    ...categories.slice(0, 4).map(c => ({ key: String(c.id), label: c.name, catId: c.id })),
  ], [categories, t]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return products;
    const tab = tabs.find(tb => tb.key === activeTab);
    if (!tab?.catId) return products;
    return products.filter(p => String(p.furnitureCategoryId) === String(tab.catId));
  }, [activeTab, products, tabs]);

  const visible = filtered.slice(0, visCount);
  const hasMore = filtered.length > visCount;

  const handleTabChange = (key) => { setActiveTab(key); setVisCount(ITEMS_PER_PAGE); };

  const handleAddToCart = useCallback(async (product) => {
    if (addingId === product.id) return;
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem({ productId: product.id, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      clearTimeout(timerRef.current);
      setToast(product.name);
      timerRef.current = setTimeout(() => setToast(null), 2800);
    } catch { /* not logged in / network */ }
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId, dispatch]);

  const handleWishlist = useCallback((product) => {
    dispatch(toggleWishlist({
      id: product.id, name: product.name, price: product.price,
      image: product.images?.[0]?.imageUrl || product.image,
    }));
  }, [dispatch]);

  const isWishlisted = (id) => wishlist.some(w => w.id === id);

  return (
    <>
      <div className="hp-sec-head">
        <div>
          <div className="hp-ey">{t("featured_products.eyebrow")}</div>
          <h2 className="hp-h2">{t("featured_products.title")} <em>{t("featured_products.title_em")}</em></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20 }}>
          <div className="hp-prod-tabs">
            {tabs.map(tab => (
              <button key={tab.key} className={`hp-prod-tab${activeTab === tab.key ? " a" : ""}`}
                onClick={() => handleTabChange(tab.key)}>{tab.label}</button>
            ))}
          </div>
          <Link to="/category" className="hp-va">{t("featured_products.view_all")} <span className="arr">→</span></Link>
        </div>
      </div>

      <div className="hp-prod-grid">
        {visible.map((product, i) => {
          const wished = isWishlisted(product.id);
          const adding = addingId === product.id;
          return (
            <div key={product.id} className="hp-prod-card"
              style={{ animation: `hpFadeUp .6s cubic-bezier(.25,.46,.45,.94) ${i * 0.08}s both` }}>
              <div className="hp-prod-iw">
                <img className="hp-prod-im"
                  src={product.images?.[0]?.imageUrl || product.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80"}
                  alt={product.name} loading="lazy"
                  onClick={() => navigate(`/details/${product.id}`)}
                  style={{ cursor: "pointer" }}
                />
                <div className="hp-prod-acts">
                  <button className={`hp-prod-add${adding ? " adding" : ""}`}
                    onClick={() => handleAddToCart(product)} disabled={adding}>
                    {adding ? "✓" : t("common.add_to_cart")}
                  </button>
                  <button className="hp-prod-wish"
                    onClick={() => handleWishlist(product)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px" }}>
                    <span style={{ fontSize: 22, color: wished ? "#e53e3e" : "#bbb", lineHeight: 1 }}>
                      {wished ? "♥" : "♡"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="hp-prod-inf">
                <p className="hp-prod-cat">{product.furnitureCategoryName || product.categoryName || ""}</p>
                <Link to={`/details/${product.id}`} className="hp-prod-nm">{product.name}</Link>
                <div className="hp-prod-pr">
                  <div>
                    <span className="hp-price">{fmt(product.discountPrice ?? product.price)}</span>
                    {product.discountPrice && <span className="hp-old-price">{fmt(product.price)}</span>}
                  </div>
                  <Stars n={product.rating ?? 4} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daha çox göstər */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button className="hp-va" onClick={() => setVisCount(v => v + ITEMS_PER_PAGE)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {t("featured_products.view_all")} <span className="arr">↓</span>
          </button>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: "#1a3a2a", color: "#fff", borderRadius: 12,
          padding: "12px 20px", fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)", animation: "hpFadeUp .3s ease both",
        }}>
          ✓ {toast} {t("fcp.added_to_cart")}
        </div>
      )}
    </>
  );
}
