// src/pages/public/ProductDetailPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /products/:slug
//
//  Bölmələr:
//  • Şəkil qalereyası (thumbnail + böyük)
//  • Məhsul adı, qiymət, reytinq
//  • Rəng / material / ölçü seçimi
//  • Kəmiyyət + Səbətə əlavə et / Wishlist
//  • Tabs: Açıqlama / Spesifikasiyalar / Rəylər
//  • Bənzər məhsullar (scroll reveal)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cartApi    from "../../api/cartApi";
import Navbar     from "../../components/common/Navbar";
import Footer     from "../../components/common/Footer";

// ─────────────────────────────────────────────────────────────
//  MOCK DATA  (real API hazır olanda silin)
// ─────────────────────────────────────────────────────────────
const MOCK_PRODUCT = {
  id: 1,
  name: "Velour Lounge Sofa",
  slug: "velour-lounge-sofa",
  price: 2490,
  old_price: 2990,
  badge: "best_seller",
  rating: 4.8,
  review_count: 124,
  in_stock: true,
  stock_qty: 7,
  sku: "ARV-SOF-001",
  images: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=85",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=900&q=85",
  ],
  colors: [
    { value:"sage",      label:"Sage Green",  hex:"#7A9E7E" },
    { value:"terracotta",label:"Terracotta",   hex:"#C1654B" },
    { value:"cream",     label:"Cream",        hex:"#F5EDD8" },
    { value:"charcoal",  label:"Charcoal",     hex:"#3C3C3C" },
  ],
  materials: ["Velvet Fabric", "Solid Oak Legs", "High-Density Foam"],
  sizes: [
    { value:"2s", label:"2-Seater — 160cm" },
    { value:"3s", label:"3-Seater — 220cm" },
    { value:"4s", label:"4-Seater — 280cm" },
  ],
  description: `
    The Velour Lounge Sofa is the centrepiece of our living room collection — a piece
    designed for both beauty and endurance. Upholstered in premium velvet and supported
    by solid oak feet, every element is crafted to the highest specification.
    
    The deep seat cushions use high-density foam wrapped in soft fibre for a sink-in feel
    that retains its shape season after season. The frame is constructed from kiln-dried
    hardwood, precision-joined for stability and longevity.
  `,
  specs: [
    { label:"Width",       value:"220 cm" },
    { label:"Depth",       value:"94 cm"  },
    { label:"Height",      value:"82 cm"  },
    { label:"Seat Height", value:"42 cm"  },
    { label:"Weight",      value:"68 kg"  },
    { label:"Frame",       value:"Kiln-dried beech hardwood" },
    { label:"Upholstery",  value:"100% Velvet (polyester)" },
    { label:"Legs",        value:"Solid white oak" },
    { label:"Filling",     value:"High-density foam + fibre wrap" },
    { label:"Assembly",    value:"Professional delivery & setup included" },
  ],
  reviews: [
    { id:1, author:"Sarah M.", location:"London",   rating:5, date:"2025-02-10", text:"Absolutely stunning sofa. Worth every penny — the velvet is incredibly soft and the construction feels solid." },
    { id:2, author:"James K.", location:"New York",  rating:5, date:"2025-01-22", text:"Delivery and assembly were seamless. The sofa fits our living room perfectly — everyone who visits asks about it." },
    { id:3, author:"Amara D.", location:"Paris",    rating:4, date:"2024-12-15", text:"Beautiful piece. The colour is exactly as shown. Slightly firm at first but softened after a few weeks — very comfortable now." },
  ],
  category: { name:"Sofas", slug:"sofas" },
};

const MOCK_RELATED = [
  { id:2, name:"Ember Armchair",       slug:"ember-armchair",   price:1200, rating:5, image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80" },
  { id:3, name:"Aria Coffee Table",    slug:"aria-coffee-table", price:940,  rating:4, image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80" },
  { id:4, name:"Linen 3-Seater",       slug:"linen-3-seater",   price:1890, rating:5, image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" },
  { id:5, name:"Oslo Shelf Unit",      slug:"oslo-shelf-unit",  price:680,  rating:4, image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80" },
];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;

function Stars({ n, size = 13 }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length:5 }).map((_,i) => (
        <span key={i} style={{ fontSize:size, color: i < Math.floor(n) ? "#C9A84C" : i < n ? "#C9A84C" : "#D0CAC2" }}>★</span>
      ))}
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }),
      { threshold:0.1, rootMargin:"0px 0px -48px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

const BADGE_MAP = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

// ─────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes pdpFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pdpFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes pdpThumb   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  @keyframes pdpPop     { 0%{transform:scale(1)} 40%{transform:scale(.92)} 100%{transform:scale(1)} }
  @keyframes pdpToast   { 0%{opacity:0;transform:translateY(16px)} 12%,82%{opacity:1;transform:translateY(0)} 100%{opacity:0} }
  @keyframes pdpShimmer { 0%,100%{opacity:1} 50%{opacity:.4} }

  .reveal           { opacity:0; transform:translateY(22px); transition:opacity .7s cubic-bezier(.25,.46,.45,.94), transform .7s cubic-bezier(.25,.46,.45,.94); }
  .reveal.revealed  { opacity:1; transform:translateY(0); }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:4px }
  ::-webkit-scrollbar-thumb { background:#C8DBC9; border-radius:2px }
  ::selection { background:#C8DBC9; color:#1C1C1C }
  img { display:block; }

  .pdp-page { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; }

  /* ── BREADCRUMB ── */
  .pdp-bread { padding:28px 60px 0; margin-top:72px; display:flex; align-items:center; gap:8px; animation:pdpFadeIn .6s ease both; }
  .pdp-bread a { font-size:11px; letter-spacing:1.3px; text-transform:uppercase; color:#A8A8A8; text-decoration:none; transition:color .3s; }
  .pdp-bread a:hover { color:#7A9E7E; }
  .pdp-bread-sep { font-size:11px; color:#D0CAC2; }
  .pdp-bread-cur { font-size:11px; letter-spacing:1.3px; text-transform:uppercase; color:#4A4A4A; }

  /* ── PRODUCT SECTION ── */
  .pdp-product { display:grid; grid-template-columns:1fr 1fr; gap:0; padding:40px 60px 80px; animation:pdpFadeUp .8s cubic-bezier(.25,.46,.45,.94) .1s both; }

  /* ── GALLERY ── */
  .pdp-gallery { position:sticky; top:92px; align-self:flex-start; display:flex; gap:16px; }
  .pdp-thumbs  { display:flex; flex-direction:column; gap:10px; }
  .pdp-thumb   { width:72px; height:72px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:border-color .25s; flex-shrink:0; }
  .pdp-thumb.active { border-color:#7A9E7E; }
  .pdp-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
  .pdp-thumb:hover img { transform:scale(1.08); }
  .pdp-main-img-wrap { flex:1; aspect-ratio:1; overflow:hidden; background:#F7F3EE; position:relative; cursor:zoom-in; }
  .pdp-main-img { width:100%; height:100%; object-fit:cover; transition:transform .6s cubic-bezier(.25,.46,.45,.94), opacity .35s ease; }
  .pdp-main-img.changing { opacity:0; transform:scale(1.03); }
  .pdp-main-img-wrap:hover .pdp-main-img { transform:scale(1.04); }
  .pdp-badge-wrap { position:absolute; top:16px; left:16px; }
  .pdp-badge  { color:#fff; font-size:9px; letter-spacing:1.6px; text-transform:uppercase; padding:5px 12px; font-weight:600; }

  /* ── INFO PANEL ── */
  .pdp-info { padding-left:64px; display:flex; flex-direction:column; gap:0; }

  .pdp-info-top { margin-bottom:24px; }
  .pdp-category { font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:#7A9E7E; margin-bottom:10px; text-decoration:none; display:inline-block; transition:opacity .3s; }
  .pdp-category:hover { opacity:.7; }
  .pdp-name { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,3.5vw,50px); font-weight:300; color:#1C1C1C; line-height:1.05; margin-bottom:16px; }
  .pdp-rating-row { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
  .pdp-rating-score { font-size:14px; font-weight:500; color:#1C1C1C; }
  .pdp-rating-count { font-size:13px; color:#A8A8A8; text-decoration:underline; cursor:pointer; transition:color .3s; }
  .pdp-rating-count:hover { color:#7A9E7E; }

  .pdp-divider { height:1px; background:#F0EBE4; margin:20px 0; }

  /* Price */
  .pdp-price-row { display:flex; align-items:baseline; gap:14px; margin-bottom:8px; }
  .pdp-price     { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:300; color:#1C1C1C; }
  .pdp-old-price { font-size:18px; color:#A8A8A8; text-decoration:line-through; }
  .pdp-save-tag  { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#fff; background:#D4714A; padding:4px 10px; }
  .pdp-tax-note  { font-size:12px; color:#A8A8A8; }
  .pdp-stock-badge { display:inline-flex; align-items:center; gap:6px; margin-top:6px; font-size:12px; }
  .pdp-stock-dot { width:7px; height:7px; border-radius:50%; }
  .pdp-stock-dot.green { background:#4CAF50; }
  .pdp-stock-dot.red   { background:#F44336; }

  /* Color picker */
  .pdp-option-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#A8A8A8; margin-bottom:10px; font-weight:500; }
  .pdp-option-label span { color:#1C1C1C; font-weight:500; }
  .pdp-colors { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px; }
  .pdp-color  { width:32px; height:32px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:all .25s; position:relative; outline:none; }
  .pdp-color::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:2px solid transparent; transition:border-color .25s; }
  .pdp-color.active::after { border-color:#1C1C1C; }
  .pdp-color:hover { transform:scale(1.1); }

  /* Size picker */
  .pdp-sizes { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
  .pdp-size  { padding:12px 16px; border:1.5px solid #E5DDD4; background:#fff; font-size:13px; font-family:'DM Sans',sans-serif; color:#4A4A4A; cursor:pointer; text-align:left; transition:all .25s; }
  .pdp-size:hover  { border-color:#7A9E7E; color:#1C1C1C; }
  .pdp-size.active { border-color:#1C1C1C; background:#1C1C1C; color:#fff; }

  /* Qty + CTA */
  .pdp-qty-cta  { display:flex; gap:12px; align-items:stretch; margin-bottom:16px; }
  .pdp-qty      { display:flex; align-items:center; border:1.5px solid #E5DDD4; flex-shrink:0; }
  .pdp-qty-btn  { width:44px; height:52px; background:none; border:none; font-size:20px; color:#4A4A4A; cursor:pointer; transition:background .25s, color .25s; }
  .pdp-qty-btn:hover { background:#F7F3EE; }
  .pdp-qty-val  { width:44px; text-align:center; font-size:15px; font-weight:500; color:#1C1C1C; }
  .pdp-cart-btn { flex:1; padding:0 32px; height:52px; background:#1C1C1C; color:#fff; font-size:12px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .35s; white-space:nowrap; }
  .pdp-cart-btn:hover:not(:disabled) { background:#7A9E7E; }
  .pdp-cart-btn.adding { background:#7A9E7E; }
  .pdp-cart-btn:disabled { opacity:.4; cursor:not-allowed; }

  .pdp-wish-row { display:flex; align-items:center; gap:8px; }
  .pdp-wish-btn { flex:1; padding:13px; border:1.5px solid #E5DDD4; background:#fff; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4A4A4A; cursor:pointer; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .3s; }
  .pdp-wish-btn:hover { border-color:#7A9E7E; color:#7A9E7E; }
  .pdp-share-btn { width:52px; height:52px; border:1.5px solid #E5DDD4; background:#fff; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .3s; flex-shrink:0; }
  .pdp-share-btn:hover { border-color:#7A9E7E; }

  /* Delivery info strip */
  .pdp-delivery { display:flex; flex-direction:column; gap:10px; margin-top:20px; padding:18px; background:#F7F3EE; }
  .pdp-delivery-item { display:flex; align-items:center; gap:12px; font-size:13px; color:#4A4A4A; }
  .pdp-delivery-icon { font-size:16px; flex-shrink:0; }

  /* ── TABS ── */
  .pdp-tabs-section { padding:0 60px 80px; }
  .pdp-tab-nav { display:flex; border-bottom:1px solid #F0EBE4; margin-bottom:40px; }
  .pdp-tab-btn { padding:14px 28px; font-size:12px; letter-spacing:1.3px; text-transform:uppercase; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; color:#A8A8A8; font-family:'DM Sans',sans-serif; transition:all .25s; margin-bottom:-1px; flex-shrink:0; }
  .pdp-tab-btn:hover { color:#1C1C1C; }
  .pdp-tab-btn.active { color:#1C1C1C; border-bottom-color:#7A9E7E; font-weight:500; }

  /* Description tab */
  .pdp-desc { font-size:15px; color:#4A4A4A; line-height:1.9; max-width:680px; white-space:pre-line; }
  .pdp-materials-list { display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; }
  .pdp-mat-chip { padding:7px 16px; border:1px solid #E5DDD4; font-size:12px; color:#6B6B6B; letter-spacing:.5px; }

  /* Specs tab */
  .pdp-specs { max-width:560px; }
  .pdp-spec-row { display:grid; grid-template-columns:180px 1fr; padding:14px 0; border-bottom:1px solid #F7F3EE; }
  .pdp-spec-row:first-child { border-top:1px solid #F7F3EE; }
  .pdp-spec-label { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#A8A8A8; }
  .pdp-spec-val   { font-size:13px; color:#1C1C1C; }

  /* Reviews tab */
  .pdp-reviews-summary { display:flex; align-items:center; gap:40px; margin-bottom:36px; padding-bottom:32px; border-bottom:1px solid #F0EBE4; }
  .pdp-reviews-score { text-align:center; }
  .pdp-reviews-score-n { font-family:'Cormorant Garamond',serif; font-size:64px; font-weight:300; color:#1C1C1C; line-height:1; display:block; }
  .pdp-reviews-score-l { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#A8A8A8; }
  .pdp-reviews-list { display:flex; flex-direction:column; gap:24px; max-width:680px; }
  .pdp-review-card { padding:28px; background:#F7F3EE; }
  .pdp-review-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .pdp-review-author { font-size:14px; font-weight:500; color:#1C1C1C; }
  .pdp-review-meta { font-size:12px; color:#A8A8A8; }
  .pdp-review-text { font-size:14px; color:#4A4A4A; line-height:1.75; font-style:italic; }

  /* ── RELATED PRODUCTS ── */
  .pdp-related { padding:0 60px 80px; }
  .pdp-related-title { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; color:#1C1C1C; margin-bottom:36px; }
  .pdp-related-title em { font-style:italic; color:#7A9E7E; }
  .pdp-related-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .pdp-rel-card { cursor:pointer; text-decoration:none; display:block; }
  .pdp-rel-iw   { aspect-ratio:4/5; overflow:hidden; background:#F7F3EE; margin-bottom:14px; }
  .pdp-rel-img  { width:100%; height:100%; object-fit:cover; transition:transform .65s cubic-bezier(.25,.46,.45,.94); }
  .pdp-rel-card:hover .pdp-rel-img { transform:scale(1.06); }
  .pdp-rel-name { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; color:#1C1C1C; margin-bottom:6px; transition:color .3s; }
  .pdp-rel-card:hover .pdp-rel-name { color:#7A9E7E; }
  .pdp-rel-price { font-size:15px; font-weight:500; color:#1C1C1C; }

  /* Toast */
  .pdp-toast { position:fixed; bottom:32px; right:32px; z-index:500; background:#1C1C1C; color:#fff; padding:14px 24px; font-size:13px; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px; animation:pdpToast 2.6s ease forwards; box-shadow:0 8px 24px rgba(28,28,28,.28); }
  .pdp-toast-icon { color:#7A9E7E; }

  /* Skeleton */
  .pdp-skeleton { display:grid; grid-template-columns:1fr 1fr; gap:0; padding:112px 60px 80px; }
  .pdp-sk-gallery { display:flex; gap:16px; }
  .pdp-sk-thumbs  { display:flex; flex-direction:column; gap:10px; }
  .pdp-sk-thumb   { width:72px; height:72px; background:#F7F3EE; animation:pdpShimmer 1.5s ease-in-out infinite; }
  .pdp-sk-main    { flex:1; aspect-ratio:1; background:#F7F3EE; animation:pdpShimmer 1.5s ease-in-out infinite; }
  .pdp-sk-info    { padding-left:64px; display:flex; flex-direction:column; gap:16px; padding-top:8px; }
  .pdp-sk-line    { height:14px; background:#F7F3EE; animation:pdpShimmer 1.5s ease-in-out infinite; border-radius:2px; }

  /* Responsive */
  @media(max-width:1024px) {
    .pdp-product { grid-template-columns:1fr; padding:28px 24px 60px; }
    .pdp-gallery { position:static; margin-bottom:40px; }
    .pdp-info { padding-left:0; }
    .pdp-tabs-section, .pdp-related { padding-left:24px; padding-right:24px; }
    .pdp-bread { padding-left:24px; }
    .pdp-related-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:640px) {
    .pdp-thumbs { flex-direction:row; }
    .pdp-thumb  { width:60px; height:60px; }
    .pdp-gallery { flex-direction:column-reverse; }
    .pdp-related-grid { grid-template-columns:1fr; }
    .pdp-reviews-summary { flex-direction:column; align-items:flex-start; gap:20px; }
    .pdp-toast { left:16px; right:16px; bottom:16px; }
    .pdp-qty-cta { flex-direction:column; }
    .pdp-cart-btn { height:48px; }
  }
`;

// ─────────────────────────────────────────────────────────────
//  PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug }     = useParams();
  const { t }        = useTranslation();
  const navigate     = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [related,    setRelated]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // User selections
  const [activeImg,  setActiveImg]  = useState(0);
  const [imgChange,  setImgChange]  = useState(false); // fade animation flag
  const [selColor,   setSelColor]   = useState(null);
  const [selSize,    setSelSize]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [activeTab,  setActiveTab]  = useState("description");
  const [adding,     setAdding]     = useState(false);
  const [toast,      setToast]      = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const toastTimer = useRef(null);

  useScrollReveal();

  // ── Fetch ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setSelColor(null);
    setSelSize(null);
    setQty(1);

    // productApi.getBySlug(slug)
    //   .then(res => { setProduct(res.data.product); setRelated(res.data.related || []); })
    //   .catch(() => navigate("/furniture-categories"))
    //   .finally(() => setLoading(false));

    // Mock:
    setTimeout(() => {
      setProduct(MOCK_PRODUCT);
      setRelated(MOCK_RELATED);
      setLoading(false);
    }, 450);

    window.scrollTo({ top:0 });
  }, [slug]);

  // ── Image switch with fade ─────────────────────────────────
  const switchImage = useCallback((idx) => {
    if (idx === activeImg) return;
    setImgChange(true);
    setTimeout(() => {
      setActiveImg(idx);
      setImgChange(false);
    }, 200);
  }, [activeImg]);

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (!product?.in_stock || adding) return;
    setAdding(true);
    try {
      await cartApi.addItem(product.id, qty);
      clearTimeout(toastTimer.current);
      setToast(true);
      toastTimer.current = setTimeout(() => setToast(false), 2800);
    } catch {}
    setTimeout(() => setAdding(false), 1200);
  }, [product, qty, adding]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pdp-page">
          <Navbar />
          <div className="pdp-skeleton">
            <div className="pdp-sk-gallery">
              <div className="pdp-sk-thumbs">
                {[0,1,2,3].map(i => <div key={i} className="pdp-sk-thumb" style={{ animationDelay:`${i*.12}s` }} />)}
              </div>
              <div className="pdp-sk-main" />
            </div>
            <div className="pdp-sk-info">
              <div className="pdp-sk-line" style={{ width:"40%",height:12 }} />
              <div className="pdp-sk-line" style={{ width:"80%",height:36 }} />
              <div className="pdp-sk-line" style={{ width:"60%",height:28 }} />
              <div className="pdp-sk-line" style={{ width:"30%",height:20 }} />
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!product) return null;

  const saveAmount = product.old_price ? product.old_price - product.price : 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="pdp-page">
        <Navbar />

        {/* Breadcrumb */}
        <nav className="pdp-bread">
          <Link to="/">Home</Link>
          <span className="pdp-bread-sep">/</span>
          <Link to="/furniture-categories">Categories</Link>
          <span className="pdp-bread-sep">/</span>
          <Link to={`/furniture-categories/${product.category.slug}`}>{product.category.name}</Link>
          <span className="pdp-bread-sep">/</span>
          {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
          <span className="pdp-bread-cur">{product.name}</span>
        </nav>

        {/* ── PRODUCT SECTION ── */}
        <section className="pdp-product">

          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className={`pdp-thumb${activeImg === i ? " active" : ""}`}
                  onClick={() => switchImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i+1}`} loading="lazy" />
                </div>
              ))}
            </div>
            <div className="pdp-main-img-wrap">
              <img
                className={`pdp-main-img${imgChange ? " changing" : ""}`}
                src={product.images[activeImg]}
                alt={product.name}
              />
              {product.badge && (
                <div className="pdp-badge-wrap">
                  <span className="pdp-badge" style={{ background: BADGE_MAP[product.badge] }}>
                    {t(`common.${product.badge}`)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="pdp-info">
            <div className="pdp-info-top">
              {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
              <Link to={`/furniture-categories/${product.category.slug}`} className="pdp-category">
                {product.category.name}
              </Link>
              <h1 className="pdp-name">{product.name}</h1>
              <div className="pdp-rating-row">
                <Stars n={product.rating} />
                <span className="pdp-rating-score">{product.rating}</span>
                <button className="pdp-rating-count" onClick={() => setActiveTab("reviews")}>
                  ({product.review_count} reviews)
                </button>
              </div>
            </div>

            <div className="pdp-divider" />

            {/* Price */}
            <div className="pdp-price-row">
              <span className="pdp-price">{fmt(product.price)}</span>
              {product.old_price && <span className="pdp-old-price">{fmt(product.old_price)}</span>}
              {saveAmount > 0 && <span className="pdp-save-tag">Save {fmt(saveAmount)}</span>}
            </div>
            <p className="pdp-tax-note">Inc. VAT · Free delivery on all orders</p>
            <div className="pdp-stock-badge">
              <span className={`pdp-stock-dot${product.in_stock ? " green" : " red"}`} />
              <span style={{ fontSize:12, color: product.in_stock ? "#4CAF50" : "#F44336" }}>
                {product.in_stock
                  ? `In Stock (${product.stock_qty} left)`
                  : t("common.out_of_stock")}
              </span>
            </div>

            <div className="pdp-divider" />

            {/* Color */}
            <div>
              <p className="pdp-option-label">
                Color: <span>{selColor ? product.colors.find(c=>c.value===selColor)?.label : "Select"}</span>
              </p>
              <div className="pdp-colors">
                {product.colors.map(c => (
                  <button
                    key={c.value}
                    className={`pdp-color${selColor===c.value?" active":""}`}
                    style={{ background:c.hex }}
                    onClick={() => setSelColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="pdp-option-label" style={{ marginTop:4 }}>
                  Size: <span>{selSize ? product.sizes.find(s=>s.value===selSize)?.label : "Select"}</span>
                </p>
                <div className="pdp-sizes">
                  {product.sizes.map(s => (
                    <button
                      key={s.value}
                      className={`pdp-size${selSize===s.value?" active":""}`}
                      onClick={() => setSelSize(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-divider" />

            {/* Qty + Cart */}
            <div className="pdp-qty-cta">
              <div className="pdp-qty">
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
                <span className="pdp-qty-val">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q => Math.min(product.stock_qty, q+1))}>+</button>
              </div>
              <button
                className={`pdp-cart-btn${adding ? " adding" : ""}`}
                disabled={!product.in_stock || adding}
                onClick={handleAddToCart}
              >
                {adding
                  ? "Added to Cart ✓"
                  : !product.in_stock
                    ? t("common.out_of_stock")
                    : t("common.add_to_cart")}
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="pdp-wish-row">
              <button
                className="pdp-wish-btn"
                onClick={() => setWishlisted(w => !w)}
              >
                <span style={{ color: wishlisted ? "#D4714A" : undefined }}>
                  {wishlisted ? "♥" : "♡"}
                </span>
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
              <button className="pdp-share-btn" title="Share">⤴</button>
            </div>

            {/* Delivery info */}
            <div className="pdp-delivery">
              <div className="pdp-delivery-item"><span className="pdp-delivery-icon">🚚</span><span>Free white-glove delivery & assembly</span></div>
              <div className="pdp-delivery-item"><span className="pdp-delivery-icon">🛡️</span><span>10-year structural guarantee</span></div>
              <div className="pdp-delivery-item"><span className="pdp-delivery-icon">↩️</span><span>30-day easy returns</span></div>
            </div>
          </div>
        </section>

        {/* ── TABS ── */}
        <section className="pdp-tabs-section">
          <div className="pdp-tab-nav">
            {[
              { key:"description",    label:"Description"       },
              { key:"specifications", label:"Specifications"    },
              { key:"reviews",        label:`Reviews (${product.review_count})` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`pdp-tab-btn${activeTab===tab.key?" active":""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === "description" && (
            <div className="reveal">
              {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
              <p className="pdp-desc">{product.description}</p>
              <div className="pdp-materials-list">
                {product.materials.map(m => <span key={m} className="pdp-mat-chip">{m}</span>)}
              </div>
            </div>
          )}

          {/* Specs */}
          {activeTab === "specifications" && (
            <div className="pdp-specs reveal">
              {product.specs.map(s => (
                <div key={s.label} className="pdp-spec-row">
                  <span className="pdp-spec-label">{s.label}</span>
                  <span className="pdp-spec-val">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="reveal">
              <div className="pdp-reviews-summary">
                <div className="pdp-reviews-score">
                  <span className="pdp-reviews-score-n">{product.rating}</span>
                  <Stars n={product.rating} size={16} />
                  <span className="pdp-reviews-score-l">{product.review_count} reviews</span>
                </div>
              </div>
              <div className="pdp-reviews-list">
                {product.reviews.map((r, i) => (
                  <div key={r.id} className="pdp-review-card reveal" style={{ transitionDelay:`${i*80}ms` }}>
                    <div className="pdp-review-head">
                      <div>
                        <p className="pdp-review-author">{r.author}</p>
                        <p className="pdp-review-meta">{r.location} · {r.date}</p>
                      </div>
                      <Stars n={r.rating} />
                    </div>
                    {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
                    <p className="pdp-review-text">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="pdp-related">
            <h2 className="pdp-related-title">You May Also <em>Like</em></h2>
            <div className="pdp-related-grid">
              {related.map((r, i) => (
                <Link
                  key={r.id}
                  to={`/products/${r.slug}`}
                  className={`pdp-rel-card reveal`}
                  style={{ transitionDelay:`${i*90}ms` }}
                >
                  <div className="pdp-rel-iw">
                    {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
                    <img className="pdp-rel-img" src={r.image} alt={r.name} loading="lazy" />
                  </div>
                  <h3 className="pdp-rel-name">{r.name}</h3>
                  <Stars n={r.rating} />
                  <p className="pdp-rel-price" style={{ marginTop:8 }}>{fmt(r.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Toast */}
        {toast && (
          <div className="pdp-toast">
            <span className="pdp-toast-icon">✓</span>
            <span><strong>{qty}× {product.name}</strong> added to cart</span>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
