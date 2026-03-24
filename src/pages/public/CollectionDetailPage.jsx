// src/pages/public/CollectionDetailPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /collections/:id
//
//  Real API ilə işləyir:
//    collectionApi.getById(id)         → kolleksiya + məhsullar
//    cartApi.addItem(productId, qty)   → səbətə əlavə et
//
//  Kolleksiya: şəkil, ad, açıqlama, qiymət (varsa), məhsul siyahısı.
//  Hər məhsulun "Səbətə əlavə et" düyməsi var.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import collectionApi from "../../api/collectionApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;

function Stars({ n }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length:5 }).map((_,i) => (
        <span key={i} style={{ color:"#C9A84C", fontSize:11 }}>{i<n?"★":"☆"}</span>
      ))}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes colFadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes colShimmer  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes colCardIn   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes colToast    { 0%{opacity:0;transform:translateY(20px)} 15%,85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
  @keyframes colPop      { 0%{transform:scale(1)} 50%{transform:scale(.94)} 100%{transform:scale(1)} }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:5px }
  ::-webkit-scrollbar-track { background:#F7F3EE }
  ::-webkit-scrollbar-thumb { background:#7A9E7E; border-radius:3px }

  .col-page { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; }

  /* ── HERO ── */
  .col-hero       { position:relative; height:75vh; min-height:520px; overflow:hidden; display:flex; align-items:flex-end; }
  .col-hero-bg    { position:absolute; inset:0; background-size:cover; background-position:center; transition:transform 8s ease; }
  .col-hero:hover .col-hero-bg { transform:scale(1.03); }
  .col-hero-ov    { position:absolute; inset:0; background:linear-gradient(to top, rgba(28,28,28,.78) 0%, rgba(28,28,28,.1) 60%, transparent 100%); }
  .col-hero-ct    { position:relative; z-index:2; padding:0 80px 64px; width:100%; display:flex; align-items:flex-end; justify-content:space-between; }
  .col-hero-left  {}
  .col-bread      { display:flex; align-items:center; gap:8px; margin-bottom:18px; }
  .col-bread a    { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.5); text-decoration:none; transition:color .3s; }
  .col-bread a:hover { color:#fff; }
  .col-bread-sep  { color:rgba(255,255,255,.3); font-size:11px; }
  .col-bread-cur  { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.8); }
  .col-hero-h1    { font-family:'Cormorant Garamond',serif; font-size:clamp(52px,7vw,100px); font-weight:300; color:#fff; line-height:1; letter-spacing:-1px; }
  .col-hero-sub   { font-size:16px; color:rgba(255,255,255,.65); margin-top:16px; max-width:500px; line-height:1.7; font-weight:300; }
  .col-hero-right { text-align:right; flex-shrink:0; }
  .col-hero-count-n { font-family:'Cormorant Garamond',serif; font-size:64px; font-weight:300; color:rgba(255,255,255,.9); line-height:1; display:block; }
  .col-hero-count-l { font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,.4); }

  /* ── COLLECTION INFO BAND ── */
  .col-info-band  { background:#F7F3EE; padding:44px 80px; display:flex; align-items:center; gap:60px; border-bottom:1px solid #EDE7DC; }
  .col-info-stat  { text-align:center; }
  .col-info-stat-n { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; color:#7A9E7E; display:block; }
  .col-info-stat-l { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#6B6B6B; }
  .col-info-divider { width:1px; height:40px; background:#E5DDD4; }
  .col-info-desc  { font-size:14px; color:#6B6B6B; line-height:1.8; max-width:560px; margin-left:auto; }

  /* ── PRODUCTS ── */
  .col-products   { padding:72px 80px; }
  .col-prod-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:48px; }
  .col-prod-title { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; color:#1C1C1C; }
  .col-prod-title em { font-style:italic; color:#7A9E7E; }
  .col-back-link  { font-size:12px; letter-spacing:1.2px; text-transform:uppercase; color:#6B6B6B; text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-bottom:1px solid #E5DDD4; padding-bottom:2px; transition:all .3s; }
  .col-back-link:hover { color:#7A9E7E; border-bottom-color:#7A9E7E; }

  /* Grid */
  .col-grid       { display:grid; grid-template-columns:repeat(4,1fr); gap:28px; }

  /* Card */
  .col-card       { background:#fff; transition:box-shadow .4s; }
  .col-card:hover { box-shadow:0 20px 56px rgba(28,28,28,.1); }
  .col-card.anim  { animation:colCardIn .55s cubic-bezier(.25,.46,.45,.94) both; }
  .col-card-iw    { position:relative; overflow:hidden; aspect-ratio:4/5; background:#F7F3EE; }
  .col-card-img   { width:100%; height:100%; object-fit:cover; transition:transform .65s cubic-bezier(.25,.46,.45,.94); display:block; }
  .col-card:hover .col-card-img { transform:scale(1.05); }
  .col-card-badge { position:absolute; top:12px; left:12px; color:#fff; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; padding:4px 10px; font-weight:500; }
  .col-card-body  { padding:18px 16px 22px; }
  .col-card-name  { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; color:#1C1C1C; margin-bottom:8px; text-decoration:none; display:block; transition:color .3s; }
  .col-card-name:hover { color:#7A9E7E; }
  .col-card-price-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .col-card-price { font-size:16px; font-weight:500; color:#1C1C1C; }
  .col-card-old   { font-size:12px; color:#A8A8A8; text-decoration:line-through; margin-left:6px; }

  /* Add to cart button */
  .col-cart-btn   { width:100%; padding:13px; font-size:11px; letter-spacing:1.6px; text-transform:uppercase; border:1px solid #1C1C1C; background:#fff; color:#1C1C1C; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; position:relative; overflow:hidden; }
  .col-cart-btn::before { content:''; position:absolute; inset:0; background:#1C1C1C; transform:scaleX(0); transform-origin:left; transition:transform .3s cubic-bezier(.25,.46,.45,.94); z-index:0; }
  .col-cart-btn span { position:relative; z-index:1; transition:color .3s; }
  .col-cart-btn:hover::before { transform:scaleX(1); }
  .col-cart-btn:hover span { color:#fff; }
  .col-cart-btn.added { background:#7A9E7E; border-color:#7A9E7E; color:#fff; animation:colPop .3s ease; }
  .col-cart-btn.added span { color:#fff; }
  .col-cart-btn.added::before { display:none; }
  .col-cart-btn:disabled { opacity:.5; cursor:not-allowed; }

  /* Skeleton */
  .col-skeleton-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:28px; }
  .col-sk-card { background:#F7F3EE; }
  .col-sk-img  { aspect-ratio:4/5; animation:colShimmer 1.5s ease-in-out infinite; }
  .col-sk-line { height:13px; background:#EDE7DC; margin:12px 14px 0; animation:colShimmer 1.5s ease-in-out infinite; }
  .col-sk-line.short { width:60%; }

  /* Error */
  .col-error { display:flex; align-items:center; gap:14px; background:#FEF2EE; border-left:3px solid #D4714A; padding:18px 24px; margin:40px 80px; }
  .col-error-text { font-size:14px; color:#1C1C1C; flex:1; }
  .col-retry  { background:none; border:1px solid #D4714A; color:#D4714A; padding:7px 16px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .col-retry:hover { background:#D4714A; color:#fff; }

  /* Empty */
  .col-empty  { padding:80px 0; text-align:center; }
  .col-empty-ic { font-size:48px; margin-bottom:20px; opacity:.3; display:block; }
  .col-empty-t  { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; color:#1C1C1C; margin-bottom:8px; }
  .col-empty-s  { font-size:14px; color:#6B6B6B; }

  /* Toast notification */
  .col-toast  { position:fixed; bottom:32px; right:32px; z-index:500; background:#1C1C1C; color:#fff; padding:14px 24px; font-size:13px; font-family:'DM Sans',sans-serif; letter-spacing:.5px; display:flex; align-items:center; gap:10px; animation:colToast 2.4s ease forwards; box-shadow:0 8px 24px rgba(28,28,28,.3); }
  .col-toast-icon { color:#7A9E7E; font-size:16px; }

  /* ── MORE COLLECTIONS ── */
  .col-more     { padding:0 80px 80px; }
  .col-more-title { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:300; color:#1C1C1C; margin-bottom:32px; }
  .col-more-title em { font-style:italic; color:#7A9E7E; }
  .col-more-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .col-more-card  { position:relative; overflow:hidden; text-decoration:none; background:#EDE7DC; }
  .col-more-card-iw { aspect-ratio:4/3; overflow:hidden; }
  .col-more-card-img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; display:block; }
  .col-more-card:hover .col-more-card-img { transform:scale(1.05); }
  .col-more-card-inf { padding:16px 0; }
  .col-more-card-nm { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:300; color:#1C1C1C; margin-bottom:4px; }
  .col-more-card-cnt { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#6B6B6B; }

  /* Responsive */
  @media(max-width:1100px) {
    .col-grid { grid-template-columns:repeat(2,1fr); }
    .col-skeleton-grid { grid-template-columns:repeat(2,1fr); }
    .col-more-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:900px) {
    .col-hero-ct, .col-info-band, .col-products, .col-more { padding-left:24px; padding-right:24px; }
    .col-hero-ct { flex-direction:column; align-items:flex-start; gap:20px; padding-bottom:40px; }
    .col-hero-right { text-align:left; }
    .col-info-band { flex-wrap:wrap; gap:28px; }
    .col-info-desc { margin-left:0; }
  }
  @media(max-width:580px) {
    .col-grid { grid-template-columns:1fr; }
    .col-skeleton-grid { grid-template-columns:1fr; }
    .col-more-grid { grid-template-columns:1fr; }
    .col-hero-h1 { font-size:48px; }
    .col-toast { left:16px; right:16px; bottom:16px; }
  }
`;

const BADGE_COLORS = {
  best_seller: "#D4714A",
  new_in:      "#7A9E7E",
  sale:        "#C9A84C",
};

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CollectionDetailPage() {
  const { id }       = useParams();
  const { t }        = useTranslation();
  const navigate     = useNavigate();

  const [collection,  setCollection]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [addedIds,    setAddedIds]    = useState({});   // { productId: "added"|"adding" }
  const [toast,       setToast]       = useState(null); // { name }
  const toastTimer = useRef(null);

  // ── Fetch collection + products ───────────────────────────
  const fetchCollection = useCallback(() => {
    setLoading(true);
    setError(null);

    collectionApi.getById(id)
      .then(res => {
        // Backend response: { id, name, description, image, products: [...], ... }
        setCollection(res.data);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          navigate("/collections", { replace: true });
        } else {
          setError(err.userMessage);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    fetchCollection();
    window.scrollTo({ top: 0 });
  }, [fetchCollection]);

  // ── Add to Cart ───────────────────────────────────────────
  const handleAddToCart = useCallback(async (product) => {
    if (addedIds[product.id]) return;

    setAddedIds(prev => ({ ...prev, [product.id]: "adding" }));
    try {
      await cartApi.addItem(product.id, 1);
      // TODO: dispatch(cartActions.increment()) if using Redux

      setAddedIds(prev => ({ ...prev, [product.id]: "added" }));

      // Toast notification
      clearTimeout(toastTimer.current);
      setToast({ name: product.name });
      toastTimer.current = setTimeout(() => setToast(null), 2600);

      // Reset button after 1.5s
      setTimeout(() => {
        setAddedIds(prev => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 1500);
    } catch {
      setAddedIds(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  }, [addedIds]);

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="col-page">
          <Navbar />
          <div style={{ height: "75vh", background: "#EDE7DC", marginTop: 72 }} />
          <div className="col-products" style={{ marginTop: 0 }}>
            <div className="col-skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-sk-card">
                  <div className="col-sk-img" />
                  <div className="col-sk-line" />
                  <div className="col-sk-line short" />
                </div>
              ))}
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <style>{CSS}</style>
        <div className="col-page">
          <Navbar />
          <div className="col-error" style={{ marginTop: 80 }}>
            <span>⚠️</span>
            <p className="col-error-text">{error}</p>
            <button className="col-retry" onClick={fetchCollection}>Retry</button>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const products = collection?.products || [];

  return (
    <>
      <style>{CSS}</style>
      <div className="col-page">
        <Navbar />

        {/* ── HERO ── */}
        <div className="col-hero" style={{ marginTop: 72 }}>
          {collection?.image && (
            <div
              className="col-hero-bg"
              style={{ backgroundImage: `url(${collection.image})` }}
            />
          )}
          {!collection?.image && (
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#7A9E7E,#EDE7DC)" }} />
          )}
          <div className="col-hero-ov" />
          <div className="col-hero-ct">
            <div className="col-hero-left">
              <div className="col-bread">
                <Link to="/">{t("nav.shop")}</Link>
                <span className="col-bread-sep">/</span>
                <Link to="/collections">{t("collection_page.all_collections")}</Link>
                <span className="col-bread-sep">/</span>
                {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
                <span className="col-bread-cur">{collection?.name}</span>
              </div>
              <h1 className="col-hero-h1">{collection?.name}</h1>
              {collection?.tagline && (
                <p className="col-hero-sub">{collection.tagline}</p>
              )}
            </div>
            <div className="col-hero-right">
              <span className="col-hero-count-n">{products.length}</span>
              <span className="col-hero-count-l">{t("collection_page.pieces")}</span>
            </div>
          </div>
        </div>

        {/* ── INFO BAND ── */}
        {(collection?.description || collection?.price_range) && (
          <div className="col-info-band">
            {collection.price_range && (
              <>
                <div className="col-info-stat">
                  <span className="col-info-stat-n">{collection.price_range}</span>
                  <span className="col-info-stat-l">Price range</span>
                </div>
                <div className="col-info-divider" />
              </>
            )}
            {collection.product_count && (
              <>
                <div className="col-info-stat">
                  <span className="col-info-stat-n">{collection.product_count}</span>
                  <span className="col-info-stat-l">{t("collection_page.pieces")}</span>
                </div>
                <div className="col-info-divider" />
              </>
            )}
            {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
            {collection.description && (
              <p className="col-info-desc">{collection.description}</p>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        <div className="col-products">
          <div className="col-prod-header">
            <h2 className="col-prod-title">
              {t("collection_page.collection_products")}
            </h2>
            <Link to="/collections" className="col-back-link">
              ← {t("collection_page.all_collections")}
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="col-empty">
              <span className="col-empty-ic">🛋</span>
              <h3 className="col-empty-t">{t("collection_page.no_products")}</h3>
              <p className="col-empty-s">
                <Link to="/collections" className="col-back-link">
                  {t("collection_page.all_collections")}
                </Link>
              </p>
            </div>
          ) : (
            <div className="col-grid">
              {products.map((product, i) => {
                const btnState = addedIds[product.id];
                return (
                  <div
                    key={product.id}
                    className="col-card anim"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="col-card-iw">
                      {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
                      <img
                        className="col-card-img"
                        src={product.image || product.images?.[0]?.url}
                        alt={product.name}
                        loading="lazy"
                      />
                      {product.badge && (
                        <span
                          className="col-card-badge"
                          style={{ background: BADGE_COLORS[product.badge] || "#7A9E7E" }}
                        >
                          {t(`common.${product.badge}`)}
                        </span>
                      )}
                    </div>
                    <div className="col-card-body">
                      {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="col-card-name"
                      >
                        {product.name}
                      </Link>
                      <div className="col-card-price-row">
                        <div>
                          <span className="col-card-price">{fmt(product.price)}</span>
                          {product.old_price && (
                            <span className="col-card-old">{fmt(product.old_price)}</span>
                          )}
                        </div>
                        {product.rating && <Stars n={Math.round(product.rating)} />}
                      </div>

                      {/* Səbətə əlavə et */}
                      <button
                        className={`col-cart-btn${btnState === "added" ? " added" : ""}`}
                        disabled={!product.in_stock || btnState === "adding"}
                        onClick={() => handleAddToCart(product)}
                      >
                        <span>
                          {!product.in_stock
                            ? t("collection_page.out_of_stock")
                            : btnState === "adding"
                              ? t("collection_page.adding")
                              : btnState === "added"
                                ? t("collection_page.added_to_cart")
                                : t("collection_page.add_to_cart")}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── MORE COLLECTIONS (əgər backend related_collections qaytarırsa) ── */}
        {collection?.related_collections?.length > 0 && (
          <div className="col-more">
            <h3 className="col-more-title">
              Other <em>Collections</em>
            </h3>
            <div className="col-more-grid">
              {collection.related_collections.slice(0, 3).map(c => (
                <Link
                  key={c.id}
                  to={`/collections/${c.id}`}
                  className="col-more-card"
                >
                  <div className="col-more-card-iw">
                    <img
                      className="col-more-card-img"
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="col-more-card-inf">
                    <h4 className="col-more-card-nm">{c.name}</h4>
                    <p className="col-more-card-cnt">{c.product_count} {t("collection_page.pieces")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div className="col-toast">
            <span className="col-toast-icon">✓</span>
            {/* DB-dən gəlir — məhsul adı */}
            <span><strong>{toast.name}</strong> — {t("collection_page.added_to_cart")}</span>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
