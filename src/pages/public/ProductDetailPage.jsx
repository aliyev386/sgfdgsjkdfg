// src/pages/public/ProductDetailPage.jsx
// Route: /products/:slug

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CreditCalculator, { PERIODS, calcCredit, AZ_BANKS } from "../../components/credit/CreditCalculator";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart } from "../../store/slices/cartSlice";
import cartApi    from "../../api/cartApi";
import productApi from "../../api/productApi";
import Navbar     from "../../components/common/Navbar";
import Footer     from "../../components/common/Footer";
import "../../assets/pagesCss/ProductDetail.css";


// ── HELPERS ───────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

function Stars({ n, size=13 }) {
  return (
    <span className="pdp-stars">
      {Array.from({length:5}).map((_,i) => (
        <span key={i} className={"pdp-star" + (i < Math.round(n) ? " on" : "")} style={{fontSize:size}}>★</span>
      ))}
    </span>
  );
}

// ── RELATED CARD ──────────────────────────────────────────────
const RelCard = memo(function RelCard({ item, t }) {
  const navigate = useNavigate();
  const save = item.old_price ? item.old_price - item.price : 0;
  return (
    <div className="pdp-rel-card" onClick={() => navigate(`/details/${item.id}`)}>
      <div className="pdp-rel-img-wrap">
        <img className="pdp-rel-img" src={item.image} alt={item.name} loading="lazy" />
        {save > 0 && <span className="pdp-rel-badge">−{fmt(save)}</span>}
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


// ── PAGE ─────────────────────────────────────────────────────

// ── Installment quick-view chips ─────────────────────────
function InstallmentChips({ price }) {
  const [open, setOpen] = useState(false);
  const defaultBank = AZ_BANKS[0];
  const previews = [
    { months: 4,  val: (price * 0.8 / 4).toFixed(2),   tag: "0%", label:"4 ay"  },
    { months: 12, val: calcCredit({ price, downPct:20, months:12, bankRate: defaultBank.rate12 }).monthly.toFixed(2), tag: null, label:"12 ay" },
    { months: 24, val: calcCredit({ price, downPct:20, months:24, bankRate: defaultBank.rate24 }).monthly.toFixed(2), tag: null, label:"24 ay" },
  ];
  return (
    <div style={{ margin:"12px 0 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:10 }}>
        <span style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:"#6B6B6B" }}>Kreditlə:</span>
        {previews.map(p => (
          <button key={p.months} onClick={() => setOpen(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px",
              background:"#F7F3EE", border:"1px solid #E5DDD4", cursor:"pointer", fontSize:12,
              color:"#1C1C1C", fontFamily:"'DM Sans',sans-serif", transition:"all .2s", position:"relative" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#7A9E7E"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#E5DDD4"}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:300 }}>₼{p.val}</span>
            <span style={{ fontSize:10, color:"#6B6B6B" }}>×{p.months}</span>
            {p.tag && <span style={{ background:"#7A9E7E", color:"#fff", fontSize:8, fontWeight:700, padding:"2px 5px", position:"absolute", top:-8, right:-4 }}>{p.tag}</span>}
          </button>
        ))}
        <button onClick={() => setOpen(o => !o)}
          style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, letterSpacing:1,
            color:"#7A9E7E", fontFamily:"'DM Sans',sans-serif", textDecoration:"underline", textUnderlineOffset:3 }}>
          {open ? "Bağla ↑" : "Kalkulyator →"}
        </button>
      </div>
      {open && (
        <div style={{ border:"1px solid #E5DDD4", padding:24, background:"#F7F3EE", marginTop:8, animation:"pdpFadeUp .35s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300 }}>
              Kredit <em style={{ fontStyle:"italic", color:"#7A9E7E" }}>Kalkulyatoru</em>
            </p>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#6B6B6B" }}>✕</button>
          </div>
          <CreditCalculator price={price} />
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id: productId } = useParams();   // route: /details/:id
  const { t }             = useTranslation();
  const navigate          = useNavigate();
  const dispatch          = useDispatch();
  const lang              = useSelector(selectLang);

  const [product,    setProduct]    = useState(null);
  const [related,    setRelated]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [activeImg,  setActiveImg]  = useState(0);
  const [changing,   setChanging]   = useState(false);
  const [lightbox,   setLightbox]   = useState(false);

  const [selColor,   setSelColor]   = useState(null);
  const [selSize,    setSelSize]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [activeTab,  setActiveTab]  = useState("description");

  const [cartAdding, setCartAdding] = useState(false);
  const [buyAdding,  setBuyAdding]  = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [toast,      setToast]      = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setActiveImg(0); setSelColor(null); setSelSize(null); setQty(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    productApi.getById(productId)
      .then(res => {
        // ProductDto: { id, name, description, price, discountPrice, stock, images, colors, label, material }
        const p = res;
        const imgs = (p.images || []).map(i => i.imageUrl).filter(Boolean);
        const mapped = {
          id:           p.id,
          name:         p.name,
          slug:         String(p.id),
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

        // Related: same category products
        if (p.furnitureCategoryId) {
          productApi.getByCategory(p.furnitureCategoryId, { page: 1, pageSize: 4 })
            .then(r => {
              const arr = (r?.data ?? []).filter(x => x.id !== p.id).slice(0, 4);
              setRelated(arr.map(x => ({
                id:        x.id,
                name:      x.name,
                slug:      String(x.id),
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

  const switchImg = useCallback((idx) => {
    if (idx === activeImg) return;
    setChanging(true);
    setTimeout(() => { setActiveImg(idx); setChanging(false); }, 200);
  }, [activeImg]);

  const lbPrev = () => setActiveImg(i => (i - 1 + (product?.images.length||1)) % (product?.images.length||1));
  const lbNext = () => setActiveImg(i => (i + 1) % (product?.images.length||1));

  const doCart = useCallback(async (setBusy) => {
    if (!product?.in_stock || cartAdding || buyAdding) return;
    setBusy(true);
    try {
      const cart = await cartApi.addItem({
        productId: product.id,
        selectedColor: selColor,
        quantity: qty,
      });
      if (cart) dispatch(setCart(cart));
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2900);
    } catch {}
    setTimeout(() => setBusy(false), 1300);
  }, [product, qty, selColor, cartAdding, buyAdding, dispatch]);

  if (loading) return (
    <>
      <div className="pdp-page">
        <Navbar />
        <div className="pdp-skeleton">
          <div className="pdp-sk-gallery">
            <div className="pdp-sk-thumbs">
              {[0,1,2,3].map(i=><div key={i} className="pdp-sk-thumb" style={{animationDelay:`${i*.1}s`}}/>)}
            </div>
            <div className="pdp-sk-main" />
          </div>
          <div className="pdp-sk-info">
            <div className="pdp-sk-line" style={{width:"35%",height:11}}/>
            <div className="pdp-sk-line" style={{width:"80%",height:34}}/>
            <div className="pdp-sk-line" style={{width:"55%",height:22}}/>
            <div className="pdp-sk-line" style={{width:"30%",height:14}}/>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );

  if (!product) return null;

  const save = product.old_price ? product.old_price - product.price : 0;
  const discountPct = product.old_price ? Math.round((save / product.old_price) * 100) : 0;

  const tabs = [
    { key:"description",    label:t("pdp.tab_description") },
    { key:"specifications", label:t("pdp.tab_specs") },
    { key:"reviews",        label:`${t("pdp.tab_reviews")} (${product.review_count})` },
  ];

  return (
    <>
      <div className="pdp-page">
        <Navbar />

        {/* BREADCRUMB */}
        <nav className="pdp-breadcrumb">
          <Link to="/">{t("pdp.home")}</Link>
          <span className="pdp-breadcrumb-sep">/</span>
          <Link to="/furniture-categories">{t("pdp.categories")}</Link>
          <span className="pdp-breadcrumb-sep">/</span>
          <Link to={`/furniture-categories/${product.category.id}`}>{product.category.name}</Link>
          <span className="pdp-breadcrumb-sep">/</span>
          <span className="pdp-breadcrumb-cur">{product.name}</span>
        </nav>

        {/* PRODUCT */}
        <section className="pdp-product">

          {/* GALLERY */}
          <div className="pdp-gallery">
            <div className="pdp-thumbs">
              {product.images.map((img,i) => (
                <div key={i} className={"pdp-thumb" + (activeImg===i?" active":"")} onClick={() => switchImg(i)}>
                  <img src={img} alt={`${product.name} ${i+1}`} loading="lazy" />
                </div>
              ))}
            </div>
            <div className="pdp-main-img-wrap">
              <img
                className={"pdp-main-img" + (changing?" changing":"")}
                src={product.images[activeImg]}
                alt={product.name}
              />
              {product.badge && (
                <span className="pdp-badge-tag" style={{background:BADGE_CLR[product.badge]}}>
                  {t(`common.${product.badge}`)}
                </span>
              )}
              <button className="pdp-zoom-btn" onClick={() => setLightbox(true)} title={t("pdp.zoom")}>⤢</button>
            </div>
          </div>

          {/* INFO */}
          <div className="pdp-info">
            <Link to={`/furniture-categories/${product.category.id}`} className="pdp-cat-link">
              {product.category.name}
            </Link>
            <h1 className="pdp-name">{product.name}</h1>
            <div className="pdp-rating-row">
              <Stars n={product.rating} size={14}/>
              <span className="pdp-rating-n">{product.rating}</span>
              <button className="pdp-reviews-btn" onClick={() => setActiveTab("reviews")}>
                {product.review_count} {t("pdp.reviews")}
              </button>
            </div>
            <p className="pdp-sku">SKU: {product.sku}</p>

            <div className="pdp-divider" />

            {/* PRICE */}
            <div className="pdp-price-box">
              <span className="pdp-price">{fmt(product.price)}</span>
              {product.old_price && <span className="pdp-old-price">{fmt(product.old_price)}</span>}
              {save > 0 && <span className="pdp-save-tag">−{discountPct}% {t("pdp.save")} {fmt(save)}</span>}
            </div>
            <p className="pdp-tax-note">{t("pdp.inc_vat")}</p>

            {/* INSTALLMENT QUICK-VIEW */}
            <InstallmentChips price={product.price} />
            <div className="pdp-stock-row">
              <div className={"pdp-stock-dot" + (product.in_stock?" green":" red")} />
              <span className="pdp-stock-txt" style={{color:product.in_stock?"#4caf50":"#f44336"}}>
                {product.in_stock
                  ? `${t("pdp.in_stock")} (${product.stock_qty} ${t("pdp.left")})`
                  : t("common.out_of_stock")}
              </span>
            </div>

            <div className="pdp-divider" />

            {/* COLOR */}
            <div style={{marginBottom:18}}>
              <p className="pdp-opt-label">
                {t("pdp.color")}:&nbsp;
                <span>{selColor ? product.colors.find(c=>c.value===selColor)?.label : t("pdp.select")}</span>
              </p>
              <div className="pdp-colors">
                {product.colors.map(c => (
                  <button key={c.value}
                    className={"pdp-color"+(selColor===c.value?" active":"")}
                    style={{background:c.hex}} onClick={() => setSelColor(c.value)} title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* SIZE */}
            {product.sizes?.length > 0 && (
              <div style={{marginBottom:18}}>
                <p className="pdp-opt-label">
                  {t("pdp.size")}:&nbsp;
                  <span>{selSize ? product.sizes.find(s=>s.value===selSize)?.label : t("pdp.select")}</span>
                </p>
                <div className="pdp-sizes">
                  {product.sizes.map(s => (
                    <button key={s.value}
                      className={"pdp-size"+(selSize===s.value?" active":"")}
                      onClick={() => setSelSize(s.value)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-divider" />

            {/* QTY + CTA */}
            <div className="pdp-cta-row">
              <div className="pdp-qty">
                <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                <span className="pdp-qty-val">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.min(product.stock_qty,q+1))}>+</button>
              </div>
              <button
                className={"pdp-buy-btn"+(buyAdding?" adding":"")}
                disabled={!product.in_stock||cartAdding||buyAdding}
                onClick={() => doCart(setBuyAdding)}
              >
                {buyAdding ? `✓ ${t("pdp.added")}` : t("pdp.buy_now")}
              </button>
              <button
                className={"pdp-cart-btn"+(cartAdding?" adding":"")}
                disabled={!product.in_stock||cartAdding||buyAdding}
                onClick={() => doCart(setCartAdding)}
              >
                {cartAdding ? "✓" : t("pdp.add_to_cart")}
              </button>
            </div>

            {/* WISHLIST + SHARE */}
            <div className="pdp-secondary-row">
              <button
                className={"pdp-wish-btn"+(saved?" saved":"")}
                onClick={() => setSaved(s=>!s)}
              >
                <span className="pdp-heart">{saved?"♥":"♡"}</span>
                {saved ? t("pdp.saved") : t("pdp.save_wishlist")}
              </button>
              <button className="pdp-share-btn" title={t("pdp.share")}>⤴</button>
            </div>

            {/* PERKS */}
            <div className="pdp-perks">
              <div className="pdp-perk">
                <span className="pdp-perk-icon">🚚</span>
                <span className="pdp-perk-txt"><strong>{t("pdp.perk_delivery_title")}</strong> — {t("pdp.perk_delivery_desc")}</span>
              </div>
              <div className="pdp-perk">
                <span className="pdp-perk-icon">🛡️</span>
                <span className="pdp-perk-txt"><strong>{t("pdp.perk_guarantee_title")}</strong> — {t("pdp.perk_guarantee_desc")}</span>
              </div>
              <div className="pdp-perk">
                <span className="pdp-perk-icon">↩️</span>
                <span className="pdp-perk-txt"><strong>{t("pdp.perk_returns_title")}</strong> — {t("pdp.perk_returns_desc")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className="pdp-tabs-section">
          <div className="pdp-tab-bar">
            {tabs.map(tab => (
              <button key={tab.key}
                className={"pdp-tab-btn"+(activeTab===tab.key?" active":"")}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="pdp-tab-panel">
              <p className="pdp-desc">{product.description}</p>
              <div className="pdp-mat-chips">
                {product.materials.map(m => <span key={m} className="pdp-mat-chip">{m}</span>)}
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="pdp-tab-panel pdp-specs-grid">
              {product.specs.map(s => (
                <div key={s.label} className="pdp-spec-row">
                  <span className="pdp-spec-label">{s.label}</span>
                  <span className="pdp-spec-val">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="pdp-tab-panel">
              <div className="pdp-reviews-hero">
                <span className="pdp-rev-big-n">{product.rating}</span>
                <div className="pdp-rev-right">
                  <Stars n={product.rating} size={18}/>
                  <span className="pdp-rev-label">{t("pdp.based_on")} {product.review_count} {t("pdp.tab_reviews").toLowerCase()}</span>
                </div>
              </div>
              <div className="pdp-reviews-list">
                {product.reviews.map((r,i) => (
                  <div key={r.id} className="pdp-review-card" style={{animationDelay:`${i*80}ms`}}>
                    <div className="pdp-review-head">
                      <div>
                        <p className="pdp-rev-author">{r.author}</p>
                        <p className="pdp-rev-meta">{r.location} · {r.date}</p>
                      </div>
                      <Stars n={r.rating} size={13}/>
                    </div>
                    <p className="pdp-rev-text">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="pdp-related">
            <div className="pdp-related-head">
              <h2 className="pdp-related-title">{t("pdp.explore_more_pre")} <em>{t("pdp.explore_more_em")}</em></h2>
              <Link to="/furniture-categories" className="pdp-see-all">
                {t("pdp.see_all")} →
              </Link>
            </div>
            <div className="pdp-related-grid">
              {related.map((item, i) => (
                <RelCard key={item.id} item={item} t={t} style={{animationDelay:`${i*80}ms`}} />
              ))}
            </div>
          </section>
        )}

        {/* LIGHTBOX */}
        {lightbox && (
          <div className="pdp-lb-overlay" onClick={() => setLightbox(false)}>
            <button className="pdp-lb-close" onClick={() => setLightbox(false)}>✕</button>
            <button className="pdp-lb-prev" onClick={e=>{e.stopPropagation();lbPrev()}}>‹</button>
            <img className="pdp-lb-img" src={product.images[activeImg]} alt={product.name}
              onClick={e=>e.stopPropagation()} />
            <button className="pdp-lb-next" onClick={e=>{e.stopPropagation();lbNext()}}>›</button>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className="pdp-toast">
            <span className="pdp-toast-ic">✓</span>
            <span><strong>{qty}× {toast}</strong> {t("pdp.added_to_cart")}</span>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}