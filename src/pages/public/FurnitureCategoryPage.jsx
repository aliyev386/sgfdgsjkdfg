// src/pages/public/FurnitureCategoryPage.jsx
// Route: /furniture-categories/:id
// Sol: filter sidebar | Sag: product grid

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import categoryApi from "../../api/categoryApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";
import "../../assets/PagesCss/FurnitureCategory.css";

const PAGE_SIZE = 12;

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
  in_stock:     i % 7 !== 0,
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

const ProductCard = memo(function ProductCard({ product, idx, addingId, onAddToCart, t }) {
  const navigate = useNavigate();
  return (
    <article
      className="fcp-card"
      style={{ animationDelay: `${(idx % PAGE_SIZE) * 55}ms` }}
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      <div className="fcp-card-img-box">
        <img className="fcp-card-img" src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className="fcp-badge" style={{ background: BADGE_COLORS[product.badge] }}>
            {t(`common.${product.badge}`)}
          </span>
        )}
        {!product.in_stock && (
          <div className="fcp-oos"><span>{t("common.out_of_stock")}</span></div>
        )}
        <div className="fcp-card-actions">
          <button className="fcp-btn-view"
            onClick={e => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}>
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
            className={"fcp-add" + (addingId === product.id ? " adding" : "") + (!product.in_stock ? " disabled" : "")}
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

function FilterSidebar({ filterData, local, onChange, onApply, onReset, hasActive, t }) {
  const [open, setOpen] = useState({ price:true, stock:true,  materials:false, styles:false, rating:false });
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }));
  const checkToggle = (key, val) => {
    const cur = local[key] || [];
    onChange(key, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };
  const { price, materials, styles } = filterData;
  const priceMin = Number(local.price_min !== "" ? local.price_min : price.min);
  const priceMax = Number(local.price_max !== "" ? local.price_max : price.max);
  const pct = v => ((v - price.min) / (price.max - price.min)) * 100;

  return (
    <aside className="fcp-sidebar">
      <div className="fcp-sidebar-head">
        <span className="fcp-sidebar-title">{t("fcp.filter_title")}</span>
        {hasActive && <button className="fcp-sidebar-reset" onClick={onReset}>{t("fcp.clear_all")}</button>}
      </div>

      <AccSection label={t("fcp.price_range")} open={open.price} onToggle={() => tog("price")}>
        <div className="fcp-price-vals"><span>{fmt(priceMin)}</span><span>{fmt(priceMax)}</span></div>
        <div className="fcp-track-wrap">
          <div className="fcp-track-fill" style={{ left:`${pct(priceMin)}%`, right:`${100-pct(priceMax)}%` }} />
          <input type="range" className="fcp-range" min={price.min} max={price.max} step={50} value={priceMin}
            onChange={e => onChange("price_min", clamp(Number(e.target.value), price.min, priceMax - 50))} />
          <input type="range" className="fcp-range" min={price.min} max={price.max} step={50} value={priceMax}
            onChange={e => onChange("price_max", clamp(Number(e.target.value), priceMin + 50, price.max))} />
        </div>
        <div className="fcp-price-inputs">
          <div className="fcp-price-field">
            <label>{t("fcp.price_min")}</label>
            <input type="number" value={priceMin} min={price.min} max={priceMax}
              onChange={e => onChange("price_min", Number(e.target.value))} />
          </div>
          <div className="fcp-price-sep">–</div>
          <div className="fcp-price-field">
            <label>{t("fcp.price_max")}</label>
            <input type="number" value={priceMax} min={priceMin} max={price.max}
              onChange={e => onChange("price_max", Number(e.target.value))} />
          </div>
        </div>
      </AccSection>

      <AccSection label={t("fcp.availability")} open={open.stock} onToggle={() => tog("stock")}>
        <label className="fcp-toggle-row" onClick={() => onChange("in_stock", !local.in_stock)}>
          <div className={"fcp-toggle" + (local.in_stock ? " on" : "")}><div className="fcp-knob" /></div>
          <span>{t("fcp.in_stock_only")}</span>
        </label>
      </AccSection>

      <AccSection label={t("fcp.materials")} open={open.materials} onToggle={() => tog("materials")}>
        <div className="fcp-checklist">
          {materials.map(m => (
            <label key={m.value} className="fcp-check-row">
              <span className={"fcp-checkbox" + ((local.materials||[]).includes(m.value) ? " on" : "")}>
                {(local.materials||[]).includes(m.value) && "✓"}
              </span>
              <input type="checkbox" hidden checked={(local.materials||[]).includes(m.value)}
                onChange={() => checkToggle("materials", m.value)} />
              <span className="fcp-check-label">{m.label}</span>
              <span className="fcp-check-count">{m.count}</span>
            </label>
          ))}
        </div>
      </AccSection>

      <AccSection label={t("fcp.style")} open={open.styles} onToggle={() => tog("styles")}>
        <div className="fcp-chips">
          {styles.map(s => (
            <button key={s.value}
              className={"fcp-chip" + ((local.styles||[]).includes(s.value) ? " active" : "")}
              onClick={() => checkToggle("styles", s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </AccSection>

      <AccSection label={t("fcp.min_rating")} open={open.rating} onToggle={() => tog("rating")}>
        <div className="fcp-ratings">
          {[5,4,3].map(r => (
            <button key={r}
              className={"fcp-rating-btn" + (local.min_rating === r ? " active" : "")}
              onClick={() => onChange("min_rating", local.min_rating === r ? null : r)}>
              {Array.from({length:5}).map((_,i) => (
                <span key={i} className={"fcp-rstar" + (i<r?" on":"")}>★</span>
              ))}
              <span className="fcp-rating-and">{t("fcp.and_above")}</span>
            </button>
          ))}
        </div>
      </AccSection>

      <button className="fcp-apply-btn" onClick={onApply}>{t("fcp.apply_filters")}</button>
    </aside>
  );
}



export default function FurnitureCategoryPage() {
  const { id }                          = useParams();
  const { t }                           = useTranslation();
  const navigate                        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category,    setCategory]    = useState(null);
  const [products,    setProducts]    = useState([]);
  const [pagination,  setPagination]  = useState({ total:0, totalPages:1 });
  const [filterData]                  = useState(MOCK_FILTERS);
  const [catLoading,  setCatLoading]  = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [heroReady,   setHeroReady]   = useState(false);
  const [error,       setError]       = useState(null);
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
    in_stock:   searchParams.get("in_stock") === "true",
  });

  const currentPage = Number(searchParams.get("page") || 1);
  const currentSort = searchParams.get("sort") || "featured";

  useEffect(() => {
    setCatLoading(true);
    // Real API: categoryApi.getById(id).then(res => { setCategory(res.data); ... })
    // categoryApi.getFilters(id).then(res => setFilterData(res.data))
    setTimeout(() => {
      const names = { "1":"Divan", "2":"Stol", "3":"Çarpayı", "4":"Kreslo" };
      setCategory({
        id,
        name: names[id] || "Məhsullar",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85",
        product_count: 24,
      });
      setCatLoading(false);
      setTimeout(() => setHeroReady(true), 80);
    }, 350);
  }, [id]);

  const fetchProducts = useCallback(() => {
    setProdLoading(true);
    setError(null);
    // Real API: categoryApi.getProducts(id, params).then(...)
    setTimeout(() => {
      const start = (currentPage - 1) * PAGE_SIZE;
      setProducts(MOCK_PRODUCTS.slice(start, start + PAGE_SIZE));
      setPagination({ total: MOCK_PRODUCTS.length, totalPages: Math.ceil(MOCK_PRODUCTS.length / PAGE_SIZE) });
      setProdLoading(false);
    }, 480);
  }, [id, currentPage, currentSort, searchParams]);

  useEffect(() => {
    fetchProducts();
    if (currentPage > 1) requestAnimationFrame(() =>
      gridRef.current?.scrollIntoView({ behavior:"smooth", block:"start" })
    );
  }, [fetchProducts]);

  const handleChange = useCallback((key, val) => setLocal(p => ({ ...p, [key]: val })), []);

  const buildParams = useCallback((overrides = {}) => {
    const src = { ...local, ...overrides };
    const p = new URLSearchParams();
    p.set("sort", currentSort); p.set("page", 1);
    if (src.price_min !== "") p.set("price_min", src.price_min);
    if (src.price_max !== "") p.set("price_max", src.price_max);
    if (src.min_rating)       p.set("min_rating", src.min_rating);
    (src.materials||[]).forEach(v => p.append("materials", v));
    (src.styles||[]).forEach(v => p.append("styles", v));
    return p;
  }, [local, currentSort]);

  const handleApply = useCallback(() => { setSearchParams(buildParams()); setMobileOpen(false); }, [buildParams, setSearchParams]);
  const handleReset = useCallback(() => {
    const blank = { price_min:"", price_max:"",  materials:[],  styles:[], min_rating:null, in_stock:false };
    setLocal(blank);
    const p = new URLSearchParams(); p.set("sort", currentSort);
    setSearchParams(p); setMobileOpen(false);
  }, [currentSort, setSearchParams]);

  const handlePageChange = useCallback(pg => {
    const p = new URLSearchParams(searchParams); p.set("page", pg); setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback(e => {
    const p = new URLSearchParams(searchParams); p.set("sort", e.target.value); p.set("page", 1); setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const removeChip = useCallback((type, val) => {
    const p = new URLSearchParams(searchParams);
    if (type === "price") { p.delete("price_min"); p.delete("price_max"); setLocal(pr => ({ ...pr, price_min:"", price_max:"" })); }
    else if (type === "in_stock") { p.delete("in_stock"); setLocal(pr => ({ ...pr, in_stock:false })); }
    else if (type === "min_rating") { p.delete("min_rating"); setLocal(pr => ({ ...pr, min_rating:null })); }
    else {
      const rem = searchParams.getAll(type).filter(x => x !== val);
      p.delete(type); rem.forEach(x => p.append(type, x));
      setLocal(pr => ({ ...pr, [type]: rem }));
    }
    p.set("page", 1); setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const activeChips = useMemo(() => {
    const chips = [];
    const pm = searchParams.get("price_min"), px = searchParams.get("price_max");
    if (pm || px) chips.push({ id:"price", label:`$${pm||0} – $${px||"∞"}`, onRemove:()=>removeChip("price") });
    if (searchParams.get("in_stock")==="true") chips.push({ id:"in_stock", label:t("fcp.in_stock_only"), onRemove:()=>removeChip("in_stock") });
    if (searchParams.get("min_rating")) chips.push({ id:"min_rating", label:`★ ${searchParams.get("min_rating")}+`, onRemove:()=>removeChip("min_rating") });
    searchParams.getAll("materials").forEach(v => chips.push({ id:`m-${v}`, label:filterData.materials.find(m=>m.value===v)?.label||v, onRemove:()=>removeChip("materials",v) }));
    searchParams.getAll("styles").forEach(v    => chips.push({ id:`s-${v}`, label:v, onRemove:()=>removeChip("styles",v) }));
    return chips;
  }, [searchParams, filterData, removeChip, t]);

  const hasActive = activeChips.length > 0;

  const handleAddToCart = useCallback(async product => {
    if (addingId === product.id || !product.in_stock) return;
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
    { v:"featured",   l:t("fcp.sort_featured")   },
    { v:"price_asc",  l:t("fcp.sort_price_asc")  },
    { v:"price_desc", l:t("fcp.sort_price_desc") },
    { v:"newest",     l:t("fcp.sort_newest")      },
    { v:"popular",    l:t("fcp.sort_popular")     },
    { v:"rating",     l:t("fcp.sort_rating")      },
  ];

  const SidebarNode = (
    <FilterSidebar
      filterData={filterData} local={local}
      onChange={handleChange} onApply={handleApply}
      onReset={handleReset} hasActive={hasActive} t={t}
    />
  );

  return (
    <>
      <div className="fcp-page">
        <Navbar />

        <div className={"fcp-hero" + (heroReady ? " ready" : "")}>
          {category?.image && (
            <div className="fcp-hero-bg" style={{ backgroundImage:`url(${category.image})` }} />
          )}
          <div className="fcp-hero-overlay" />
          <div className="fcp-hero-content">
            <div className="fcp-breadcrumb">
              <Link to="/">{t("fcp.home")}</Link>
              <span className="fcp-breadcrumb-sep">/</span>
              <Link to="/furniture-categories">{t("fcp.categories")}</Link>
              <span className="fcp-breadcrumb-sep">/</span>
              <span className="fcp-breadcrumb-cur">{category?.name || "…"}</span>
            </div>
            <h1 className="fcp-hero-title">
              {catLoading ? "…" : <em>{category?.name}</em>}
            </h1>
          </div>
          <div className="fcp-hero-stat">
            <span className="fcp-hero-stat-n">{pagination.total || 0}</span>
            <span className="fcp-hero-stat-l">{t("fcp.products")}</span>
          </div>
        </div>

        <div className="fcp-layout">
          {SidebarNode}

          <main className="fcp-main" ref={gridRef} style={{ scrollMarginTop:80 }}>
            {activeChips.length > 0 && (
              <div className="fcp-active-chips">
                {activeChips.map(chip => (
                  <div key={chip.id} className="fcp-achip">
                    <span>{chip.label}</span>
                    <button className="fcp-achip-x" onClick={chip.onRemove}>×</button>
                  </div>
                ))}
                <button className="fcp-clear-all" onClick={handleReset}>
                  {t("fcp.clear_all")} ×
                </button>
              </div>
            )}

            <div className="fcp-toolbar">
              <div className="fcp-toolbar-left">
                <button className="fcp-mob-btn" onClick={() => setMobileOpen(true)}>
                  ⚙ {t("fcp.filter_title")}{hasActive ? ` (${activeChips.length})` : ""}
                </button>
                <p className="fcp-result-info">
                  {t("fcp.showing")} <strong>{(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE, pagination.total)}</strong>{" "}
                  {t("fcp.of")} <strong>{pagination.total}</strong>
                </p>
              </div>
              <div className="fcp-toolbar-right">
                <span className="fcp-sort-label">{t("fcp.sort_label")}</span>
                <select className="fcp-sort-select" value={currentSort} onChange={handleSortChange}>
                  {sortOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <div className="fcp-view-btns">
                  <button className={"fcp-view-btn" + (gridCols===3?" active":"")} onClick={()=>setGridCols(3)}>⊞</button>
                  <button className={"fcp-view-btn" + (gridCols===4?" active":"")} onClick={()=>setGridCols(4)}>⊟</button>
                </div>
              </div>
            </div>

            {error && (
              <div className="fcp-error">
                <span>⚠️</span>
                <p className="fcp-error-text">{error}</p>
                <button className="fcp-retry" onClick={fetchProducts}>{t("common.error")}</button>
              </div>
            )}

            {prodLoading && (
              <div className="fcp-sk-grid">
                {Array.from({length:PAGE_SIZE}).map((_,i) => (
                  <div key={i} className="fcp-sk-card">
                    <div className="fcp-sk-img" />
                    <div className="fcp-sk-line" />
                    <div className="fcp-sk-line sm" />
                  </div>
                ))}
              </div>
            )}

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

            {!prodLoading && products.length > 0 && (
              <div className={"fcp-grid cols-" + gridCols}>
                {products.map((p,i) => (
                  <ProductCard key={p.id} product={p} idx={i}
                    addingId={addingId} onAddToCart={handleAddToCart} t={t} />
                ))}
              </div>
            )}

            {!prodLoading && products.length > 0 && (
              <Pagination current={currentPage} total={pagination.totalPages}
                onPageChange={handlePageChange} accentColor="#7A9E7E" />
            )}
          </main>
        </div>

        {mobileOpen && (
          <>
            <div className="fcp-overlay" onClick={() => setMobileOpen(false)} />
            <div className="fcp-drawer">
              <div className="fcp-drawer-head">
                <span className="fcp-drawer-title">{t("fcp.filter_title")}</span>
                <button className="fcp-drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <div style={{padding:"0 0 48px"}}>{SidebarNode}</div>
            </div>
          </>
        )}

        {toast && (
          <div className="fcp-toast">
            <span className="fcp-toast-ic">✓</span>
            <span><strong>{toast}</strong> {t("fcp.added_to_cart")}</span>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}