// src/pages/public/FurnitureCategoryPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /category/:slug   (məs: /category/sofas, /category/beds)
//
//  Sol tərəf  → Zəngin filter sidebar (qiymət, rəng, material,
//               brend, stil, reytinq, stok)
//  Sağ tərəf  → Məhsul grid, sort, pagination
//  Animasiya  → Scroll reveal (IntersectionObserver)
//
//  Real API:
//    categoryApi.getBySlug(slug)          → kateqoriya məlumatı
//    categoryApi.getProducts(id, params)  → məhsullar + pagination
//    categoryApi.getFilters(id)           → mövcud filter seçimləri
//
//  Filter state URL-də saxlanılır — paylaşmaq, geri qaytarmaq olar
// ═══════════════════════════════════════════════════════════════

import {
  useState, useEffect, useCallback, useMemo,
  useRef, memo
} from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import categoryApi from "../../api/categoryApi";
import cartApi     from "../../api/cartApi";
import Navbar      from "../../components/common/Navbar";
import Footer      from "../../components/common/Footer";
import Pagination  from "../../components/common/Pagination";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const PAGE_SIZE     = 12;
const SIDEBAR_W     = 288;

// Mock filter options — real API-dan gelecek
// categoryApi.getFilters(id) bu strukturu qaytarmalıdır
const MOCK_FILTERS = {
  price: { min: 0, max: 15000 },
  colors: [
    { value: "white",    label: "White",   hex: "#F5F5F5" },
    { value: "beige",    label: "Beige",   hex: "#E8DCC8" },
    { value: "grey",     label: "Grey",    hex: "#9E9E9E" },
    { value: "black",    label: "Black",   hex: "#212121" },
    { value: "brown",    label: "Brown",   hex: "#795548" },
    { value: "green",    label: "Green",   hex: "#7A9E7E" },
    { value: "blue",     label: "Blue",    hex: "#5C8DB8" },
    { value: "terracotta", label: "Terracotta", hex: "#C1654B" },
    { value: "mustard",  label: "Mustard", hex: "#C9A84C" },
  ],
  materials: [
    { value: "solid_oak",    label: "Solid Oak",      count: 42 },
    { value: "walnut",       label: "Walnut",          count: 28 },
    { value: "pine",         label: "Pine",            count: 19 },
    { value: "linen",        label: "Linen Fabric",    count: 35 },
    { value: "velvet",       label: "Velvet",          count: 22 },
    { value: "leather",      label: "Full Leather",    count: 17 },
    { value: "rattan",       label: "Rattan",          count: 11 },
    { value: "marble",       label: "Marble",          count: 8  },
    { value: "metal",        label: "Metal Frame",     count: 31 },
  ],
  brands: [
    { value: "arvana",     label: "Arvana Originals", count: 54 },
    { value: "nordic_co",  label: "Nordic & Co.",     count: 23 },
    { value: "atelier_b",  label: "Atelier Bois",     count: 18 },
    { value: "forma",      label: "Forma Studio",     count: 15 },
    { value: "terra",      label: "Terra Home",       count: 12 },
  ],
  styles: [
    { value: "scandinavian", label: "Scandinavian" },
    { value: "modern",       label: "Modern"       },
    { value: "industrial",   label: "Industrial"   },
    { value: "bohemian",     label: "Bohemian"     },
    { value: "classic",      label: "Classic"      },
    { value: "minimalist",   label: "Minimalist"   },
  ],
  ratings: [4, 3, 2],
};

// Mock products — real API qaytarana qədər
const MOCK_PRODUCTS = Array.from({ length: 24 }, (_, i) => ({
  id:           i + 1,
  name:         ["Velour Lounge Sofa","Nordic Oak Chair","Florence Platform Bed",
                 "Aria Coffee Table","Ember Armchair","Oslo Shelf Unit",
                 "Linen 3-Seater","Heirloom Dining Table","Brass Arc Lamp",
                 "Marble Side Table","Rattan Lounge Chair","Teak Desk"][i % 12],
  slug:         `product-${i + 1}`,
  price:        [2490,680,2100,940,1200,680,1890,3400,380,520,1100,1600][i % 12],
  old_price:    [2990,null,null,null,null,820,null,3900,null,null,null,null][i % 12],
  badge:        ["best_seller","new_in",null,"new_in",null,"sale",null,"sale",null,null,"new_in",null][i % 12],
  rating:       4 + (i % 2 === 0 ? 1 : 0),
  review_count: 12 + i * 3,
  in_stock:     i % 7 !== 0,
  image:        [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  ][i % 12],
}));

// ─────────────────────────────────────────────────────────────
//  SCROLL REVEAL HOOK
// ─────────────────────────────────────────────────────────────
function useScrollReveal(selector = ".reveal") {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const fmt       = (n)  => `$${Number(n).toLocaleString()}`;
const clamp     = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function Stars({ n, count }) {
  return (
    <div className="fcp-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "fcp-star filled" : "fcp-star"}>★</span>
      ))}
      {count != null && <span className="fcp-star-count">({count})</span>}
    </div>
  );
}

const BADGE_MAP = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

// ─────────────────────────────────────────────────────────────
//  PRODUCT CARD  (memoized)
// ─────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product, idx, addingId, onAddToCart, t }) {
  const navigate = useNavigate();

  return (
    <article
      className="fcp-card reveal"
      style={{ transitionDelay: `${(idx % PAGE_SIZE) * 60}ms` }}
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      <div className="fcp-card-img-wrap">
        <img
          className="fcp-card-img"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        {/* Badge — DB key-i i18n-ə map olur */}
        {product.badge && (
          <span className="fcp-badge" style={{ background: BADGE_MAP[product.badge] }}>
            {t(`common.${product.badge}`)}
          </span>
        )}


        {/* Hover actions */}
        <div className="fcp-card-hover-acts">
          <button
            className="fcp-quick-view"
            onClick={e => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}
          >
            {t("common.view_details")}
          </button>
          <button
            className="fcp-wish-btn"
            onClick={e => e.stopPropagation()}
            aria-label="Wishlist"
          >♡</button>
        </div>
      </div>

      <div className="fcp-card-body">

        <h3 className="fcp-card-name">{product.name}</h3>

        <Stars n={product.rating} count={product.review_count} />

        <div className="fcp-card-foot">
          <div className="fcp-price-group">
            <span className="fcp-price">{fmt(product.price)}</span>
            {product.old_price && (
              <span className="fcp-old-price">{fmt(product.old_price)}</span>
            )}
          </div>

          <button
            className={`fcp-add-btn${addingId === product.id ? " adding" : ""}${!product.in_stock ? " disabled" : ""}`}
            disabled={!product.in_stock || addingId === product.id}
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          >
            {addingId === product.id ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
});

// ─────────────────────────────────────────────────────────────
//  FILTER SIDEBAR
// ─────────────────────────────────────────────────────────────
function FilterSidebar({ filterData, local, onChange, onApply, onReset, hasActive, t }) {
  // Accordion state — hangi bölmə açıqdır
  const [open, setOpen] = useState({
    price: true, colors: true, materials: true,
    brands: false, styles: false, rating: false, stock: true,
  });

  const toggle = key => setOpen(p => ({ ...p, [key]: !p[key] }));

  const Section = ({ id, label, children }) => (
    <div className="fcp-fs-section">
      <button className="fcp-fs-section-head" onClick={() => toggle(id)}>
        <span>{label}</span>
        <span className={`fcp-fs-chevron${open[id] ? " open" : ""}`}>›</span>
      </button>
      {open[id] && <div className="fcp-fs-section-body">{children}</div>}
    </div>
  );

  const checkToggle = (key, val) => {
    const cur = local[key] || [];
    onChange(key, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

  const { price, colors, materials, brands, styles, ratings } = filterData;
  const priceMin = Number(local.price_min || price.min);
  const priceMax = Number(local.price_max || price.max);

  return (
    <aside className="fcp-sidebar">
      {/* Sidebar header */}
      <div className="fcp-fs-header">
        <span className="fcp-fs-title">Filters</span>
        {hasActive && (
          <button className="fcp-fs-reset" onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Price range ── */}
      <Section id="price" label="Price range">
        <div className="fcp-price-display">
          <span>{fmt(priceMin)}</span>
          <span>{fmt(priceMax)}</span>
        </div>
        {/* Dual slider simulation with two range inputs */}
        <div className="fcp-dual-range">
          <input
            type="range"
            className="fcp-range fcp-range-min"
            min={price.min}
            max={price.max}
            step={50}
            value={priceMin}
            onChange={e => {
              const v = clamp(Number(e.target.value), price.min, priceMax - 50);
              onChange("price_min", v);
            }}
          />
          <input
            type="range"
            className="fcp-range fcp-range-max"
            min={price.min}
            max={price.max}
            step={50}
            value={priceMax}
            onChange={e => {
              const v = clamp(Number(e.target.value), priceMin + 50, price.max);
              onChange("price_max", v);
            }}
          />
        </div>
        <div className="fcp-price-inputs">
          <div className="fcp-price-field">
            <label>Min</label>
            <input
              type="number"
              value={priceMin}
              min={price.min}
              max={priceMax}
              onChange={e => onChange("price_min", Number(e.target.value))}
            />
          </div>
          <div className="fcp-price-sep">—</div>
          <div className="fcp-price-field">
            <label>Max</label>
            <input
              type="number"
              value={priceMax}
              min={priceMin}
              max={price.max}
              onChange={e => onChange("price_max", Number(e.target.value))}
            />
          </div>
        </div>
      </Section>

      {/* ── In Stock toggle ── */}
      <Section id="stock" label="Availability">
        <label className="fcp-toggle-row">
          <div
            className={`fcp-toggle${local.in_stock ? " on" : ""}`}
            onClick={() => onChange("in_stock", !local.in_stock)}
          >
            <div className="fcp-toggle-knob" />
          </div>
          <span>In stock only</span>
        </label>
      </Section>

      {/* ── Colors ── */}
      <Section id="colors" label="Color">
        <div className="fcp-colors">
          {colors.map(c => (
            <button
              key={c.value}
              className={`fcp-color${(local.colors || []).includes(c.value) ? " active" : ""}`}
              style={{ background: c.hex }}
              onClick={() => checkToggle("colors", c.value)}
              title={c.label}
            />
          ))}
        </div>
        {(local.colors || []).length > 0 && (
          <p className="fcp-fs-selected">
            {(local.colors || []).map(v => colors.find(c => c.value === v)?.label).filter(Boolean).join(", ")}
          </p>
        )}
      </Section>

      {/* ── Materials ── */}
      <Section id="materials" label="Material">
        <div className="fcp-checklist">
          {materials.map(m => (
            <label key={m.value} className="fcp-check-row">
              <span className={`fcp-checkbox${(local.materials || []).includes(m.value) ? " on" : ""}`}>
                {(local.materials || []).includes(m.value) && <span>✓</span>}
              </span>
              <input
                type="checkbox"
                hidden
                checked={(local.materials || []).includes(m.value)}
                onChange={() => checkToggle("materials", m.value)}
              />
              <span className="fcp-check-label">{m.label}</span>
              <span className="fcp-check-count">{m.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Brands ── */}
      <Section id="brands" label="Brand">
        <div className="fcp-checklist">
          {brands.map(b => (
            <label key={b.value} className="fcp-check-row">
              <span className={`fcp-checkbox${(local.brands || []).includes(b.value) ? " on" : ""}`}>
                {(local.brands || []).includes(b.value) && <span>✓</span>}
              </span>
              <input
                type="checkbox"
                hidden
                checked={(local.brands || []).includes(b.value)}
                onChange={() => checkToggle("brands", b.value)}
              />
              <span className="fcp-check-label">{b.label}</span>
              <span className="fcp-check-count">{b.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Style ── */}
      <Section id="styles" label="Style">
        <div className="fcp-chips">
          {styles.map(s => (
            <button
              key={s.value}
              className={`fcp-style-chip${(local.styles || []).includes(s.value) ? " active" : ""}`}
              onClick={() => checkToggle("styles", s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Rating ── */}
      <Section id="rating" label="Minimum Rating">
        <div className="fcp-rating-list">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              className={`fcp-rating-row${local.min_rating === r ? " active" : ""}`}
              onClick={() => onChange("min_rating", local.min_rating === r ? null : r)}
            >
              <div className="fcp-rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r ? "fcp-star filled" : "fcp-star"}>★</span>
                ))}
              </div>
              <span className="fcp-rating-label">& above</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Apply */}
      <button className="fcp-apply-btn" onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  /* ── Keyframes ── */
  @keyframes fcpHeroIn  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fcpReveal  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fcpShimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes fcpDrawer  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes fcpBgIn    { from{opacity:0} to{opacity:1} }
  @keyframes fcpPop     { 0%{transform:scale(1)} 40%{transform:scale(.9)} 100%{transform:scale(1)} }
  @keyframes fcpBadgeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fcpToast   { 0%{opacity:0;transform:translateY(16px)} 15%,80%{opacity:1;transform:translateY(0)} 100%{opacity:0} }

  /* ── Scroll reveal ── */
  .reveal            { opacity:0; transform:translateY(24px); transition:opacity .65s cubic-bezier(.25,.46,.45,.94), transform .65s cubic-bezier(.25,.46,.45,.94); }
  .reveal.revealed   { opacity:1; transform:translateY(0); }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:4px }
  ::-webkit-scrollbar-track { background:#F7F3EE }
  ::-webkit-scrollbar-thumb { background:#C8DBC9; border-radius:2px }
  ::selection { background:#C8DBC9; color:#1C1C1C }
  img { display:block; }

  .fcp-page { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; }

  /* ── HERO BAND ── */
  .fcp-hero { position:relative; height:380px; overflow:hidden; display:flex; align-items:flex-end; margin-top:72px; }
  .fcp-hero-bg { position:absolute; inset:0; background-size:cover; background-position:center; transform:scale(1.04); transition:transform 1.2s ease; }
  .fcp-hero.loaded .fcp-hero-bg { transform:scale(1); }
  .fcp-hero-ov { position:absolute; inset:0; background:linear-gradient(to top, rgba(20,20,20,.8) 0%, rgba(20,20,20,.15) 55%, transparent 100%); }
  .fcp-hero-ct { position:relative; z-index:2; padding:0 60px 52px; width:100%; animation:fcpHeroIn .9s cubic-bezier(.25,.46,.45,.94) both; }
  .fcp-hero-bread { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
  .fcp-hero-bread a { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.48); text-decoration:none; transition:color .3s; }
  .fcp-hero-bread a:hover { color:#fff; }
  .fcp-hero-bread-sep { font-size:11px; color:rgba(255,255,255,.25); }
  .fcp-hero-bread-cur { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.78); }
  .fcp-hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(48px,6.5vw,92px); font-weight:300; color:#fff; line-height:.95; letter-spacing:-1px; }
  .fcp-hero-h1 em { font-style:italic; color:#C8DBC9; }
  .fcp-hero-meta { position:absolute; bottom:52px; right:60px; text-align:right; z-index:2; animation:fcpHeroIn .9s .2s cubic-bezier(.25,.46,.45,.94) both; }
  .fcp-hero-count { font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:rgba(255,255,255,.9); line-height:1; display:block; }
  .fcp-hero-count-label { font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,.38); }

  /* ── LAYOUT ── */
  .fcp-layout { display:flex; align-items:flex-start; }

  /* ── SIDEBAR ── */
  .fcp-sidebar { width:${SIDEBAR_W}px; flex-shrink:0; position:sticky; top:72px; height:calc(100vh - 72px); overflow-y:auto; border-right:1px solid #F0EBE4; padding:32px 28px 60px; }
  .fcp-sidebar::-webkit-scrollbar { width:3px; }
  .fcp-sidebar::-webkit-scrollbar-thumb { background:#E5DDD4; border-radius:2px; }

  .fcp-fs-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #F0EBE4; }
  .fcp-fs-title  { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:#1C1C1C; }
  .fcp-fs-reset  { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#D4714A; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity .3s; }
  .fcp-fs-reset:hover { opacity:.7; }

  /* Accordion section */
  .fcp-fs-section { border-bottom:1px solid #F0EBE4; }
  .fcp-fs-section-head { width:100%; display:flex; align-items:center; justify-content:space-between; padding:16px 0; background:none; border:none; cursor:pointer; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#1C1C1C; font-family:'DM Sans',sans-serif; font-weight:500; }
  .fcp-fs-chevron { font-size:18px; color:#A8A8A8; transition:transform .3s cubic-bezier(.34,1.56,.64,1); display:inline-block; }
  .fcp-fs-chevron.open { transform:rotate(90deg); }
  .fcp-fs-section-body { padding-bottom:20px; }

  /* Price slider */
  .fcp-price-display { display:flex; justify-content:space-between; font-size:13px; font-weight:500; color:#1C1C1C; margin-bottom:14px; }
  .fcp-dual-range { position:relative; height:20px; margin-bottom:16px; }
  .fcp-range { width:100%; -webkit-appearance:none; height:2px; background:#E5DDD4; outline:none; cursor:pointer; position:absolute; top:50%; transform:translateY(-50%); pointer-events:all; }
  .fcp-range-min { z-index:2; background:transparent; }
  .fcp-range-max { z-index:1; }
  .fcp-range::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#7A9E7E; border:2px solid #fff; box-shadow:0 0 0 1.5px #7A9E7E; cursor:pointer; transition:transform .2s; }
  .fcp-range::-webkit-slider-thumb:hover { transform:scale(1.2); }
  .fcp-price-inputs { display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; }
  .fcp-price-field { display:flex; flex-direction:column; gap:4px; }
  .fcp-price-field label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#A8A8A8; }
  .fcp-price-field input { padding:8px 10px; border:1px solid #E5DDD4; font-size:13px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#F7F3EE; outline:none; width:100%; transition:border-color .3s; }
  .fcp-price-field input:focus { border-color:#7A9E7E; }
  .fcp-price-sep { color:#A8A8A8; font-size:16px; text-align:center; margin-top:14px; }

  /* Toggle */
  .fcp-toggle-row { display:flex; align-items:center; gap:12px; cursor:pointer; }
  .fcp-toggle { width:40px; height:22px; border-radius:11px; background:#E5DDD4; position:relative; cursor:pointer; transition:background .3s; flex-shrink:0; }
  .fcp-toggle.on { background:#7A9E7E; }
  .fcp-toggle-knob { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.2); transition:transform .3s cubic-bezier(.34,1.56,.64,1); }
  .fcp-toggle.on .fcp-toggle-knob { transform:translateX(18px); }
  .fcp-toggle-row span { font-size:13px; color:#4A4A4A; }

  /* Colors */
  .fcp-colors { display:flex; flex-wrap:wrap; gap:8px; }
  .fcp-color  { width:30px; height:30px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:all .25s; outline:none; position:relative; }
  .fcp-color::after { content:''; position:absolute; inset:-4px; border-radius:50%; border:1.5px solid transparent; transition:border-color .25s; }
  .fcp-color.active::after { border-color:#1C1C1C; }
  .fcp-color:hover { transform:scale(1.12); }
  .fcp-fs-selected { font-size:11px; color:#7A9E7E; margin-top:10px; letter-spacing:.3px; }

  /* Checklist */
  .fcp-checklist { display:flex; flex-direction:column; gap:4px; }
  .fcp-check-row { display:flex; align-items:center; gap:10px; padding:6px 0; cursor:pointer; }
  .fcp-checkbox  { width:16px; height:16px; border:1.5px solid #D0CAC2; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .2s; }
  .fcp-checkbox.on { background:#1C1C1C; border-color:#1C1C1C; }
  .fcp-checkbox.on span { color:#fff; font-size:10px; }
  .fcp-check-label { flex:1; font-size:13px; color:#4A4A4A; }
  .fcp-check-count { font-size:11px; color:#A8A8A8; }

  /* Style chips */
  .fcp-chips { display:flex; flex-wrap:wrap; gap:7px; }
  .fcp-style-chip { padding:6px 14px; border:1px solid #E5DDD4; background:#fff; font-size:11px; letter-spacing:.8px; color:#6B6B6B; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .25s; }
  .fcp-style-chip:hover { border-color:#7A9E7E; color:#7A9E7E; }
  .fcp-style-chip.active { background:#1C1C1C; border-color:#1C1C1C; color:#fff; }

  /* Rating */
  .fcp-rating-list { display:flex; flex-direction:column; gap:6px; }
  .fcp-rating-row  { display:flex; align-items:center; gap:10px; padding:8px 10px; border:1px solid transparent; background:none; cursor:pointer; width:100%; transition:all .25s; text-align:left; }
  .fcp-rating-row:hover { background:#F7F3EE; }
  .fcp-rating-row.active { border-color:#7A9E7E; background:#F2F8F2; }
  .fcp-rating-stars { display:flex; gap:2px; }
  .fcp-rating-label { font-size:12px; color:#6B6B6B; font-family:'DM Sans',sans-serif; }

  /* Apply */
  .fcp-apply-btn { width:100%; padding:14px; background:#1C1C1C; color:#fff; font-size:11px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; margin-top:24px; }
  .fcp-apply-btn:hover { background:#7A9E7E; }

  /* Stars shared */
  .fcp-stars { display:flex; align-items:center; gap:2px; margin-bottom:12px; }
  .fcp-star  { font-size:11px; color:#D0CAC2; transition:color .2s; }
  .fcp-star.filled { color:#C9A84C; }
  .fcp-star-count { font-size:11px; color:#A8A8A8; margin-left:5px; }

  /* ── MAIN CONTENT ── */
  .fcp-main { flex:1; min-width:0; padding:32px 48px 80px; }

  /* Active filter chips */
  .fcp-active-filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px; min-height:32px; }
  .fcp-af-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; background:#F7F3EE; border:1px solid #E5DDD4; font-size:11px; color:#4A4A4A; animation:fcpBadgeIn .3s ease both; }
  .fcp-af-chip-x { background:none; border:none; cursor:pointer; color:#A8A8A8; font-size:15px; line-height:1; padding:0; transition:color .2s; }
  .fcp-af-chip-x:hover { color:#D4714A; }
  .fcp-af-clear { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; background:#FEF2EE; border:1px solid #F0B89A; font-size:11px; color:#D4714A; cursor:pointer; font-family:'DM Sans',sans-serif; }

  /* Sort toolbar */
  .fcp-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
  .fcp-result-info { font-size:13px; color:#6B6B6B; }
  .fcp-result-info strong { color:#1C1C1C; font-weight:500; }
  .fcp-toolbar-right { display:flex; align-items:center; gap:16px; }
  .fcp-sort-label { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#6B6B6B; white-space:nowrap; }
  .fcp-sort-sel { border:1px solid #E5DDD4; padding:9px 32px 9px 14px; font-size:12px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center; cursor:pointer; outline:none; appearance:none; transition:border-color .3s; }
  .fcp-sort-sel:focus { border-color:#7A9E7E; }
  /* Grid view toggle */
  .fcp-view-toggle { display:flex; border:1px solid #E5DDD4; }
  .fcp-view-btn { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#A8A8A8; font-size:16px; transition:all .2s; }
  .fcp-view-btn.active { background:#1C1C1C; color:#fff; }

  /* ── PRODUCT GRID ── */
  .fcp-grid     { display:grid; gap:24px; }
  .fcp-grid.g4  { grid-template-columns:repeat(4,1fr); }
  .fcp-grid.g3  { grid-template-columns:repeat(3,1fr); }

  /* ── PRODUCT CARD ── */
  .fcp-card { background:#fff; cursor:pointer; transition:box-shadow .4s; }
  .fcp-card:hover { box-shadow:0 20px 56px rgba(28,28,28,.09); }
  .fcp-card-img-wrap { position:relative; overflow:hidden; aspect-ratio:4/5; background:#F7F3EE; }
  .fcp-card-img { width:100%; height:100%; object-fit:cover; transition:transform .7s cubic-bezier(.25,.46,.45,.94); }
  .fcp-card:hover .fcp-card-img { transform:scale(1.06); }

  .fcp-badge { position:absolute; top:12px; left:12px; color:#fff; font-size:9px; letter-spacing:1.6px; text-transform:uppercase; padding:5px 11px; font-weight:600; z-index:2; }
  .fcp-oos-overlay { position:absolute; inset:0; background:rgba(255,255,255,.65); display:flex; align-items:center; justify-content:center; z-index:3; }
  .fcp-oos-overlay span { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#6B6B6B; background:#fff; padding:8px 16px; border:1px solid #E5DDD4; }

  /* Hover action panel */
  .fcp-card-hover-acts { position:absolute; bottom:0; left:0; right:0; padding:14px 12px; display:flex; gap:8px; background:rgba(20,20,20,.88); transform:translateY(100%); transition:transform .38s cubic-bezier(.25,.46,.45,.94); z-index:4; }
  .fcp-card:hover .fcp-card-hover-acts { transform:translateY(0); }
  .fcp-quick-view { flex:1; padding:11px; font-size:11px; letter-spacing:1.3px; text-transform:uppercase; border:none; background:#fff; color:#1C1C1C; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s, color .3s; }
  .fcp-quick-view:hover { background:#7A9E7E; color:#fff; }
  .fcp-wish-btn { width:44px; background:transparent; border:1px solid rgba(255,255,255,.28); color:#fff; cursor:pointer; font-size:16px; transition:background .3s; }
  .fcp-wish-btn:hover { background:rgba(255,255,255,.12); }

  .fcp-card-body { padding:16px 14px 20px; }
  .fcp-card-name { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; color:#1C1C1C; margin-bottom:6px; line-height:1.25; transition:color .3s; }
  .fcp-card:hover .fcp-card-name { color:#7A9E7E; }
  .fcp-card-foot { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
  .fcp-price-group { display:flex; align-items:baseline; gap:8px; }
  .fcp-price { font-size:16px; font-weight:500; color:#1C1C1C; }
  .fcp-old-price { font-size:12px; color:#A8A8A8; text-decoration:line-through; }
  .fcp-add-btn { width:36px; height:36px; border:1.5px solid #1C1C1C; background:#fff; color:#1C1C1C; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .3s cubic-bezier(.34,1.56,.64,1); flex-shrink:0; }
  .fcp-add-btn:hover:not(.disabled) { background:#1C1C1C; color:#fff; transform:scale(1.12); }
  .fcp-add-btn.adding { background:#7A9E7E; border-color:#7A9E7E; color:#fff; animation:fcpPop .3s ease; }
  .fcp-add-btn.disabled { opacity:.38; cursor:not-allowed; }

  /* ── SKELETON ── */
  .fcp-sk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .fcp-sk-card { }
  .fcp-sk-img  { aspect-ratio:4/5; background:#F7F3EE; animation:fcpShimmer 1.5s ease-in-out infinite; }
  .fcp-sk-line { height:13px; background:#F0EBE4; margin:12px 14px 0; animation:fcpShimmer 1.5s ease-in-out infinite; }
  .fcp-sk-line.s { width:55%; }

  /* ── EMPTY / ERROR ── */
  .fcp-empty { padding:80px 0; text-align:center; }
  .fcp-empty-ic { font-size:52px; margin-bottom:20px; opacity:.3; display:block; }
  .fcp-empty-t { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; margin-bottom:8px; }
  .fcp-empty-s { font-size:14px; color:#6B6B6B; margin-bottom:28px; }
  .fcp-empty-btn { display:inline-flex; align-items:center; gap:8px; background:#1C1C1C; color:#fff; padding:13px 32px; font-size:11px; letter-spacing:1.6px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; }
  .fcp-empty-btn:hover { background:#7A9E7E; }
  .fcp-error { display:flex; align-items:center; gap:14px; background:#FEF2EE; border-left:3px solid #D4714A; padding:18px 24px; margin-bottom:24px; }
  .fcp-error-text { font-size:14px; flex:1; }
  .fcp-retry { background:none; border:1px solid #D4714A; color:#D4714A; padding:7px 16px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .fcp-retry:hover { background:#D4714A; color:#fff; }

  /* Mobile filter button */
  .fcp-mob-filter-btn { display:none; align-items:center; gap:8px; padding:10px 20px; background:#1C1C1C; color:#fff; border:none; font-size:11px; letter-spacing:1.4px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; }

  /* Mobile drawer */
  .fcp-mob-overlay { position:fixed; inset:0; z-index:200; background:rgba(28,28,28,.45); backdrop-filter:blur(4px); animation:fcpBgIn .3s ease; }
  .fcp-mob-drawer  { position:fixed; top:0; left:0; bottom:0; width:min(${SIDEBAR_W}px,95vw); background:#fff; z-index:201; overflow-y:auto; animation:fcpDrawer .4s cubic-bezier(.25,.46,.45,.94); box-shadow:8px 0 40px rgba(28,28,28,.16); }
  .fcp-mob-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:24px 28px 20px; border-bottom:1px solid #F0EBE4; position:sticky; top:0; background:#fff; z-index:1; }
  .fcp-mob-drawer-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; }
  .fcp-mob-close { width:36px; height:36px; background:none; border:1px solid #E5DDD4; cursor:pointer; font-size:16px; color:#6B6B6B; display:flex; align-items:center; justify-content:center; transition:all .3s; }
  .fcp-mob-close:hover { background:#1C1C1C; color:#fff; border-color:#1C1C1C; }
  .fcp-mob-drawer-body { padding:0 28px 48px; }

  /* Toast */
  .fcp-toast { position:fixed; bottom:32px; right:32px; z-index:500; background:#1C1C1C; color:#fff; padding:13px 22px; font-size:13px; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px; animation:fcpToast 2.5s ease forwards; box-shadow:0 8px 24px rgba(28,28,28,.28); }
  .fcp-toast-icon { color:#7A9E7E; }

  /* ── RESPONSIVE ── */
  @media(max-width:1200px) { .fcp-grid.g4 { grid-template-columns:repeat(3,1fr); } }
  @media(max-width:1024px) {
    .fcp-sidebar { display:none; }
    .fcp-mob-filter-btn { display:inline-flex; }
    .fcp-main { padding:28px 24px 60px; }
    .fcp-grid.g4,.fcp-grid.g3 { grid-template-columns:repeat(2,1fr); }
    .fcp-sk-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:600px) {
    .fcp-hero-ct { padding:0 24px 40px; }
    .fcp-hero-meta { right:24px; bottom:40px; }
    .fcp-grid.g4,.fcp-grid.g3 { grid-template-columns:1fr; }
    .fcp-sk-grid { grid-template-columns:1fr; }
    .fcp-toolbar { flex-direction:column; align-items:flex-start; }
    .fcp-toast { left:16px; right:16px; bottom:16px; }
  }
`;

// ─────────────────────────────────────────────────────────────
//  PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function FurnitureCategoryPage() {
  const { slug }                    = useParams();
  const { t }                       = useTranslation();
  const navigate                    = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Data ──────────────────────────────────────────────────
  const [category,    setCategory]   = useState(null);
  const [products,    setProducts]   = useState([]);
  const [pagination,  setPagination] = useState({ total:0, totalPages:1 });
  const [filterData,  setFilterData] = useState(MOCK_FILTERS);
  const [catLoading,  setCatLoading] = useState(true);
  const [prodLoading, setProdLoading]= useState(true);
  const [heroLoaded,  setHeroLoaded] = useState(false);
  const [error,       setError]      = useState(null);
  const [addingId,    setAddingId]   = useState(null);
  const [toast,       setToast]      = useState(null);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const [gridCols,    setGridCols]   = useState(3); // 3 or 4

  // URL-dan ilkin filter dəyərləri
  const [local, setLocal] = useState({
    price_min:  searchParams.get("price_min") ? Number(searchParams.get("price_min")) : "",
    price_max:  searchParams.get("price_max") ? Number(searchParams.get("price_max")) : "",
    colors:     searchParams.getAll("colors"),
    materials:  searchParams.getAll("materials"),
    brands:     searchParams.getAll("brands"),
    styles:     searchParams.getAll("styles"),
    min_rating: searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : null,
    in_stock:   searchParams.get("in_stock") === "true",
  });

  const currentPage = Number(searchParams.get("page") || 1);
  const currentSort = searchParams.get("sort") || "featured";
  const gridRef     = useRef(null);
  const toastTimer  = useRef(null);

  useScrollReveal(); // ← scroll reveal bütün .reveal elementlərə tətbiq olunur

  // ── Fetch category info ────────────────────────────────────
  useEffect(() => {
    setCatLoading(true);
    // categoryApi.getBySlug(slug)
    //   .then(res => setCategory(res.data))
    //   .catch(() => navigate("/furniture-categories"))
    //   .finally(() => setCatLoading(false));

    // Mock:
    setTimeout(() => {
      setCategory({
        id: 1,
        name: slug.replace(/-/g," ").replace(/\b\w/g, l => l.toUpperCase()),
        description: "Handcrafted pieces built to last a lifetime.",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85",
        product_count: 24,
      });
      setCatLoading(false);
      setHeroLoaded(true);
    }, 400);

    // Filters:
    // categoryApi.getFilters(id).then(res => setFilterData(res.data));
  }, [slug]);

  // ── Fetch products ─────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setProdLoading(true);
    setError(null);

    const params = {
      page: currentPage, limit: PAGE_SIZE, sort: currentSort,
      ...(searchParams.get("price_min") && { price_min: searchParams.get("price_min") }),
      ...(searchParams.get("price_max") && { price_max: searchParams.get("price_max") }),
      ...(searchParams.get("in_stock") === "true" && { in_stock: true }),
      ...(searchParams.get("min_rating") && { min_rating: searchParams.get("min_rating") }),
    };
    const colors    = searchParams.getAll("colors");
    const materials = searchParams.getAll("materials");
    const brands    = searchParams.getAll("brands");
    const styles    = searchParams.getAll("styles");
    if (colors.length)    params.colors    = colors;
    if (materials.length) params.materials = materials;
    if (brands.length)    params.brands    = brands;
    if (styles.length)    params.styles    = styles;

    // categoryApi.getProducts(category?.id, params)
    //   .then(res => { setProducts(res.data.data); setPagination({...}); })
    //   .catch(err => setError(err.userMessage))
    //   .finally(() => setProdLoading(false));

    // Mock:
    setTimeout(() => {
      const allMock = [...MOCK_PRODUCTS];
      if (params.in_stock) allMock.filter(p => p.in_stock);
      const start = (currentPage - 1) * PAGE_SIZE;
      setProducts(allMock.slice(start, start + PAGE_SIZE));
      setPagination({ total: allMock.length, totalPages: Math.ceil(allMock.length / PAGE_SIZE) });
      setProdLoading(false);
    }, 500);
  }, [slug, currentPage, currentSort, searchParams]);

  useEffect(() => {
    fetchProducts();
    if (currentPage > 1) {
      requestAnimationFrame(() =>
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, [fetchProducts]);

  // ── Filter handlers ────────────────────────────────────────
  const handleLocalChange = useCallback((key, val) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  }, []);

  const buildParams = useCallback((overrides = {}) => {
    const src = { ...local, ...overrides };
    const p = new URLSearchParams();
    p.set("sort", currentSort);
    p.set("page", 1);
    if (src.price_min)   p.set("price_min",  src.price_min);
    if (src.price_max)   p.set("price_max",  src.price_max);
    if (src.in_stock)    p.set("in_stock",   "true");
    if (src.min_rating)  p.set("min_rating", src.min_rating);
    (src.colors    || []).forEach(v => p.append("colors",    v));
    (src.materials || []).forEach(v => p.append("materials", v));
    (src.brands    || []).forEach(v => p.append("brands",    v));
    (src.styles    || []).forEach(v => p.append("styles",    v));
    return p;
  }, [local, currentSort]);

  const handleApply = useCallback(() => {
    setSearchParams(buildParams());
    setMobileOpen(false);
  }, [buildParams, setSearchParams]);

  const handleReset = useCallback(() => {
    const blank = { price_min:"", price_max:"", colors:[], materials:[], brands:[], styles:[], min_rating:null, in_stock:false };
    setLocal(blank);
    const p = new URLSearchParams();
    p.set("sort", currentSort);
    setSearchParams(p);
    setMobileOpen(false);
  }, [currentSort, setSearchParams]);

  const handlePageChange = useCallback((pg) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", pg);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((e) => {
    const p = new URLSearchParams(searchParams);
    p.set("sort", e.target.value);
    p.set("page", 1);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  // ── Remove single chip ────────────────────────────────────
  const removeChip = useCallback((type, val) => {
    const p = new URLSearchParams(searchParams);
    if (type === "price")    { p.delete("price_min"); p.delete("price_max"); setLocal(pr => ({ ...pr, price_min:"", price_max:"" })); }
    else if (type === "in_stock") { p.delete("in_stock"); setLocal(pr => ({ ...pr, in_stock:false })); }
    else if (type === "min_rating") { p.delete("min_rating"); setLocal(pr => ({ ...pr, min_rating:null })); }
    else {
      const remaining = searchParams.getAll(type).filter(x => x !== val);
      p.delete(type);
      remaining.forEach(x => p.append(type, x));
      setLocal(pr => ({ ...pr, [type]: remaining }));
    }
    p.set("page", 1);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  // ── Active chips ──────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    const pm = searchParams.get("price_min"), px = searchParams.get("price_max");
    if (pm || px) chips.push({ id:"price",      label:`$${pm||0} – $${px||"∞"}`, onRemove:()=>removeChip("price") });
    if (searchParams.get("in_stock")==="true")   chips.push({ id:"in_stock",   label:"In Stock",               onRemove:()=>removeChip("in_stock") });
    if (searchParams.get("min_rating"))          chips.push({ id:"min_rating", label:`★ ${searchParams.get("min_rating")}+`, onRemove:()=>removeChip("min_rating") });
    searchParams.getAll("colors").forEach(v    => chips.push({ id:`c-${v}`,   label: filterData.colors.find(c=>c.value===v)?.label||v,    onRemove:()=>removeChip("colors",v) }));
    searchParams.getAll("materials").forEach(v => chips.push({ id:`m-${v}`,   label: filterData.materials.find(m=>m.value===v)?.label||v, onRemove:()=>removeChip("materials",v) }));
    searchParams.getAll("brands").forEach(v    => chips.push({ id:`b-${v}`,   label: filterData.brands.find(b=>b.value===v)?.label||v,    onRemove:()=>removeChip("brands",v) }));
    searchParams.getAll("styles").forEach(v    => chips.push({ id:`s-${v}`,   label: v,                                                   onRemove:()=>removeChip("styles",v) }));
    return chips;
  }, [searchParams, filterData, removeChip]);

  const hasActive = activeChips.length > 0;

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = useCallback(async (product) => {
    if (addingId === product.id || !product.in_stock) return;
    setAddingId(product.id);
    try {
      await cartApi.addItem(product.id, 1);
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId]);

  const sortOptions = [
    { v:"featured",   l: "Featured"           },
    { v:"price_asc",  l: "Price: Low to High" },
    { v:"price_desc", l: "Price: High to Low" },
    { v:"newest",     l: "Newest First"       },
    { v:"popular",    l: "Most Popular"       },
    { v:"rating",     l: "Top Rated"         },
  ];

  const FilterContent = (
    <FilterSidebar
      filterData={filterData}
      local={local}
      onChange={handleLocalChange}
      onApply={handleApply}
      onReset={handleReset}
      hasActive={hasActive}
      t={t}
    />
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="fcp-page">
        <Navbar />

        {/* ── HERO ── */}
        <div className={`fcp-hero${heroLoaded ? " loaded" : ""}`}>
          {category?.image && (
            <div
              className="fcp-hero-bg"
              style={{ backgroundImage: `url(${category.image})` }}
            />
          )}
          <div className="fcp-hero-ov" />
          <div className="fcp-hero-ct">
            <div className="fcp-hero-bread">
              <Link to="/">Home</Link>
              <span className="fcp-hero-bread-sep">/</span>
              <Link to="/furniture-categories">Categories</Link>
              <span className="fcp-hero-bread-sep">/</span>
              <span className="fcp-hero-bread-cur">{category?.name || "..."}</span>
            </div>
            {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
            <h1 className="fcp-hero-h1">
              {catLoading ? "..." : category?.name}
            </h1>
          </div>
          <div className="fcp-hero-meta">
            <span className="fcp-hero-count">{pagination.total || 0}</span>
            <span className="fcp-hero-count-label">products</span>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="fcp-layout">

          {/* Desktop sidebar */}
          {FilterContent}

          {/* ── MAIN ── */}
          <main className="fcp-main" ref={gridRef} style={{ scrollMarginTop: 80 }}>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="fcp-active-filters">
                {activeChips.map(chip => (
                  <div key={chip.id} className="fcp-af-chip">
                    <span>{chip.label}</span>
                    <button className="fcp-af-chip-x" onClick={chip.onRemove}>×</button>
                  </div>
                ))}
                <button className="fcp-af-clear" onClick={handleReset}>
                  Clear all ×
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="fcp-toolbar">
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <button className="fcp-mob-filter-btn" onClick={() => setMobileOpen(true)}>
                  ⚙ Filters {hasActive && `(${activeChips.length})`}
                </button>
                <p className="fcp-result-info">
                  Showing{" "}
                  <strong>
                    {(currentPage-1)*PAGE_SIZE+1}–
                    {Math.min(currentPage*PAGE_SIZE, pagination.total)}
                  </strong>
                  {" "}of{" "}
                  <strong>{pagination.total}</strong>
                </p>
              </div>
              <div className="fcp-toolbar-right">
                <span className="fcp-sort-label">Sort by</span>
                <select className="fcp-sort-sel" value={currentSort} onChange={handleSortChange}>
                  {sortOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                {/* Grid column toggle */}
                <div className="fcp-view-toggle">
                  <button
                    className={`fcp-view-btn${gridCols===3?" active":""}`}
                    onClick={() => setGridCols(3)}
                    title="3 columns"
                  >⊞</button>
                  <button
                    className={`fcp-view-btn${gridCols===4?" active":""}`}
                    onClick={() => setGridCols(4)}
                    title="4 columns"
                  >⊟</button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="fcp-error">
                <span>⚠️</span>
                <p className="fcp-error-text">{error}</p>
                <button className="fcp-retry" onClick={fetchProducts}>Retry</button>
              </div>
            )}

            {/* Skeleton */}
            {prodLoading && (
              <div className="fcp-sk-grid">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="fcp-sk-card" style={{ animationDelay:`${i*0.07}s` }}>
                    <div className="fcp-sk-img" />
                    <div className="fcp-sk-line" />
                    <div className="fcp-sk-line s" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!prodLoading && !error && products.length === 0 && (
              <div className="fcp-empty">
                <span className="fcp-empty-ic">🛋</span>
                <h3 className="fcp-empty-t">{t("category_page.no_products")}</h3>
                <p className="fcp-empty-s">{t("category_page.no_products_hint")}</p>
                {hasActive && (
                  <button className="fcp-empty-btn" onClick={handleReset}>
                    {t("category_page.reset_filters")}
                  </button>
                )}
              </div>
            )}

            {/* Product grid — cards have .reveal class → scroll reveal */}
            {!prodLoading && products.length > 0 && (
              <div className={`fcp-grid g${gridCols}`}>
                {products.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    idx={idx}
                    addingId={addingId}
                    onAddToCart={handleAddToCart}
                    t={t}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!prodLoading && products.length > 0 && (
              <Pagination
                current={currentPage}
                total={pagination.totalPages}
                onPageChange={handlePageChange}
                accentColor="#7A9E7E"
              />
            )}
          </main>
        </div>

        {/* Mobile filter drawer */}
        {mobileOpen && (
          <>
            <div className="fcp-mob-overlay" onClick={() => setMobileOpen(false)} />
            <div className="fcp-mob-drawer">
              <div className="fcp-mob-drawer-head">
                <span className="fcp-mob-drawer-title">Filters</span>
                <button className="fcp-mob-close" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <div className="fcp-mob-drawer-body">{FilterContent}</div>
            </div>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className="fcp-toast">
            <span className="fcp-toast-icon">✓</span>
            <span><strong>{toast}</strong> added to cart</span>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
