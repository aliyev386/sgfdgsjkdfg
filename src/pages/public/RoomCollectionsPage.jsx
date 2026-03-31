// src/pages/public/RoomCollectionsPage.jsx
// Route: /rooms/:roomSlug
// Seçilmiş otağa aid kolleksiyalar

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart } from "../../store/slices/cartSlice";
import collectionApi from "../../api/collectionApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/RoomCollections.css";

// ── ROOM META (API-dan gəlir)
const ACCENTS2 = ["#7A9E7E","#C9A84C","#C1654B","#5C8DB8","#9B8AC4","#7A9E7E","#E8A87C","#A0856C"]; 


const fmt = (n) => `$${Number(n).toLocaleString()}`;
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

// ── COLLECTION CARD ───────────────────────────────────────────
const CollCard = memo(function CollCard({ coll, idx, accent, t }) {
  const navigate = useNavigate();
  return (
    <article
      className="rcp-card"
      style={{ animationDelay:`${idx * 60}ms` }}
      onClick={() => navigate(`/collection-detail/${coll.id}`)}
    >
      <div className="rcp-card-img-box">
        <img className="rcp-card-img" src={coll.image} alt={coll.name} loading="lazy" />
        {coll.badge && (
          <span className="rcp-badge" style={{background:BADGE_CLR[coll.badge]}}>
            {t(`common.${coll.badge}`)}
          </span>
        )}
        <div className="rcp-card-hover">
          <div className="rcp-hover-inner">
            <span className="rcp-hover-label">{t("rooms_coll.view_collection")}</span>
            <span className="rcp-hover-arrow">→</span>
          </div>
        </div>
      </div>
      <div className="rcp-card-body">
        <h3 className="rcp-card-name">{coll.name}</h3>
        <p className="rcp-card-desc">{coll.description}</p>
        <div className="rcp-card-foot">
          <span className="rcp-pieces">
            <span className="rcp-pieces-n">{coll.pieces}</span>
            {" "}{t("collection_page.pieces")}
          </span>
          <button
            className="rcp-explore-btn"
            style={{"--accent":accent}}
            onClick={e => { e.stopPropagation(); navigate(`/collection-detail/${coll.id}`); }}
          >
            {t("rooms_coll.explore")} →
          </button>
        </div>
      </div>
    </article>
  );
});


// all rooms list for the nav
// ALL_ROOMS API-dan dinamik yüklənir


export default function RoomCollectionsPage() {
  const { categoryId } = useParams();   // route: /room-collections/:categoryId
  const { t }          = useTranslation();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();
  const lang           = useSelector(selectLang);

  const [heroLoaded,  setHeroLoaded]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [items,       setItems]       = useState([]);
  const [allRooms,    setAllRooms]    = useState([]);   // nav tabs
  const [currentMeta, setCurrentMeta] = useState({ name: "", image: "", accent: "#7A9E7E" });

  // Load all collection categories for nav
  useEffect(() => {
    collectionApi.getCategories()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setAllRooms(arr.map((c, i) => ({
          id:     c.id,
          slug:   String(c.id),
          name:   c.name,
          image:  c.imageUrl || "",
          accent: ACCENTS2[i % ACCENTS2.length],
        })));
      })
      .catch(() => {});
  }, [lang]);

  // Load collections for selected category
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setHeroLoaded(false);

    // Find meta for this category
    const meta = allRooms.find(r => String(r.id) === String(categoryId));
    if (meta) setCurrentMeta(meta);

    const fetch = categoryId
      ? collectionApi.getByCategory(categoryId)
      : collectionApi.getAll();

    fetch
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setItems(arr.map(c => ({
          id:          c.id,
          name:        c.name,
          slug:        String(c.id),
          pieces:      c.products?.length ?? 0,
          badge:       null,
          image:       c.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
          description: c.description || "",
        })));
      })
      .catch(() => setItems([]))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setHeroLoaded(true), 80);
      });
  }, [categoryId, lang, allRooms.length]);

  const accent = currentMeta.accent || "#7A9E7E";

  return (
    <>
      {/* inject accent css var */}
      <style>{`:root { --rcp-accent: ${accent}; }`}</style>
      <div className="rcp-page">
        <Navbar />

        {/* HERO */}
        <div className={"rcp-hero" + (heroLoaded?" loaded":"")}>
          <div className="rcp-hero-bg" style={{backgroundImage:`url(${currentMeta.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85"})`}} />
          <div className="rcp-hero-ov" />
          <div className="rcp-hero-content">
            <div className="rcp-breadcrumb">
              <Link to="/">{t("pdp.home")}</Link>
              <span className="rcp-bc-sep">/</span>
              <Link to="/rooms">{t("rooms_page.eyebrow")}</Link>
              <span className="rcp-bc-sep">/</span>
              <span className="rcp-bc-cur">{currentMeta.name}</span>
            </div>
            <span className="rcp-hero-tag" style={{color:accent}}>{t("rooms_coll.collections_for")}</span>
            <h1 className="rcp-hero-title" style={{color:"#fff"}}>
              <em style={{color:accent}}>{currentMeta.name}</em>
            </h1>
          </div>
          <div className="rcp-hero-stats">
            <span className="rcp-hero-stat-n">{items.length || "—"}</span>
            <span className="rcp-hero-stat-l">{t("rooms_coll.collections")}</span>
          </div>
        </div>

        {/* ROOMS NAV */}
        <nav className="rcp-rooms-nav">
          <div className="rcp-rooms-nav-inner" style={{"--accent":accent}}>
            {allRooms.map(r => (
              <Link
                key={r.slug}
                to={`/room-collections/${r.slug}`}
                className={"rcp-room-tab" + (String(r.id)===String(categoryId)?" active":"")}
                style={String(r.id)===String(categoryId) ? {"--accent":accent} : {}}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* MAIN */}
        <div className="rcp-main">
          <div className="rcp-section-head">
            <h2 className="rcp-section-title" style={{"--accent":accent}}>
              {t("rooms_coll.section_title_pre")} <em>{t(`cat_list.rooms.${meta.key}`)}</em>
            </h2>
            {!loading && (
              <span className="rcp-section-count">
                {items.length} {t("rooms_coll.collections")}
              </span>
            )}
          </div>

          {loading && (
            <div className="rcp-sk-grid">
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="rcp-sk-card">
                  <div className="rcp-sk-img" style={{animationDelay:`${i*.1}s`}} />
                  <div className="rcp-sk-line" />
                  <div className="rcp-sk-line sm" />
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="rcp-empty">
              <span className="rcp-empty-ic">🛋</span>
              <h3 className="rcp-empty-t">{t("rooms_coll.no_collections")}</h3>
              <p className="rcp-empty-s">{t("rooms_coll.no_collections_hint")}</p>
              <Link to="/rooms" className="rcp-empty-btn">{t("rooms_coll.back_to_rooms")}</Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="rcp-grid">
              {items.map((coll, i) => (
                <CollCard
                  key={coll.id}
                  coll={coll}
                  idx={i}
                  accent={accent}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}