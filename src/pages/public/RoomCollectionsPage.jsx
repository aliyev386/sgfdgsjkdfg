
import { useState, useEffect, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import collectionApi from "../../api/collectionApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/RoomCollections.css";

const ACCENTS2 = ["#7A9E7E","#C9A84C","#C1654B","#5C8DB8","#9B8AC4","#7A9E7E","#E8A87C","#A0856C"];
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

const CollCard = memo(function CollCard({ coll, idx, t }) {
  const navigate = useNavigate();
  return (
    <article
      className="rcp-card"
      style={{ animationDelay:`${idx * 55}ms` }}
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
          <button
            className="rcp-explore-btn"
            onClick={e => { e.stopPropagation(); navigate(`/collection-detail/${coll.id}`); }}
          >
            {t("rooms_coll.explore")} →
          </button>
        </div>
      </div>
    </article>
  );
});

export default function RoomCollectionsPage() {
  const { categoryId } = useParams();
  const { t }          = useTranslation();
  const lang           = useSelector(selectLang);

  const [heroLoaded,  setHeroLoaded]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [items,       setItems]       = useState([]);
  const [allRooms,    setAllRooms]    = useState([]);
  const [currentMeta, setCurrentMeta] = useState({ name: "", image: "", accent: "#7A9E7E" });

  useEffect(() => {
    collectionApi.getCategories()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        const rooms = arr.map((c, i) => ({
          id:     c.id,
          slug:   String(c.id),
          name:   c.name,
          image:  c.imageUrl || "",
          accent: ACCENTS2[i % ACCENTS2.length],
        }));
        setAllRooms(rooms);
        const found = rooms.find(r => String(r.id) === String(categoryId));
        if (found) setCurrentMeta(found);
      })
      .catch(() => {});
  }, [lang, categoryId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setHeroLoaded(false);

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
  }, [categoryId, lang]);

  const accent = currentMeta.accent || "#7A9E7E";

  return (
    <>
      <style>{`:root { --rcp-accent: ${accent}; }`}</style>
      <div className="rcp-page">
        <Navbar />

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
            <span className="rcp-hero-tag">{t("rooms_coll.collections_for")}</span>
            <h1 className="rcp-hero-title">{currentMeta.name}</h1>
          </div>
          <div className="rcp-hero-stats">
            <span className="rcp-hero-stat-n">{items.length || "—"}</span>
            <span className="rcp-hero-stat-l">{t("rooms_coll.collections")}</span>
          </div>
        </div>

        <nav className="rcp-rooms-nav">
          <div className="rcp-rooms-nav-inner">
            {allRooms.map(r => (
              <Link
                key={r.slug}
                to={`/room-collections/${r.slug}`}
                className={"rcp-room-tab" + (String(r.id)===String(categoryId)?" active":"")}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="rcp-main">
          <div className="rcp-section-head">
            <h2 className="rcp-section-title">
              {t("rooms_coll.section_title_pre")} {currentMeta.name}
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
                <CollCard key={coll.id} coll={coll} idx={i} t={t} />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
