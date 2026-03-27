// Route: /collections/:slug
// Kolleksiya detalları: hero, şəkil qalereyası, məhsullar, cart

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import collectionApi from "../../api/collectionApi";
import cartApi       from "../../api/cartApi";
import Navbar        from "../../components/common/Navbar";
import Footer        from "../../components/common/Footer";
import "../../assets/PagesCss/CollectionDetails.css";

// ── MOCK DATA ─────────────────────────────────────────────────
const MOCK_COLLECTIONS = {
  "velour-sofa": {
    id:1, slug:"velour-sofa",
    name:"Velour Sofa Collection",
    tagline:"Plush velvet sofas in timeless silhouettes — built to last a lifetime.",
    description:"Our Velour Sofa Collection brings together the finest velvet-upholstered seating available today. Each piece is hand-crafted in our workshop using kiln-dried hardwood frames and premium high-density foam. The collection spans compact two-seaters to generous four-seat sectionals, all available in nine hand-dyed colourways.\n\nDesigned for longevity, every sofa in this collection carries our 10-year structural guarantee.",
    badge:"best_seller",
    room:"Living Room",
    pieces:12,
    year:2025,
    designer:"Studio Arvana",
    gallery:[
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=90",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=90",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=90",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=90",
    ],
    products:[
      { id:1,  name:"Velour 2-Seater",       slug:"velour-2-seater",   price:1890, old_price:2290, badge:"sale",        rating:4.8, reviews:64,  in_stock:true,  image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80" },
      { id:2,  name:"Velour 3-Seater",        slug:"velour-3-seater",   price:2490, old_price:2990, badge:"best_seller", rating:4.9, reviews:124, in_stock:true,  image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80" },
      { id:3,  name:"Velour Corner Sectional",slug:"velour-sectional",  price:3490, old_price:null, badge:"new_in",      rating:5.0, reviews:18,  in_stock:true,  image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80" },
      { id:4,  name:"Velour Armchair",        slug:"velour-armchair",   price:1200, old_price:null, badge:null,          rating:4.7, reviews:42,  in_stock:true,  image:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80" },
      { id:5,  name:"Velour Ottoman",         slug:"velour-ottoman",    price:490,  old_price:620,  badge:"sale",        rating:4.6, reviews:31,  in_stock:false, image:"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=700&q=80" },
      { id:6,  name:"Velour Chaise Longue",   slug:"velour-chaise",     price:1690, old_price:null, badge:"new_in",      rating:4.8, reviews:22,  in_stock:true,  image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80" },
    ],
  },
  "nordic-oak": {
    id:2, slug:"nordic-oak",
    name:"Nordic Oak Series",
    tagline:"Scandinavian craftsmanship in solid white oak — clean lines, enduring beauty.",
    description:"The Nordic Oak Series celebrates the quiet beauty of solid white oak. Inspired by Scandinavian design principles — simplicity, functionality, and natural materials — this collection spans seating, side tables, and storage.\n\nEvery joint is precision-cut by hand, finished with natural oil for a warm, tactile surface that improves with age.",
    badge:"new_in",
    room:"Living Room",
    pieces:8,
    year:2025,
    designer:"Lena Svensson",
    gallery:[
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=90",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=90",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=90",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=90",
    ],
    products:[
      { id:7,  name:"Nordic Dining Chair",    slug:"nordic-dining-chair",price:680,  old_price:null, badge:"new_in",      rating:4.8, reviews:38,  in_stock:true,  image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80" },
      { id:8,  name:"Nordic Side Table",      slug:"nordic-side-table",  price:420,  old_price:null, badge:null,          rating:4.7, reviews:25,  in_stock:true,  image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80" },
      { id:9,  name:"Nordic Desk",            slug:"nordic-desk",        price:940,  old_price:1100, badge:"sale",        rating:4.9, reviews:17,  in_stock:true,  image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80" },
      { id:10, name:"Nordic Shelf Unit",      slug:"nordic-shelf",       price:680,  old_price:null, badge:null,          rating:4.6, reviews:29,  in_stock:true,  image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80" },
    ],
  },
  "platform-beds": {
    id:3, slug:"platform-beds",
    name:"Platform Bed Frames",
    tagline:"Low-profile beds in solid oak and upholstered linen — serene by design.",
    description:"Our Platform Bed collection redefines bedroom calm. Each frame sits close to the ground in the Japanese tradition, creating a sense of spaciousness and serenity. Available in solid oak, walnut, and linen-upholstered finishes.\n\nAll beds include integrated slatted bases — no box spring needed — and are available in single, double, king, and super-king.",
    badge:"best_seller",
    room:"Bedroom",
    pieces:8,
    year:2024,
    designer:"Studio Arvana",
    gallery:[
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=90",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=90",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=90",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90",
    ],
    products:[
      { id:11, name:"Florence King Bed",      slug:"florence-king",      price:2100, old_price:null, badge:"best_seller", rating:5.0, reviews:86,  in_stock:true,  image:"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=700&q=80" },
      { id:12, name:"Florence Double Bed",    slug:"florence-double",    price:1690, old_price:null, badge:null,          rating:4.9, reviews:62,  in_stock:true,  image:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=700&q=80" },
      { id:13, name:"Florence Single Bed",    slug:"florence-single",    price:1290, old_price:null, badge:null,          rating:4.8, reviews:44,  in_stock:true,  image:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80" },
      { id:14, name:"Florence Bedside Table", slug:"florence-bedside",   price:380,  old_price:480,  badge:"sale",        rating:4.7, reviews:55,  in_stock:true,  image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" },
    ],
  },
};

// Default fallback for unknown slugs
const getCollection = (slug) => MOCK_COLLECTIONS[slug] || {
  ...MOCK_COLLECTIONS["velour-sofa"],
  slug, name: slug.replace(/-/g," ").replace(/\b\w/g,l=>l.toUpperCase()),
};

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
      <div className="cdp-prod-img-box" onClick={()=>navigate(`/products/${product.slug}`)}>
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
            onClick={e=>{e.stopPropagation();navigate(`/products/${product.slug}`)}}
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
          onClick={()=>navigate(`/products/${product.slug}`)}
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
              onClick={()=>navigate(`/products/${product.slug}`)}
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
  const { slug }   = useParams();
  const { t }      = useTranslation();
  const navigate   = useNavigate();

  const [coll,      setColl]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [heroLoaded,setHeroLoaded]= useState(false);
  const [lbOpen,    setLbOpen]    = useState(false);
  const [lbIdx,     setLbIdx]     = useState(0);
  const [addingId,  setAddingId]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [sortBy,    setSortBy]    = useState("default");
  const toastTimer = useRef(null);

  useEffect(() => {
    setLoading(true);
    setHeroLoaded(false);
    window.scrollTo({ top:0 });

    // Real API: collectionApi.getById(slug)
    //   .then(res => { setColl(res.data); ... })
    //   .catch(() => navigate("/rooms"))
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      setColl(getCollection(slug));
      setLoading(false);
      setTimeout(() => setHeroLoaded(true), 80);
    }, 380);
  }, [slug]);

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
      await cartApi.addItem(product.id, 1);
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2900);
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId]);

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