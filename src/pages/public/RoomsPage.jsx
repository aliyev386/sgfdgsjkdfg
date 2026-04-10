import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import collectionApi from "../../api/collectionApi";
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
const INITIAL_VISIBLE = 8;

const SPAN_STYLES = {
  large:  { gridColumn: "span 5", gridRow: "span 2", minHeight: "500px" },
  medium: { gridColumn: "span 4", gridRow: "span 1", minHeight: "280px" },
  small:  { gridColumn: "span 3", gridRow: "span 1", minHeight: "240px" },
};

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: "18px",
  width: "100%",
};

export default function RoomsPage() {
  const { t }  = useTranslation();
  const lang   = useSelector(selectLang);

  const [allRooms, setAllRooms] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchRooms = useCallback(() => {
    setLoading(true);
    setError(null);
    collectionApi.getCategories()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setAllRooms(arr.map((c, i) => ({
          id:    c.id,
          slug:  String(c.id),
          name:  c.name,
          image: c.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          accent: ACCENTS[i % ACCENTS.length],
        })));
      })
      .catch(err => setError(err?.userMessage || "Xəta baş verdi"))
      .finally(() => setLoading(false));
  }, [lang]);

  useEffect(() => {
    fetchRooms();
    window.scrollTo({ top: 0 });
  }, [fetchRooms]);

  const visibleRooms = useMemo(
    () => (expanded ? allRooms : allRooms.slice(0, INITIAL_VISIBLE)).map((r, i) => ({
      ...r,
      span:   SPANS[i % SPANS.length],
      accent: ACCENTS[i % ACCENTS.length],
    })),
    [allRooms, expanded]
  );

  const hiddenCount = allRooms.length - INITIAL_VISIBLE;
  const showToggle  = allRooms.length > INITIAL_VISIBLE;

  return (
    <div className="cp-page">
      <Navbar />

      <div className="cp-hero">
        <div className="cp-hero-noise" />
        <div className="cp-hero-orb cp-hero-orb1" />
        <div className="cp-hero-orb cp-hero-orb2" />
        <div className="cp-hero-inner">
          <div className="cp-hero-left">
            <div className="cp-hero-eyebrow">{t("rooms_page.eyebrow")}</div>
            <h1 className="cp-hero-title">
              {t("rooms_page.title_pre")}<br />
              <em>{t("rooms_page.title_em")}</em>
            </h1>
            <p className="cp-hero-sub">{t("rooms_page.subtitle")}</p>
          </div>
          <div className="cp-hero-right">
            <span className="cp-hero-stat-n">{loading ? "—" : allRooms.length}</span>
            <span className="cp-hero-stat-l">{t("rooms_page.stat_label")}</span>
          </div>
        </div>
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
            <button onClick={fetchRooms}>Retry</button>
          </div>
        )}

        {!loading && !error && allRooms.length === 0 && (
          <div className="cp-empty">
            <span className="cp-empty-ic">🛋</span>
            <h3>{t("rooms_coll.no_collections", "Kolleksiya tapılmadı")}</h3>
          </div>
        )}

        {!loading && !error && visibleRooms.length > 0 && (
          <>
            <div style={GRID_STYLE}>
              {visibleRooms.map((room, i) => (
                <Link
                  key={room.slug}
                  to={`/room-collections/${room.slug}`}
                  className="cp-card"
                  style={{
                    ...SPAN_STYLES[room.span],
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  <img
                    className="cp-card-img"
                    src={room.image}
                    alt={room.name}
                    loading="lazy"
                  />
                  <div className="cp-card-ov" />
                  <div className="cp-card-accent" style={{ background: room.accent }} />
                  <div className="cp-card-body">
                    <span className="cp-card-tag">{t("rooms_page.shop_room")}</span>
                    <h2 className="cp-card-name" style={{
                      fontSize: room.span === "large" ? "clamp(28px,3.5vw,40px)"
                               : room.span === "medium" ? "clamp(22px,2.5vw,30px)"
                               : "clamp(18px,2vw,24px)"
                    }}>
                      {room.name}
                    </h2>
                    <div className="cp-card-cta">
                      <span>{t("rooms_page.explore_room")}</span>
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
                  className={"cp-toggle-btn" + (expanded ? " expanded" : "")}
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