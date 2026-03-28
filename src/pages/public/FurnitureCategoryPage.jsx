// src/pages/public/FurnitureCategoryPage.jsx
// Route: /furniture-categories  OR  /furniture-categories/:id
// Sol: filter sidebar | Sağ: product grid | Yuxarı: dinamik banner

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/FurnitureCategory.css";

const PAGE_SIZE = 12;

// ── CATEGORIES (sidebar üçün) ──────────────────────────────────────────────
const CATEGORIES = [
  { id: null,  key: "all",         labelKey: "fcp.cat_all",         count: 83, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85", accent: "#7A9E7E", tagline: "fcp.banner_all" },
  { id: "1",   key: "sofa",        labelKey: "fcp.cat_sofa",        count: 14, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85", accent: "#7A9E7E", tagline: "fcp.banner_sofa" },
  { id: "2",   key: "table",       labelKey: "fcp.cat_table",       count: 11, image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85", accent: "#C9A84C", tagline: "fcp.banner_table" },
  { id: "3",   key: "bed",         labelKey: "fcp.cat_bed",         count: 9,  image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=85", accent: "#A0856C", tagline: "fcp.banner_bed" },
  { id: "4",   key: "chair",       labelKey: "fcp.cat_chair",       count: 17, image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=85", accent: "#C1654B", tagline: "fcp.banner_chair" },
  { id: "5",   key: "wardrobe",    labelKey: "fcp.cat_wardrobe",    count: 8,  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85", accent: "#5C8DB8", tagline: "fcp.banner_wardrobe" },
  { id: "6",   key: "shelf",       labelKey: "fcp.cat_shelf",       count: 12, image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=85", accent: "#9B8AC4", tagline: "fcp.banner_shelf" },
  { id: "7",   key: "desk",        labelKey: "fcp.cat_desk",        count: 7,  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85", accent: "#5A7A9E", tagline: "fcp.banner_desk" },
  { id: "8",   key: "decor",       labelKey: "fcp.cat_decor",       count: 5,  image: "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=1400&q=85", accent: "#E8A87C", tagline: "fcp.banner_decor" },
];

const MOCK_FILTERS = {
  price: { min: 0, max: 15000 },
  materials: [
    { value: "solid_oak", label: "Solid Oak",    count: 42 },
    { value: "walnut",    label: "Walnut",       count: 28 },
    { value: "pine",      label: "Pine",         count: 19 },
    { value: "linen",     label: "Linen Fabric", count: 35 },
    { value: "velvet",    label: "Velvet",       count: 22 },
    { value: "leather",   label: "Full Leather", count: 17 },
    { value: "rattan",    label: "Rattan",       count: 11 },
    { value: "metal",     label: "Metal Frame",  count: 31 },
  ],
  styles: [
    { value: "scandinavian", label: "Scandinavian" },
    { value: "modern",       label: "Modern"       },
    { value: "industrial",   label: "Industrial"   },
    { value: "bohemian",     label: "Bohemian"     },
    { value: "classic",      label: "Classic"      },
    { value: "minimalist",   label: "Minimalist"   },
  ],
};

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
  image: [
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

const fmt   = (n) => `$${Number(n).toLocaleString()}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const BADGE_COLORS = { best_seller: "#D4714A", new_in: "#7A9E7E", sale: "#C9A84C" };

// ── STARS ──────────────────────────────────────────────────────────────────
function Stars({ n, count }) {
  return (
    <div className="fcp-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={"fcp-star" + (i < n ? " on" : "")}>★</span>
      ))}
      {count != null && <span className="fcp-star-c">({count})</span>}
    </div>
  );
}

// ── PRODUCT CARD ───────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product, idx, addingId, onAddToCart, t }) {
  const navigate = useNavigate();
  return (
    <article
      className="fcp-card"
      style={{ animationDelay: `${(idx % PAGE_SIZE) * 50}ms` }}
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      <div className="fcp-card-img-box">
        <img className="fcp-card-img" src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className="fcp-badge" style={{ background: BADGE_COLORS[product.badge] }}>
            {t(`common.${product.badge}`)}
          </span>
        )}
        <div className="fcp-card-hover-actions">
          <button
            className="fcp-btn-view"
            onClick={e => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}
          >
            {t("fcp.view_details")}
          </button>
          <button className="fcp-btn-wish" onClick={e => e.stopPropagation()}>♡</button>
        </div>
      </div>
      <div className="fcp-card-body">
        <h3 className="fcp-card-name">{product.name}</h3>
        <Stars n={product.rating} count={product.review_count} />
        <div className="fcp-card-foot">
          <div className="fcp-prices">
            <span className="fcp-price">{fmt(product.price)}</span>
            {product.old_price && <span className="fcp-old-price">{fmt(product.old_price)}</span>}
          </div>
          <button
            className={"fcp-add" + (addingId === product.id ? " adding" : "")}
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          >
            {addingId === product.id ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
});

// ── ACCORDION SECTION ──────────────────────────────────────────────────────
function AccSection({ label, open, onToggle, children }) {
  return (
    <div className="fcp-section">
      <button className="fcp-section-head" onClick={onToggle}>
        <span>{label}</span>
        <span className={"fcp-chevron" + (open ? " open" : "")}>›</span>
      </button>
      <div className={"fcp-section-body" + (open ? " open" : "")}>
        <div className="fcp-section-inner">{children}</div>
      </div>
    </div>
  );
}

// ── PRICE RANGE SLIDER (fixed dual-thumb + debounce) ──────────────────────
function PriceRange({ priceMin, priceMax, draftMin, draftMax, onDraftChange, onCommit, pMin, pMax }) {
  const pct = v => ((v - pMin) / (pMax - pMin)) * 100;
  const leftPct  = pct(draftMin);
  const rightPct = pct(draftMax);

  return (
    <>
      <div className="fcp-price-vals">
        <span>{fmt(draftMin)}</span>
        <span>{fmt(draftMax)}</span>
      </div>

      {/* dual-range track */}
      <div className="fcp-track-wrap">
        <div className="fcp-track-bg" />
        <div className="fcp-track-fill" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />

        {/* MIN thumb — rendered second so it can receive pointer events on left side */}
        <input
          type="range"
          className="fcp-range fcp-range-min"
          min={pMin} max={pMax} step={50}
          value={draftMin}
          onChange={e => {
            const v = clamp(Number(e.target.value), pMin, draftMax - 50);
            onDraftChange("min", v);
          }}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
        />

        {/* MAX thumb */}
        <input
          type="range"
          className="fcp-range fcp-range-max"
          min={pMin} max={pMax} step={50}
          value={draftMax}
          onChange={e => {
            const v = clamp(Number(e.target.value), draftMin + 50, pMax);
            onDraftChange("max", v);
          }}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
        />
      </div>

      <div className="fcp-price-inputs">
        <div className="fcp-price-field">
          <label>{fmt(pMin)}</label>
          <input
            type="number"
            value={draftMin}
            min={pMin} max={draftMax - 50}
            onChange={e => onDraftChange("min", clamp(Number(e.target.value), pMin, draftMax - 50))}
            onBlur={onCommit}
          />
        </div>
        <div className="fcp-price-sep">—</div>
        <div className="fcp-price-field">
          <label>{fmt(pMax)}</label>
          <input
            type="number"
            value={draftMax}
            min={draftMin + 50} max={pMax}
            onChange={e => onDraftChange("max", clamp(Number(e.target.value), draftMin + 50, pMax))}
            onBlur={onCommit}
          />
        </div>
      </div>
    </>
  );
}

// ── FILTER SIDEBAR ─────────────────────────────────────────────────────────
function FilterSidebar({ categories, selectedCatId, onCategoryChange, filterData, local, onChange, onPriceCommit, onReset, hasActive, t }) {
  const [open, setOpen] = useState({ category: true, price: true, materials: false, styles: false, rating: false });
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }));

  const checkToggle = (key, val) => {
    const cur = local[key] || [];
    onChange(key, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

  const { price, materials, styles } = filterData;

  // Draft price state — local to sidebar, only commits on mouseUp / blur
  const [draftMin, setDraftMin] = useState(() => Number(local.price_min !== "" ? local.price_min : price.min));
  const [draftMax, setDraftMax] = useState(() => Number(local.price_max !== "" ? local.price_max : price.max));

  // Sync draft when parent resets
  useEffect(() => {
    setDraftMin(local.price_min !== "" ? Number(local.price_min) : price.min);
    setDraftMax(local.price_max !== "" ? Number(local.price_max) : price.max);
  }, [local.price_min, local.price_max, price.min, price.max]);

  const handleDraftChange = (which, val) => {
    if (which === "min") setDraftMin(val);
    else setDraftMax(val);
  };

  const handleCommit = () => onPriceCommit(draftMin, draftMax);

  return (
    <aside className="fcp-sidebar">
      <div className="fcp-sidebar-head">
        <span className="fcp-sidebar-title">{t("fcp.filter_title")}</span>
        {hasActive && (
          <button className="fcp-sidebar-reset" onClick={onReset}>{t("fcp.clear_all")}</button>
        )}
      </div>

      {/* CATEGORY */}
      <AccSection label={t("fcp.categories")} open={open.category} onToggle={() => tog("category")}>
        <div className="fcp-cat-list">
          {categories.map(cat => (
            <button
              key={cat.id ?? "all"}
              className={"fcp-cat-item" + (selectedCatId === cat.id ? " active" : "")}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span className="fcp-cat-dot" style={{ background: cat.accent }} />
              <span className="fcp-cat-label">{t(cat.labelKey)}</span>
              <span className="fcp-cat-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </AccSection>

      {/* PRICE */}
      <AccSection label={t("fcp.price_range")} open={open.price} onToggle={() => tog("price")}>
        <PriceRange
          draftMin={draftMin}
          draftMax={draftMax}
          onDraftChange={handleDraftChange}
          onCommit={handleCommit}
          pMin={price.min}
          pMax={price.max}
        />
      </AccSection>

      {/* MATERIALS */}
      <AccSection label={t("fcp.materials")} open={open.materials} onToggle={() => tog("materials")}>
        <div className="fcp-checklist">
          {materials.map(m => (
            <label key={m.value} className="fcp-check-row" onClick={() => checkToggle("materials", m.value)}>
              <span className={"fcp-checkbox" + ((local.materials || []).includes(m.value) ? " on" : "")}>
                {(local.materials || []).includes(m.value) && "✓"}
              </span>
              <span className="fcp-check-label">{m.label}</span>
              <span className="fcp-check-count">{m.count}</span>
            </label>
          ))}
        </div>
      </AccSection>

      {/* STYLE */}
      <AccSection label={t("fcp.style")} open={open.styles} onToggle={() => tog("styles")}>
        <div className="fcp-chips">
          {styles.map(s => (
            <button key={s.value}
              className={"fcp-chip" + ((local.styles || []).includes(s.value) ? " active" : "")}
              onClick={() => checkToggle("styles", s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </AccSection>

      {/* RATING */}
      <AccSection label={t("fcp.min_rating")} open={open.rating} onToggle={() => tog("rating")}>
        <div className="fcp-ratings">
          {[5, 4, 3].map(r => (
            <button key={r}
              className={"fcp-rating-btn" + (local.min_rating === r ? " active" : "")}
              onClick={() => onChange("min_rating", local.min_rating === r ? null : r)}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={"fcp-rstar" + (i < r ? " on" : "")}>★</span>
              ))}
              <span className="fcp-rating-and">{t("fcp.and_above")}</span>
            </button>
          ))}
        </div>
      </AccSection>
    </aside>
  );
}

// ── CUSTOM PAGINATION ──────────────────────────────────────────────────────
function FcpPagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
  return (
    <div className="fcp-pagination">
      <button className="fcp-pg-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>‹</button>
      {pages.map(p => (
        <button key={p} className={"fcp-pg-num" + (p === current ? " active" : "")} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="fcp-pg-btn" disabled={current === total} onClick={() => onChange(current + 1)}>›</button>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function FurnitureCategoryPage() {
  const { id: routeId }                 = useParams();
  const { t }                           = useTranslation();
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // selected category id — null = "All"
  const [selectedCatId, setSelectedCatId] = useState(routeId ?? null);

  const activeCat = useMemo(
    () => CATEGORIES.find(c => String(c.id) === String(selectedCatId)) ?? CATEGORIES[0],
    [selectedCatId]
  );

  const [products,    setProducts]    = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, totalPages: 1 });
  const [filterData]                  = useState(MOCK_FILTERS);
  const [prodLoading, setProdLoading] = useState(true);
  const [bannerReady, setBannerReady] = useState(false);
  const [addingId,    setAddingId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [gridCols,    setGridCols]    = useState(3);
  const toastTimer = useRef(null);
  const gridRef    = useRef(null);

  const [local, setLocal] = useState({
    price_min:  searchParams.get("price_min") ? Number(searchParams.get("price_min")) : "",
    price_max:  searchParams.get("price_max") ? Number(searchParams.get("price_max")) : "",
    materials:  searchParams.getAll("materials"),
    styles:     searchParams.getAll("styles"),
    min_rating: searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : null,
  });

  const currentPage = Number(searchParams.get("page") || 1);
  const currentSort = searchParams.get("sort") || "featured";

  // Banner entrance animation
  useEffect(() => {
    setBannerReady(false);
    const t = setTimeout(() => setBannerReady(true), 80);
    return () => clearTimeout(t);
  }, [selectedCatId]);

  // Fetch products
  const fetchProducts = useCallback(() => {
    setProdLoading(true);
    setTimeout(() => {
      const start = (currentPage - 1) * PAGE_SIZE;
      setProducts(MOCK_PRODUCTS.slice(start, start + PAGE_SIZE));
      setPagination({ total: MOCK_PRODUCTS.length, totalPages: Math.ceil(MOCK_PRODUCTS.length / PAGE_SIZE) });
      setProdLoading(false);
    }, 380);
  }, [currentPage, currentSort, selectedCatId, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // Instant filter for non-price filters
  const handleChange = useCallback((key, val) => {
    setLocal(p => {
      const next = { ...p, [key]: val };
      const params = new URLSearchParams(searchParams);
      params.set("page", 1);
      if (next.price_min !== "") params.set("price_min", next.price_min); else params.delete("price_min");
      if (next.price_max !== "") params.set("price_max", next.price_max); else params.delete("price_max");
      if (next.min_rating)       params.set("min_rating", next.min_rating); else params.delete("min_rating");
      params.delete("materials"); (next.materials || []).forEach(v => params.append("materials", v));
      params.delete("styles");    (next.styles    || []).forEach(v => params.append("styles", v));
      setSearchParams(params, { replace: true });
      return next;
    });
  }, [searchParams, setSearchParams]);

  // Price commits only on mouseUp / blur — no flickering
  const handlePriceCommit = useCallback((min, max) => {
    setLocal(p => ({ ...p, price_min: min, price_max: max }));
    const params = new URLSearchParams(searchParams);
    params.set("page", 1);
    params.set("price_min", min);
    params.set("price_max", max);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleReset = useCallback(() => {
    setLocal({ price_min: "", price_max: "", materials: [], styles: [], min_rating: null });
    const p = new URLSearchParams(); p.set("sort", currentSort);
    setSearchParams(p); setMobileOpen(false);
  }, [currentSort, setSearchParams]);

  const handleCategoryChange = useCallback((catId) => {
    setSelectedCatId(catId);
    handleReset();
    if (catId) navigate(`/furniture-categories/${catId}`, { replace: true });
    else       navigate("/furniture-categories", { replace: true });
    setMobileOpen(false);
  }, [navigate, handleReset]);

  const handlePageChange = useCallback(pg => {
    const p = new URLSearchParams(searchParams); p.set("page", pg); setSearchParams(p);
    requestAnimationFrame(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback(e => {
    const p = new URLSearchParams(searchParams); p.set("sort", e.target.value); p.set("page", 1); setSearchParams(p);
  }, [searchParams, setSearchParams]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    const pm = searchParams.get("price_min"), px = searchParams.get("price_max");
    if (pm || px) chips.push({ id: "price", label: `$${pm || 0} – $${px || "∞"}`, onRemove: () => { handleChange("price_min", ""); handleChange("price_max", ""); } });
    if (searchParams.get("min_rating")) chips.push({ id: "min_rating", label: `★ ${searchParams.get("min_rating")}+`, onRemove: () => handleChange("min_rating", null) });
    searchParams.getAll("materials").forEach(v => chips.push({ id: `m-${v}`, label: filterData.materials.find(m => m.value === v)?.label || v, onRemove: () => handleChange("materials", (local.materials || []).filter(x => x !== v)) }));
    searchParams.getAll("styles").forEach(v    => chips.push({ id: `s-${v}`, label: v, onRemove: () => handleChange("styles", (local.styles || []).filter(x => x !== v)) }));
    return chips;
  }, [searchParams, filterData, local, handleChange]);

  const hasActive = activeChips.length > 0;

  const handleAddToCart = useCallback(async product => {
    if (addingId === product.id) return;
    setAddingId(product.id);
    try {
      await cartApi.addItem(product.id, 1);
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2900);
    } catch {}
    setTimeout(() => setAddingId(null), 1500);
  }, [addingId]);

  const sortOptions = [
    { v: "featured",   l: t("fcp.sort_featured")   },
    { v: "price_asc",  l: t("fcp.sort_price_asc")  },
    { v: "price_desc", l: t("fcp.sort_price_desc") },
    { v: "newest",     l: t("fcp.sort_newest")      },
    { v: "popular",    l: t("fcp.sort_popular")     },
    { v: "rating",     l: t("fcp.sort_rating")      },
  ];

  const SidebarNode = (
    <FilterSidebar
      categories={CATEGORIES}
      selectedCatId={selectedCatId}
      onCategoryChange={handleCategoryChange}
      filterData={filterData}
      local={local}
      onChange={handleChange}
      onPriceCommit={handlePriceCommit}
      onReset={handleReset}
      hasActive={hasActive}
      t={t}
    />
  );

  return (
    <div className="fcp-page">
      <Navbar />

      {/* ── DYNAMIC BANNER ── */}
      <div className={"fcp-banner" + (bannerReady ? " ready" : "")}
           style={{ "--accent": activeCat.accent }}>
        <div className="fcp-banner-bg" style={{ backgroundImage: `url(${activeCat.image})` }} />
        <div className="fcp-banner-overlay" />
        <div className="fcp-banner-content">
          {/* breadcrumb */}
          <nav className="fcp-breadcrumb">
            <Link to="/">{t("fcp.home")}</Link>
            <span className="fcp-bc-sep">/</span>
            <span className="fcp-bc-cur">{t(activeCat.labelKey)}</span>
          </nav>

          <div className="fcp-banner-body">
            <div className="fcp-banner-left">
              <p className="fcp-banner-eyebrow">{t("fcp.collection")}</p>
              <h1 className="fcp-banner-title">{t(activeCat.labelKey)}</h1>
              <p className="fcp-banner-sub">{t(activeCat.tagline)}</p>
            </div>
            <div className="fcp-banner-right">
              <div className="fcp-banner-stat">
                <span className="fcp-stat-n">{activeCat.count}</span>
                <span className="fcp-stat-l">{t("fcp.products")}</span>
              </div>
            </div>
          </div>

          {/* Category pills inside banner */}
          <div className="fcp-banner-cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id ?? "all"}
                className={"fcp-banner-cat" + (selectedCatId === cat.id ? " active" : "")}
                style={selectedCatId === cat.id ? { "--ac": cat.accent } : {}}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="fcp-layout">

        {/* Sidebar */}
        {SidebarNode}

        {/* Main */}
        <main className="fcp-main" ref={gridRef} style={{ scrollMarginTop: 80 }}>

          {/* ── Active filter chips — toolbar-dan üstdə ── */}
          {activeChips.length > 0 && (
            <div className="fcp-active-chips">
              <span className="fcp-achips-label">{t("fcp.filter_title")}:</span>
              {activeChips.map(chip => (
                <div key={chip.id} className="fcp-achip">
                  <span>{chip.label}</span>
                  <button className="fcp-achip-x" onClick={chip.onRemove} title="Sil">×</button>
                </div>
              ))}
              <button className="fcp-clear-all" onClick={handleReset}>
                {t("fcp.clear_all")}
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="fcp-toolbar">
            <div className="fcp-toolbar-left">
              <button className="fcp-mob-btn" onClick={() => setMobileOpen(true)}>
                <span>≡</span> {t("fcp.filter_title")}{hasActive ? ` (${activeChips.length})` : ""}
              </button>
              <p className="fcp-result-info">
                <strong>{pagination.total}</strong> {t("fcp.products")}
              </p>
            </div>
            <div className="fcp-toolbar-right">
              <span className="fcp-sort-label">{t("fcp.sort_label")}</span>
              <select className="fcp-sort-select" value={currentSort} onChange={handleSortChange}>
                {sortOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <div className="fcp-view-btns">
                <button className={"fcp-view-btn" + (gridCols === 3 ? " active" : "")} onClick={() => setGridCols(3)}>⊞</button>
                <button className={"fcp-view-btn" + (gridCols === 4 ? " active" : "")} onClick={() => setGridCols(4)}>⊟</button>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          {prodLoading && (
            <div className="fcp-sk-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="fcp-sk-card">
                  <div className="fcp-sk-img" />
                  <div className="fcp-sk-line" />
                  <div className="fcp-sk-line sm" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!prodLoading && products.length === 0 && (
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

          {/* Grid */}
          {!prodLoading && products.length > 0 && (
            <div className={"fcp-grid cols-" + gridCols}>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} idx={i}
                  addingId={addingId} onAddToCart={handleAddToCart} t={t} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!prodLoading && products.length > 0 && (
            <FcpPagination current={currentPage} total={pagination.totalPages} onChange={handlePageChange} />
          )}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fcp-overlay" onClick={() => setMobileOpen(false)} />
          <div className="fcp-drawer">
            <div className="fcp-drawer-head">
              <span className="fcp-drawer-title">{t("fcp.filter_title")}</span>
              <button className="fcp-drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <div style={{ padding: "0 0 48px" }}>{SidebarNode}</div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fcp-toast">
          <span className="fcp-toast-ic">✓</span>
          <span><strong>{toast}</strong> {t("fcp.added_to_cart")}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}