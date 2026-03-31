// Route: /collections/:slug
// Kolleksiya detalları: hero, şəkil qalereyası, məhsullar, cart

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart } from "../../store/slices/cartSlice";
import collectionApi from "../../api/collectionApi";
import cartApi       from "../../api/cartApi";
import Navbar        from "../../components/common/Navbar";
import Footer        from "../../components/common/Footer";
import "../../assets/pagesCss/CollectionDetails.css";



// ── HELPERS ───────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;
const BADGE_CLR  = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };
const BADGE_KEYS = { best_seller:"common.best_seller", new_in:"common.new_in", sale:"common.sale" };

function Stars({ n, size=12 }) {
  return (
    <span className="cdp-stars">
      {Array.from({length:5}).map((_,i)=>(
        <span key={i} className={"cdp-star"+(i<Math.round(n)?" on":"")} style={{fontSize:size}}>★</span>
      ))}
    </span>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────
const ProdCard = memo(function ProdCard({ product, addingId, onAdd, t }) {
  const navigate = useNavigate();
  const save = product.old_price ? product.old_price - product.price : 0;
  const pct  = product.old_price ? Math.round((save/product.old_price)*100) : 0;
  const isAdding = addingId === product.id;

  return (
    <article className="cdp-prod-card" style={{animationDelay:`${(product.id%12)*55}ms`}}>
      {/* Image */}
      <div className="cdp-prod-img-box" onClick={()=>navigate(`/details/${product.id}`)}>
        <img className="cdp-prod-img" src={product.image} alt={product.name} loading="lazy"/>
        {product.badge && (
          <span className="cdp-prod-badge" style={{background:BADGE_CLR[product.badge]}}>
            {t(BADGE_KEYS[product.badge])}
          </span>
        )}
        {!product.in_stock && (
          <div className="cdp-prod-oos"><span>{t("common.out_of_stock")}</span></div>
        )}
        {save > 0 && (
          <span className="cdp-prod-pct-off">−{pct}%</span>
        )}
        <div className="cdp-prod-hover-panel">
          <button
            className="cdp-hover-details"
            onClick={e=>{e.stopPropagation();navigate(`/details/${product.id}`)}}
          >
            {t("collection_page.view_details")}
          </button>
          <button className="cdp-hover-wish" onClick={e=>e.stopPropagation()}>♡</button>
        </div>
      </div>

      {/* Body */}
      <div className="cdp-prod-body">
        <h3
          className="cdp-prod-name"
          onClick={()=>navigate(`/details/${product.id}`)}
        >{product.name}</h3>

        <div className="cdp-prod-rating-row">
          <Stars n={product.rating}/>
          <span className="cdp-prod-rating-n">{product.rating}</span>
          <span className="cdp-prod-reviews">({product.reviews})</span>
        </div>

        <div className="cdp-prod-foot">
          <div className="cdp-prod-prices">
            <span className="cdp-prod-price">{fmt(product.price)}</span>
            {product.old_price && (
              <span className="cdp-prod-old">{fmt(product.old_price)}</span>
            )}
          </div>
          <div className="cdp-prod-actions">
            <button
              className="cdp-details-btn"
              onClick={()=>navigate(`/details/${product.id}`)}
              title={t("collection_page.view_details")}
            >⤢</button>
            <button
              className={"cdp-cart-btn"+(isAdding?" adding":"")+(product.in_stock?"":" disabled")}
              disabled={!product.in_stock || isAdding}
              onClick={()=>onAdd(product)}
            >
              {isAdding ? "✓" : t("collection_page.add_to_cart")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

// ── CSS ───────────────────────────────────────────────────────

// ── PAGE ─────────────────────────────────────────────────────
export default function CollectionDetailPage() {
  const { id: collId } = useParams();   // route: /collection-detail/:id
  const { t }          = useTranslation();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();
  const lang           = useSelector(selectLang);

  const [coll,       setColl]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [lbOpen,     setLbOpen]     = useState(false);
  const [lbIdx,      setLbIdx]      = useState(0);
  const [addingId,   setAddingId]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [sortBy,     setSortBy]     = useState("default");
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!collId) return;
    setLoading(true);
    setHeroLoaded(false);
    window.scrollTo({ top: 0 });

    collectionApi.getById(collId)
      .then(res => {
        // CollectionDto: { id, name, description, imageUrl, totalPrice, discountPrice, products: ProductDto[] }
        const dto = res;
        const mapped = {
          id:          dto.id,
          slug:        String(dto.id),
          name:        dto.name,
          tagline:     dto.description || dto.name,
          description: dto.description || "",
          badge:       null,
          room:        dto.categoryName || "",
          pieces:      dto.products?.length ?? 0,
          gallery:     dto.imageUrl ? [dto.imageUrl] : [],
          products: (dto.products || []).map(p => ({
            id:        p.id,
            name:      p.name,
            slug:      String(p.id),
            price:     p.discountPrice ?? p.price,
            old_price: p.discountPrice ? p.price : null,
            badge:     p.label || null,
            rating:    4,
            reviews:   0,
            in_stock:  p.stock > 0,
            image:     p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
          })),
        };
        setColl(mapped);
      })
      .catch(() => navigate("/collections"))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setHeroLoaded(true), 80);
      });
  }, [collId, lang, navigate]);

  // Sort products
  const sortedProducts = coll ? (() => {
    const arr = [...(coll.products || [])];
    if (sortBy === "price_asc")  return arr.sort((a,b) => a.price - b.price);
    if (sortBy === "price_desc") return arr.sort((a,b) => b.price - a.price);
    if (sortBy === "rating")     return arr.sort((a,b) => b.rating - a.rating);
    return arr;
  })() : [];

  // Add to cart
  const handleAdd = useCallback(async (product) => {
    if (addingId === product.id || !product.in_stock) return;
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem({ productId: product.id, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2900);
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId, dispatch]);

  // Lightbox
  const openLb  = (i) => { setLbIdx(i); setLbOpen(true); };
  const lbPrev  = () => setLbIdx(i => (i - 1 + (coll?.gallery?.length||1)) % (coll?.gallery?.length||1));
  const lbNext  = () => setLbIdx(i => (i + 1) % (coll?.gallery?.length||1));

  // Close lightbox on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setLbOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) return (
    <>
      <div className="cdp-page">
        <Navbar />
        <div style={{maxWidth:1400,margin:"100px auto 0",padding:"36px 72px"}}>
          <div className="cdp-sk-grid">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="cdp-sk-card">
                <div className="cdp-sk-img" style={{animationDelay:`${i*.1}s`}}/>
                <div className="cdp-sk-line"/>
                <div className="cdp-sk-line sm"/>
              </div>
            ))}
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );

  if (!coll) return null;

  return (
    <>
      <div className="cdp-page">
        <Navbar/>

        {/* ══ HERO ══ */}
        <div className={"cdp-hero"+(heroLoaded?" loaded":"")}>
          {coll.gallery?.[0] && (
            <img className="cdp-hero-bg-img" src={coll.gallery[0]} alt={coll.name}/>
          )}
          <div className="cdp-hero-noise"/>
          <div className="cdp-hero-ov"/>
          <div className="cdp-hero-inner">
            <div className="cdp-hero-left">
              <div className="cdp-breadcrumb">
                <Link to="/">{t("pdp.home")}</Link>
                <span className="cdp-bc-sep">/</span>
                <Link to="/rooms">{t("rooms_page.eyebrow")}</Link>
                <span className="cdp-bc-sep">/</span>
                <span className="cdp-bc-cur">{coll.name}</span>
              </div>
              <div className="cdp-hero-eyebrow">{t("cdp.collection")}</div>
              <h1 className="cdp-hero-name">
                {coll.name.split(" ").slice(0,-1).join(" ")}{" "}
                <em>{coll.name.split(" ").slice(-1)[0]}</em>
              </h1>
              <p className="cdp-hero-tagline">{coll.tagline}</p>
              <div className="cdp-hero-tags">
                <span className="cdp-hero-tag">🏠 {coll.room}</span>
                <span className="cdp-hero-tag">✦ {coll.designer}</span>
                <span className="cdp-hero-tag">📅 {coll.year}</span>
              </div>
            </div>
            <div className="cdp-hero-right">
              <div className="cdp-hero-stat">
                <span className="cdp-hero-stat-n">{coll.pieces}</span>
                <span className="cdp-hero-stat-l">{t("collection_page.pieces")}</span>
              </div>
              {coll.badge && (
                <span className="cdp-hero-badge" style={{background:BADGE_CLR[coll.badge]}}>
                  {t(BADGE_KEYS[coll.badge])}
                </span>
              )}
              <a
                href="#cdp-products"
                className="cdp-hero-cta"
                onClick={e=>{e.preventDefault();document.getElementById("cdp-products")?.scrollIntoView({behavior:"smooth"})}}
              >
                {t("cdp.shop_collection")} ↓
              </a>
            </div>
          </div>
        </div>

        {/* ══ GALLERY ══ */}
        {coll.gallery?.length > 0 && (
          <div className="cdp-gallery">
            <div className="cdp-gallery-head">
              <span className="cdp-gallery-title">{t("cdp.gallery")}</span>
              <span className="cdp-gallery-counter">{coll.gallery.length} {t("cdp.photos")}</span>
            </div>
            <div className="cdp-gallery-strip">
              {coll.gallery.slice(0,4).map((img, i) => (
                <div
                  key={i}
                  className={"cdp-gal-item"+(i===3&&coll.gallery.length>4?" more":"")}
                  onClick={()=>openLb(i)}
                >
                  <img className="cdp-gal-img" src={img} alt={`${coll.name} ${i+1}`} loading="lazy"/>
                  <div className="cdp-gal-item-ov">
                    {i===3&&coll.gallery.length>4 ? (
                      <div style={{textAlign:"center"}}>
                        <div className="cdp-gal-more-n">+{coll.gallery.length-3}</div>
                        <div className="cdp-gal-more-l">{t("cdp.more_photos")}</div>
                      </div>
                    ) : (
                      <div className="cdp-gal-zoom">⤢</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ABOUT ══ */}
        <div className="cdp-about">
          <div className="cdp-about-text">
            <h2>{t("cdp.about_pre")} <em>{coll.name}</em></h2>
            <p className="cdp-about-desc">{coll.description}</p>
          </div>
          <div className="cdp-about-meta">
            <div className="cdp-meta-row">
              <span className="cdp-meta-label">{t("cdp.meta_room")}</span>
              <span className="cdp-meta-val">🏠 {coll.room}</span>
            </div>
            <div className="cdp-meta-row">
              <span className="cdp-meta-label">{t("cdp.meta_designer")}</span>
              <span className="cdp-meta-val">{coll.designer}</span>
            </div>
            <div className="cdp-meta-row">
              <span className="cdp-meta-label">{t("cdp.meta_year")}</span>
              <span className="cdp-meta-val">{coll.year}</span>
            </div>
            <div className="cdp-meta-row">
              <span className="cdp-meta-label">{t("cdp.meta_pieces")}</span>
              <span className="cdp-meta-val">{coll.pieces} {t("collection_page.pieces")}</span>
            </div>
            <div className="cdp-meta-row">
              <span className="cdp-meta-label">{t("cdp.meta_availability")}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div className="cdp-meta-dot"/>
                <span className="cdp-meta-val" style={{color:"#4caf50"}}>{t("cdp.meta_available")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ DIVIDER ══ */}
        <div className="cdp-divider" style={{marginTop:56}}>
          <div className="cdp-divider-line"/>
        </div>

        {/* ══ PRODUCTS ══ */}
        <div className="cdp-products" id="cdp-products">
          <div className="cdp-prod-head">
            <div>
              <h2 className="cdp-prod-title">
                {t("cdp.products_in")} <em>{t("cdp.collection_short")}</em>
              </h2>
              <p className="cdp-prod-count">{sortedProducts.length} {t("collection_page.pieces")}</p>
            </div>
            <select
              className="cdp-prod-sort"
              value={sortBy}
              onChange={e=>setSortBy(e.target.value)}
            >
              <option value="default">{t("fcp.sort_featured")}</option>
              <option value="price_asc">{t("fcp.sort_price_asc")}</option>
              <option value="price_desc">{t("fcp.sort_price_desc")}</option>
              <option value="rating">{t("fcp.sort_rating")}</option>
            </select>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="cdp-empty">
              <span className="cdp-empty-ic">🛋</span>
              <h3 className="cdp-empty-t">{t("collection_page.no_products")}</h3>
              <p className="cdp-empty-s">{t("rooms_coll.no_collections_hint")}</p>
            </div>
          ) : (
            <div className="cdp-prod-grid">
              {sortedProducts.map((product) => (
                <ProdCard
                  key={product.id}
                  product={product}
                  addingId={addingId}
                  onAdd={handleAdd}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {/* ══ LIGHTBOX ══ */}
        {lbOpen && (
          <div className="cdp-lb" onClick={()=>setLbOpen(false)}>
            <button className="cdp-lb-close" onClick={()=>setLbOpen(false)}>✕</button>
            <button className="cdp-lb-prev" onClick={e=>{e.stopPropagation();lbPrev()}}>‹</button>
            <img
              className="cdp-lb-img"
              src={coll.gallery[lbIdx]}
              alt={`${coll.name} ${lbIdx+1}`}
              onClick={e=>e.stopPropagation()}
            />
            <button className="cdp-lb-next" onClick={e=>{e.stopPropagation();lbNext()}}>›</button>
            <div className="cdp-lb-dots">
              {coll.gallery.map((_,i)=>(
                <div
                  key={i}
                  className={"cdp-lb-dot"+(i===lbIdx?" on":"")}
                  onClick={e=>{e.stopPropagation();setLbIdx(i)}}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══ TOAST ══ */}
        {toast && (
          <div className="cdp-toast">
            <span className="cdp-toast-ic">✓</span>
            <span><strong>{toast}</strong> {t("fcp.added_to_cart")}</span>
          </div>
        )}

        <Footer/>
      </div>
    </>
  );
}