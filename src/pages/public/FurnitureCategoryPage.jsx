import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart } from "../../store/slices/cartSlice";
import cartApi from "../../api/cartApi";
import { toggleWishlist } from "../../store/slices/wishlistStore";
import categoryApi from "../../api/categoryApi";
import productApi from "../../api/productApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { fireCartAdded } from "../../components/common/CartAddedPopup";
import "../../assets/pagesCss/FurnitureCategory.css";

const PAGE_SIZE = 12;
const PRICE_MAX = 15000;

const ACCENT_COLORS = ["#7A9E7E","#C9A84C","#A0856C","#C1654B","#5C8DB8","#9B8AC4","#5A7A9E","#E8A87C","#D4714A"];
const BANNER_IMGS = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=85",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=85",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85",
  "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=1400&q=85",
];
const BADGE_COLORS = { best_seller:"#c0604a", new_in:"#6d9b70", sale:"#c9a84c", new:"#6d9b70", hot:"#c0604a", featured:"#5a82b0" };
const SORT_OPTIONS = [
  { value:"featured",   labelKey:"fcp.sort_featured"   },
  { value:"price_asc",  labelKey:"fcp.sort_price_asc"  },
  { value:"price_desc", labelKey:"fcp.sort_price_desc" },
  { value:"newest",     labelKey:"fcp.sort_newest"      },
];
const MATERIALS = ["Wood","Metal","Fabric","Leather","Velvet","Glass","Rattan"];
const STYLES    = ["Modern","Classic","Scandinavian","Industrial","Bohemian","Minimalist"];
const ROOMS     = ["Living Room","Bedroom","Office","Dining Room","Outdoor","Kids Room"];

const fmt   = n => `$${Number(n).toLocaleString()}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ── Product Card ── */
const ProductCard = memo(function ProductCard({ product, idx, addingId, onAddToCart, wishlist, dispatch, t }) {
  const navigate = useNavigate();
  const wished   = wishlist?.some(w => w.id === product.id);
  const badgeKey = product.badge?.toLowerCase().replace(/\s+/, "_");
  const badgeBg  = BADGE_COLORS[badgeKey] || "#6d9b70";
  return (
    <article className="fcp-card" style={{ animationDelay:`${(idx%PAGE_SIZE)*40}ms` }} onClick={() => navigate(`/details/${product.id}`)}>
      <div className="fcp-card-img-wrap">
        <img className="fcp-card-img" src={product.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"} alt={product.name} loading="lazy" />
        {badgeKey && <span className="fcp-card-badge" style={{ background: badgeBg }}>{product.badge}</span>}
        <div className="fcp-card-actions">
          <button className="fcp-card-view" onClick={e => { e.stopPropagation(); navigate(`/details/${product.id}`); }}>{t("fcp.view_details")}</button>
          <button className="fcp-card-wish" onClick={e => { e.stopPropagation(); dispatch(toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image })); }}>
            {wished ? <span style={{ color:"#e53e3e" }}>♥</span> : "♡"}
          </button>
        </div>
      </div>
      <div className="fcp-card-body">
        <h3 className="fcp-card-name">{product.name}</h3>
        {product.categoryName && <p className="fcp-card-cat">{product.categoryName}</p>}
        <div className="fcp-card-foot">
          <div className="fcp-card-prices">
            <span className="fcp-card-price">{fmt(product.price)}</span>
            {product.oldPrice && <span className="fcp-card-old">{fmt(product.oldPrice)}</span>}
          </div>
          <button className={`fcp-card-add${addingId===product.id?" adding":""}`} onClick={e => { e.stopPropagation(); onAddToCart(product); }}>
            {addingId===product.id ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
});

function Section({ label, open, onToggle, children, count }) {
  return (
    <div className="fcp-section">
      <button className="fcp-section-btn" onClick={onToggle}>
        <span className="fcp-section-label">
          {label}
          {count > 0 && <span className="fcp-section-count">{count}</span>}
        </span>
        <span className={`fcp-section-arrow${open?" open":""}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      <div className={`fcp-section-body${open?" open":""}`}>
        <div className="fcp-section-content">{children}</div>
      </div>
    </div>
  );
}

function PriceSlider({ min, max, pMin=0, pMax=PRICE_MAX, onChange }) {
  const pct  = v => ((v-pMin)/(pMax-pMin))*100;
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  useEffect(() => setLocalMin(min), [min]);
  useEffect(() => setLocalMax(max), [max]);
  const commit = () => onChange(localMin, localMax);
  return (
    <>
      <div className="fcp-price-vals"><span>{fmt(localMin)}</span><span>{fmt(localMax)}</span></div>
      <div className="fcp-track">
        <div className="fcp-track-bg" />
        <div className="fcp-track-fill" style={{ left:`${pct(localMin)}%`, right:`${100-pct(localMax)}%` }} />
        <input type="range" className="fcp-range fcp-range-min" min={pMin} max={pMax} step={50} value={localMin} onChange={e => setLocalMin(clamp(+e.target.value,pMin,localMax-50))} onMouseUp={commit} onTouchEnd={commit} />
        <input type="range" className="fcp-range fcp-range-max" min={pMin} max={pMax} step={50} value={localMax} onChange={e => setLocalMax(clamp(+e.target.value,localMin+50,pMax))} onMouseUp={commit} onTouchEnd={commit} />
      </div>
      <div className="fcp-price-inputs">
        <input className="fcp-price-input" type="number" value={localMin} min={pMin} max={localMax-50} onChange={e => setLocalMin(clamp(+e.target.value,pMin,localMax-50))} onBlur={commit} />
        <span className="fcp-price-dash">—</span>
        <input className="fcp-price-input" type="number" value={localMax} min={localMin+50} max={pMax} onChange={e => setLocalMax(clamp(+e.target.value,localMin+50,pMax))} onBlur={commit} />
      </div>
    </>
  );
}

function ChipFilter({ items, selected, onToggle }) {
  return (
    <div className="fcp-chip-filter">
      {items.map(item => (
        <button key={item} className={`fcp-fchip${selected.includes(item)?" active":""}`} onClick={() => onToggle(item)}>{item}</button>
      ))}
    </div>
  );
}

function ColorFilter({ items = [], selected, onToggle }) {
  if (!items.length) return (
    <p style={{ fontSize: 12, color: "#aaa", padding: "4px 0" }}>Rəng tapılmadı</p>
  );
  return (
    <div className="fcp-color-grid">
      {items.map(c => (
        <button key={c.name} className={`fcp-color-btn${selected.includes(c.name)?" active":""}`} onClick={() => onToggle(c.name)} title={c.name}>
          <span className="fcp-color-swatch" style={{ background: c.hexCode || c.hex || "#ccc" }} />
          <span className="fcp-color-name">{c.name}</span>
          {selected.includes(c.name) && <span className="fcp-color-check">✓</span>}
        </button>
      ))}
    </div>
  );
}

function SidebarContent({ categories, selectedCatId, onCategoryChange, filters, onPriceChange, onReset, hasActive, t, currentSort, onSortChange, localFilters, onLocalFilter, activeCount, apiColors }) {
  const [open, setOpen] = useState({ category:true, price:true, material:true, room:false, style:false, color:false, sort:true, availability:false });
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }));
  const priceMin = filters.priceMin !== "" ? Number(filters.priceMin) : 0;
  const priceMax = filters.priceMax !== "" ? Number(filters.priceMax) : PRICE_MAX;
  const toggleLocal = (key, val) => {
    const arr = localFilters[key] || [];
    onLocalFilter(key, arr.includes(val) ? arr.filter(x=>x!==val) : [...arr,val]);
  };
  return (
    <div className="fcp-sidebar-inner">
      <div className="fcp-sidebar-header">
        <div className="fcp-sidebar-title-row">
          <span className="fcp-sidebar-title">Filters</span>
          {activeCount > 0 && <span className="fcp-sidebar-badge">{activeCount}</span>}
        </div>
        {hasActive && <button className="fcp-sidebar-clear" onClick={onReset}>Clear all</button>}
      </div>

      <Section label={t("fcp.categories")} open={open.category} onToggle={() => tog("category")}>
        <div className="fcp-cat-list">
          {categories.map(cat => (
            <button key={cat.id??"all"} className={`fcp-cat-btn${selectedCatId===cat.id?" active":""}`} onClick={() => onCategoryChange(cat.id)}>
              <span className="fcp-cat-dot" style={{ background: cat.accent }} />
              <span className="fcp-cat-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section label={t("fcp.price_range")} open={open.price} onToggle={() => tog("price")}>
        <PriceSlider min={priceMin} max={priceMax} pMin={0} pMax={PRICE_MAX} onChange={onPriceChange} />
      </Section>



      <Section label="Color" open={open.color} onToggle={() => tog("color")} count={(localFilters.colors||[]).length}>
        <ColorFilter items={apiColors} selected={localFilters.colors||[]} onToggle={v => toggleLocal("colors",v)} />
      </Section>


      <Section label={t("fcp.sort_label")} open={open.sort} onToggle={() => tog("sort")}>
        <div className="fcp-sort-group">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} className={`fcp-sort-opt${currentSort===opt.value?" active":""}`} onClick={() => onSortChange(opt.value)}>
              <span className="fcp-sort-radio" />
              <span>{t(opt.labelKey)}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const range = [];
  for (let i = Math.max(1, current-2); i <= Math.min(total, current+2); i++) range.push(i);
  return (
    <div className="fcp-pagination">
      <button className="fcp-pg-btn" disabled={current===1} onClick={() => onChange(current-1)}>‹</button>
      {range[0]>1 && <><button className="fcp-pg-num" onClick={() => onChange(1)}>1</button>{range[0]>2 && <span className="fcp-pg-dots">…</span>}</>}
      {range.map(p => <button key={p} className={`fcp-pg-num${p===current?" active":""}`} onClick={() => onChange(p)}>{p}</button>)}
      {range[range.length-1]<total && <>{range[range.length-1]<total-1 && <span className="fcp-pg-dots">…</span>}<button className="fcp-pg-num" onClick={() => onChange(total)}>{total}</button></>}
      <button className="fcp-pg-btn" disabled={current===total} onClick={() => onChange(current+1)}>›</button>
    </div>
  );
}

export default function FurnitureCategoryPage() {
  const { id: routeId }                 = useParams();
  const { t }                           = useTranslation();
  const navigate                        = useNavigate();
  const dispatch                        = useDispatch();
  const wishlist                        = useSelector(s => s.wishlist.items);
  const lang                            = useSelector(selectLang);
  const [searchParams, setSearchParams] = useSearchParams();

  const [apiCats,     setApiCats]     = useState([]);
  const [apiColors,   setApiColors]   = useState([]);
  const [selectedId,  setSelectedId]  = useState(routeId ? Number(routeId) : null);
  const [products,    setProducts]    = useState([]);
  const [pagination,  setPagination]  = useState({ total:0, totalPages:1 });
  const [loading,     setLoading]     = useState(true);
  const [addingId,    setAddingId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [gridCols,    setGridCols]    = useState(3);
  const [bannerReady, setBannerReady] = useState(false);

  const [localFilters, setLocalFilters] = useState({ materials:[], rooms:[], styles:[], colors:[], inStock:false });
  const [filters, setFilters] = useState({ priceMin: searchParams.get("priceMin")||"", priceMax: searchParams.get("priceMax")||"" });

  const currentPage = Number(searchParams.get("page")||1);
  const currentSort = searchParams.get("sort")||"featured";

  const gridRef    = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    categoryApi.getAll().then(res => {
      const arr = Array.isArray(res) ? res : [];
      setApiCats(arr.map((c,i) => ({ id:c.id, name:c.name||`Category ${c.id}`, image:c.imageUrl||BANNER_IMGS[i%BANNER_IMGS.length], accent:ACCENT_COLORS[i%ACCENT_COLORS.length] })));
    }).catch(() => {});
  }, [lang]);

  useEffect(() => {
    productApi.getColors().then(data => {
      if (Array.isArray(data) && data.length) setApiColors(data);
    }).catch(() => {});
  }, []);

  const allCategories = useMemo(() => [{ id:null, name:t("fcp.cat_all"), image:BANNER_IMGS[0], accent:"#6d9b70" }, ...apiCats], [apiCats, t]);
  const activeCat = useMemo(() => allCategories.find(c => c.id===selectedId)??allCategories[0], [selectedId, allCategories]);

  useEffect(() => {
    setBannerReady(false);
    const tid = setTimeout(() => setBannerReady(true), 60);
    return () => clearTimeout(tid);
  }, [selectedId]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const pMin = searchParams.get("priceMin");
    const pMax = searchParams.get("priceMax");
    let request;
    if (pMin||pMax) request = productApi.getByPriceRange(pMin?Number(pMin):0, pMax?Number(pMax):PRICE_MAX, { page:currentPage, pageSize:PAGE_SIZE });
    else if (selectedId) request = productApi.getByCategory(selectedId, { page:currentPage, pageSize:PAGE_SIZE });
    else request = productApi.getAll({ page:currentPage, pageSize:PAGE_SIZE });
    Promise.resolve(request)
      .then(res => {
        const items = res?.data??(Array.isArray(res)?res:[]);
        const pag   = res?.pagination??{};
        const mapped = items.map(p => ({
          id:p.id, name:p.name, categoryName:p.categoryName||null,
          price:p.discountPrice??p.price, oldPrice:p.discountPrice?p.price:null,
          badge:p.label||null, image:p.images?.[0]?.imageUrl||null,
          material:p.material||null, room:p.room||null, style:p.style||null,
          color:p.color||null, inStock:p.stockQuantity>0,
        }));
        const sorted = [...mapped].sort((a,b) => {
          if (currentSort==="price_asc")  return a.price-b.price;
          if (currentSort==="price_desc") return b.price-a.price;
          return 0;
        });
        setProducts(sorted);
        setPagination({ total:pag.totalCount??sorted.length, totalPages:(pag?.totalPages??Math.ceil((pag?.totalCount??sorted.length)/PAGE_SIZE))||1 });
      })
      .catch(() => { setProducts([]); setPagination({ total:0, totalPages:1 }); })
      .finally(() => setLoading(false));
  }, [currentPage, currentSort, selectedId, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { window.scrollTo({ top:0 }); }, []);

  const filteredProducts = useMemo(() => {
    let r = [...products];
    if (localFilters.materials.length) r = r.filter(p => p.material && localFilters.materials.some(m => p.material.toLowerCase().includes(m.toLowerCase())));
    if (localFilters.rooms.length)     r = r.filter(p => p.room && localFilters.rooms.some(m => p.room.toLowerCase().includes(m.toLowerCase())));
    if (localFilters.styles.length)    r = r.filter(p => p.style && localFilters.styles.some(m => p.style.toLowerCase().includes(m.toLowerCase())));
    if (localFilters.colors.length)    r = r.filter(p => p.color && localFilters.colors.some(m => p.color.toLowerCase().includes(m.toLowerCase())));
    if (localFilters.inStock)          r = r.filter(p => p.inStock !== false);
    return r;
  }, [products, localFilters]);

  const updateParams = useCallback((updates) => {
    const p = new URLSearchParams(searchParams);
    p.set("page",1);
    Object.entries(updates).forEach(([k,v]) => { if (v!==null&&v!==""&&v!==undefined) p.set(k,v); else p.delete(k); });
    setSearchParams(p, { replace:true });
  }, [searchParams, setSearchParams]);

  const handlePriceChange = useCallback((min, max) => {
    setFilters({ priceMin:min>0?min:"", priceMax:max<PRICE_MAX?max:"" });
    updateParams({ priceMin:min>0?min:null, priceMax:max<PRICE_MAX?max:null });
  }, [updateParams]);

  const handleSortChange = useCallback(val => updateParams({ sort:val }), [updateParams]);

  const handleCategoryChange = useCallback((catId) => {
    setSelectedId(catId);
    setFilters({ priceMin:"", priceMax:"" });
    setLocalFilters({ materials:[], rooms:[], styles:[], colors:[], inStock:false });
    const p = new URLSearchParams();
    if (currentSort!=="featured") p.set("sort", currentSort);
    setSearchParams(p);
    if (catId) navigate(`/category/${catId}`, { replace:true });
    else       navigate("/category", { replace:true });
    setMobileOpen(false);
  }, [navigate, currentSort, setSearchParams]);

  const handleReset = useCallback(() => {
    setFilters({ priceMin:"", priceMax:"" });
    setLocalFilters({ materials:[], rooms:[], styles:[], colors:[], inStock:false });
    const p = new URLSearchParams();
    if (currentSort!=="featured") p.set("sort", currentSort);
    setSearchParams(p);
    setMobileOpen(false);
  }, [currentSort, setSearchParams]);

  const handleLocalFilter = useCallback((key, val) => setLocalFilters(prev => ({ ...prev, [key]:val })), []);

  const handlePageChange = useCallback(pg => {
    updateParams({ page:pg });
    requestAnimationFrame(() => gridRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }));
  }, [updateParams]);

  const activeChips = useMemo(() => {
    const chips = [];
    const pMin = searchParams.get("priceMin"), pMax = searchParams.get("priceMax");
    if (pMin||pMax) chips.push({ id:"price", label:`${fmt(pMin||0)} – ${pMax?fmt(pMax):fmt(PRICE_MAX)}`, onRemove:() => handlePriceChange(0,PRICE_MAX) });
    (localFilters.materials||[]).forEach(m => chips.push({ id:`mat-${m}`, label:m, onRemove:() => handleLocalFilter("materials", localFilters.materials.filter(x=>x!==m)) }));
    (localFilters.colors||[]).forEach(c => chips.push({ id:`color-${c}`, label:c, onRemove:() => handleLocalFilter("colors", localFilters.colors.filter(x=>x!==c)) }));
    return chips;
  }, [searchParams, localFilters, handlePriceChange, handleLocalFilter]);

  const hasActive   = activeChips.length > 0;
  const activeCount = activeChips.length;

  const handleAddToCart = useCallback(async product => {
    if (addingId===product.id) return;
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem({ productId:product.id, quantity:1 });
      if (cart) dispatch(setCart(cart));
      fireCartAdded({ name: product.name, image: product.images?.[0]?.imageUrl || product.image || null, price: product.discountPrice ?? product.price });
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId, dispatch]);

  const SidebarNode = (
    <SidebarContent
      categories={allCategories} selectedCatId={selectedId} onCategoryChange={handleCategoryChange}
      filters={filters} onPriceChange={handlePriceChange} onReset={handleReset} hasActive={hasActive}
      t={t} currentSort={currentSort} onSortChange={handleSortChange}
      localFilters={localFilters} onLocalFilter={handleLocalFilter} activeCount={activeCount}
      apiColors={apiColors}
    />
  );

  return (
    <div className="fcp-page">
      <Navbar />

      <div className={`fcp-banner${bannerReady?" ready":""}`} style={{ "--accent": activeCat.accent }}>
        <div className="fcp-banner-bg" style={{ backgroundImage:`url(${activeCat.image})` }} />
        <div className="fcp-banner-overlay" />
        <div className="fcp-banner-content">
          <nav className="fcp-breadcrumb">
            <Link to="/">{t("fcp.home")}</Link>
            <Link to="/categories" className="fcp-bc-cur"> / category /</Link>
            <span className="fcp-bc-cur">{activeCat.name}</span>
          </nav>
          <div className="fcp-banner-inner">
            <div>
              <h1 className="fcp-banner-title">{activeCat.name}</h1>
            </div>
            <div className="fcp-banner-stat">
              <span className="fcp-stat-n">{pagination.total}</span>
              <span className="fcp-stat-l">{t("fcp.products")}</span>
            </div>
          </div>
          <div className="fcp-banner-cats">
            {allCategories.map(cat => (
              <button key={cat.id??"all"} className={`fcp-banner-cat${selectedId===cat.id?" active":""}`} style={selectedId===cat.id?{ "--ac":cat.accent }:{}} onClick={() => handleCategoryChange(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fcp-layout">
        <aside className="fcp-sidebar">{SidebarNode}</aside>

        <main className="fcp-main" ref={gridRef} style={{ scrollMarginTop:88 }}>
          {activeChips.length > 0 && (
            <div className="fcp-chips-bar">
              {activeChips.map(chip => (
                <div key={chip.id} className="fcp-chip">
                  <span>{chip.label}</span>
                  <button className="fcp-chip-x" onClick={chip.onRemove}>×</button>
                </div>
              ))}
              <button className="fcp-chip-clear" onClick={handleReset}>Clear all</button>
            </div>
          )}

          <div className="fcp-toolbar">
            <div className="fcp-toolbar-left">
              <button className="fcp-mob-filter-btn" onClick={() => setMobileOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2.5h12M3 7h8M5 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {t("fcp.filter_title")}{hasActive?` (${activeCount})`:""}
              </button>
              <p className="fcp-result-count"><strong>{filteredProducts.length}</strong> {t("fcp.products")}</p>
            </div>
            <div className="fcp-toolbar-right">
              <div className="fcp-view-btns">
                {[3,4].map(n => (
                  <button key={n} className={`fcp-view-btn${gridCols===n?" active":""}`} onClick={() => setGridCols(n)} title={`${n} columns`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      {n===3 && <><rect x="0" y="0" width="4" height="4" rx="1"/><rect x="5" y="0" width="4" height="4" rx="1"/><rect x="10" y="0" width="4" height="4" rx="1"/><rect x="0" y="5" width="4" height="4" rx="1"/><rect x="5" y="5" width="4" height="4" rx="1"/><rect x="10" y="5" width="4" height="4" rx="1"/><rect x="0" y="10" width="4" height="4" rx="1"/><rect x="5" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/></>}
                      {n===4 && <><rect x="0" y="0" width="3" height="3" rx="1"/><rect x="3.7" y="0" width="3" height="3" rx="1"/><rect x="7.3" y="0" width="3" height="3" rx="1"/><rect x="11" y="0" width="3" height="3" rx="1"/><rect x="0" y="5.5" width="3" height="3" rx="1"/><rect x="3.7" y="5.5" width="3" height="3" rx="1"/><rect x="7.3" y="5.5" width="3" height="3" rx="1"/><rect x="11" y="5.5" width="3" height="3" rx="1"/><rect x="0" y="11" width="3" height="3" rx="1"/><rect x="3.7" y="11" width="3" height="3" rx="1"/><rect x="7.3" y="11" width="3" height="3" rx="1"/><rect x="11" y="11" width="3" height="3" rx="1"/></>}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="fcp-sk-grid" style={{ gridTemplateColumns:`repeat(${gridCols},1fr)` }}>
              {Array.from({ length: PAGE_SIZE }).map((_,i) => (
                <div key={i} className="fcp-sk-card"><div className="fcp-sk-img" /><div className="fcp-sk-body"><div className="fcp-sk-line" /><div className="fcp-sk-line short" /><div className="fcp-sk-line xs" /></div></div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length===0 && (
            <div className="fcp-empty">
              <span className="fcp-empty-icon">🛋</span>
              <h3 className="fcp-empty-title">{t("category_page.no_products")}</h3>
              <p className="fcp-empty-sub">{t("category_page.no_products_hint")}</p>
              {hasActive && <button className="fcp-empty-reset" onClick={handleReset}>{t("category_page.reset_filters")}</button>}
            </div>
          )}

          {!loading && filteredProducts.length>0 && (
            <div className={`fcp-grid cols-${gridCols}`}>
              {filteredProducts.map((p,i) => <ProductCard key={p.id} product={p} idx={i} addingId={addingId} onAddToCart={handleAddToCart} wishlist={wishlist} dispatch={dispatch} t={t} />)}
            </div>
          )}

          {!loading && filteredProducts.length>0 && <Pagination current={currentPage} total={pagination.totalPages} onChange={handlePageChange} />}
        </main>
      </div>

      {mobileOpen && (
        <>
          <div className="fcp-overlay" onClick={() => setMobileOpen(false)} />
          <div className="fcp-drawer">
            <div className="fcp-drawer-header">
              <span className="fcp-drawer-title">{t("fcp.filter_title")}</span>
              <button className="fcp-drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <div className="fcp-drawer-body">{SidebarNode}</div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
