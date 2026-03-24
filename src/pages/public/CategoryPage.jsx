// src/pages/public/CategoryPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /furniture-categories/:id
//
//  Real API ilə işləyir:
//    categoryApi.getById(id)          → kateqoriya adı, şəkli
//    categoryApi.getProducts(id, params) → məhsullar + pagination
//    categoryApi.getFilters(id)       → mövcud rəng, material siyahısı
//
//  Filtrlər URL-ə yazılır (?page=2&sort=price_asc&price_min=500...)
//  Belə ki, refresh-də, paylaşdıqda eyni nəticə görünür.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import categoryApi from "../../api/categoryApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 12;

// ── Qiymət formatı ────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;

// ── Stars ─────────────────────────────────────────────────────
function Stars({ n }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: "#C9A84C", fontSize: 10 }}>
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

// ── Loader skeleton ───────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="cp-grid">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="cp-skeleton-card">
          <div className="cp-skeleton-img" />
          <div className="cp-skeleton-line" />
          <div className="cp-skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
const mockFilters = {
  colors: [
    { value: "black", label: "Black", hex: "#000000" },
    { value: "white", label: "White", hex: "#FFFFFF" },
    { value: "brown", label: "Brown", hex: "#8B4513" },
    { value: "gray", label: "Gray", hex: "#808080" },
  ],
  materials: [
    { value: "wood", label: "Wood", count: 12 },
    { value: "metal", label: "Metal", count: 8 },
    { value: "glass", label: "Glass", count: 5 },
  ],
  price_max: 5000
};
// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes cpFadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cpShimmer  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes cpDrawer   { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes cpOverlay  { from{opacity:0} to{opacity:1} }
  @keyframes cpCardIn   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:5px }
  ::-webkit-scrollbar-track { background:#F7F3EE }
  ::-webkit-scrollbar-thumb { background:#7A9E7E; border-radius:3px }

  .cp-page  { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; }

  /* ── HERO BAND ── */
  .cp-hero  { position:relative; height:320px; overflow:hidden; display:flex; align-items:flex-end; }
  .cp-hero-bg { position:absolute; inset:0; background-size:cover; background-position:center; transition:transform 8s ease; }
  .cp-hero:hover .cp-hero-bg { transform:scale(1.03); }
  .cp-hero-ov { position:absolute; inset:0; background:linear-gradient(to top, rgba(28,28,28,.72) 0%, rgba(28,28,28,.1) 60%, transparent 100%); }
  .cp-hero-ct { position:relative; z-index:2; padding:0 60px 48px; width:100%; }
  .cp-bread   { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .cp-bread a, .cp-bread-sep { font-size:12px; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.5); text-decoration:none; transition:color .3s; }
  .cp-bread a:hover { color:#fff; }
  .cp-bread-sep { margin:0 2px; }
  .cp-bread-cur { font-size:12px; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.85); }
  .cp-hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(44px,6vw,80px); font-weight:300; color:#fff; line-height:1; }
  .cp-hero-count { position:absolute; bottom:48px; right:60px; text-align:right; z-index:2; }
  .cp-hero-count-n { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:300; color:rgba(255,255,255,.9); display:block; line-height:1; }
  .cp-hero-count-l { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.45); }

  /* ── LAYOUT ── */
  .cp-body  { display:grid; grid-template-columns:280px 1fr; gap:0; align-items:start; }

  /* ── FILTER SIDEBAR ── */
  .cp-sidebar { padding:40px 32px; border-right:1px solid #F0EBE4; position:sticky; top:72px; max-height:calc(100vh - 72px); overflow-y:auto; }
  .cp-sidebar::-webkit-scrollbar { width:3px; }
  .cp-sidebar::-webkit-scrollbar-thumb { background:#E5DDD4; border-radius:2px; }

  .cp-filter-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
  .cp-filter-title  { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:#1C1C1C; }
  .cp-reset-btn     { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#D4714A; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity .3s; }
  .cp-reset-btn:hover { opacity:.7; }

  .cp-filter-group  { margin-bottom:32px; }
  .cp-filter-group-title { font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:#A8A8A8; margin-bottom:14px; font-weight:500; }

  /* Price range */
  .cp-price-inputs { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .cp-price-input  { padding:10px 12px; border:1px solid #E5DDD4; font-size:13px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#F7F3EE; outline:none; width:100%; transition:border-color .3s; }
  .cp-price-input:focus { border-color:#7A9E7E; }
  .cp-price-sep   { display:flex; align-items:center; justify-content:center; font-size:12px; color:#A8A8A8; }

  /* Range slider */
  .cp-range-wrap  { padding:6px 0 4px; }
  .cp-range       { width:100%; -webkit-appearance:none; height:2px; background:linear-gradient(to right, #7A9E7E var(--val,50%), #E5DDD4 var(--val,50%)); outline:none; cursor:pointer; }
  .cp-range::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#7A9E7E; cursor:pointer; border:2px solid #fff; box-shadow:0 0 0 1px #7A9E7E; transition:transform .2s; }
  .cp-range::-webkit-slider-thumb:hover { transform:scale(1.25); }

  /* Checkbox filters */
  .cp-check-list  { display:flex; flex-direction:column; gap:10px; }
  .cp-check-item  { display:flex; align-items:center; gap:10px; cursor:pointer; }
  .cp-check-item input { display:none; }
  .cp-check-box   { width:16px; height:16px; border:1px solid #E5DDD4; flex-shrink:0; transition:all .2s; display:flex; align-items:center; justify-content:center; }
  .cp-check-item input:checked ~ .cp-check-box { background:#1C1C1C; border-color:#1C1C1C; }
  .cp-check-item input:checked ~ .cp-check-box::after { content:'✓'; font-size:10px; color:#fff; }
  .cp-check-label { font-size:13px; color:#4A4A4A; transition:color .2s; }
  .cp-check-item:hover .cp-check-label { color:#1C1C1C; }
  .cp-check-count { font-size:11px; color:#A8A8A8; margin-left:auto; }

  /* Color swatches */
  .cp-color-list  { display:flex; flex-wrap:wrap; gap:8px; }
  .cp-color-swatch { width:28px; height:28px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:all .2s; position:relative; }
  .cp-color-swatch.active { border-color:#1C1C1C; transform:scale(1.15); }
  .cp-color-swatch:hover  { transform:scale(1.1); }
  .cp-color-tip   { position:absolute; bottom:calc(100%+6px); left:50%; transform:translateX(-50%); background:#1C1C1C; color:#fff; font-size:10px; padding:3px 7px; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity .2s; }
  .cp-color-swatch:hover .cp-color-tip { opacity:1; }

  /* Apply button */
  .cp-apply-btn   { width:100%; padding:14px; background:#1C1C1C; color:#fff; font-size:11px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; margin-top:8px; }
  .cp-apply-btn:hover { background:#7A9E7E; }

  /* ── MAIN CONTENT ── */
  .cp-main  { padding:40px 48px; }

  /* Toolbar */
  .cp-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; flex-wrap:wrap; gap:16px; }
  .cp-result-info { font-size:13px; color:#6B6B6B; }
  .cp-result-info strong { color:#1C1C1C; font-weight:500; }
  .cp-sort-wrap { display:flex; align-items:center; gap:10px; }
  .cp-sort-label { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#6B6B6B; }
  .cp-sort-sel   { border:1px solid #E5DDD4; padding:9px 32px 9px 14px; font-size:12px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center; cursor:pointer; outline:none; appearance:none; transition:border-color .3s; }
  .cp-sort-sel:focus { border-color:#7A9E7E; }

  /* Mobile filter button */
  .cp-mobile-filter-btn { display:none; align-items:center; gap:8px; background:#1C1C1C; color:#fff; padding:10px 20px; font-size:11px; letter-spacing:1.4px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }

  /* Active filter chips */
  .cp-active-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px; }
  .cp-chip { display:flex; align-items:center; gap:6px; padding:5px 12px; background:#F7F3EE; border:1px solid #E5DDD4; font-size:11px; color:#4A4A4A; }
  .cp-chip-x { background:none; border:none; cursor:pointer; color:#A8A8A8; font-size:14px; line-height:1; padding:0; transition:color .2s; }
  .cp-chip-x:hover { color:#D4714A; }

  /* Product grid */
  .cp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }

  /* Product card */
  .cp-card  { background:#fff; transition:box-shadow .4s; cursor:pointer; }
  .cp-card:hover { box-shadow:0 20px 56px rgba(28,28,28,.1); }
  .cp-card.anim { animation:cpCardIn .5s cubic-bezier(.25,.46,.45,.94) both; }
  .cp-card-iw { position:relative; overflow:hidden; aspect-ratio:4/5; background:#F7F3EE; }
  .cp-card-img { width:100%; height:100%; object-fit:cover; transition:transform .65s cubic-bezier(.25,.46,.45,.94); display:block; }
  .cp-card:hover .cp-card-img { transform:scale(1.05); }
  .cp-card-badge { position:absolute; top:12px; left:12px; color:#fff; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; padding:4px 10px; font-weight:500; }
  .cp-card-actions { position:absolute; bottom:0; left:0; right:0; padding:14px; background:rgba(28,28,28,.88); transform:translateY(100%); transition:transform .38s cubic-bezier(.25,.46,.45,.94); display:flex; gap:10px; }
  .cp-card:hover .cp-card-actions { transform:translateY(0); }
  .cp-card-add { flex:1; padding:12px; font-size:11px; letter-spacing:1.3px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; transition:background .3s,color .3s; }
  .cp-card-add:hover { background:#7A9E7E; color:#fff; }
  .cp-card-add.adding { background:#7A9E7E; color:#fff; }
  .cp-card-wish { background:transparent; border:1px solid rgba(255,255,255,.3); color:#fff; width:44px; padding:0; cursor:pointer; transition:background .3s; font-size:14px; }
  .cp-card-wish:hover { background:rgba(255,255,255,.12); }
  .cp-card-body { padding:16px 14px 20px; }
  .cp-card-cat  { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#7A9E7E; margin-bottom:4px; }
  .cp-card-name { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; color:#1C1C1C; margin-bottom:10px; text-decoration:none; display:block; transition:color .3s; }
  .cp-card-name:hover { color:#7A9E7E; }
  .cp-card-foot { display:flex; align-items:center; justify-content:space-between; }
  .cp-card-price { font-size:15px; font-weight:500; color:#1C1C1C; }
  .cp-card-old   { font-size:12px; color:#A8A8A8; text-decoration:line-through; margin-left:6px; }

  /* Skeleton */
  .cp-skeleton-card { background:#F7F3EE; }
  .cp-skeleton-img  { aspect-ratio:4/5; animation:cpShimmer 1.5s ease-in-out infinite; }
  .cp-skeleton-line { height:13px; background:#EDE7DC; margin:10px 14px 0; animation:cpShimmer 1.5s ease-in-out infinite; }
  .cp-skeleton-line.short { width:55%; }

  /* Empty state */
  .cp-empty { padding:80px 0; text-align:center; }
  .cp-empty-ic { font-size:48px; margin-bottom:20px; opacity:.3; display:block; }
  .cp-empty-t  { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; color:#1C1C1C; margin-bottom:8px; }
  .cp-empty-s  { font-size:14px; color:#6B6B6B; margin-bottom:28px; }

  /* Error */
  .cp-error { display:flex; align-items:center; gap:14px; background:#FEF2EE; border:1px solid #F0B89A; padding:18px 24px; border-left:3px solid #D4714A; margin-bottom:24px; }
  .cp-error-text { font-size:14px; color:#1C1C1C; flex:1; }
  .cp-retry { background:none; border:1px solid #D4714A; color:#D4714A; padding:7px 16px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .cp-retry:hover { background:#D4714A; color:#fff; }

  /* Mobile filter drawer */
  .cp-mob-overlay { position:fixed; inset:0; z-index:200; background:rgba(28,28,28,.45); backdrop-filter:blur(4px); animation:cpOverlay .3s ease forwards; }
  .cp-mob-drawer  { position:fixed; left:0; top:0; bottom:0; width:min(340px,100vw); background:#fff; z-index:201; overflow-y:auto; padding:28px 28px 48px; animation:cpDrawer .4s cubic-bezier(.25,.46,.45,.94) forwards; box-shadow:8px 0 40px rgba(28,28,28,.15); }
  .cp-mob-drawer-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
  .cp-mob-drawer-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:300; }
  .cp-mob-close { background:none; border:1px solid #E5DDD4; width:36px; height:36px; cursor:pointer; font-size:16px; color:#6B6B6B; display:flex; align-items:center; justify-content:center; transition:all .3s; }
  .cp-mob-close:hover { background:#1C1C1C; color:#fff; border-color:#1C1C1C; }

  /* Responsive */
  @media(max-width:1100px) { .cp-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:900px)  {
    .cp-hero-ct, .cp-hero-count { padding-left:24px; padding-right:24px; }
    .cp-body   { grid-template-columns:1fr; }
    .cp-sidebar { display:none; }
    .cp-main   { padding:28px 24px; }
    .cp-mobile-filter-btn { display:flex; }
  }
  @media(max-width:580px)  {
    .cp-grid { grid-template-columns:1fr; }
    .cp-toolbar { flex-direction:column; align-items:flex-start; }
  }
`;

const BADGE_COLORS = {
  best_seller: "#D4714A",
  new_in:      "#7A9E7E",
  sale:        "#C9A84C",
};

// ─────────────────────────────────────────────────────────────
//  FILTER SIDEBAR (reusable panel — desktop + mobile drawer)
// ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, localFilters, onChange, onApply, onReset, t }) {
  // mock fallback
  const mockFilters = {
    colors: [
      { value: "black", label: "Black", hex: "#000000" },
      { value: "white", label: "White", hex: "#FFFFFF" },
      { value: "brown", label: "Brown", hex: "#8B4513" },
      { value: "gray", label: "Gray", hex: "#808080" },
    ],
    materials: [
      { value: "wood", label: "Wood", count: 12 },
      { value: "metal", label: "Metal", count: 8 },
      { value: "glass", label: "Glass", count: 5 },
    ],
    price_max: 5000
  };
  const toggleColor = (c) => {
    const cur = localFilters.colors || [];
    onChange("colors", cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
  };

  const toggleMaterial = (m) => {
    const cur = localFilters.materials || [];
    onChange("materials", cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  };

  const hasFilters = filters?.colors?.length
    ? filters
    : mockFilters;

  const { colors = [], materials = [], price_max: maxPrice = 10000 } = hasFilters;
  return (
    <div>
      <div className="cp-filter-header">
        <span className="cp-filter-title">{t("category_page.filter_title")}</span>
        {hasFilters && (
          <button className="cp-reset-btn" onClick={onReset}>
            {t("category_page.reset_filters")}
          </button>
        )}
      </div>

      {/* Price range */}
      <div className="cp-filter-group">
        <div className="cp-filter-group-title">{t("category_page.price_range")}</div>
        <div className="cp-price-inputs">
          <input
            className="cp-price-input"
            type="number"
            placeholder={t("category_page.price_min")}
            value={localFilters.price_min || ""}
            onChange={e => onChange("price_min", e.target.value)}
            min={0}
          />
          <input
            className="cp-price-input"
            type="number"
            placeholder={t("category_page.price_max")}
            value={localFilters.price_max || ""}
            onChange={e => onChange("price_max", e.target.value)}
            min={0}
          />
        </div>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="cp-filter-group">
          <div className="cp-filter-group-title">{t("category_page.colors")}</div>
          <div className="cp-color-list">
            {colors.map(c => (
              <div
                key={c.value}
                className={`cp-color-swatch${(localFilters.colors || []).includes(c.value) ? " active" : ""}`}
                style={{ background: c.hex }}
                onClick={() => toggleColor(c.value)}
                title={c.label}
              >
                <span className="cp-color-tip">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <div className="cp-filter-group">
          <div className="cp-filter-group-title">{t("category_page.materials")}</div>
          <div className="cp-check-list">
            {materials.map(m => (
              <label key={m.value} className="cp-check-item">
                <input
                  type="checkbox"
                  checked={(localFilters.materials || []).includes(m.value)}
                  onChange={() => toggleMaterial(m.value)}
                />
                <span className="cp-check-box" />
                <span className="cp-check-label">{m.label}</span>
                {m.count != null && <span className="cp-check-count">{m.count}</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      <button className="cp-apply-btn" onClick={onApply}>
        {t("category_page.filter_apply")}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { id } = useParams();
  const { t }  = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ─────────────────────────────────────────────────
  const [category,    setCategory]    = useState(null);
  const [products,    setProducts]    = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, totalPages: 1, page: 1 });
  const [filters,     setFilters]     = useState({ colors: [], materials: [], price_max: 10000 });
  const [catLoading,  setCatLoading]  = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [error,       setError]       = useState(null);
  const [addingId,    setAddingId]    = useState(null);   // "adding to cart" product id
  const [mobileFilter,setMobileFilter]= useState(false);

  // Local filter state (applied on button click, not live)
  const [localFilters, setLocalFilters] = useState({
    price_min:  searchParams.get("price_min") || "",
    price_max:  searchParams.get("price_max") || "",
    colors:     searchParams.getAll("colors"),
    materials:  searchParams.getAll("materials"),
  });

  // Derived from URL
  const currentPage = Number(searchParams.get("page") || 1);
  const currentSort = searchParams.get("sort") || "featured";

  const gridRef = useRef(null);

  // ── Kateqoriya məlumatı ────────────────────────────────────
  useEffect(() => {
    setCatLoading(true);
    setError(null);
    categoryApi.getById(id)
      .then(res => setCategory(res.data))
      .catch(err => setError(err.userMessage))
      .finally(() => setCatLoading(false));

    // Filter seçimlərini gətir
    categoryApi.getFilters(id)
      .then(res => setFilters(res.data))
      .catch(() => {}); // filter xətası critical deyil
  }, [id]);

  // ── Məhsullar — URL params dəyişdikdə yenilənir ────────────
  const fetchProducts = useCallback(() => {
    setProdLoading(true);
    setError(null);

    const params = {
      page:      currentPage,
      limit:     PAGE_SIZE,
      sort:      currentSort,
    };
    if (searchParams.get("price_min")) params.price_min = searchParams.get("price_min");
    if (searchParams.get("price_max")) params.price_max = searchParams.get("price_max");
    const colors    = searchParams.getAll("colors");
    const materials = searchParams.getAll("materials");
    if (colors.length)    params.colors    = colors;
    if (materials.length) params.materials = materials;

    categoryApi.getProducts(id, params)
      .then(res => {
        // Backend response format: { data: [...], total, page, limit, totalPages }
        setProducts(res.data.data || res.data);
        setPagination({
          total:      res.data.total      || 0,
          totalPages: res.data.totalPages || 1,
          page:       res.data.page       || currentPage,
        });
      })
      .catch(err => setError(err.userMessage))
      .finally(() => setProdLoading(false));
  }, [id, currentPage, currentSort, searchParams]);

  useEffect(() => {
    fetchProducts();
    // Scroll to grid on page change
    if (currentPage > 1) {
      requestAnimationFrame(() =>
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, [fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────
  const handlePageChange = useCallback((page) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", page);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((e) => {
    const p = new URLSearchParams(searchParams);
    p.set("sort", e.target.value);
    p.set("page", 1);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const handleLocalFilterChange = useCallback((key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const p = new URLSearchParams();
    p.set("sort", currentSort);
    p.set("page", 1);
    if (localFilters.price_min) p.set("price_min", localFilters.price_min);
    if (localFilters.price_max) p.set("price_max", localFilters.price_max);
    (localFilters.colors || []).forEach(c => p.append("colors", c));
    (localFilters.materials || []).forEach(m => p.append("materials", m));
    setSearchParams(p);
    setMobileFilter(false);
  }, [localFilters, currentSort, setSearchParams]);

  const handleResetFilters = useCallback(() => {
    setLocalFilters({ price_min: "", price_max: "", colors: [], materials: [] });
    const p = new URLSearchParams();
    p.set("sort", currentSort);
    setSearchParams(p);
    setMobileFilter(false);
  }, [currentSort, setSearchParams]);

  const handleAddToCart = useCallback(async (productId) => {
    setAddingId(productId);
    try {
      await cartApi.addItem(productId, 1);
      // TODO: dispatch(cartSlice.addItem(...)) if using Redux
    } catch {
      // TODO: show toast notification
    } finally {
      setTimeout(() => setAddingId(null), 1200);
    }
  }, []);

  // Active filter chips for display
  const activeChips = useMemo(() => {
    const chips = [];
    if (searchParams.get("price_min") || searchParams.get("price_max")) {
      const min = searchParams.get("price_min") || "0";
      const max = searchParams.get("price_max") || "∞";
      chips.push({ key: "price", label: `$${min} – $${max}`, onRemove: () => {
        const p = new URLSearchParams(searchParams);
        p.delete("price_min"); p.delete("price_max");
        setSearchParams(p);
        setLocalFilters(prev => ({ ...prev, price_min: "", price_max: "" }));
      }});
    }
    searchParams.getAll("colors").forEach(c =>
      chips.push({ key: `color-${c}`, label: c, onRemove: () => {
        const p = new URLSearchParams(searchParams);
        const remaining = searchParams.getAll("colors").filter(x => x !== c);
        p.delete("colors");
        remaining.forEach(x => p.append("colors", x));
        setSearchParams(p);
        setLocalFilters(prev => ({ ...prev, colors: remaining }));
      }})
    );
    searchParams.getAll("materials").forEach(m =>
      chips.push({ key: `mat-${m}`, label: m, onRemove: () => {
        const p = new URLSearchParams(searchParams);
        const remaining = searchParams.getAll("materials").filter(x => x !== m);
        p.delete("materials");
        remaining.forEach(x => p.append("materials", x));
        setSearchParams(p);
        setLocalFilters(prev => ({ ...prev, materials: remaining }));
      }})
    );
    return chips;
  }, [searchParams, setSearchParams]);

  const sortOptions = [
    { value: "featured",   label: t("category_page.sort_featured") },
    { value: "price_asc",  label: t("category_page.sort_price_asc") },
    { value: "price_desc", label: t("category_page.sort_price_desc") },
    { value: "newest",     label: t("category_page.sort_newest") },
    { value: "popular",    label: t("category_page.sort_popular") },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="cp-page">
        <Navbar />

        {/* HERO BAND */}
        <div className="cp-hero" style={{ marginTop: 72 }}>
          {category?.image && (
            <div className="cp-hero-bg" style={{ backgroundImage: `url(${category.image})` }} />
          )}
          {!category?.image && <div style={{ position:"absolute",inset:0,background:"#EDE7DC" }} />}
          <div className="cp-hero-ov" />
          <div className="cp-hero-ct">
            <div className="cp-bread">
              <Link to="/">{t("nav.shop")}</Link>
              <span className="cp-bread-sep">/</span>
              <span className="cp-bread-cur">
                {catLoading ? "..." : category?.name}
              </span>
            </div>
            {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
            <h1 className="cp-hero-h1">
              {catLoading ? "..." : category?.name}
            </h1>
          </div>
          <div className="cp-hero-count">
            <span className="cp-hero-count-n">{pagination.total}</span>
            <span className="cp-hero-count-l">{t("category_page.products_found")}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="cp-body">

          {/* DESKTOP SIDEBAR */}
          <aside className="cp-sidebar">
            <FilterPanel
              filters={filters}
              localFilters={localFilters}
              onChange={handleLocalFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              t={t}
            />
          </aside>

          {/* MAIN */}
          <main className="cp-main" ref={gridRef} style={{ scrollMarginTop: 80 }}>

            {/* TOOLBAR */}
            <div className="cp-toolbar">
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                {/* Mobile filter button */}
                <button
                  className="cp-mobile-filter-btn"
                  onClick={() => setMobileFilter(true)}
                >
                  ⚙ {t("category_page.mobile_filter_btn")}
                </button>
                <p className="cp-result-info">
                  {t("category_page.showing")}{" "}
                  <strong>
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, pagination.total)}
                  </strong>{" "}
                  {t("category_page.of")}{" "}
                  <strong>{pagination.total}</strong>
                </p>
              </div>
              <div className="cp-sort-wrap">
                <span className="cp-sort-label">{t("category_page.sort_label")}</span>
                <select
                  className="cp-sort-sel"
                  value={currentSort}
                  onChange={handleSortChange}
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ACTIVE FILTER CHIPS */}
            {activeChips.length > 0 && (
              <div className="cp-active-chips">
                {activeChips.map(chip => (
                  <div key={chip.key} className="cp-chip">
                    <span>{chip.label}</span>
                    <button className="cp-chip-x" onClick={chip.onRemove}>×</button>
                  </div>
                ))}
                <button
                  className="cp-chip"
                  style={{ cursor:"pointer", color:"#D4714A", borderColor:"#F0B89A", background:"#FEF2EE" }}
                  onClick={handleResetFilters}
                >
                  {t("category_page.reset_filters")} ×
                </button>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="cp-error">
                <span>⚠️</span>
                <p className="cp-error-text">{error}</p>
                <button className="cp-retry" onClick={fetchProducts}>Retry</button>
              </div>
            )}

            {/* GRID */}
            {prodLoading ? (
              <GridSkeleton />
            ) : products.length === 0 ? (
              <div className="cp-empty">
                <span className="cp-empty-ic">🛋</span>
                <h3 className="cp-empty-t">{t("category_page.no_products")}</h3>
                <p className="cp-empty-s">{t("category_page.no_products_hint")}</p>
                {activeChips.length > 0 && (
                  <button className="cp-apply-btn" style={{ maxWidth:200, margin:"0 auto" }} onClick={handleResetFilters}>
                    {t("category_page.reset_filters")}
                  </button>
                )}
              </div>
            ) : (
              <div className="cp-grid">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="cp-card anim"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="cp-card-iw">
                      {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
                      <img
                        className="cp-card-img"
                        src={product.image || product.images?.[0]?.url}
                        alt={product.name}
                        loading="lazy"
                      />
                      {product.badge && (
                        <span
                          className="cp-card-badge"
                          style={{ background: BADGE_COLORS[product.badge] || "#7A9E7E" }}
                        >
                          {t(`common.${product.badge}`)}
                        </span>
                      )}
                      <div className="cp-card-actions">
                        <button
                          className={`cp-card-add${addingId === product.id ? " adding" : ""}`}
                          disabled={!product.in_stock || addingId === product.id}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          {addingId === product.id
                            ? t("collection_page.adding")
                            : !product.in_stock
                              ? t("common.out_of_stock")
                              : t("common.add_to_cart")}
                        </button>
                        <button className="cp-card-wish">♡</button>
                      </div>
                    </div>
                    <div className="cp-card-body">
                      <p className="cp-card-cat">{product.category?.name || category?.name}</p>
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="cp-card-name"
                      >
                        {product.name}
                      </Link>
                      <div className="cp-card-foot">
                        <div>
                          <span className="cp-card-price">{fmt(product.price)}</span>
                          {product.old_price && (
                            <span className="cp-card-old">{fmt(product.old_price)}</span>
                          )}
                        </div>
                        {product.rating && <Stars n={Math.round(product.rating)} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
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

        {/* MOBILE FILTER DRAWER */}
        {mobileFilter && (
          <>
            <div className="cp-mob-overlay" onClick={() => setMobileFilter(false)} />
            <div className="cp-mob-drawer">
              <div className="cp-mob-drawer-head">
                <span className="cp-mob-drawer-title">{t("category_page.filter_title")}</span>
                <button className="cp-mob-close" onClick={() => setMobileFilter(false)}>✕</button>
              </div>
              <FilterPanel
                filters={filters}
                localFilters={localFilters}
                onChange={handleLocalFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                t={t}
              />
            </div>
          </>
        )}

        <Footer />
      </div>
    </>
  );
}
