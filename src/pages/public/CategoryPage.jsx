import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import categoryApi from "../../api/categoryApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import CategoriesGrid from "../../components/categoriespage/CategoriesGrid";
import "../../assets/pagesCss/CategoryPage.css";
import "../../assets/pagesCss/Rooms.css";
import collectionApi from "../../api/collectionApi";
import { Link } from "react-router-dom";

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
  const [rooms, setRooms] = useState([]);
  
  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
  
    collectionApi.getCategories()
      .then(res => {        
        const arr = Array.isArray(res) ? res : [];
  
        setRooms(arr.map((c, i) => ({
          id: c.id,
          slug: String(c.id),
          name: c.name,
          image: c.imageUrl || PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length],
          accent: ["#7A9E7E","#C9A84C","#C1654B","#5C8DB8","#9B8AC4"][i % 5],
          span: ["large","medium","small","small"][i % 4],
        })));
      })
      .catch(err => setError("Xəta baş verdi"))
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

        <div className="rp-grid-wrap">
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"80px 0", color:"#aaa" }}>
              <div style={{ width:32, height:32, border:"3px solid #C9A84C", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            </div>
          ) : (
          <div className="rp-grid">
            {rooms.map((room, i) => (
              <Link
                key={room.slug}
                to={`/room-collections/${room.slug}`}
                className="rp-card"
                data-span={room.span}
                style={{ animationDelay:`${i * 70}ms` }}
              >
                <img className="rp-card-img" src={room.image} alt={room.name} loading="lazy" />
                <div className="rp-card-ov" />
                <div className="rp-card-accent" style={{ background: room.accent }} />

                <div className="rp-card-body">
                  <span className="rp-card-tag">{t("rooms_page.shop_room")}</span>
                  <h2 className="rp-card-name">{room.name}</h2>

                  <div className="rp-card-cta">
                    <span>{t("rooms_page.explore_room")}</span>
                    <span className="rp-cta-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
 
        <Footer />
      </div>
    </>
  );
}
