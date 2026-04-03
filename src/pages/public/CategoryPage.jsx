import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import categoryApi from "../../api/categoryApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import CategoriesGrid from "../../components/categoriespage/CategoriesGrid";
import "../../assets/pagesCss/CategoryPage.css";

const INITIAL_VISIBLE = 8;

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

export default function CategoriesPage() {
  const { t }  = useTranslation();
  const lang   = useSelector(selectLang);

  const [allCategories, setAllCategories] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [sortKey,       setSortKey]       = useState("default");
  const [expanded,      setExpanded]      = useState(false);
  const searchRef = useRef(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    categoryApi.getAll()
      .then(res => {
        // FurnitureCategoryDto: { id, name, imageUrl }
        const arr = Array.isArray(res) ? res : [];
        setAllCategories(arr.map((c, i) => ({
          id:          c.id,
          name:        c.name,
          image_url:   c.imageUrl || PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length],
          product_count: c.productCount || 0,
          description: c.name,
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
      case "products":   result.sort((a, b) => (b.product_count || 0) - (a.product_count || 0)); break;
    }
    return result;
  }, [allCategories, search, sortKey]);

  const visibleCategories = useMemo(() =>
    expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE),
    [filtered, expanded]);
  const hiddenCount = filtered.length - INITIAL_VISIBLE;
  const showToggle  = filtered.length > INITIAL_VISIBLE;
  const hasActiveFilters = search.trim() || sortKey !== "default";

  const handleReset = useCallback(() => {
    setSearch(""); setSortKey("default"); setExpanded(false);
    searchRef.current?.focus();
  }, []);

  return (
    <>
      <div className="cl">
        <Navbar />
        <header className="cl-header">
          <div className="cl-header-inner">
            <div className="cl-header-left">
              <div className="cl-eyebrow">{t("categories.eyebrow")}</div>
              <h1 className="cl-title">{t("cat_list.page_title")}</h1>
              <p className="cl-subtitle">{t("cat_list.page_subtitle")}</p>
            </div>
            <div className="cl-header-right">
              <span className="cl-total-n">{loading ? "—" : allCategories.length}</span>
              <span className="cl-total-l">{t("cat_list.total_categories")}</span>
            </div>
          </div>
        </header>

        <div className="cl-toolbar">
          <div className="cl-search-wrap">
            <span className="cl-search-icon"><img src="/images/search.png" alt="" /></span>
            <input
              ref={searchRef}
              className="cl-search"
              type="text"
              placeholder={t("cat_list.search_placeholder")}
              value={search}
              onChange={e => { setSearch(e.target.value); setExpanded(false); }}
              autoComplete="off"
            />
            {search && (
              <button className="cl-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="cl-sort-wrap">
            <span className="cl-sort-label">{t("cat_list.sort_label")}</span>
            <select className="cl-sort-sel" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="default">{t("categories.eyebrow")}</option>
              <option value="alpha">{t("cat_list.sort_alpha")}</option>
              <option value="alpha_desc">{t("cat_list.sort_alpha_desc")}</option>
              <option value="products">{t("cat_list.sort_products")}</option>
            </select>
          </div>
        </div>

        <div className="cl-content">
          {!loading && (
            <div className="cl-result-bar">
              <p className="cl-result-text">
                <strong>{filtered.length}</strong> {t("cat_list.total_categories")}
              </p>
              {hasActiveFilters && (
                <button className="cl-reset-link" onClick={handleReset}>× {t("cat_list.reset")}</button>
              )}
            </div>
          )}

          {error && (
            <div className="cl-error">
              <span>⚠️</span>
              <p className="cl-error-text">{error}</p>
              <button className="cl-retry" onClick={fetchCategories}>Retry</button>
            </div>
          )}

          {loading && (
            <div className="cl-sk-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="cl-sk-card" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="cl-empty">
              <span className="cl-empty-ic">🗂</span>
              <h3 className="cl-empty-t">{t("cat_list.no_results")}</h3>
              <p className="cl-empty-s">{t("cat_list.no_results_hint")}</p>
              <button className="cl-empty-reset" onClick={handleReset}>{t("cat_list.reset")}</button>
            </div>
          )}

          {!loading && !error && visibleCategories.length > 0 && (
            <>
              <CategoriesGrid
                t={t}
                visibleCategories={visibleCategories}
                INITIAL_VISIBLE={6}
                PLACEHOLDER_IMGS={PLACEHOLDER_IMGS}
              />
              {showToggle && (
                <div className="cl-toggle-wrap">
                  <div className="cl-toggle-line" />
                  <button
                    className={`cl-toggle-btn${expanded ? " expanded" : ""}`}
                    onClick={() => setExpanded(prev => !prev)}
                  >
                    <span className="cl-toggle-icon">▾</span>
                    {expanded ? t("cat_list.show_less") : t("cat_list.show_more")}
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
