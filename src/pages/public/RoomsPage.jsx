// src/pages/public/RoomsPage.jsx
// Route: /rooms
// Bütün otaqlar grid şəklində — hər biri /rooms/:roomSlug-a aparır

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/Rooms.css";

const ROOMS = [
  {
    slug:   "living-room",
    key:    "living_room",
    image:  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85",
    accent: "#7A9E7E",
    collections: 14,
    featured: ["Velour Sofa", "Oak Coffee Table", "Arc Lamp"],
    span: "large",
  },
  {
    slug:   "bedroom",
    key:    "bedroom",
    image:  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85",
    accent: "#C9A84C",
    collections: 11,
    featured: ["Platform Bed", "Bedside Table", "Wardrobe"],
    span: "medium",
  },
  {
    slug:   "dining",
    key:    "dining",
    image:  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=85",
    accent: "#C1654B",
    collections: 9,
    featured: ["Dining Table", "Chairs Set", "Sideboard"],
    span: "medium",
  },
  {
    slug:   "kitchen",
    key:    "kitchen",
    image:  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85",
    accent: "#5C8DB8",
    collections: 7,
    featured: ["Kitchen Island", "Bar Stools", "Shelving"],
    span: "small",
  },
  {
    slug:   "office",
    key:    "office",
    image:  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85",
    accent: "#9B8AC4",
    collections: 8,
    featured: ["Desk", "Ergonomic Chair", "Bookshelf"],
    span: "small",
  },
  {
    slug:   "outdoor",
    key:    "outdoor",
    image:  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=85",
    accent: "#7A9E7E",
    collections: 5,
    featured: ["Lounge Set", "Garden Table", "Hanging Chair"],
    span: "small",
  },
  {
    slug:   "kids",
    key:    "kids",
    image:  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
    accent: "#E8A87C",
    collections: 6,
    featured: ["Kids Bed", "Study Desk", "Toy Storage"],
    span: "small",
  },
  {
    slug:   "hallway",
    key:    "hallway",
    image:  "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=900&q=85",
    accent: "#A0856C",
    collections: 4,
    featured: ["Console Table", "Coat Rack", "Mirror"],
    span: "small",
  },
  {
    slug:   "bathroom",
    key:    "bathroom",
    image:  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=85",
    accent: "#6AACB8",
    collections: 5,
    featured: ["Vanity Unit", "Storage Cabinet", "Mirror"],
    span: "small",
  },
];

export default function RoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
 
  useEffect(() => { window.scrollTo({ top:0 }); }, []);
 
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
              <span className="rp-hero-stat-n">{ROOMS.length}</span>
              <span className="rp-hero-stat-l">{t("rooms_page.stat_label")}</span>
            </div>
          </div>
        </div>
 
        {/* GRID */}
        <div className="rp-grid-wrap">
          <div className="rp-grid">
            {ROOMS.map((room, i) => (
              <Link
                key={room.slug}
                to={`/rooms/${room.slug}`}
                className="rp-card"
                data-span={room.span}
                style={{ animationDelay:`${i * 70}ms` }}
              >
                <img className="rp-card-img" src={room.image} alt={t(`cat_list.rooms.${room.key}`)} loading="lazy" />
                <div className="rp-card-ov" />
                <div className="rp-card-accent" style={{ background: room.accent }} />
 
                {/* Collection count badge */}
                <div className="rp-count-badge">
                  <span className="rp-count-n">{room.collections}</span>
                  <span className="rp-count-l">{t("rooms_page.collections")}</span>
                </div>
 
                <div className="rp-card-body">
                  <span className="rp-card-tag">{t("rooms_page.shop_room")}</span>
                  <h2 className="rp-card-name">{t(`cat_list.rooms.${room.key}`)}</h2>
                  <p className="rp-card-meta">{room.collections} {t("rooms_page.collections")}</p>
 
                  {room.span !== "small" && (
                    <div className="rp-card-chips">
                      {room.featured.map(f => (
                        <span key={f} className="rp-chip">{f}</span>
                      ))}
                    </div>
                  )}
 
                  <div className="rp-card-cta">
                    <span>{t("rooms_page.explore_room")}</span>
                    <span className="rp-cta-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
 
        {/* BOTTOM BANNER */}
        <div className="rp-banner">
          <div className="rp-banner-inner">
            <div className="rp-banner-orb" />
            <div className="rp-banner-left">
              <div className="rp-banner-eyebrow">{t("rooms_page.banner_eyebrow")}</div>
              <h3 className="rp-banner-title">
                {t("rooms_page.banner_title")}<br/>
                <em>{t("rooms_page.banner_title_em")}</em>
              </h3>
            </div>
            <div className="rp-banner-right">
              <Link to="/furniture-categories" className="rp-banner-btn-p">
                {t("rooms_page.banner_btn_p")}
              </Link>
              <Link to="/furniture-categories" className="rp-banner-btn-s">
                {t("rooms_page.banner_btn_s")}
              </Link>
            </div>
          </div>
        </div>
 
        <Footer />
      </div>
    </>
  );
}