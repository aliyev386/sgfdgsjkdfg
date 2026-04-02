// src/pages/public/ProductDetailPage.jsx
// Route: /details/:id  — CollectionDetails dizayn dili ilə uyğunlaşdırılmış

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CreditCalculator, { calcCredit, AZ_BANKS } from "../../components/credit/CreditCalculator";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistStore";
import cartApi    from "../../api/cartApi";
import productApi from "../../api/productApi";
import Navbar     from "../../components/common/Navbar";
import Footer     from "../../components/common/Footer";
import "../../assets/pagesCss/ProductDetail.css";

const fmt = (n) => `₼${Number(n).toLocaleString()}`;
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

// ── STARS ────────────────────────────────────────────────────
function Stars({ n, size = 13 }) {
  return (
    <span className="pdp-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={"pdp-star" + (i < Math.round(n) ? " on" : "")} style={{ fontSize: size }}>★</span>
      ))}
    </span>
  );
}

// ── RELATED CARD ─────────────────────────────────────────────
const RelCard = memo(function RelCard({ item, t }) {
  const navigate = useNavigate();
  return (
    <div className="pdp-rel-card" onClick={() => navigate(`/details/${item.id}`)}>
      <div className="pdp-rel-img-wrap">
        <img className="pdp-rel-img" src={item.image} alt={item.name} loading="lazy" />
        {item.old_price && (
          <span className="pdp-rel-badge">−{Math.round(((item.old_price - item.price) / item.old_price) * 100)}%</span>
        )}
        <div className="pdp-rel-hover">
          <span>{t("pdp.view_product")}</span>
        </div>
      </div>
      <div className="pdp-rel-body">
        <h4 className="pdp-rel-name">{item.name}</h4>
        <Stars n={item.rating} />
        <div className="pdp-rel-prices">
          <span className="pdp-rel-price">{fmt(item.price)}</span>
          {item.old_price && <span className="pdp-rel-old">{fmt(item.old_price)}</span>}
        </div>
      </div>
    </div>
  );
});

// ── ICON SVGs ────────────────────────────────────────────────
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHeart = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDelivery = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4"/>
  </svg>
);
const IconReturn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M3 12a9 9 0 109-9H8M8 7l-5 2 2 5"/>
  </svg>
);

// ── PAGE ─────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id: productId } = useParams();
  const { t }             = useTranslation();
  const navigate          = useNavigate();
  const dispatch          = useDispatch();
  const lang              = useSelector(selectLang);
  const wishlist          = useSelector(s => s.wishlist.items);

  const [product,    setProduct]    = useState(null);
  const [related,    setRelated]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [activeImg,  setActiveImg]  = useState(0);
  const [lbOpen,     setLbOpen]     = useState(false);

  const [selColor,   setSelColor]   = useState(null);
  const [selSize,    setSelSize]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [activeTab,  setActiveTab]  = useState("description");

  const [cartAdding, setCartAdding] = useState(false);
  const [buyAdding,  setBuyAdding]  = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [toast,      setToast]      = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setActiveImg(0); setSelColor(null); setSelSize(null); setQty(1);
    window.scrollTo({ top: 0 });

    productApi.getById(productId)
      .then(p => {
        const imgs = (p.images || []).map(i => i.imageUrl).filter(Boolean);
        const mapped = {
          id:           p.id,
          name:         p.name,
          price:        p.discountPrice ?? p.price,
          old_price:    p.discountPrice ? p.price : null,
          badge:        p.label || null,
          rating:       4,
          review_count: 0,
          in_stock:     p.stock > 0,
          stock_qty:    p.stock,
          sku:          `ARV-${p.id}`,
          images:       imgs.length ? imgs : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&q=90"],
          colors:       (p.colors || []).map(c => ({ value: c.name, label: c.name, hex: c.hexCode })),
          materials:    p.material ? [p.material] : [],
          sizes:        [],
          description:  p.description || "",
          specs:        [],
          reviews:      [],
          category:     { id: p.furnitureCategoryId, name: p.categoryName || "" },
        };
        setProduct(mapped);

        if (p.furnitureCategoryId) {
          productApi.getByCategory(p.furnitureCategoryId, { page: 1, pageSize: 4 })
            .then(r => {
              const arr = (r?.data ?? []).filter(x => x.id !== p.id).slice(0, 4);
              setRelated(arr.map(x => ({
                id:        x.id,
                name:      x.name,
                price:     x.discountPrice ?? x.price,
                old_price: x.discountPrice ? x.price : null,
                rating:    4,
                image:     x.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
              })));
            })
            .catch(() => {});
        }
      })
      .catch(() => navigate("/categories"))
      .finally(() => setLoading(false));
  }, [productId, lang, navigate]);

  const isSaved = product ? wishlist.some(w => w.id === product.id) : false;

  const doCart = useCallback(async (setBusy) => {
    if (!product?.in_stock || cartAdding || buyAdding) return;
    setBusy(true);
    try {
      const cart = await cartApi.addItem({ productId: product.id, selectedColor: selColor, quantity: qty });
      if (cart) dispatch(setCart(cart));
      clearTimeout(toastTimer.current);
      setToast(`${qty}× ${product.name} səbətə əlavə edildi`);
      toastTimer.current = setTimeout(() => setToast(null), 2900);
    } catch {}
    setTimeout(() => setBusy(false), 1300);
  }, [product, qty, selColor, cartAdding, buyAdding, dispatch]);

  const handleSave = useCallback(() => {
    if (!product) return;
    dispatch(toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.images[0] }));
  }, [product, dispatch]);

  // Lightbox keyboard
  useEffect(() => {
    if (!lbOpen || !product?.images?.length) return;
    const h = (e) => {
      if (e.key === "Escape")     setLbOpen(false);
      if (e.key === "ArrowLeft")  setActiveImg(i => (i - 1 + product.images.length) % product.images.length);
      if (e.key === "ArrowRight") setActiveImg(i => (i + 1) % product.images.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lbOpen, product?.images?.length]);

  // ── LOADING ──────────────────────────────────────────────
  if (loading) return (
    <div className="pdp-page">
      <Navbar />
      <div className="pdp-loading-page">
        <div className="pdp-loading-inner">
          <div className="pdp-loader-ring" />
          <span className="pdp-loading-text">{t("common.loading")}</span>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!product) return null;

  const save        = product.old_price ? product.old_price - product.price : 0;
  const discPct     = product.old_price ? Math.round((save / product.old_price) * 100) : 0;
  const defaultBank = AZ_BANKS[0];
  const previewChips = [
    { months: 4,  val: (product.price * 0.8 / 4).toFixed(2),   badge: "0%", label: "4 ay" },
    { months: 12, val: calcCredit({ price: product.price, downPct: 20, months: 12, bankRate: defaultBank.rate12 }).monthly.toFixed(2), badge: null, label: "12 ay" },
    { months: 24, val: calcCredit({ price: product.price, downPct: 20, months: 24, bankRate: defaultBank.rate24 }).monthly.toFixed(2), badge: null, label: "24 ay" },
  ];

  const tabs = [
    { key: "description",    label: t("pdp.tab_description") },
    { key: "specifications", label: t("pdp.tab_specs") },
    { key: "reviews",        label: `${t("pdp.tab_reviews")} (${product.review_count})` },
  ];

  return (
    <div className="pdp-page">
      <Navbar />

      {/* BREADCRUMB */}
      <nav className="pdp-breadcrumb">
        <Link to="/">{t("pdp.home")}</Link>
        <span className="pdp-bc-sep">/</span>
        <Link to="/furniture-categories">{t("pdp.categories")}</Link>
        <span className="pdp-bc-sep">/</span>
        <Link to={`/furniture-categories/${product.category.id}`}>{product.category.name}</Link>
        <span className="pdp-bc-sep">/</span>
        <span className="pdp-bc-cur">{product.name}</span>
      </nav>

      {/* SPLIT */}
      <div className="pdp-split">

        {/* LEFT: GALLERY */}
        <div className="pdp-gallery">
          <div className="pdp-main-img-wrap" onClick={() => setLbOpen(true)}>
            <img className="pdp-main-img" src={product.images[activeImg]} alt={product.name} />
            {product.badge && (
              <span className="pdp-img-badge" style={{ background: BADGE_CLR[product.badge] || "#7A9E7E" }}>
                {product.badge}
              </span>
            )}
            {!product.in_stock && (
              <div className="pdp-oos-overlay">
                <span className="pdp-oos-label">{t("common.out_of_stock")}</span>
              </div>
            )}
            <div className="pdp-zoom-hint">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                <path d="M8 3H3v5M3 3l6 6M12 17h5v-5M17 17l-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <div key={i} className={`pdp-thumb${activeImg === i ? " active" : ""}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: INFO */}
        <div className="pdp-info">
          <div className="pdp-eyebrow">
            <Link to={`/furniture-categories/${product.category.id}`} className="pdp-cat-link">
              {product.category.name}
            </Link>
          </div>

          <h1 className="pdp-name">
            {product.name.split(" ").slice(0, -1).join(" ")}{" "}
            <em>{product.name.split(" ").slice(-1)[0]}</em>
          </h1>

          {/* Rating row */}
          <div className="pdp-rating-row">
            <Stars n={product.rating} size={14} />
            <span className="pdp-rating-n">{product.rating}</span>
            <button className="pdp-reviews-link" onClick={() => setActiveTab("reviews")}>
              {product.review_count} {t("pdp.reviews")}
            </button>
            <span className="pdp-sku">SKU: {product.sku}</span>
          </div>

          {/* Price */}
          <div className="pdp-price-block">
            <span className="pdp-price">{fmt(product.price)}</span>
            {product.old_price && <span className="pdp-price-old">{fmt(product.old_price)}</span>}
            {save > 0 && <span className="pdp-price-save">−{discPct}%</span>}
          </div>
          <p className="pdp-price-label">{t("pdp.inc_vat")}</p>

          {/* Stock */}
          <div className="pdp-stock-row">
            <div className={`pdp-stock-dot${product.in_stock ? " green" : " red"}`} />
            <span className="pdp-stock-txt" style={{ color: product.in_stock ? "#4A8A50" : "#C94B4B" }}>
              {product.in_stock
                ? `${t("pdp.in_stock")} (${product.stock_qty} ${t("pdp.left")})`
                : t("common.out_of_stock")}
            </span>
          </div>

          {/* Meta */}
          <div className="pdp-meta">
            {product.category.name && (
              <div className="pdp-meta-row">
                <span className="pdp-meta-label">{t("pdp.categories")}</span>
                <span className="pdp-meta-val">{product.category.name}</span>
              </div>
            )}
            {product.materials.length > 0 && (
              <div className="pdp-meta-row">
                <span className="pdp-meta-label">Material</span>
                <span className="pdp-meta-val">{product.materials.join(", ")}</span>
              </div>
            )}
            <div className="pdp-meta-row">
              <span className="pdp-meta-label">SKU</span>
              <span className="pdp-meta-val">{product.sku}</span>
            </div>
          </div>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="pdp-opt-block">
              <p className="pdp-opt-label">
                {t("pdp.color")}:&nbsp;
                <span>{selColor ? product.colors.find(c => c.value === selColor)?.label : t("pdp.select")}</span>
              </p>
              <div className="pdp-colors">
                {product.colors.map(c => (
                  <button
                    key={c.value}
                    className={`pdp-color-swatch${selColor === c.value ? " active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="pdp-opt-block">
              <p className="pdp-opt-label">
                {t("pdp.size")}:&nbsp;
                <span>{selSize ? product.sizes.find(s => s.value === selSize)?.label : t("pdp.select")}</span>
              </p>
              <div className="pdp-sizes">
                {product.sizes.map(s => (
                  <button
                    key={s.value}
                    className={`pdp-size-btn${selSize === s.value ? " active" : ""}`}
                    onClick={() => setSelSize(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kredit preview chips */}
          <div className="pdp-credit-chips">
            <span className="pdp-credit-chips-label">Kreditlə:</span>
            <div className="pdp-credit-chips-row">
              {previewChips.map(p => (
                <button key={p.months} className="pdp-chip" onClick={() => setCreditOpen(true)}>
                  <span className="pdp-chip-price">₼{p.val}</span>
                  <span className="pdp-chip-label">×{p.months}</span>
                  {p.badge && <span className="pdp-chip-badge">{p.badge}</span>}
                </button>
              ))}
              <button className="pdp-chip-calc-link" onClick={() => setCreditOpen(o => !o)}>
                {creditOpen ? "Bağla ↑" : "Kalkulyator →"}
              </button>
            </div>
          </div>

          {/* Credit calculator accordion */}
          {creditOpen && (
            <div className="pdp-credit-body">
              <div className="pdp-credit-body-head">
                <p className="pdp-credit-body-title">Kredit <em>Kalkulyatoru</em></p>
                <button className="pdp-credit-close" onClick={() => setCreditOpen(false)}>✕</button>
              </div>
              <CreditCalculator price={product.price} compact={false} />
            </div>
          )}

          {/* QTY + CTA */}
          <div className="pdp-cta-row">
            <div className="pdp-qty">
              <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="pdp-qty-val">{qty}</span>
              <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}>+</button>
            </div>
            <button
              className={`pdp-btn-buy${buyAdding ? " adding" : ""}`}
              disabled={!product.in_stock || cartAdding || buyAdding}
              onClick={() => doCart(setBuyAdding)}
            >
              {buyAdding ? `✓ ${t("pdp.added")}` : t("pdp.buy_now")}
            </button>
          </div>

          <div className="pdp-secondary-row">
            <button
              className={`pdp-btn-cart${cartAdding ? " adding" : ""}`}
              disabled={!product.in_stock || cartAdding || buyAdding}
              onClick={() => doCart(setCartAdding)}
            >
              <IconCart />
              {cartAdding ? "Əlavə edildi ✓" : t("pdp.add_to_cart")}
            </button>
            <button
              className={`pdp-btn-wish${isSaved ? " saved" : ""}`}
              onClick={handleSave}
              title={isSaved ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
            >
              <IconHeart filled={isSaved} />
              <span>{isSaved ? t("pdp.saved") : t("pdp.save_wishlist")}</span>
            </button>
          </div>

          {/* Perks */}
          <div className="pdp-perks">
            <div className="pdp-perk">
              <div className="pdp-perk-icon"><IconDelivery /></div>
              <div className="pdp-perk-text">
                <strong>{t("pdp.perk_delivery_title")}</strong>
                {t("pdp.perk_delivery_desc")}
              </div>
            </div>
            <div className="pdp-perk">
              <div className="pdp-perk-icon"><IconShield /></div>
              <div className="pdp-perk-text">
                <strong>{t("pdp.perk_guarantee_title")}</strong>
                {t("pdp.perk_guarantee_desc")}
              </div>
            </div>
            <div className="pdp-perk">
              <div className="pdp-perk-icon"><IconReturn /></div>
              <div className="pdp-perk-text">
                <strong>{t("pdp.perk_returns_title")}</strong>
                {t("pdp.perk_returns_desc")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="pdp-section-divider"><div className="pdp-section-divider-line" /></div>

      {/* TABS */}
      <section className="pdp-tabs-section">
        <div className="pdp-tab-bar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`pdp-tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="pdp-tab-panel">
            <p className="pdp-desc">{product.description || t("pdp.no_description")}</p>
            {product.materials.length > 0 && (
              <div className="pdp-mat-chips">
                {product.materials.map(m => <span key={m} className="pdp-mat-chip">{m}</span>)}
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="pdp-tab-panel">
            {product.specs.length > 0 ? (
              <div className="pdp-specs-grid">
                {product.specs.map(s => (
                  <div key={s.label} className="pdp-spec-row">
                    <span className="pdp-spec-label">{s.label}</span>
                    <span className="pdp-spec-val">{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdp-empty-tab">
                <span className="pdp-empty-ic">📋</span>
                <p>Spesifikasiya məlumatı mövcud deyil.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="pdp-tab-panel">
            <div className="pdp-reviews-hero">
              <span className="pdp-rev-big-n">{product.rating}</span>
              <div className="pdp-rev-right">
                <Stars n={product.rating} size={18} />
                <span className="pdp-rev-label">{t("pdp.based_on")} {product.review_count} {t("pdp.tab_reviews").toLowerCase()}</span>
              </div>
            </div>
            {product.reviews.length > 0 ? (
              <div className="pdp-reviews-list">
                {product.reviews.map((r, i) => (
                  <div key={r.id} className="pdp-review-card" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="pdp-review-head">
                      <div>
                        <p className="pdp-rev-author">{r.author}</p>
                        <p className="pdp-rev-meta">{r.location} · {r.date}</p>
                      </div>
                      <Stars n={r.rating} size={13} />
                    </div>
                    <p className="pdp-rev-text">{r.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdp-empty-tab">
                <span className="pdp-empty-ic">💬</span>
                <p>Hələ ki rəy yoxdur.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="pdp-related">
          <div className="pdp-related-head">
            <div className="pdp-related-eyebrow">{t("pdp.explore_more_pre")}</div>
            <h2 className="pdp-related-title">
              {t("pdp.explore_more_pre")} <em>{t("pdp.explore_more_em")}</em>
            </h2>
            <Link to="/furniture-categories" className="pdp-see-all">{t("pdp.see_all")} →</Link>
          </div>
          <div className="pdp-related-grid">
            {related.map(item => <RelCard key={item.id} item={item} t={t} />)}
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="pdp-lb" onClick={() => setLbOpen(false)}>
          <button className="pdp-lb-close" onClick={() => setLbOpen(false)}>✕</button>
          {product.images.length > 1 && (
            <>
              <button className="pdp-lb-prev" onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + product.images.length) % product.images.length); }}>‹</button>
              <button className="pdp-lb-next" onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % product.images.length); }}>›</button>
            </>
          )}
          <img className="pdp-lb-img" src={product.images[activeImg]} alt={product.name} onClick={e => e.stopPropagation()} />
          {product.images.length > 1 && (
            <div className="pdp-lb-counter">{activeImg + 1} / {product.images.length}</div>
          )}
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="pdp-toast">
          <span className="pdp-toast-check">✓</span>
          <span><strong>{toast}</strong></span>
        </div>
      )}

      <Footer />
    </div>
  );
}