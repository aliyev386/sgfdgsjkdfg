// src/pages/public/CampaignsPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { selectIsAuth } from "../../store/slices/authSlice";
import { setCart } from "../../store/slices/cartSlice";
import campaignApi from "../../api/campaignApi";
import productApi from "../../api/productApi";
import { useAuthModal } from "../../hooks/useAuthModal";
import collectionApi from "../../api/collectionApi";
import categoryApi from "../../api/categoryApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const PAGE_SIZE = 12;
const COLL_PAGE_SIZE = 9;

const fmt = (n) =>
  `₼${Number(n).toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── Countdown ─────────────────────────────────────────────── */
function timeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
  };
}

function Countdown({ endDate }) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(() => timeLeft(endDate));
  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(endDate)), 60000);
    return () => clearInterval(id);
  }, [endDate]);
  if (!left) return <span className="cp-expired">{t("campaigns.expired", "Bitmişdir")}</span>;
  return (
    <div className="cp-countdown">
      {left.d > 0 && (
        <>
          <span className="cp-cd-n">{left.d}</span>
          <span className="cp-cd-l">{t("campaigns.day", "gün")}</span>
          <span className="cp-cd-sep">:</span>
        </>
      )}
      <span className="cp-cd-n">{String(left.h).padStart(2, "0")}</span>
      <span className="cp-cd-l">{t("campaigns.hour", "saat")}</span>
      <span className="cp-cd-sep">:</span>
      <span className="cp-cd-n">{String(left.m).padStart(2, "0")}</span>
      <span className="cp-cd-l">{t("campaigns.min", "dəq")}</span>
    </div>
  );
}

/* ── Toast ──────────────────────────────────────────────────── */
function Toast({ msg, ok, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className={`cp-toast ${ok ? "ok" : "err"}`}>
      <span>{ok ? "✓" : "!"}</span> {msg}
    </div>
  );
}

/* ── Hero Banner ────────────────────────────────────────────── */
function HeroBanner({ campaigns }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (campaigns.length < 2) return;
    timerRef.current = setInterval(() => setActive(a => (a + 1) % campaigns.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [campaigns.length]);

  if (!campaigns.length) return null;
  const camp = campaigns[active];

  return (
    <div className="cp-hero">
      {campaigns.map((c, i) => (
        <div
          key={c.id}
          className={`cp-hero-slide ${i === active ? "visible" : ""}`}
          style={{ backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : "none" }}
        >
          <div className="cp-hero-ov" />
        </div>
      ))}
      <div className="cp-hero-ct">
        <div className="cp-hero-eyebrow">
          <span className="cp-hero-line" />
          {t("campaigns.special_offer", "XÜSUSİ TƏKLİF")}
        </div>
        <h1 className="cp-hero-title">{camp.title}</h1>
        {camp.description && <p className="cp-hero-sub">{camp.description}</p>}
        <div className="cp-hero-meta">
          {camp.discountPercent && (
            <div className="cp-hero-discount">
              <span className="cp-hero-pct">−{camp.discountPercent}%</span>
              <span className="cp-hero-pct-lbl">{t("campaigns.discount", "endirim")}</span>
            </div>
          )}
          {camp.endDate && (
            <div className="cp-hero-timer">
              <span className="cp-hero-timer-lbl">{t("campaigns.until", "Bitmə vaxtı")}</span>
              <Countdown endDate={camp.endDate} />
            </div>
          )}
        </div>
        <div className="cp-hero-btns">
          <button
            className="cp-btn-dark"
            onClick={() => document.getElementById("camp-products")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("campaigns.view_products", "Məhsullara bax")} <span>↓</span>
          </button>
          <button
            className="cp-btn-ghost"
            onClick={() => document.getElementById("camp-collections")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("footer.collections", "Kolleksiyalar")}
          </button>
        </div>
      </div>
      {campaigns.length > 1 && (
        <div className="cp-hero-dots">
          {campaigns.map((_, i) => (
            <button
              key={i}
              className={`cp-hero-dot ${i === active ? "on" : ""}`}
              onClick={() => { clearInterval(timerRef.current); setActive(i); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Product Card ───────────────────────────────────────────── */
function ProductCard({ product, onAddCart, adding, inCart }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const price = product.discountPrice ?? product.price;
  const oldPrice = product.discountPrice ? product.price : null;
  const img =
    product.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";
  const pct = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const isInCart = inCart(product.id);

  return (
    <div className="cp-prod-card" onClick={() => navigate(`/details/${product.id}`)}>
      <div className="cp-prod-img-wrap">
        <img src={img} alt={product.name} className="cp-prod-img" loading="lazy" />
        {pct && <span className="cp-prod-badge">−{pct}%</span>}
        {product.label === "new_in" && !pct && (
          <span className="cp-prod-badge new">{t("common.new_in", "YENİ")}</span>
        )}
        <div className="cp-prod-hover">
          <button
            className={`cp-prod-hover-btn${isInCart ? " in-cart" : ""}`}
            onClick={e => { e.stopPropagation(); if (!isInCart) onAddCart(product.id); }}
            disabled={adding === product.id || product.stock === 0 || isInCart}
          >
            {adding === product.id
              ? "✓ " + t("common.add_to_cart", "Əlavə edildi")
              : isInCart
              ? t("shop.in_cart", "Səbətdə")
              : product.stock === 0
              ? t("common.out_of_stock", "Stokda yoxdur")
              : "+ " + t("common.add_to_cart", "Səbətə")}
          </button>
        </div>
      </div>
      <div className="cp-prod-body">
        <p className="cp-prod-cat">{product.categoryName || ""}</p>
        <h3 className="cp-prod-name">{product.name}</h3>
        <div className="cp-prod-prices">
          <span className="cp-prod-price">{fmt(price)}</span>
          {oldPrice && <span className="cp-prod-old">{fmt(oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Collection Card ────────────────────────────────────────── */
function CollectionCard({ col }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const img =
    col.imageUrl ||
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80";
  return (
    <div className="cp-coll-card" onClick={() => navigate(`/collection-detail/${col.id}`)}>
      <div className="cp-coll-img-wrap">
        <img src={img} alt={col.name} className="cp-coll-img" loading="lazy" />
        <div className="cp-coll-ov" />
        <div className="cp-coll-inf">
          <h3 className="cp-coll-name">{col.name}</h3>
          {col.totalPrice && <p className="cp-coll-price">{fmt(col.totalPrice)}-dən</p>}
          <span className="cp-coll-cta">{t("collections.explore", "Kolleksiyaya bax")} →</span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ count = 4, type = "prod" }) {
  return (
    <div className={`cp-sk-grid ${type}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cp-sk-card" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = current - delta;
  const right = current + delta;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i <= right)) {
      pages.push(i);
    }
  }

  const withEllipsis = [];
  let prev = null;
  for (const page of pages) {
    if (prev && page - prev > 1) withEllipsis.push("...");
    withEllipsis.push(page);
    prev = page;
  }

  return (
    <div className="cp-pagination">
      <button
        className="cp-pg-btn arrow"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ←
      </button>
      {withEllipsis.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="cp-pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`cp-pg-btn${p === current ? " on" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="cp-pg-btn arrow"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        →
      </button>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function CampaignsPage() {
  const { t } = useTranslation();
  const lang = useSelector(selectLang);
  const isAuth = useSelector(selectIsAuth);
  const cartItems = useSelector(s => s.cart.items);
  const inCart = (id) => cartItems.some(i => i.productId === id);
  const dispatch = useDispatch();
  const { openAuthModal } = useAuthModal();

  const [campaigns, setCampaigns]         = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null); // selected campaign for products
  const [products, setProducts]           = useState([]);
  const [prodTotal, setProdTotal]         = useState(0);
  const [collections, setCollections]     = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [prodLoading, setProdLoading]     = useState(false);
  const [collLoading, setCollLoading]     = useState(true);
  const [adding, setAdding]               = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeCat, setActiveCat]         = useState("all");
  const [page, setPage]                   = useState(1);
  const [collTab, setCollTab]             = useState("all");
  const [collPage, setCollPage]           = useState(1);
  const [collCategories, setCollCategories] = useState([]);
  const [activeCollCat, setActiveCollCat]   = useState("all");

  // Load campaigns and supporting data once
  useEffect(() => {
    window.scrollTo({ top: 0 });

    campaignApi.getActive()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setCampaigns(arr);
        if (arr.length > 0) setActiveCampaign(arr[0]);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));

    collectionApi.getAll()
      .then(res => setCollections(Array.isArray(res) ? res : []))
      .catch(() => setCollections([]))
      .finally(() => setCollLoading(false));

    categoryApi.getAll()
      .then(res => setCategories(Array.isArray(res) ? res : []))
      .catch(() => setCategories([]));

    collectionApi.getCategories()
      .then(res => setCollCategories(Array.isArray(res) ? res : []))
      .catch(() => setCollCategories([]));
  }, [lang]);

  // Load products for active campaign — paginated from backend by scope
  useEffect(() => {
    if (!activeCampaign) return;
    setProdLoading(true);
    campaignApi.getProducts(activeCampaign.id, { page, pageSize: PAGE_SIZE })
      .then(res => {
        const arr = res?.data || res?.items || (Array.isArray(res) ? res : []);
        setProducts(Array.isArray(arr) ? arr : []);
        setProdTotal(res?.pagination?.totalCount ?? res?.total ?? (Array.isArray(arr) ? arr.length : 0));
      })
      .catch(() => { setProducts([]); setProdTotal(0); })
      .finally(() => setProdLoading(false));
  }, [activeCampaign, page, lang]);

  // Reset page when campaign or category filter changes
  useEffect(() => { setPage(1); }, [activeCampaign, activeCat]);
  // Reset coll page when tab or category changes
  useEffect(() => { setCollPage(1); }, [collTab, activeCollCat]);

  const handleAddCart = useCallback(async (productId) => {
    if (!isAuth) { openAuthModal("login"); return; }
    if (inCart(productId)) return;
    setAdding(productId);
    try {
      const cart = await cartApi.addItem({ productId, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      setToast({ msg: t("cart_popup.added", "Səbətə əlavə edildi"), ok: true });
    } catch {
      setToast({ msg: t("common.error", "Xəta baş verdi"), ok: false });
    } finally {
      setTimeout(() => setAdding(null), 1200);
    }
  }, [isAuth, openAuthModal, dispatch, t]);

  // Client-side category filter (only when scope=All, otherwise backend already scoped)
  const filtered = activeCampaign?.scopeType === 0
    ? products.filter(p =>
        activeCat === "all" ? true :
        String(p.furnitureCategoryId) === String(activeCat) ||
        String(p.categoryId) === String(activeCat)
      )
    : products; // already scoped by backend

  const totalPages = Math.ceil((activeCampaign?.scopeType === 0 ? filtered.length : prodTotal) / PAGE_SIZE);
  const paginated  = activeCampaign?.scopeType === 0
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered; // already paginated from server

  const saleCount       = products.filter(p => p.discountPrice).length;

  const handlePageChange = (p) => {
    setPage(p);
    document.getElementById("camp-products")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCollPageChange = (p) => {
    setCollPage(p);
    document.getElementById("camp-collections")?.scrollIntoView({ behavior: "smooth" });
  };

  // Collection filtering
  const filteredCollections = collections.filter(c => {
    const tabMatch =
      collTab === "all"        ? true :
      collTab === "sale"       ? !!c.discountPrice :
      collTab === "new"        ? c.isNew === true || c.label === "new_in" :
      collTab === "bestseller" ? c.isBestSeller === true || c.label === "best_seller" :
      true;
    const catMatch =
      activeCollCat === "all" ? true :
      String(c.collectionCategoryId) === String(activeCollCat);
    return tabMatch && catMatch;
  });

  const collTotalPages      = Math.ceil(filteredCollections.length / COLL_PAGE_SIZE);
  const paginatedCollections = filteredCollections.slice((collPage - 1) * COLL_PAGE_SIZE, collPage * COLL_PAGE_SIZE);
  const collSaleCount       = collections.filter(c => c.discountPrice).length;
  const collNewCount        = collections.filter(c => c.isNew || c.label === "new_in").length;
  const collBestCount       = collections.filter(c => c.isBestSeller || c.label === "best_seller").length;

  const collTabs = [
    { key: "all",        label: t("featured_products.tabs.all", "Hamısı"),  count: collections.length },
    { key: "sale",       label: t("common.sale", "Endirimdə"),              count: collSaleCount },
    { key: "new",        label: t("common.new_in", "Yeni gələn"),           count: collNewCount },
    { key: "bestseller", label: t("common.best_seller", "Ən çox satan"),    count: collBestCount },
  ];

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      {/* Hero */}
      {!loading && <HeroBanner campaigns={campaigns} />}
      {loading  && <div className="cp-hero-sk" />}

      {/* Stats bar */}
      <div className="cp-stats-bar">
        <div className="cp-stats-inner">
          <div className="cp-stat">
            <span className="cp-stat-n">{prodTotal || products.length}</span>
            <span className="cp-stat-l">{t("shop.sale_products", "Kampaniya məhsulu")}</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">{collections.length}</span>
            <span className="cp-stat-l">{t("footer.collections", "Kolleksiya")}</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">{campaigns.length}</span>
            <span className="cp-stat-l">{t("shop.active_campaigns", "Aktiv kampaniya")}</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">₼0</span>
            <span className="cp-stat-l">{t("shop.free_delivery", "Çatdırılma (₼500+)")}</span>
          </div>
        </div>
      </div>

      {/* Products section */}
      <section id="camp-products" className="cp-section">
        <div className="cp-section-inner">

          <div className="cp-section-head">
            <div>
              <div className="cp-eyebrow">
                <span />{t("shop.sale_eyebrow", "KAMPANİYA MƏHSULLARİ")}
              </div>
              <h2 className="cp-h2">
                {activeCampaign?.title || t("shop.best_picks", "Kampaniya")}{" "}
                <em>{activeCampaign?.discountPercent ? `−${activeCampaign.discountPercent}%` : t("shop.best_picks_em", "Seçimlər")}</em>
              </h2>
            </div>
          </div>

          {/* Campaign selector tabs — if multiple campaigns */}
          {campaigns.length > 1 && (
            <div className="cp-tabs">
              {campaigns.map(camp => (
                <button
                  key={camp.id}
                  className={`cp-tab ${activeCampaign?.id === camp.id ? "on" : ""}`}
                  onClick={() => { setActiveCampaign(camp); setPage(1); setActiveCat("all"); }}
                >
                  {camp.title}
                  {camp.discountPercent && (
                    <span className="cp-tab-count">−{camp.discountPercent}%</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Category pill buttons — only shown when scope is All */}
          {(activeCampaign?.scopeType ?? 0) === 0 && categories.length > 0 && (
            <div className="cp-cat-filters">
              <button
                className={`cp-cat-btn ${activeCat === "all" ? "on" : ""}`}
                onClick={() => setActiveCat("all")}
              >
                {t("featured_products.tabs.all", "Hamısı")}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cp-cat-btn ${String(activeCat) === String(cat.id) ? "on" : ""}`}
                  onClick={() => setActiveCat(String(activeCat) === String(cat.id) ? "all" : cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Results info */}
          {!prodLoading && (prodTotal > 0 || filtered.length > 0) && (
            <div className="cp-results-info">
              {prodTotal || filtered.length} {t("shop.products_found", "məhsul tapıldı")}
              {totalPages > 1 && (
                <span className="cp-results-page">
                  — {t("shop.page", "Səhifə")} {page}/{totalPages}
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {prodLoading ? (
            <Skeleton count={8} type="prod" />
          ) : paginated.length > 0 ? (
            <>
              <div className="cp-prod-grid">
                {paginated.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddCart={handleAddCart}
                    adding={adding}
                    inCart={inCart}
                  />
                ))}
              </div>
              <Pagination
                current={page}
                total={totalPages}
                onChange={handlePageChange}
              />
            </>
          ) : (
            <div className="cp-empty">
              <span className="cp-empty-ic">🏷️</span>
              <p className="cp-empty-t">{t("common.no_data", "Bu kateqoriyada məhsul yoxdur")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Divider banner */}
      <div className="cp-divider-banner">
        <div className="cp-divider-ov" />
        <div className="cp-divider-ct">
          <p className="cp-divider-ey">{t("shop.campaign_label", "ENDİRİM KAMPANIYASI")}</p>
          <h2 className="cp-divider-h">
            ₼500-dən yuxarı sifarişlərə{" "}
            <em>{t("shop.free_delivery_em", "pulsuz çatdırılma")}</em>
          </h2>
          <Link to="/categories" className="cp-btn-dark">
            {t("cta_banner.btn_primary", "Alış-verişə başla")} →
          </Link>
        </div>
      </div>

      {/* Collections */}
      <section id="camp-collections" className="cp-section cream">
        <div className="cp-section-inner">
          <div className="cp-section-head">
            <div>
              <div className="cp-eyebrow">
                <span />{t("collections.eyebrow", "KOLLEKSİYALAR")}
              </div>
              <h2 className="cp-h2">
                {t("shop.full_sets", "Tam")}{" "}
                <em>{t("shop.full_sets_em", "Dəstlər")}</em>
              </h2>
            </div>
            <Link to="/collections" className="cp-view-all">
              {t("collections.view_all", "Bütün kolleksiyalar")} →
            </Link>
          </div>

          {/* Collection tabs */}
          <div className="cp-tabs">
            {collTabs.map(tab => (
              <button
                key={tab.key}
                className={`cp-tab ${collTab === tab.key ? "on" : ""}`}
                onClick={() => { setCollTab(tab.key); setActiveCollCat("all"); setCollPage(1); }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="cp-tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Collection category pills */}
          {collCategories.length > 0 && (
            <div className="cp-cat-filters">
              <button
                className={`cp-cat-btn ${activeCollCat === "all" ? "on" : ""}`}
                onClick={() => setActiveCollCat("all")}
              >
                {t("featured_products.tabs.all", "Hamısı")}
              </button>
              {collCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`cp-cat-btn ${String(activeCollCat) === String(cat.id) ? "on" : ""}`}
                  onClick={() => {
                    setActiveCollCat(String(activeCollCat) === String(cat.id) ? "all" : cat.id);
                    setCollPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Results info for collections */}
          {!collLoading && filteredCollections.length > 0 && (
            <div className="cp-results-info">
              {filteredCollections.length} {t("footer.collections", "kolleksiya")}
              {collTotalPages > 1 && (
                <span className="cp-results-page">
                  — {t("shop.page", "Səhifə")} {collPage}/{collTotalPages}
                </span>
              )}
            </div>
          )}

          {collLoading ? (
            <Skeleton count={3} type="coll" />
          ) : paginatedCollections.length > 0 ? (
            <>
              <div className="cp-coll-grid">
                {paginatedCollections.map(c => (
                  <CollectionCard key={c.id} col={c} />
                ))}
              </div>
              <Pagination
                current={collPage}
                total={collTotalPages}
                onChange={handleCollPageChange}
              />
            </>
          ) : (
            <div className="cp-empty">
              <span className="cp-empty-ic">🛋️</span>
              <p className="cp-empty-t">{t("common.no_data", "Kolleksiya tapılmadı")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cp-bottom-cta">
        <div className="cp-bottom-cta-inner">
          <div className="cp-eyebrow center">
            <span />{t("cta_banner.eyebrow", "XÜSUSİ TƏKLİF")}
          </div>
          <h2 className="cp-h2 center">
            {t("shop.discover_collections", "Kolleksiyalarımızı")}
            <br />
            <em>{t("shop.discover_em", "kəşf edin")}</em>
          </h2>
          <p className="cp-bottom-sub">{t("cta_banner.subtitle", "Zövqünüzə uyğun mebeli tapın. Pulsuz dizayn konsultasiyası üçün bizimlə əlaqə saxlayın.")}</p>
          <div className="cp-bottom-btns">
            <Link to="/categories" className="cp-btn-dark">
              {t("footer.products", "Məhsullara bax")} →
            </Link>
            <Link to="/contact" className="cp-btn-ghost">
              {t("footer.contact", "Bizimlə əlaqə")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {toast && (
        <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />
      )}
    </>
  );
}

/* ── CSS ────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

@keyframes cpFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
@keyframes cpSk     { 0%,100%{opacity:.5} 50%{opacity:1} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Shared tokens ── */
.cp-eyebrow{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:12px}
.cp-eyebrow span{display:block;width:28px;height:1px;background:#7A9E7E;flex-shrink:0}
.cp-eyebrow.center{justify-content:center}
.cp-eyebrow.center span{display:none}
.cp-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,4vw,52px);font-weight:300;line-height:1.12;color:#1C1C1C}
.cp-h2 em{font-style:italic;color:#7A9E7E}
.cp-h2.center{text-align:center}
.cp-btn-dark{display:inline-flex;align-items:center;gap:8px;padding:15px 36px;background:#1C1C1C;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;border:none;cursor:pointer;text-decoration:none;transition:all .3s}
.cp-btn-dark:hover{background:#7A9E7E;transform:translateY(-2px);box-shadow:0 12px 32px rgba(122,158,126,.28)}
.cp-btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:none;color:#1C1C1C;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;border:1.5px solid #E5DDD4;cursor:pointer;text-decoration:none;transition:all .3s}
.cp-btn-ghost:hover{border-color:#1C1C1C}
.cp-view-all{font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B;border-bottom:1px solid #E5DDD4;padding-bottom:2px;text-decoration:none;transition:all .3s;white-space:nowrap}
.cp-view-all:hover{color:#7A9E7E;border-bottom-color:#7A9E7E}

/* ── Hero ── */
.cp-hero{position:relative;height:92vh;min-height:640px;overflow:hidden;display:flex;align-items:center;background:#1C1C1C}
.cp-hero-sk{height:92vh;min-height:640px;background:linear-gradient(135deg,#EDE7DC,#D6CFC5);animation:cpSk 1.8s ease infinite}
.cp-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.2s ease}
.cp-hero-slide.visible{opacity:1}
.cp-hero-ov{position:absolute;inset:0;background:linear-gradient(105deg,rgba(28,28,28,.88) 0%,rgba(28,28,28,.5) 55%,rgba(28,28,28,.15) 100%)}
.cp-hero-ct{position:relative;z-index:2;max-width:680px;padding:0 90px;animation:cpFadeUp .9s cubic-bezier(.25,.46,.45,.94) .3s both}
.cp-hero-eyebrow{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:12px}
.cp-hero-line{display:block;width:32px;height:1px;background:#7A9E7E;flex-shrink:0}
.cp-hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,6.5vw,88px);font-weight:300;line-height:1.05;color:#fff;margin-bottom:20px}
.cp-hero-sub{font-size:16px;color:rgba(255,255,255,.65);max-width:420px;line-height:1.8;margin-bottom:36px;font-weight:300}
.cp-hero-meta{display:flex;align-items:center;gap:40px;margin-bottom:44px;flex-wrap:wrap}
.cp-hero-discount{display:flex;align-items:baseline;gap:8px}
.cp-hero-pct{font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:300;color:#C9A84C;line-height:1}
.cp-hero-pct-lbl{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5)}
.cp-hero-timer{display:flex;flex-direction:column;gap:6px}
.cp-hero-timer-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4)}
.cp-hero-btns{display:flex;gap:16px;flex-wrap:wrap}
.cp-hero-dots{position:absolute;bottom:36px;left:90px;display:flex;gap:8px;z-index:5}
.cp-hero-dot{width:28px;height:2px;background:rgba(255,255,255,.3);border:none;cursor:pointer;transition:all .3s;padding:0}
.cp-hero-dot.on{background:#fff;width:48px}

/* ── Countdown ── */
.cp-countdown{display:flex;align-items:baseline;gap:4px}
.cp-cd-n{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;line-height:1;min-width:28px;text-align:center}
.cp-cd-l{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.45);margin-right:4px}
.cp-cd-sep{font-family:'Cormorant Garamond',serif;font-size:24px;color:rgba(255,255,255,.3);margin:0 2px}
.cp-expired{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.4)}

/* ── Stats ── */
.cp-stats-bar{background:#1C1C1C;padding:40px 60px}
.cp-stats-inner{max-width:1380px;margin:0 auto;display:flex;align-items:center;justify-content:center;flex-wrap:wrap}
.cp-stat{text-align:center;padding:0 60px;flex-shrink:0}
.cp-stat-n{font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;display:block;line-height:1}
.cp-stat-l{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4);display:block;margin-top:8px}
.cp-stat-div{width:1px;height:48px;background:rgba(255,255,255,.1);flex-shrink:0}

/* ── Sections ── */
.cp-section{padding:110px 60px}
.cp-section.cream{background:#F7F3EE}
.cp-section-inner{max-width:1380px;margin:0 auto}
.cp-section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;gap:24px;flex-wrap:wrap}

/* ── Tabs ── */
.cp-tabs{display:flex;border-bottom:1px solid #E5DDD4;margin-bottom:24px;overflow-x:auto}
.cp-tab{padding:14px 28px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;white-space:nowrap;transition:all .3s;display:flex;align-items:center;gap:8px}
.cp-tab.on{color:#1C1C1C;border-bottom-color:#1C1C1C}
.cp-tab:hover:not(.on){color:#7A9E7E;border-bottom-color:#C8DBC9}
.cp-tab-count{background:#F0EDE8;color:#6B6B6B;font-size:10px;padding:2px 8px;border-radius:20px;transition:all .3s}
.cp-tab.on .cp-tab-count{background:#1C1C1C;color:#fff}

/* ── Category pills ── */
.cp-cat-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.cp-cat-btn{padding:9px 22px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;background:#fff;color:#6B6B6B;border:1.5px solid #E5DDD4;cursor:pointer;transition:all .25s;white-space:nowrap}
.cp-cat-btn:hover:not(.on){border-color:#7A9E7E;color:#7A9E7E}
.cp-cat-btn.on{background:#1C1C1C;color:#fff;border-color:#1C1C1C}

/* ── Results info ── */
.cp-results-info{font-size:12px;color:#9CA3AF;letter-spacing:.5px;margin-bottom:28px;font-family:'DM Sans',sans-serif}
.cp-results-page{margin-left:4px}

/* ── Product grid ── */
.cp-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px}
.cp-prod-card{cursor:pointer;animation:cpFadeUp .5s both}
.cp-prod-img-wrap{position:relative;height:320px;overflow:hidden;background:#EDE7DC;margin-bottom:16px}
.cp-prod-img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94)}
.cp-prod-card:hover .cp-prod-img{transform:scale(1.06)}
.cp-prod-badge{position:absolute;top:14px;left:14px;background:#C0392B;color:#fff;font-size:10px;font-weight:700;padding:5px 12px;letter-spacing:.5px}
.cp-prod-badge.new{background:#7A9E7E}
.cp-prod-hover{position:absolute;inset:0;display:flex;align-items:flex-end;padding:20px;opacity:0;transition:opacity .3s}
.cp-prod-card:hover .cp-prod-hover{opacity:1}
.cp-prod-hover-btn{width:100%;padding:13px;background:#1C1C1C;color:#fff;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:background .3s}
.cp-prod-hover-btn:hover:not(:disabled){background:#7A9E7E}
.cp-prod-hover-btn:disabled{opacity:.6;cursor:not-allowed}
.cp-prod-hover-btn.in-cart{background:#4A8A50;cursor:default}
.cp-prod-hover-btn.in-cart:hover{background:#4A8A50}
.cp-prod-body{padding:0 4px}
.cp-prod-cat{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;margin-bottom:6px}
.cp-prod-name{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:300;color:#1C1C1C;margin-bottom:10px;line-height:1.3}
.cp-prod-prices{display:flex;align-items:center;gap:10px}
.cp-prod-price{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:#1C1C1C}
.cp-prod-old{font-size:14px;color:#9CA3AF;text-decoration:line-through}

/* ── Pagination ── */
.cp-pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:64px;flex-wrap:wrap}
.cp-pg-btn{min-width:40px;height:40px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;color:#6B6B6B;background:#fff;border:1.5px solid #E5DDD4;cursor:pointer;transition:all .25s}
.cp-pg-btn:hover:not(:disabled):not(.on){border-color:#7A9E7E;color:#7A9E7E}
.cp-pg-btn.on{background:#1C1C1C;color:#fff;border-color:#1C1C1C;cursor:default}
.cp-pg-btn:disabled{opacity:.35;cursor:not-allowed}
.cp-pg-btn.arrow{font-size:16px;min-width:44px}
.cp-pg-ellipsis{font-size:14px;color:#9CA3AF;padding:0 4px;line-height:40px}

/* ── Collections ── */
.cp-coll-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cp-coll-card{cursor:pointer;animation:cpFadeUp .5s both}
.cp-coll-img-wrap{position:relative;height:400px;overflow:hidden;background:#EDE7DC}
.cp-coll-img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.25,.46,.45,.94)}
.cp-coll-card:hover .cp-coll-img{transform:scale(1.06)}
.cp-coll-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(28,28,28,.78) 0%,rgba(28,28,28,.1) 55%,transparent 100%);transition:opacity .4s}
.cp-coll-card:hover .cp-coll-ov{opacity:.9}
.cp-coll-inf{position:absolute;bottom:0;left:0;right:0;padding:28px 24px}
.cp-coll-name{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#fff;margin-bottom:6px}
.cp-coll-price{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:14px}
.cp-coll-cta{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(8px);transition:all .3s;display:inline-block}
.cp-coll-card:hover .cp-coll-cta{opacity:1;transform:translateY(0)}

/* ── Divider banner ── */
.cp-divider-banner{position:relative;height:380px;overflow:hidden;background:linear-gradient(135deg,#1C1C1C 0%,#2D3A2E 100%);display:flex;align-items:center;justify-content:center}
.cp-divider-ov{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(122,158,126,.15) 0%,transparent 70%)}
.cp-divider-ct{position:relative;z-index:1;text-align:center;padding:0 40px}
.cp-divider-ey{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#7A9E7E;margin-bottom:20px}
.cp-divider-h{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,48px);font-weight:300;color:#fff;line-height:1.2;margin-bottom:36px}
.cp-divider-h em{font-style:italic;color:#C8DBC9}

/* ── Bottom CTA ── */
.cp-bottom-cta{padding:120px 60px;background:#fff;text-align:center}
.cp-bottom-cta-inner{max-width:560px;margin:0 auto}
.cp-bottom-sub{font-size:15px;color:#6B6B6B;line-height:1.8;margin:24px 0 40px;font-weight:300}
.cp-bottom-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}

/* ── Skeleton ── */
.cp-sk-grid{display:grid;gap:28px}
.cp-sk-grid.prod{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.cp-sk-grid.coll{grid-template-columns:repeat(3,1fr)}
.cp-sk-card{background:linear-gradient(90deg,#EDE7DC 25%,#E5DDD4 50%,#EDE7DC 75%);background-size:200% 100%;animation:cpSk 1.5s ease infinite}
.cp-sk-grid.prod .cp-sk-card{height:400px}
.cp-sk-grid.coll .cp-sk-card{height:400px}

/* ── Empty ── */
.cp-empty{text-align:center;padding:80px 40px}
.cp-empty-ic{font-size:48px;display:block;margin-bottom:16px;opacity:.5}
.cp-empty-t{font-family:'Cormorant Garamond',serif;font-size:22px;color:#6B6B6B;font-weight:300}

/* ── Toast ── */
.cp-toast{position:fixed;bottom:32px;right:32px;z-index:999;display:flex;align-items:center;gap:10px;padding:14px 24px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;animation:cpFadeUp .3s ease;box-shadow:0 12px 40px rgba(28,28,28,.2)}
.cp-toast.ok{background:#1C1C1C;color:#fff}
.cp-toast.err{background:#C0392B;color:#fff}

/* ── Responsive ── */
@media(max-width:1100px){
  .cp-coll-grid{grid-template-columns:repeat(2,1fr)}
  .cp-stat{padding:0 40px}
}
@media(max-width:900px){
  .cp-section{padding:80px 32px}
  .cp-stats-bar{padding:32px}
  .cp-hero-ct{padding:0 32px}
  .cp-hero-dots{left:32px}
  .cp-bottom-cta{padding:80px 32px}
}
@media(max-width:640px){
  .cp-hero{height:80vh}
  .cp-hero-pct{font-size:40px}
  .cp-coll-grid{grid-template-columns:1fr}
  .cp-coll-img-wrap{height:280px}
  .cp-stat{padding:0 20px}
  .cp-stat-div{height:32px}
  .cp-tab{padding:12px 14px;font-size:10px}
  .cp-cat-filters{gap:8px}
  .cp-cat-btn{padding:8px 14px;font-size:10px}
  .cp-pg-btn{min-width:36px;height:36px;font-size:12px}
  .cp-hero-btns{flex-direction:column}
  .cp-bottom-btns{flex-direction:column;align-items:center}
}
`;