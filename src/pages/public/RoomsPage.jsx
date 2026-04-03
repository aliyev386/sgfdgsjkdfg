// src/pages/public/RoomsPage.jsx
// Route: /rooms
// Bütün otaqlar grid şəklində — hər biri /rooms/:roomSlug-a aparır

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import collectionApi from "../../api/collectionApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/Rooms.css";

// CollectionCategoryDto-lar API-dan gəlir
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=85",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=85",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
  "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=900&q=85",
];
const ACCENTS = ["#7A9E7E","#C9A84C","#C1654B","#5C8DB8","#9B8AC4","#7A9E7E","#E8A87C","#A0856C"];
const SPANS   = ["large","medium","medium","small","small","small","small","small"];

export default function RoomsPage() {
  const { t }  = useTranslation();
  const lang   = useSelector(selectLang);
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    collectionApi.getCategories()
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setRooms(arr.map((c, i) => ({
          id:          c.id,
          slug:        String(c.id),
          name:        c.name,
          image:       c.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          accent:      ACCENTS[i % ACCENTS.length],
          span:        SPANS[i % SPANS.length],
          collections: 0,
        })));
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <>
      <div className="rp-page">
        <Navbar />

        {/* HERO */}
        <div className="rp-hero">
          <div className="rp-hero-noise" />
          <div className="rp-hero-orb rp-hero-orb1" />
          <div className="rp-hero-orb rp-hero-orb2" />
          <div className="rp-hero-inner">
            <div className="rp-hero-left">
              <div className="rp-hero-eyebrow">{t("rooms_page.eyebrow")}</div>
              <h1 className="rp-hero-title">
                {t("rooms_page.title_pre")}<br/>
                <em>{t("rooms_page.title_em")}</em>
              </h1>
              <p className="rp-hero-sub">{t("rooms_page.subtitle")}</p>
            </div>
            <div className="rp-hero-right">
              <span className="rp-hero-stat-n">{loading ? "—" : rooms.length}</span>
              <span className="rp-hero-stat-l">{t("rooms_page.stat_label")}</span>
            </div>
          </div>
        </div>

        {/* GRID */}
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
 
        {/* BOTTOM BANNER */}

 
        <Footer />
      </div>
    </>
  );
}