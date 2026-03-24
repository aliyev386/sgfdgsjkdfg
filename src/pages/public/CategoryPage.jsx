// src/pages/public/CategoriesListPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /furniture-categories
//
//  Bütün kateqoriyaları (divan, stol, çarpayı...) göstərir.
//  Hər kart /furniture-categories/:id səhifəsinə aparan link.
//
//  Real API:
//    categoryApi.getAll()  →  kateqoriyalar siyahısı
//    (filter/sort/search client-side — siyahı kiçikdir)
//
//  Özəlliklər:
//  • Otağa görə filter tabs (Hamısı / Qonaq / Yataq...)
//  • Uzun siyahılarda "Daha çox / Daha az" toggle  ← istədiyin
//  • Canlı axtarış (kateqoriya adına görə)
//  • Sort: A→Z / Z→A / Məhsul sayına görə
//  • Bütün statik mətnlər 3 dildə (t() ilə)
//  • DB-dən gələn kateqoriya adları TƏRCÜMƏ OLUNMUR
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import categoryApi from "../../api/categoryApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

// ── Neçə kart göstərilsin collapse-dan əvvəl ──────────────────
const INITIAL_VISIBLE = 8;

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes clFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes clCardIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes clShimmer { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes clTabLine { from{transform:scaleX(0)} to{transform:scaleX(1)} }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:5px }
  ::-webkit-scrollbar-track { background:#F7F3EE }
  ::-webkit-scrollbar-thumb { background:#7A9E7E; border-radius:3px }
  ::selection { background:#C8DBC9; color:#1C1C1C }

  .cl { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; }

  /* ── PAGE HEADER ── */
  .cl-header      { background:#F7F3EE; padding:100px 80px 64px; margin-top:72px; border-bottom:1px solid #EDE7DC; }
  .cl-header-inner { max-width:1400px; margin:0 auto; display:flex; align-items:flex-end; justify-content:space-between; gap:40px; flex-wrap:wrap; }
  .cl-header-left {}
  .cl-eyebrow     { font-size:11px; letter-spacing:3.5px; text-transform:uppercase; color:#7A9E7E; font-weight:500; margin-bottom:14px; display:flex; align-items:center; gap:12px; }
  .cl-eyebrow::before { content:''; display:block; width:28px; height:1px; background:#7A9E7E; flex-shrink:0; }
  .cl-title       { font-family:'Cormorant Garamond',serif; font-size:clamp(44px,6vw,80px); font-weight:300; color:#1C1C1C; line-height:1; }
  .cl-subtitle    { font-size:16px; color:#6B6B6B; margin-top:14px; font-weight:300; max-width:440px; line-height:1.7; }
  .cl-header-right { text-align:right; flex-shrink:0; }
  .cl-total-n     { font-family:'Cormorant Garamond',serif; font-size:56px; font-weight:300; color:#7A9E7E; display:block; line-height:1; }
  .cl-total-l     { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#A8A8A8; }

  /* ── TOOLBAR ── */
  .cl-toolbar     { max-width:1400px; margin:0 auto; padding:36px 80px 0; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }

  /* Search */
  .cl-search-wrap { position:relative; flex:1; min-width:200px; max-width:360px; }
  .cl-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; color:#A8A8A8; pointer-events:none; }
  .cl-search      { width:100%; padding:12px 14px 12px 40px; border:1px solid #E5DDD4; font-size:13px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#F7F3EE; outline:none; transition:border-color .3s; }
  .cl-search:focus { border-color:#7A9E7E; background:#fff; }
  .cl-search::placeholder { color:#A8A8A8; }
  .cl-search-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; color:#A8A8A8; line-height:1; padding:0; transition:color .2s; }
  .cl-search-clear:hover { color:#D4714A; }

  /* Sort */
  .cl-sort-wrap   { display:flex; align-items:center; gap:10px; }
  .cl-sort-label  { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#6B6B6B; white-space:nowrap; }
  .cl-sort-sel    { border:1px solid #E5DDD4; padding:10px 32px 10px 14px; font-size:12px; font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center; cursor:pointer; outline:none; appearance:none; transition:border-color .3s; }
  .cl-sort-sel:focus { border-color:#7A9E7E; }

  /* ── ROOM FILTER TABS ── */
  .cl-tabs-wrap   { max-width:1400px; margin:0 auto; padding:28px 80px 0; }
  .cl-tabs        { display:flex; gap:0; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid #F0EBE4; padding-bottom:0; }
  .cl-tabs::-webkit-scrollbar { display:none; }
  .cl-tab         { padding:14px 22px; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; color:#6B6B6B; font-family:'DM Sans',sans-serif; white-space:nowrap; transition:color .25s, border-color .25s; margin-bottom:-1px; flex-shrink:0; }
  .cl-tab:hover   { color:#1C1C1C; }
  .cl-tab.active  { color:#1C1C1C; border-bottom-color:#7A9E7E; font-weight:500; }

  /* Tab count badge */
  .cl-tab-cnt     { font-size:10px; color:#A8A8A8; margin-left:5px; }
  .cl-tab.active .cl-tab-cnt { color:#7A9E7E; }

  /* ── MAIN CONTENT ── */
  .cl-content     { max-width:1400px; margin:0 auto; padding:48px 80px 80px; }

  /* Result count line */
  .cl-result-bar  { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; min-height:28px; }
  .cl-result-text { font-size:13px; color:#6B6B6B; }
  .cl-result-text strong { color:#1C1C1C; font-weight:500; }
  .cl-reset-link  { font-size:12px; color:#D4714A; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; letter-spacing:.5px; transition:opacity .3s; }
  .cl-reset-link:hover { opacity:.7; }

  /* ── CATEGORY GRID ── */
  .cl-grid        { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }

  /* ── CATEGORY CARD ── */
  .cl-card        { position:relative; overflow:hidden; text-decoration:none; background:#EDE7DC; display:block; cursor:pointer; }
  .cl-card.anim   { animation:clCardIn .5s cubic-bezier(.25,.46,.45,.94) both; }
  .cl-card-iw     { position:relative; aspect-ratio:3/4; overflow:hidden; }
  .cl-card-img    { width:100%; height:100%; object-fit:cover; transition:transform .75s cubic-bezier(.25,.46,.45,.94); display:block; }
  .cl-card:hover .cl-card-img { transform:scale(1.07); }
  .cl-card-ov     { position:absolute; inset:0; background:linear-gradient(to top, rgba(28,28,28,.68) 0%, rgba(28,28,28,.05) 55%, transparent 100%); transition:opacity .4s; }
  .cl-card:hover .cl-card-ov { opacity:.9; }

  /* Card info — always visible */
  .cl-card-info   { position:absolute; bottom:0; left:0; right:0; padding:24px 20px; }
  .cl-card-room   { font-size:9px; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:6px; }
  .cl-card-name   { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:300; color:#fff; line-height:1.15; margin-bottom:6px; }
  .cl-card-cnt    { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.5); }

  /* Explore CTA — hover-da çıxır */
  .cl-card-cta    { display:inline-flex; align-items:center; gap:7px; font-size:11px; letter-spacing:1.8px; text-transform:uppercase; color:#fff; margin-top:12px; opacity:0; transform:translateY(8px); transition:opacity .3s, transform .3s; }
  .cl-card:hover .cl-card-cta { opacity:1; transform:translateY(0); }
  .cl-card-cta-arrow { transition:transform .3s; display:inline-block; }
  .cl-card:hover .cl-card-cta-arrow { transform:translateX(4px); }

  /* ── SHOW MORE / LESS ── */
  .cl-toggle-wrap { margin-top:40px; display:flex; flex-direction:column; align-items:center; gap:16px; }
  .cl-toggle-line { width:100%; height:1px; background:linear-gradient(to right, transparent, #E5DDD4, transparent); }
  .cl-toggle-btn  { display:inline-flex; align-items:center; gap:10px; padding:13px 36px; border:1px solid #E5DDD4; background:#fff; font-size:11px; letter-spacing:1.8px; text-transform:uppercase; color:#6B6B6B; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .cl-toggle-btn:hover { border-color:#7A9E7E; color:#7A9E7E; }
  .cl-toggle-icon { font-size:14px; transition:transform .35s cubic-bezier(.34,1.56,.64,1); display:inline-block; }
  .cl-toggle-btn.expanded .cl-toggle-icon { transform:rotate(180deg); }
  .cl-toggle-count { font-size:10px; color:#A8A8A8; background:#F7F3EE; padding:2px 8px; border-radius:10px; }

  /* ── SKELETON ── */
  .cl-sk-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .cl-sk-card     { background:#F7F3EE; aspect-ratio:3/4; animation:clShimmer 1.5s ease-in-out infinite; }
  .cl-sk-card:nth-child(2) { animation-delay:.15s; }
  .cl-sk-card:nth-child(3) { animation-delay:.3s; }
  .cl-sk-card:nth-child(4) { animation-delay:.45s; }

  /* ── EMPTY STATE ── */
  .cl-empty       { padding:80px 0; text-align:center; }
  .cl-empty-ic    { font-size:52px; margin-bottom:20px; opacity:.3; display:block; }
  .cl-empty-t     { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:300; color:#1C1C1C; margin-bottom:8px; }
  .cl-empty-s     { font-size:14px; color:#6B6B6B; margin-bottom:28px; }
  .cl-empty-reset { display:inline-flex; align-items:center; gap:8px; background:#1C1C1C; color:#fff; padding:14px 32px; font-size:11px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; }
  .cl-empty-reset:hover { background:#7A9E7E; }

  /* ── ERROR ── */
  .cl-error       { display:flex; align-items:center; gap:14px; background:#FEF2EE; border-left:3px solid #D4714A; padding:18px 24px; margin:40px 80px; max-width:600px; }
  .cl-error-text  { font-size:14px; color:#1C1C1C; flex:1; }
  .cl-retry       { background:none; border:1px solid #D4714A; color:#D4714A; padding:7px 16px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .cl-retry:hover { background:#D4714A; color:#fff; }

  /* ── RESPONSIVE ── */
  @media(max-width:1200px) {
    .cl-grid { grid-template-columns:repeat(3,1fr); }
    .cl-sk-grid { grid-template-columns:repeat(3,1fr); }
  }
  @media(max-width:900px) {
    .cl-header { padding:80px 24px 48px; }
    .cl-toolbar, .cl-tabs-wrap, .cl-content { padding-left:24px; padding-right:24px; }
    .cl-header-inner { flex-direction:column; align-items:flex-start; }
    .cl-header-right { text-align:left; }
    .cl-grid { grid-template-columns:repeat(2,1fr); gap:16px; }
    .cl-sk-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:520px) {
    .cl-grid { grid-template-columns:1fr; }
    .cl-sk-grid { grid-template-columns:1fr; }
    .cl-toolbar { flex-direction:column; align-items:stretch; }
    .cl-search-wrap { max-width:100%; }
    .cl-title { font-size:44px; }
  }
`;

// ── Otaq tab-larının sabit sırası (i18n key → room_type dəyəri) ──
const ROOM_TABS = [
  { key: "all",         value: "all"         },
  { key: "living_room", value: "living_room" },
  { key: "bedroom",     value: "bedroom"     },
  { key: "kitchen",     value: "kitchen"     },
  { key: "dining",      value: "dining"      },
  { key: "office",      value: "office"      },
  { key: "outdoor",     value: "outdoor"     },
  { key: "kids",        value: "kids"        },
  { key: "hallway",     value: "hallway"     },
  { key: "bathroom",    value: "bathroom"    },
];

// ── Placeholder şəkil (kateqoriyanın şəkli yoxdursa) ──────────
const PLACEHOLDER_IMGS = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80",
];

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const { t } = useTranslation();

  // ── Data state ────────────────────────────────────────────
  const [allCategories, setAllCategories] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  // ── UI state ──────────────────────────────────────────────
  const [search,   setSearch]   = useState("");
  const [roomTab,  setRoomTab]  = useState("all");
  const [sortKey,  setSortKey]  = useState("default");
  const [expanded, setExpanded] = useState(false);  // az/çox toggle

  const searchRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);

    categoryApi.getAll()
      .then(res => {
        // Backend: res.data massiv gətirir
        setAllCategories(res.data || []);
      })
      .catch(err => setError(err.userMessage || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
    window.scrollTo({ top: 0 });
  }, [fetchCategories]);

  // ── Tab counts — hər otaqda neçə kateqoriya var ───────────
  const tabCounts = useMemo(() => {
    const counts = { all: allCategories.length };
    allCategories.forEach(c => {
      const room = c.room_type || "other";
      counts[room] = (counts[room] || 0) + 1;
    });
    return counts;
  }, [allCategories]);

  // ── Filter + Sort pipeline ────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...allCategories];

    // 1. Otaq filteri
    if (roomTab !== "all") {
      result = result.filter(c => c.room_type === roomTab);
    }

    // 2. Axtarış — DB-dən gələn adda axtarış, i18n edilmir
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    switch (sortKey) {
      case "alpha":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "alpha_desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "products":
        result.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
        break;
      default:
        // API sırası qalır
        break;
    }

    return result;
  }, [allCategories, roomTab, search, sortKey]);

  // ── Show more / less ──────────────────────────────────────
  // expanded false-dırsa yalnız INITIAL_VISIBLE göstərirlir
  const visibleCategories = useMemo(() =>
    expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE),
    [filtered, expanded]
  );
  const hiddenCount = filtered.length - INITIAL_VISIBLE;
  const showToggle  = filtered.length > INITIAL_VISIBLE;

  // ── Handlers ──────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setSearch("");
    setRoomTab("all");
    setSortKey("default");
    setExpanded(false);
    searchRef.current?.focus();
  }, []);

  const handleTabChange = useCallback((val) => {
    setRoomTab(val);
    setExpanded(false); // tab dəyişdikdə collapse
  }, []);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
    setExpanded(false); // axtarışda collapse
  }, []);

  // Aktiv filter var mı?
  const hasActiveFilters = search.trim() || roomTab !== "all" || sortKey !== "default";

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="cl">
        <Navbar />

        {/* ── PAGE HEADER ── */}
        <header className="cl-header">
          <div className="cl-header-inner">
            <div className="cl-header-left">
              {/* i18n */}
              <div className="cl-eyebrow">{t("categories.eyebrow")}</div>
              <h1 className="cl-title">{t("cat_list.page_title")}</h1>
              <p className="cl-subtitle">{t("cat_list.page_subtitle")}</p>
            </div>
            <div className="cl-header-right">
              <span className="cl-total-n">
                {loading ? "—" : allCategories.length}
              </span>
              <span className="cl-total-l">{t("cat_list.total_categories")}</span>
            </div>
          </div>
        </header>

        {/* ── TOOLBAR: search + sort ── */}
        <div className="cl-toolbar">
          {/* Search */}
          <div className="cl-search-wrap">
            <span className="cl-search-icon">🔍</span>
            <input
              ref={searchRef}
              className="cl-search"
              type="text"
              placeholder={t("cat_list.search_placeholder")}
              value={search}
              onChange={handleSearch}
              autoComplete="off"
            />
            {search && (
              <button
                className="cl-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>

          {/* Sort */}
          <div className="cl-sort-wrap">
            <span className="cl-sort-label">{t("cat_list.sort_label")}</span>
            <select
              className="cl-sort-sel"
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
            >
              <option value="default">{t("categories.eyebrow")}</option>
              <option value="alpha">{t("cat_list.sort_alpha")}</option>
              <option value="alpha_desc">{t("cat_list.sort_alpha_desc")}</option>
              <option value="products">{t("cat_list.sort_products")}</option>
            </select>
          </div>
        </div>

        {/* ── ROOM FILTER TABS ── */}
        <div className="cl-tabs-wrap">
          <div className="cl-tabs" role="tablist">
            {ROOM_TABS.map(tab => {
              const count = tab.value === "all"
                ? allCategories.length
                : (tabCounts[tab.value] || 0);

              // Məhsulu olmayan tab-ları gizlət (all həmişə görünür)
              if (tab.value !== "all" && count === 0 && !loading) return null;

              return (
                <button
                  key={tab.value}
                  className={`cl-tab${roomTab === tab.value ? " active" : ""}`}
                  onClick={() => handleTabChange(tab.value)}
                  role="tab"
                  aria-selected={roomTab === tab.value}
                >
                  {/* i18n — tab adı */}
                  {t(`cat_list.rooms.${tab.key}`)}
                  {!loading && (
                    <span className="cl-tab-cnt">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="cl-content">

          {/* Result bar */}
          {!loading && (
            <div className="cl-result-bar">
              <p className="cl-result-text">
                {hasActiveFilters ? (
                  <>
                    <strong>{filtered.length}</strong> {t("cat_list.total_categories")}
                  </>
                ) : (
                  <>
                    <strong>{allCategories.length}</strong> {t("cat_list.total_categories")}
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <button className="cl-reset-link" onClick={handleReset}>
                  × {t("cat_list.reset")}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="cl-error">
              <span>⚠️</span>
              <p className="cl-error-text">{error}</p>
              <button className="cl-retry" onClick={fetchCategories}>Retry</button>
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div className="cl-sk-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="cl-sk-card" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="cl-empty">
              <span className="cl-empty-ic">🗂</span>
              <h3 className="cl-empty-t">{t("cat_list.no_results")}</h3>
              <p className="cl-empty-s">{t("cat_list.no_results_hint")}</p>
              <button className="cl-empty-reset" onClick={handleReset}>
                {t("cat_list.reset")}
              </button>
            </div>
          )}

          {/* ── CATEGORY GRID ── */}
          {!loading && !error && visibleCategories.length > 0 && (
            <>
              <div className="cl-grid">
                {visibleCategories.map((cat, i) => (
                  <Link
                    key={cat.id}
                    to={`/furniture-categories/${cat.id}`}
                    className="cl-card anim"
                    style={{ animationDelay: `${(i % INITIAL_VISIBLE) * 0.06}s` }}
                  >
                    <div className="cl-card-iw">
                      {/* DB-dən gəlir — şəkil TƏRCÜMƏ OLUNMUR */}
                      <img
                        className="cl-card-img"
                        src={
                          cat.image ||
                          cat.cover_image ||
                          PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]
                        }
                        alt={cat.name}
                        loading="lazy"
                      />
                      <div className="cl-card-ov" />
                    </div>
                    <div className="cl-card-info">
                      {/* Otaq tipi varsa — i18n ilə göstər */}
                      {cat.room_type && cat.room_type !== "other" && (
                        <p className="cl-card-room">
                          {t(`cat_list.rooms.${cat.room_type}`, cat.room_type)}
                        </p>
                      )}
                      {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
                      <h3 className="cl-card-name">{cat.name}</h3>
                      {cat.product_count != null && (
                        <p className="cl-card-cnt">
                          {cat.product_count} {t("cat_list.products_count")}
                        </p>
                      )}
                      {/* CTA — i18n */}
                      <span className="cl-card-cta">
                        {t("cat_list.explore_btn")}
                        <span className="cl-card-cta-arrow">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ── SHOW MORE / SHOW LESS ── */}
              {showToggle && (
                <div className="cl-toggle-wrap">
                  <div className="cl-toggle-line" />
                  <button
                    className={`cl-toggle-btn${expanded ? " expanded" : ""}`}
                    onClick={() => setExpanded(prev => !prev)}
                  >
                    {/* Icon */}
                    <span className="cl-toggle-icon">▾</span>

                    {/* Mətn — i18n */}
                    {expanded
                      ? t("cat_list.show_less")
                      : t("cat_list.show_more")}

                    {/* Neçə kateqoriya gizlənib / göstərilib */}
                    {!expanded && hiddenCount > 0 && (
                      <span className="cl-toggle-count">+{hiddenCount}</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
