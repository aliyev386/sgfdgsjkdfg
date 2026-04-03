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
import "../../assets/pagesCss/FurnitureCategory.css";

const PAGE_SIZE = 12;
const PRICE_MAX = 15000;

const ACCENT_COLORS = [
  "#6d9b70","#c9a84c","#a07b5a","#c0604a","#5a82b0","#9070b8","#5a7a9e","#d4825a","#7a9ea0"
];
const BANNER_IMGS = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=80",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1400&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80",
  "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=1400&q=80",
];

const BADGE_COLORS = {
  best_seller: "#c0604a",
  new_in:      "#6d9b70",
  sale:        "#c9a84c",
  new:         "#6d9b70",
  hot:         "#c0604a",
  featured:    "#5a82b0",
};

const SORT_OPTIONS = [
  { value: "featured",   labelKey: "fcp.sort_featured"   },
  { value: "price_asc",  labelKey: "fcp.sort_price_asc"  },
  { value: "price_desc", labelKey: "fcp.sort_price_desc" },
  { value: "newest",     labelKey: "fcp.sort_newest"      },
];

const fmt = n => `$${Number(n).toLocaleString()}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ─── PRODUCT CARD ──────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product, idx, addingId, onAddToCart, wishlist, dispatch, t }) {
  const navigate  = useNavigate();
  const wished    = wishlist?.some(w => w.id === product.id);
  const badgeKey  = product.badge?.toLowerCase().replace(/\s+/, "_");
  const badgeBg   = BADGE_COLORS[badgeKey] || "#6d9b70";

  return (
    <article
      className="fcp-card"
      style={{ animationDelay: `${(idx % PAGE_SIZE) * 40}ms` }}
      onClick={() => navigate(`/details/${product.id}`)}
    >
      <div className="fcp-card-img-wrap">
        <img
          className="fcp-card-img"
          src={product.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"}
          alt={product.name}
          loading="lazy"
        />
        {badgeKey && (
          <span className="fcp-card-badge" style={{ background: badgeBg }}>
            {product.badge}
          </span>
        )}
        <div className="fcp-card-actions">
          <button
            className="fcp-card-view"
            onClick={e => { e.stopPropagation(); navigate(`/details/${product.id}`); }}
          >
            {t("fcp.view_details")}
          </button>
          <button
            className="fcp-card-wish"
            onClick={e => {
              e.stopPropagation();
              dispatch(toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image }));
            }}
          >
            {wished ? <span style={{ color: "#e53e3e" }}>♥</span> : "♡"}
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
          <button
            className={`fcp-card-add${addingId === product.id ? " adding" : ""}`}
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          >
            {addingId === product.id ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
});

// ─── ACCORDION SECTION ─────────────────────────────────────────────────────────
function Section({ label, open, onToggle, children }) {
  return (
    <div className="fcp-section">
      <button className="fcp-section-btn" onClick={onToggle}>
        <span>{label}</span>
        <span className={`fcp-section-arrow${open ? " open" : ""}`}>›</span>
      </button>
      <div className={`fcp-section-body${open ? " open" : ""}`}>
        <div className="fcp-section-content">{children}</div>
      </div>
    </div>
  );
}

// ─── DUAL PRICE SLIDER ──────────────────────────────────────────────────────────
function PriceSlider({ min, max, pMin = 0, pMax = PRICE_MAX, onChange }) {
  const pct   = v => ((v - pMin) / (pMax - pMin)) * 100;
  const lPct  = pct(min);
  const rPct  = pct(max);

  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  useEffect(() => { setLocalMin(min); }, [min]);
  useEffect(() => { setLocalMax(max); }, [max]);

  const commit = () => onChange(localMin, localMax);

  return (
    <>
      <div className="fcp-price-vals">
        <span>{fmt(localMin)}</span>
        <span>{fmt(localMax)}</span>
      </div>
      <div className="fcp-track">
        <div className="fcp-track-bg" />
        <div className="fcp-track-fill" style={{ left: `${lPct}%`, right: `${100 - rPct}%` }} />
        <input
          type="range" className="fcp-range fcp-range-min"
          min={pMin} max={pMax} step={50} value={localMin}
          onChange={e => setLocalMin(clamp(+e.target.value, pMin, localMax - 50))}
          onMouseUp={commit} onTouchEnd={commit}
        />
        <input
          type="range" className="fcp-range fcp-range-max"
          min={pMin} max={pMax} step={50} value={localMax}
          onChange={e => setLocalMax(clamp(+e.target.value, localMin + 50, pMax))}
          onMouseUp={commit} onTouchEnd={commit}
        />
      </div>
      <div className="fcp-price-inputs">
        <input
          className="fcp-price-input" type="number"
          value={localMin} min={pMin} max={localMax - 50}
          onChange={e => setLocalMin(clamp(+e.target.value, pMin, localMax - 50))}
          onBlur={commit}
        />
        <span className="fcp-price-dash">—</span>
        <input
          className="fcp-price-input" type="number"
          value={localMax} min={localMin + 50} max={pMax}
          onChange={e => setLocalMax(clamp(+e.target.value, localMin + 50, pMax))}
          onBlur={commit}
        />
      </div>
    </>
  );
}

// ─── FILTER SIDEBAR INNER ──────────────────────────────────────────────────────
function SidebarContent({ categories, selectedCatId, onCategoryChange, filters, onFilterChange, onPriceChange, onReset, hasActive, t, currentSort, onSortChange }) {
  const [open, setOpen] = useState({ category: true, price: true, sort: true });
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }));

  const priceMin = filters.priceMin !== "" ? Number(filters.priceMin) : 0;
  const priceMax = filters.priceMax !== "" ? Number(filters.priceMax) : PRICE_MAX;

  return (
    <div className="fcp-sidebar-inner">
      <div className="fcp-sidebar-header">
        <span className="fcp-sidebar-title">{t("fcp.filter_title")}</span>
        {hasActive && (
          <button className="fcp-sidebar-clear" onClick={onReset}>
            {t("fcp.clear_all")}
          </button>
        )}
      </div>

      {/* CATEGORY */}
      <Section label={t("fcp.categories")} open={open.category} onToggle={() => tog("category")}>
        <div className="fcp-cat-list">
          {categories.map(cat => (
            <button
              key={cat.id ?? "all"}
              className={`fcp-cat-btn${selectedCatId === cat.id ? " active" : ""}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span className="fcp-cat-dot" style={{ background: cat.accent }} />
              <span className="fcp-cat-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* PRICE */}
      <Section label={t("fcp.price_range")} open={open.price} onToggle={() => tog("price")}>
        <PriceSlider
          min={priceMin}
          max={priceMax}
          pMin={0}
          pMax={PRICE_MAX}
          onChange={onPriceChange}
        />
      </Section>

      {/* SORT */}
      <Section label={t("fcp.sort_label")} open={open.sort} onToggle={() => tog("sort")}>
        <div className="fcp-sort-group">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`fcp-sort-opt${currentSort === opt.value ? " active" : ""}`}
              onClick={() => onSortChange(opt.value)}
            >
              <span className="fcp-sort-radio" />
              <span>{t(opt.labelKey)}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── PAGINATION ────────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const range = [];
  const delta = 2;
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) range.push(i);
  return (
    <div className="fcp-pagination">
      <button className="fcp-pg-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>‹</button>
      {range[0] > 1 && <>
        <button className="fcp-pg-num" onClick={() => onChange(1)}>1</button>
        {range[0] > 2 && <span style={{ color: "#aaa", padding: "0 4px" }}>…</span>}
      </>}
      {range.map(p => (
        <button key={p} className={`fcp-pg-num${p === current ? " active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      {range[range.length - 1] < total && <>
        {range[range.length - 1] < total - 1 && <span style={{ color: "#aaa", padding: "0 4px" }}>…</span>}
        <button className="fcp-pg-num" onClick={() => onChange(total)}>{total}</button>
      </>}
      <button className="fcp-pg-btn" disabled={current === total} onClick={() => onChange(current + 1)}>›</button>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function FurnitureCategoryPage() {
  const { id: routeId }                 = useParams();
  const { t }                           = useTranslation();
  const navigate                        = useNavigate();
  const dispatch                        = useDispatch();
  const wishlist                        = useSelector(s => s.wishlist.items);
  const lang                            = useSelector(selectLang);
  const [searchParams, setSearchParams] = useSearchParams();

  // ── state ──────────────────────────────────────────────────────────────────
  const [apiCats,     setApiCats]     = useState([]);
  const [selectedId,  setSelectedId]  = useState(routeId ? Number(routeId) : null);
  const [products,    setProducts]    = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, totalPages: 1 });
  const [loading,     setLoading]     = useState(true);
  const [addingId,    setAddingId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [gridCols,    setGridCols]    = useState(3);
  const [bannerReady, setBannerReady] = useState(false);

  const [filters, setFilters] = useState({
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
  });

  const currentPage = Number(searchParams.get("page") || 1);
  const currentSort = searchParams.get("sort") || "featured";

  const gridRef    = useRef(null);
  const toastTimer = useRef(null);

  // ── load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    categoryApi.getAll().then(res => {
      const arr = Array.isArray(res) ? res : [];
      setApiCats(arr.map((c, i) => ({
        id:     c.id,
        name:   c.name || `Category ${c.id}`,
        image:  c.imageUrl || BANNER_IMGS[i % BANNER_IMGS.length],
        accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
      })));
    }).catch(() => {});
  }, [lang]);

  const allCategories = useMemo(() => [
    { id: null, name: t("fcp.cat_all"), image: BANNER_IMGS[0], accent: "#6d9b70" },
    ...apiCats,
  ], [apiCats, t]);

  const activeCat = useMemo(
    () => allCategories.find(c => c.id === selectedId) ?? allCategories[0],
    [selectedId, allCategories]
  );

  // ── banner entrance ────────────────────────────────────────────────────────
  useEffect(() => {
    setBannerReady(false);
    const tid = setTimeout(() => setBannerReady(true), 60);
    return () => clearTimeout(tid);
  }, [selectedId]);

  // ── fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setLoading(true);

    const pMin = searchParams.get("priceMin");
    const pMax = searchParams.get("priceMax");

    // Build request depending on active filters
    let request;

    if (pMin || pMax) {
      // Use price-range endpoint when price filter is set
      const min = pMin ? Number(pMin) : 0;
      const max = pMax ? Number(pMax) : PRICE_MAX;
      request = productApi.getByPriceRange(min, max, { page: currentPage, pageSize: PAGE_SIZE });
    } else if (selectedId) {
      // Category endpoint
      request = productApi.getByCategory(selectedId, { page: currentPage, pageSize: PAGE_SIZE });
    } else {
      // All products
      request = productApi.getAll({ page: currentPage, pageSize: PAGE_SIZE });
    }

    Promise.resolve(request)
      .then(res => {
        const items = res?.data ?? (Array.isArray(res) ? res : []);
        const pag   = res?.pagination ?? {};

        const mapped = items.map(p => ({
          id:           p.id,
          name:         p.name,
          categoryName: p.categoryName || null,
          price:        p.discountPrice ?? p.price,
          oldPrice:     p.discountPrice ? p.price : null,
          badge:        p.label || null,
          image:        p.images?.[0]?.imageUrl || null,
        }));

        // Client-side sort (backend doesn't expose sort param in these endpoints)
        const sorted = [...mapped].sort((a, b) => {
          if (currentSort === "price_asc")  return a.price - b.price;
          if (currentSort === "price_desc") return b.price - a.price;
          return 0;
        });

        setProducts(sorted);
        setPagination({
          total:      pag.totalCount ?? sorted.length,
totalPages: (pag?.totalPages ?? Math.ceil((pag?.totalCount ?? sorted.length) / PAGE_SIZE)) || 1        });
      })
      .catch(() => { setProducts([]); setPagination({ total: 0, totalPages: 1 }); })
      .finally(() => setLoading(false));
  }, [currentPage, currentSort, selectedId, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // ── filter / sort handlers ─────────────────────────────────────────────────
  const updateParams = useCallback((updates) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", 1);
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== null && v !== "" && v !== undefined) p.set(k, v);
      else p.delete(k);
    });
    setSearchParams(p, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePriceChange = useCallback((min, max) => {
    const updates = {};
    if (min > 0)       updates.priceMin = min;
    else               updates.priceMin = null;
    if (max < PRICE_MAX) updates.priceMax = max;
    else                 updates.priceMax = null;
    setFilters({ priceMin: min > 0 ? min : "", priceMax: max < PRICE_MAX ? max : "" });
    updateParams(updates);
  }, [updateParams]);

  const handleSortChange = useCallback((val) => {
    updateParams({ sort: val });
  }, [updateParams]);

  const handleCategoryChange = useCallback((catId) => {
    setSelectedId(catId);
    setFilters({ priceMin: "", priceMax: "" });
    // Reset all params, keep sort
    const p = new URLSearchParams();
    if (currentSort !== "featured") p.set("sort", currentSort);
    setSearchParams(p);
    if (catId) navigate(`/category/${catId}`, { replace: true });
    else       navigate("/category", { replace: true });
    setMobileOpen(false);
  }, [navigate, currentSort, setSearchParams]);

  const handleReset = useCallback(() => {
    setFilters({ priceMin: "", priceMax: "" });
    const p = new URLSearchParams();
    if (currentSort !== "featured") p.set("sort", currentSort);
    setSearchParams(p);
    setMobileOpen(false);
  }, [currentSort, setSearchParams]);

  const handlePageChange = useCallback(pg => {
    updateParams({ page: pg });
    requestAnimationFrame(() =>
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }, [updateParams]);

  // ── active chips ───────────────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips = [];
    const pMin = searchParams.get("priceMin");
    const pMax = searchParams.get("priceMax");
    if (pMin || pMax)
      chips.push({
        id: "price",
        label: `${fmt(pMin || 0)} – ${pMax ? fmt(pMax) : fmt(PRICE_MAX)}`,
        onRemove: () => handlePriceChange(0, PRICE_MAX),
      });
    return chips;
  }, [searchParams, handlePriceChange]);

  const hasActive = activeChips.length > 0;

  // ── add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async product => {
    if (addingId === product.id) return;
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem({ productId: product.id, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      clearTimeout(toastTimer.current);
      setToast(product.name);
      toastTimer.current = setTimeout(() => setToast(null), 2800);
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId, dispatch]);

  // ── sidebar node ───────────────────────────────────────────────────────────
  const SidebarNode = (
    <SidebarContent
      categories={allCategories}
      selectedCatId={selectedId}
      onCategoryChange={handleCategoryChange}
      filters={filters}
      onFilterChange={() => {}}
      onPriceChange={handlePriceChange}
      onReset={handleReset}
      hasActive={hasActive}
      t={t}
      currentSort={currentSort}
      onSortChange={handleSortChange}
    />
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fcp-page">
      <Navbar />

      {/* ── BANNER ── */}
      <div
        className={`fcp-banner${bannerReady ? " ready" : ""}`}
        style={{ "--accent": activeCat.accent }}
      >
        <div className="fcp-banner-bg" style={{ backgroundImage: `url(${activeCat.image})` }} />
        <div className="fcp-banner-overlay" />
        <div className="fcp-banner-content">
          <nav className="fcp-breadcrumb">
            <Link to="/">{t("fcp.home")}</Link>
            <span className="fcp-bc-sep">/</span>
            <span className="fcp-bc-cur">{activeCat.name}</span>
          </nav>

          <div className="fcp-banner-inner">
            <div>
              <p className="fcp-banner-eyebrow">{t("fcp.collection")}</p>
              <h1 className="fcp-banner-title">{activeCat.name}</h1>
              <p className="fcp-banner-sub">{t("fcp.banner_sub")}</p>
            </div>
            <div className="fcp-banner-stat">
              <span className="fcp-stat-n">{pagination.total}</span>
              <span className="fcp-stat-l">{t("fcp.products")}</span>
            </div>
          </div>

          <div className="fcp-banner-cats">
            {allCategories.map(cat => (
              <button
                key={cat.id ?? "all"}
                className={`fcp-banner-cat${selectedId === cat.id ? " active" : ""}`}
                style={selectedId === cat.id ? { "--ac": cat.accent } : {}}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="fcp-layout">
        {/* Sidebar desktop */}
        <aside className="fcp-sidebar">
          {SidebarNode}
        </aside>

        {/* Main */}
        <main className="fcp-main" ref={gridRef} style={{ scrollMarginTop: 88 }}>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="fcp-chips-bar">
              {activeChips.map(chip => (
                <div key={chip.id} className="fcp-chip">
                  <span>{chip.label}</span>
                  <button className="fcp-chip-x" onClick={chip.onRemove} title="Remove">×</button>
                </div>
              ))}
              <button className="fcp-chip-clear" onClick={handleReset}>
                {t("fcp.clear_all")}
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="fcp-toolbar">
            <div className="fcp-toolbar-left">
              <button className="fcp-mob-filter-btn" onClick={() => setMobileOpen(true)}>
                <span className="fcp-filter-icon">⊞</span>
                {t("fcp.filter_title")}
                {hasActive ? ` (${activeChips.length})` : ""}
              </button>
              <p className="fcp-result-count">
                <strong>{pagination.total}</strong> {t("fcp.products")}
              </p>
            </div>
            <div className="fcp-toolbar-right">
              <div className="fcp-view-btns">
                <button
                  className={`fcp-view-btn${gridCols === 3 ? " active" : ""}`}
                  onClick={() => setGridCols(3)}
                  title="3 columns"
                >⊞</button>
                <button
                  className={`fcp-view-btn${gridCols === 4 ? " active" : ""}`}
                  onClick={() => setGridCols(4)}
                  title="4 columns"
                >⊟</button>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          {loading && (
            <div className="fcp-sk-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="fcp-sk-card">
                  <div className="fcp-sk-img" />
                  <div className="fcp-sk-body">
                    <div className="fcp-sk-line" />
                    <div className="fcp-sk-line short" />
                    <div className="fcp-sk-line xs" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="fcp-empty">
              <span className="fcp-empty-icon">🛋</span>
              <h3 className="fcp-empty-title">{t("category_page.no_products")}</h3>
              <p className="fcp-empty-sub">{t("category_page.no_products_hint")}</p>
              {hasActive && (
                <button className="fcp-empty-reset" onClick={handleReset}>
                  {t("category_page.reset_filters")}
                </button>
              )}
            </div>
          )}

          {/* Product grid */}
          {!loading && products.length > 0 && (
            <div className={`fcp-grid cols-${gridCols}`}>
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  idx={i}
                  addingId={addingId}
                  onAddToCart={handleAddToCart}
                  wishlist={wishlist}
                  dispatch={dispatch}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <Pagination
              current={currentPage}
              total={pagination.totalPages}
              onChange={handlePageChange}
            />
          )}
        </main>
      </div>

      {/* Mobile drawer */}
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

      {/* Toast */}
      {toast && (
        <div className="fcp-toast">
          <span className="fcp-toast-check">✓</span>
          <span>
            <strong>{toast}</strong> {t("fcp.added_to_cart")}
          </span>
        </div>
      )}

      <Footer />
    </div>
  );
}