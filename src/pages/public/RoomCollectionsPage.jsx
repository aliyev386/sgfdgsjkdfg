// src/pages/public/RoomCollectionsPage.jsx
// Route: /rooms/:roomSlug
// Seçilmiş otağa aid kolleksiyalar

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import collectionApi from "../../api/collectionApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/PagesCss/RoomCollections.css";

// ── ROOM META ─────────────────────────────────────────────────
const ROOM_META = {
  "living-room": {
    key:"living_room", accent:"#7A9E7E", accent2:"#5a8060",
    image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85",
  },
  "bedroom": {
    key:"bedroom", accent:"#C9A84C", accent2:"#a88a38",
    image:"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=85",
  },
  "dining": {
    key:"dining", accent:"#C1654B", accent2:"#9e4e38",
    image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=85",
  },
  "kitchen": {
    key:"kitchen", accent:"#5C8DB8", accent2:"#4472a0",
    image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=85",
  },
  "office": {
    key:"office", accent:"#9B8AC4", accent2:"#7a6aaa",
    image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85",
  },
  "outdoor": {
    key:"outdoor", accent:"#7A9E7E", accent2:"#5a8060",
    image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=85",
  },
  "kids": {
    key:"kids", accent:"#E8A87C", accent2:"#cc8856",
    image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85",
  },
  "hallway": {
    key:"hallway", accent:"#A0856C", accent2:"#806554",
    image:"https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=1600&q=85",
  },
  "bathroom": {
    key:"bathroom", accent:"#6AACB8", accent2:"#4a8e9a",
    image:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=85",
  },
};

// ── MOCK COLLECTIONS ──────────────────────────────────────────
const ALL_MOCK_COLLECTIONS = {
  "living-room": [
    { id:1,  name:"Velour Sofa Collection",    slug:"velour-sofa",    pieces:12, badge:"best_seller", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80", description:"Plush velvet sofas in timeless silhouettes." },
    { id:2,  name:"Nordic Oak Series",         slug:"nordic-oak",     pieces:8,  badge:"new_in",      image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80", description:"Scandinavian oak chairs for every setting." },
    { id:3,  name:"Aria Coffee Tables",        slug:"aria-tables",    pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80", description:"Minimalist marble and wood surfaces." },
    { id:4,  name:"Statement Lighting",        slug:"lighting",       pieces:9,  badge:"new_in",      image:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80", description:"Arc lamps and sculptural pendants." },
    { id:5,  name:"Shelving & Display",        slug:"shelving",       pieces:7,  badge:null,          image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", description:"Open shelving in solid oak and walnut." },
    { id:6,  name:"Lounge Armchairs",          slug:"armchairs",      pieces:10, badge:"sale",        image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80", description:"Deep-cushioned armchairs for lounging." },
  ],
  "bedroom": [
    { id:7,  name:"Platform Bed Frames",       slug:"platform-beds",  pieces:8,  badge:"best_seller", image:"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=700&q=80", description:"Low-profile beds in oak and upholstered linen." },
    { id:8,  name:"Bedside Tables",            slug:"bedside",        pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=700&q=80", description:"Compact bedside units with hidden storage." },
    { id:9,  name:"Wardrobe Collection",       slug:"wardrobes",      pieces:5,  badge:"new_in",      image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80", description:"Floor-to-ceiling wardrobes, made to order." },
    { id:10, name:"Linen & Texture",           slug:"linen-texture",  pieces:14, badge:null,          image:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80", description:"Bedroom textiles in organic linen." },
    { id:11, name:"Dressing Tables",           slug:"dressing",       pieces:4,  badge:"sale",        image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=700&q=80", description:"Vanity mirrors and dressing tables." },
  ],
  "dining": [
    { id:12, name:"Dining Table Series",       slug:"dining-tables",  pieces:9,  badge:"best_seller", image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=700&q=80", description:"Extendable dining tables in solid wood." },
    { id:13, name:"Chair Collections",         slug:"dining-chairs",  pieces:12, badge:null,          image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80", description:"From rattan to upholstered dining chairs." },
    { id:14, name:"Sideboards & Buffets",      slug:"sideboards",     pieces:6,  badge:"new_in",      image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", description:"Storage and display for the dining room." },
    { id:15, name:"Bar & Counter Stools",      slug:"bar-stools",     pieces:8,  badge:null,          image:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80", description:"Tall stools in velvet, rattan and wood." },
  ],
  "kitchen": [
    { id:16, name:"Kitchen Island Units",      slug:"kitchen-islands",pieces:5,  badge:null,          image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80", description:"Freestanding kitchen islands in oak." },
    { id:17, name:"Open Shelving Kitchen",     slug:"kitchen-shelves",pieces:7,  badge:"new_in",      image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80", description:"Wall-mounted open shelving for kitchens." },
    { id:18, name:"Bar Stools Kitchen",        slug:"kitchen-stools", pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80", description:"Sleek counter stools for kitchen islands." },
  ],
  "office": [
    { id:19, name:"Desk Collection",           slug:"desks",          pieces:8,  badge:"best_seller", image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80", description:"Minimalist desks in walnut and oak." },
    { id:20, name:"Ergonomic Seating",         slug:"office-chairs",  pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80", description:"Supportive and beautiful office chairs." },
    { id:21, name:"Bookcase & Storage",        slug:"bookcases",      pieces:7,  badge:"new_in",      image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", description:"From floating shelves to tall bookcases." },
    { id:22, name:"Home Office Bundles",       slug:"office-bundles", pieces:4,  badge:"sale",        image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80", description:"Curated desk + chair + shelf bundles." },
  ],
  "outdoor": [
    { id:23, name:"Garden Lounge Sets",        slug:"garden-lounge",  pieces:5,  badge:"best_seller", image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700&q=80", description:"All-weather rattan lounge collections." },
    { id:24, name:"Outdoor Dining",            slug:"outdoor-dining", pieces:4,  badge:null,          image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=700&q=80", description:"Teak and aluminium outdoor dining sets." },
    { id:25, name:"Hammocks & Hanging",        slug:"hammocks",       pieces:3,  badge:"new_in",      image:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80", description:"Hanging chairs and hammock frames." },
  ],
  "kids": [
    { id:26, name:"Kids Bed Collection",       slug:"kids-beds",      pieces:7,  badge:null,          image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80", description:"Safe and beautiful beds for children." },
    { id:27, name:"Study Desks for Kids",      slug:"kids-desks",     pieces:5,  badge:"new_in",      image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80", description:"Adjustable study desks and chairs." },
    { id:28, name:"Toy & Book Storage",        slug:"kids-storage",   pieces:8,  badge:null,          image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", description:"Colourful shelves and toy boxes." },
  ],
  "hallway": [
    { id:29, name:"Console Tables",            slug:"consoles",       pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1616137422495-1e9e46e2aa1e?w=700&q=80", description:"Slim console tables for any hallway." },
    { id:30, name:"Coat Racks & Hooks",        slug:"coat-racks",     pieces:4,  badge:"new_in",      image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80", description:"Wall-mounted coat and key storage." },
    { id:31, name:"Hallway Mirrors",           slug:"mirrors",        pieces:5,  badge:null,          image:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80", description:"Statement mirrors in various shapes." },
  ],
  "bathroom": [
    { id:32, name:"Vanity Units",              slug:"vanity",         pieces:5,  badge:"best_seller", image:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=700&q=80", description:"Floating and freestanding vanity units." },
    { id:33, name:"Bathroom Storage",          slug:"bath-storage",   pieces:6,  badge:null,          image:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", description:"Sleek bathroom cabinets and shelves." },
    { id:34, name:"Bathroom Mirrors",          slug:"bath-mirrors",   pieces:4,  badge:"new_in",      image:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80", description:"Backlit and framed bathroom mirrors." },
  ],
};

const fmt = (n) => `$${Number(n).toLocaleString()}`;
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C" };

// ── COLLECTION CARD ───────────────────────────────────────────
const CollCard = memo(function CollCard({ coll, idx, accent, t }) {
  const navigate = useNavigate();
  return (
    <article
      className="rcp-card"
      style={{ animationDelay:`${idx * 60}ms` }}
      onClick={() => navigate(`/collections/${coll.slug}`)}
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
            onClick={e => { e.stopPropagation(); navigate(`/collections/${coll.slug}`); }}
          >
            {t("rooms_coll.explore")} →
          </button>
        </div>
      </div>
    </article>
  );
});


// all rooms list for the nav
const ALL_ROOMS = [
  {slug:"living-room",key:"living_room"},
  {slug:"bedroom",    key:"bedroom"},
  {slug:"dining",     key:"dining"},
  {slug:"kitchen",    key:"kitchen"},
  {slug:"office",     key:"office"},
  {slug:"outdoor",    key:"outdoor"},
  {slug:"kids",       key:"kids"},
  {slug:"hallway",    key:"hallway"},
  {slug:"bathroom",   key:"bathroom"},
];

export default function RoomCollectionsPage() {
  const { roomSlug }  = useParams();
  const { t }         = useTranslation();
  const navigate      = useNavigate();

  const meta        = ROOM_META[roomSlug] || ROOM_META["living-room"];
  const collections = ALL_MOCK_COLLECTIONS[roomSlug] || [];

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [items,      setItems]      = useState([]);

  useEffect(() => {
    window.scrollTo({ top:0 });
    setLoading(true);
    setHeroLoaded(false);

    // Real API: collectionApi.getByRoom(roomSlug).then(res => setItems(res.data))
    setTimeout(() => {
      setItems(ALL_MOCK_COLLECTIONS[roomSlug] || []);
      setLoading(false);
      setTimeout(() => setHeroLoaded(true), 80);
    }, 350);
  }, [roomSlug]);

  const accent = meta.accent;

  return (
    <>
      {/* inject accent css var */}
      <style>{`:root { --rcp-accent: ${accent}; }`}</style>
      <div className="rcp-page">
        <Navbar />

        {/* HERO */}
        <div className={"rcp-hero" + (heroLoaded?" loaded":"")}>
          <div className="rcp-hero-bg" style={{backgroundImage:`url(${meta.image})`}} />
          <div className="rcp-hero-ov" />
          <div className="rcp-hero-content">
            <div className="rcp-breadcrumb">
              <Link to="/">{t("pdp.home")}</Link>
              <span className="rcp-bc-sep">/</span>
              <Link to="/rooms">{t("rooms_page.eyebrow")}</Link>
              <span className="rcp-bc-sep">/</span>
              <span className="rcp-bc-cur">{t(`cat_list.rooms.${meta.key}`)}</span>
            </div>
            <span className="rcp-hero-tag" style={{color:accent}}>{t("rooms_coll.collections_for")}</span>
            <h1 className="rcp-hero-title" style={{color:"#fff"}}>
              <em style={{color:accent}}>{t(`cat_list.rooms.${meta.key}`)}</em>
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
            {ALL_ROOMS.map(r => (
              <Link
                key={r.slug}
                to={`/rooms/${r.slug}`}
                className={"rcp-room-tab" + (roomSlug===r.slug?" active":"")}
                style={roomSlug===r.slug ? {"--accent":accent} : {}}
              >
                {t(`cat_list.rooms.${r.key}`)}
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