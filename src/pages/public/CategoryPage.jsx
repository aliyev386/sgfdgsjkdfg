
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import categoryApi from "../../api/categoryApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/CategoryPage.css";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=85",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=85",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=900&q=85",
];

const ACCENTS = ["#7A9E7E","#C9A84C","#C1654B","#5C8DB8","#9B8AC4","#7A9E7E","#E8A87C","#A0856C"];
const SPANS   = ["large","medium","medium","small","small","small","small","small"];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const lang  = useSelector(selectLang);

  const [allCategories, setAllCategories] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [sortKey,       setSortKey]       = useState("default");
  const [expanded,      setExpanded]      = useState(false);
  const searchRef = useRef(null);

  const INITIAL_VISIBLE = 8;

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    categoryApi.getAll()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setAllCategories(arr.map((c, i) => ({
          id:     c.id,
          slug:   String(c.id),
          name:   c.name,
          image:  c.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          accent: ACCENTS[i % ACCENTS.length],
          span:   SPANS[i % SPANS.length],
        })));
      })
      .catch(err => setError(err?.userMessage || "Xəta baş verdi"))
      .finally(() => setLoading(false));
  }, [lang]);

  useEffect(() => {
    fetchCategories();
    window.scrollTo({ top: 0 });
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    let result = [...allCategories];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }
    switch (sortKey) {
      case "alpha":      result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "alpha_desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return result;
  }, [allCategories, search, sortKey]);

  const visibleCategories = useMemo(() =>
    expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE),
    [filtered, expanded]
  );
  const hiddenCount = filtered.length - INITIAL_VISIBLE;
  const showToggle  = filtered.length > INITIAL_VISIBLE;

  const handleReset = useCallback(() => {
    setSearch(""); setSortKey("default"); setExpanded(false);
    searchRef.current?.focus();
  }, []);

  const categoriesWithSpan = visibleCategories.map((c, i) => ({
    ...c,
    span: SPANS[i % SPANS.length],
    accent: ACCENTS[i % ACCENTS.length],
  }));

  return (
    <div className="cp-page">
      <Navbar />

      <div className="cp-hero">
        <div className="cp-hero-noise" />
        <div className="cp-hero-orb cp-hero-orb1" />
        <div className="cp-hero-orb cp-hero-orb2" />
        <div className="cp-hero-inner">
          <div className="cp-hero-left">
            <div className="cp-hero-eyebrow">{t("cat_list.eyebrow")}</div>
            <h1 className="cp-hero-title">
              {t("cat_list.title")}<br />
              <em>{t("cat_list.title-em")}</em>
            </h1>
            <p className="cp-hero-sub">{t("cat_list.page_subtitle")}</p>
          </div>
          <div className="cp-hero-right">
            <span className="cp-hero-stat-n">{loading ? "—" : allCategories.length}</span>
            <span className="cp-hero-stat-l">{t("cat_list.total_categories")}</span>
          </div>
        </div>
      </div>

      <div className="cp-toolbar">
        <div className="cp-search-wrap">
          <span className="cp-search-icon">⌕</span>
          <input
            ref={searchRef}
            className="cp-search"
            type="text"
            placeholder={t("cat_list.search_placeholder")}
            value={search}
            onChange={e => { setSearch(e.target.value); setExpanded(false); }}
            autoComplete="off"
          />
          {search && (
            <button className="cp-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <div className="cp-sort-wrap">
          <span className="cp-sort-label">{t("cat_list.sort_label")}</span>
          <select
            className="cp-sort-sel"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
          >
            <option value="default">{t("categories.eyebrow")}</option>
            <option value="alpha">{t("cat_list.sort_alpha")}</option>
            <option value="alpha_desc">{t("cat_list.sort_alpha_desc")}</option>
          </select>
        </div>
        {(search || sortKey !== "default") && (
          <button className="cp-reset-btn" onClick={handleReset}>
            × {t("cat_list.reset")}
          </button>
        )}
      </div>

      <div className="cp-grid-wrap">

        {loading && (
          <div className="cp-spinner-wrap">
            <div className="cp-spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="cp-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchCategories}>Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cp-empty">
            <span className="cp-empty-ic">🗂</span>
            <h3>{t("cat_list.no_results")}</h3>
            <p>{t("cat_list.no_results_hint")}</p>
            <button onClick={handleReset}>{t("cat_list.reset")}</button>
          </div>
        )}

        {!loading && !error && categoriesWithSpan.length > 0 && (
          <>
            <div className="cp-grid">
              {categoriesWithSpan.map((cat, i) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="cp-card"
                  data-span={cat.span}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <img
                    className="cp-card-img"
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                  />
                  <div className="cp-card-ov" />
                  <div className="cp-card-accent" style={{ background: cat.accent }} />

                  <div className="cp-card-body">
                    <span className="cp-card-tag">{t("cat_list.shop_category", "Kateqoriya")}</span>
                    <h2 className="cp-card-name">{cat.name}</h2>
                    <div className="cp-card-cta">
                      <span>{t("cat_list.explore_category", "Kəşf et")}</span>
                      <span className="cp-cta-arrow">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {showToggle && (
              <div className="cp-toggle-wrap">
                <div className="cp-toggle-line" />
                <button
                  className={`cp-toggle-btn${expanded ? " expanded" : ""}`}
                  onClick={() => setExpanded(prev => !prev)}
                >
                  <span className="cp-toggle-icon">▾</span>
                  {expanded ? t("cat_list.show_less") : t("cat_list.show_more")}
                  {!expanded && hiddenCount > 0 && (
                    <span className="cp-toggle-count">+{hiddenCount}</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}