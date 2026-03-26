// src/pages/public/CollectionDetailPage.jsx
// ═══════════════════════════════════════════════════════════════
//  Route: /collections/:id
//
//  İstifadəçinin 2 seçimi:
//    1. "Bütün kolleksiyanı al"  → hamısı birdəfəyə səbətə
//    2. "İçindən seç"            → checkbox ilə istədiyi məhsulları
//                                  seçib ayrıca səbətə atır
//
//  Real API:
//    collectionApi.getById(id)          → kolleksiya + məhsullar
//    cartApi.addItem(productId, qty)    → tək məhsul
//    cartApi.addMultiple([{id, qty}])   → çoxlu məhsul (bulk)
// ═══════════════════════════════════════════════════════════════

import {
  useState, useEffect, useCallback,
  useMemo, useRef, memo
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import Navbar        from "../../components/common/Navbar";
// import Footer        from "../../components/common/Footer";

// ─────────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────────
const MOCK_COLLECTION = {
  id:          1,
  name:        "Nordic Calm",
  slug:        "nordic-calm",
  tagline:     "Stillness in every corner.",
  description: `The Nordic Calm collection is a carefully curated ensemble of living room essentials,
united by a shared language of natural materials, muted tones and understated craft.
Each piece is designed to coexist — the sofa's linen weave echoes the oak grain of
the shelf, while the arc lamp casts a warmth that ties the room together.

Designed for those who believe home should feel like an exhale.`,
  image:       "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&q=85",
  total_price:      6510,
  discounted_price: 5490,
  discount_pct:     16,
  products: [
    {
      id: 1, name: "Linen 3-Seater Sofa",  slug: "linen-3-seater",
      price: 1890, color: "Oat Linen", color_hex: "#E8DCC8",
      in_stock: true,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80",
      ],
    },
    {
      id: 2, name: "Solid Oak Coffee Table", slug: "aria-coffee-table",
      price: 940, color: "Natural Oak", color_hex: "#C9A070",
      in_stock: true,
      images: [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80",
      ],
    },
    {
      id: 3, name: "Boucle Armchair",        slug: "ember-armchair",
      price: 1200, color: "Ivory Boucle", color_hex: "#F5EDD8",
      in_stock: true,
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&q=80",
      ],
    },
    {
      id: 4, name: "Arc Floor Lamp",          slug: "arc-floor-lamp",
      price: 380, color: "Brass / Linen", color_hex: "#C9A84C",
      in_stock: true,
      images: [
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80",
      ],
    },
    {
      id: 5, name: "Walnut Side Table",       slug: "walnut-side-table",
      price: 520, color: "Dark Walnut", color_hex: "#5C3D2E",
      in_stock: false,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
      ],
    },
    {
      id: 6, name: "Linen Cushion Set (×2)",  slug: "linen-cushion-set",
      price: 120, color: "Sage & Oat", color_hex: "#7A9E7E",
      in_stock: true,
      images: [
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80",
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString()}`;

function Stars({ n }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {Array.from({ length:5 }).map((_,i) => (
        <span key={i} style={{ fontSize:11, color: i<n?"#C9A84C":"#D0CAC2" }}>★</span>
      ))}
    </span>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes cdHeroIn   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cdFadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cdReveal   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cdShimmer  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes cdBounce   { 0%{transform:scale(1)} 35%{transform:scale(.9)} 70%{transform:scale(1.08)} 100%{transform:scale(1)} }
  @keyframes cdCheckIn  { from{transform:scale(0) rotate(-20deg)} to{transform:scale(1) rotate(0)} }
  @keyframes cdToast    { 0%{opacity:0;transform:translateY(18px)} 12%,82%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-8px)} }
  @keyframes cdPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(122,158,126,.5)} 50%{box-shadow:0 0 0 10px rgba(122,158,126,0)} }
  @keyframes cdSlide    { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cdStickyIn { from{transform:translateY(100%)} to{transform:translateY(0)} }

  .reveal       { opacity:0; transform:translateY(22px); transition:opacity .7s cubic-bezier(.25,.46,.45,.94), transform .7s cubic-bezier(.25,.46,.45,.94); }
  .reveal.visible { opacity:1; transform:translateY(0); }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:4px }
  ::-webkit-scrollbar-thumb { background:#C8DBC9; border-radius:2px }
  ::selection { background:#C8DBC9; color:#1C1C1C }
  img { display:block; }

  .cd-page { font-family:'DM Sans',sans-serif; background:#fff; color:#1C1C1C; min-height:100vh; padding-bottom:120px; }

  /* ── HERO ── */
  .cd-hero { position:relative; height:88vh; min-height:560px; overflow:hidden; display:flex; align-items:flex-end; margin-top:72px; }
  .cd-hero-bg { position:absolute; inset:0; background-size:cover; background-position:center; transform:scale(1.05); animation:cdHeroIn 1.4s cubic-bezier(.25,.46,.45,.94) forwards; }
  .cd-hero-ov { position:absolute; inset:0; background:linear-gradient(to top, rgba(15,15,15,.82) 0%, rgba(15,15,15,.2) 55%, transparent 100%); }
  .cd-hero-ct { position:relative; z-index:2; padding:0 80px 72px; width:100%; display:flex; align-items:flex-end; justify-content:space-between; gap:60px; flex-wrap:wrap; animation:cdHeroIn .9s cubic-bezier(.25,.46,.45,.94) .3s both; }

  .cd-hero-left {}
  .cd-hero-bread { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
  .cd-hero-bread a { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.44); text-decoration:none; transition:color .3s; }
  .cd-hero-bread a:hover { color:#fff; }
  .cd-hero-bread-sep { color:rgba(255,255,255,.22); }
  .cd-hero-bread-cur { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.78); }

  .cd-hero-tag { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#C8DBC9; margin-bottom:12px; display:flex; align-items:center; gap:10px; }
  .cd-hero-tag::before { content:''; display:block; width:24px; height:1px; background:#C8DBC9; flex-shrink:0; }
  .cd-hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(52px,7.5vw,110px); font-weight:300; color:#fff; line-height:.95; letter-spacing:-1.5px; }
  .cd-hero-h1 em { font-style:italic; color:#C8DBC9; }
  .cd-hero-tagline { font-size:17px; color:rgba(255,255,255,.6); margin-top:18px; font-weight:300; font-style:italic; font-family:'Cormorant Garamond',serif; }

  /* Hero price card */
  .cd-hero-price-card { background:rgba(255,255,255,.1); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.15); padding:32px 36px; flex-shrink:0; min-width:260px; }
  .cd-hero-price-label { font-size:9px; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:12px; }
  .cd-hero-price-full  { font-size:15px; color:rgba(255,255,255,.4); text-decoration:line-through; margin-bottom:6px; }
  .cd-hero-price-disc  { font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:#fff; line-height:1; }
  .cd-hero-save-tag    { display:inline-block; background:#7A9E7E; color:#fff; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; padding:4px 12px; margin-top:10px; }
  .cd-hero-items-count { font-size:12px; color:rgba(255,255,255,.5); margin-top:14px; }

  /* ── SCROLL indicator ── */
  .cd-scroll-hint { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); z-index:2; display:flex; flex-direction:column; align-items:center; gap:8px; animation:cdFadeUp 1s ease 1.2s both; }
  .cd-scroll-hint span { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.4); }
  .cd-scroll-line { width:1px; height:44px; background:rgba(255,255,255,.2); position:relative; overflow:hidden; }
  .cd-scroll-line::after { content:''; position:absolute; top:-100%; left:0; width:100%; height:100%; background:#C8DBC9; animation:scrollDrop 1.6s ease-in-out 1.2s infinite; }
  @keyframes scrollDrop { 0%{top:-100%} 100%{top:100%} }

  /* ── INFO BAND ── */
  .cd-info-band { background:#F7F3EE; padding:48px 80px; border-bottom:1px solid #EDE7DC; }
  .cd-info-band-inner { display:grid; grid-template-columns:1fr auto; gap:60px; align-items:start; max-width:1200px; }
  .cd-description { font-size:16px; color:#4A4A4A; line-height:1.9; white-space:pre-line; font-weight:300; max-width:640px; }
  .cd-info-stats { display:flex; flex-direction:column; gap:20px; }
  .cd-stat { text-align:right; }
  .cd-stat-n { font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:300; color:#7A9E7E; line-height:1; display:block; }
  .cd-stat-l { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#A8A8A8; }

  /* ── MODE SELECTOR ── */
  .cd-mode-wrap { padding:48px 80px 0; }
  .cd-mode-heading { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; color:#1C1C1C; margin-bottom:6px; }
  .cd-mode-heading em { font-style:italic; color:#7A9E7E; }
  .cd-mode-sub { font-size:14px; color:#6B6B6B; margin-bottom:28px; }
  .cd-mode-tabs { display:flex; gap:0; border:1px solid #E5DDD4; width:fit-content; margin-bottom:0; }
  .cd-mode-tab  { padding:14px 32px; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; background:#fff; border:none; cursor:pointer; color:#6B6B6B; font-family:'DM Sans',sans-serif; transition:background .3s, color .3s; display:flex; align-items:center; gap:10px; }
  .cd-mode-tab.active { background:#1C1C1C; color:#fff; }
  .cd-mode-tab:not(.active):hover { background:#F7F3EE; }
  .cd-mode-tab-icon { font-size:16px; }
  .cd-mode-tab-badge { background:#7A9E7E; color:#fff; font-size:10px; padding:2px 8px; border-radius:10px; margin-left:4px; }
  .cd-mode-tab.active .cd-mode-tab-badge { background:rgba(255,255,255,.2); }

  /* ── PRODUCTS SECTION ── */
  .cd-products-wrap { padding:36px 80px 80px; }

  /* ── BULK MODE  (bütün kolleksiya) ── */
  .cd-bulk-summary { background:#F7F3EE; padding:28px 32px; margin-bottom:32px; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; border-left:3px solid #7A9E7E; animation:cdSlide .4s ease both; }
  .cd-bulk-text {}
  .cd-bulk-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:#1C1C1C; margin-bottom:4px; }
  .cd-bulk-detail { font-size:13px; color:#6B6B6B; }
  .cd-bulk-detail strong { color:#1C1C1C; }
  .cd-bulk-price-group { display:flex; align-items:baseline; gap:14px; flex-shrink:0; }
  .cd-bulk-price { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:300; color:#1C1C1C; }
  .cd-bulk-old   { font-size:18px; color:#A8A8A8; text-decoration:line-through; }
  .cd-bulk-save  { font-size:11px; letter-spacing:1px; text-transform:uppercase; background:#D4714A; color:#fff; padding:4px 10px; }

  /* ── SELECT MODE (fərdi seçim) ── */
  .cd-select-bar { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:32px; padding:20px 28px; border:1.5px solid #E5DDD4; background:#fff; animation:cdSlide .4s ease both; }
  .cd-select-bar-left { display:flex; align-items:center; gap:20px; }
  .cd-select-all-btn { display:flex; align-items:center; gap:8px; background:none; border:1px solid #E5DDD4; padding:9px 18px; font-size:11px; letter-spacing:1.3px; text-transform:uppercase; color:#4A4A4A; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .cd-select-all-btn:hover { border-color:#7A9E7E; color:#7A9E7E; }
  .cd-select-count { font-size:13px; color:#6B6B6B; }
  .cd-select-count strong { color:#1C1C1C; font-weight:600; }
  .cd-select-total { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; color:#1C1C1C; }

  /* ── PRODUCT GRID ── */
  .cd-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }

  /* ── PRODUCT CARD ── */
  .cd-card { background:#fff; position:relative; transition:box-shadow .4s; cursor:pointer; }
  .cd-card:hover { box-shadow:0 16px 48px rgba(28,28,28,.09); }
  .cd-card.selected { box-shadow:0 0 0 2px #7A9E7E, 0 16px 48px rgba(122,158,126,.15); }
  .cd-card.oos { opacity:.65; }

  /* Selection checkbox (top-left) */
  .cd-card-check { position:absolute; top:14px; left:14px; z-index:10; width:26px; height:26px; border:2px solid rgba(255,255,255,.8); border-radius:4px; background:rgba(255,255,255,.85); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .25s; }
  .cd-card-check.checked { background:#7A9E7E; border-color:#7A9E7E; }
  .cd-card-check-icon { font-size:14px; color:#fff; animation:cdCheckIn .25s cubic-bezier(.34,1.56,.64,1) both; display:none; }
  .cd-card-check.checked .cd-card-check-icon { display:block; }

  /* Image */
  .cd-card-img-wrap { position:relative; aspect-ratio:4/5; overflow:hidden; background:#F7F3EE; }
  .cd-card-img { width:100%; height:100%; object-fit:cover; transition:transform .7s cubic-bezier(.25,.46,.45,.94); }
  .cd-card:hover .cd-card-img { transform:scale(1.06); }

  /* OOS overlay */
  .cd-card-oos { position:absolute; inset:0; background:rgba(255,255,255,.55); display:flex; align-items:center; justify-content:center; z-index:3; }
  .cd-card-oos span { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#6B6B6B; background:#fff; padding:8px 16px; border:1px solid #E5DDD4; }

  /* Image hover overlay */
  .cd-card-img-hover { position:absolute; inset:0; background:rgba(20,20,20,.42); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .35s; z-index:2; }
  .cd-card:hover .cd-card-img-hover { opacity:1; }
  .cd-card-view-btn { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#fff; border:1px solid rgba(255,255,255,.6); padding:10px 22px; background:transparent; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; }
  .cd-card-view-btn:hover { background:rgba(255,255,255,.15); }

  /* Card body */
  .cd-card-body { padding:18px 16px 20px; }
  .cd-card-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; color:#1C1C1C; margin-bottom:10px; transition:color .3s; }
  .cd-card:hover .cd-card-name { color:#7A9E7E; }
  .cd-card-color-row { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .cd-card-color-dot { width:14px; height:14px; border-radius:50%; border:1.5px solid rgba(0,0,0,.08); flex-shrink:0; }
  .cd-card-color-name { font-size:12px; color:#6B6B6B; }
  .cd-card-foot { display:flex; align-items:center; justify-content:space-between; }
  .cd-card-price { font-size:17px; font-weight:500; color:#1C1C1C; }
  .cd-card-oos-label { font-size:11px; color:#A8A8A8; letter-spacing:.5px; }

  /* Individual add to cart (select mode) */
  .cd-card-add { width:36px; height:36px; border:1.5px solid #E5DDD4; background:#fff; font-size:18px; color:#1C1C1C; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .3s cubic-bezier(.34,1.56,.64,1); flex-shrink:0; }
  .cd-card-add:hover:not(:disabled) { background:#1C1C1C; color:#fff; border-color:#1C1C1C; transform:scale(1.1); }
  .cd-card-add:disabled { opacity:.3; cursor:not-allowed; }
  .cd-card-add.adding { background:#7A9E7E; border-color:#7A9E7E; color:#fff; animation:cdBounce .4s ease; }

  /* ── STICKY CART BAR ── */
  .cd-sticky-bar { position:fixed; bottom:0; left:0; right:0; z-index:100; background:#1C1C1C; padding:0 80px; display:flex; align-items:center; justify-content:space-between; gap:24px; height:80px; transform:translateY(100%); transition:transform .4s cubic-bezier(.25,.46,.45,.94); border-top:1px solid rgba(255,255,255,.1); }
  .cd-sticky-bar.visible { transform:translateY(0); animation:cdStickyIn .4s cubic-bezier(.25,.46,.45,.94) both; }
  .cd-sticky-bar-left { display:flex; align-items:center; gap:24px; }
  .cd-sticky-items { display:flex; gap:8px; align-items:center; overflow:hidden; max-width:320px; }
  .cd-sticky-thumb { width:40px; height:40px; overflow:hidden; border:1.5px solid rgba(255,255,255,.15); flex-shrink:0; }
  .cd-sticky-thumb img { width:100%; height:100%; object-fit:cover; }
  .cd-sticky-more { width:40px; height:40px; background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; font-size:11px; color:rgba(255,255,255,.6); flex-shrink:0; }
  .cd-sticky-info { }
  .cd-sticky-count { font-size:12px; color:rgba(255,255,255,.5); margin-bottom:2px; }
  .cd-sticky-total { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:300; color:#fff; }
  .cd-sticky-bar-right { display:flex; align-items:center; gap:12px; }
  .cd-sticky-clear { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.4); background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:color .3s; white-space:nowrap; }
  .cd-sticky-clear:hover { color:rgba(255,255,255,.8); }
  .cd-sticky-cart-btn { padding:0 40px; height:52px; background:#7A9E7E; color:#fff; font-size:12px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .3s; white-space:nowrap; flex-shrink:0; }
  .cd-sticky-cart-btn:hover { background:#5C8A62; }
  .cd-sticky-cart-btn.adding { background:#5C8A62; }

  /* Bulk add btn */
  .cd-bulk-add-btn { padding:16px 48px; background:#7A9E7E; color:#fff; font-size:12px; letter-spacing:1.8px; text-transform:uppercase; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .35s, transform .35s, box-shadow .35s; display:inline-flex; align-items:center; gap:12px; flex-shrink:0; }
  .cd-bulk-add-btn:hover { background:#5C8A62; transform:translateY(-2px); box-shadow:0 12px 32px rgba(92,138,98,.3); }
  .cd-bulk-add-btn.adding { background:#5C8A62; animation:cdPulse 1s ease infinite; }
  .cd-bulk-add-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

  /* ── TOAST ── */
  .cd-toast { position:fixed; bottom:100px; right:32px; z-index:500; background:#1C1C1C; color:#fff; padding:14px 22px; font-size:13px; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px; animation:cdToast 3s ease forwards; box-shadow:0 8px 24px rgba(28,28,28,.3); max-width:360px; }
  .cd-toast-icon { color:#7A9E7E; font-size:16px; flex-shrink:0; }

  /* ── ERROR / SKELETON ── */
  .cd-error { display:flex; align-items:center; gap:14px; background:#FEF2EE; border-left:3px solid #D4714A; padding:18px 24px; margin:40px 80px; }
  .cd-retry { background:none; border:1px solid #D4714A; color:#D4714A; padding:7px 16px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s; }
  .cd-retry:hover { background:#D4714A; color:#fff; }
  .cd-skeleton { padding:112px 80px 80px; }
  .cd-sk-hero { height:88vh; min-height:560px; margin-top:72px; background:#F7F3EE; animation:cdShimmer 1.5s ease-in-out infinite; }
  .cd-sk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:40px 80px; }
  .cd-sk-card { aspect-ratio:4/5; background:#F7F3EE; animation:cdShimmer 1.5s ease-in-out infinite; }

  /* Responsive */
  @media(max-width:1100px) { .cd-grid { grid-template-columns:repeat(2,1fr); } .cd-sk-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:900px)  {
    .cd-hero-ct,.cd-info-band,.cd-mode-wrap,.cd-products-wrap { padding-left:24px; padding-right:24px; }
    .cd-hero-ct { flex-direction:column; align-items:flex-start; padding-bottom:40px; }
    .cd-hero-price-card { width:100%; }
    .cd-info-band-inner { grid-template-columns:1fr; }
    .cd-info-stats { flex-direction:row; flex-wrap:wrap; gap:24px; }
    .cd-stat { text-align:left; }
    .cd-sticky-bar { padding:0 24px; height:70px; }
    .cd-sticky-items { max-width:160px; }
    .cd-sk-hero { margin-top:72px; }
    .cd-sk-grid,.cd-error { padding-left:24px; padding-right:24px; margin-left:0; margin-right:0; }
  }
  @media(max-width:640px)  {
    .cd-grid { grid-template-columns:1fr; }
    .cd-sk-grid { grid-template-columns:1fr; }
    .cd-bulk-summary { flex-direction:column; align-items:flex-start; }
    .cd-select-bar { flex-direction:column; align-items:flex-start; }
    .cd-sticky-bar { height:auto; padding:16px 24px; flex-direction:column; align-items:stretch; gap:12px; }
    .cd-sticky-cart-btn { padding:14px; text-align:center; }
    .cd-toast { left:16px; right:16px; bottom:auto; top:20px; }
    .cd-mode-tabs { flex-direction:column; width:100%; }
  }
`;

// ─────────────────────────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product, mode, isSelected, onToggleSelect, addingId, onAddSingle, idx
}) {
  const navigate = useNavigate();

  const handleCheck = useCallback((e) => {
    e.stopPropagation();
    if (!product.in_stock) return;
    onToggleSelect(product.id);
  }, [product, onToggleSelect]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    navigate(`/products/${product.slug}`);
  }, [product.slug, navigate]);

  return (
    <article
      className={`cd-card reveal${isSelected ? " selected" : ""}${!product.in_stock ? " oos" : ""}`}
      style={{ transitionDelay: `${(idx % 6) * 70}ms` }}
    >
      {/* Select checkbox (only in select mode) */}
      {mode === "select" && (
        <div
          className={`cd-card-check${isSelected ? " checked" : ""}`}
          onClick={handleCheck}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Select ${product.name}`}
        >
          <span className="cd-card-check-icon">✓</span>
        </div>
      )}

      {/* Image */}
      <div className="cd-card-img-wrap" onClick={handleView}>
        <img
          className="cd-card-img"
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
        />
        {!product.in_stock && (
          <div className="cd-card-oos"><span>Out of Stock</span></div>
        )}
        <div className="cd-card-img-hover">
          <button className="cd-card-view-btn" onClick={handleView}>View Details</button>
        </div>
      </div>

      {/* Body */}
      <div className="cd-card-body">
        <h3 className="cd-card-name" onClick={handleView}>{product.name}</h3>
        <div className="cd-card-color-row">
          <span className="cd-card-color-dot" style={{ background: product.color_hex }} />
          <span className="cd-card-color-name">{product.color}</span>
        </div>
        <div className="cd-card-foot">
          <span className="cd-card-price">{fmt(product.price)}</span>

          {mode === "select" ? (
            /* Select mode: big checkbox feel — click card to toggle */
            product.in_stock ? (
              <button
                className={`cd-card-add${isSelected ? " adding" : ""}`}
                onClick={handleCheck}
                aria-label={isSelected ? "Deselect" : "Select"}
              >
                {isSelected ? "✓" : "+"}
              </button>
            ) : (
              <span className="cd-card-oos-label">Out of Stock</span>
            )
          ) : (
            /* Bulk mode: individual add button */
            product.in_stock ? (
              <button
                className={`cd-card-add${addingId === product.id ? " adding" : ""}`}
                disabled={addingId === product.id}
                onClick={e => { e.stopPropagation(); onAddSingle(product); }}
                aria-label="Add to cart"
              >
                {addingId === product.id ? "✓" : "+"}
              </button>
            ) : (
              <span className="cd-card-oos-label">Out of Stock</span>
            )
          )}
        </div>
      </div>
    </article>
  );
});

// ─────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────
export default function CollectionDetailPage() {
  const { id }       = useParams();
  const { t }        = useTranslation();
  const navigate     = useNavigate();

  // ── Data ──────────────────────────────────────────────────
  const [collection,  setCollection]  = useState(null);
  const [loading,     setLoading]     = useState(true);
//   const [error,       setError]       = useState(null);

  // ── Mode: "bulk" | "select" ────────────────────────────────
  const [mode,        setMode]        = useState("bulk");

  // ── Selection (select mode) ────────────────────────────────
  const [selected,    setSelected]    = useState(new Set());

  // ── Cart state ─────────────────────────────────────────────
  const [bulkAdding,  setBulkAdding]  = useState(false);
  const [selAdding,   setSelAdding]   = useState(false);
  const [singleAddId, setSingleAddId] = useState(null);
  const [toast,       setToast]       = useState(null); // { text }

  const toastTimer = useRef(null);

  useScrollReveal();

  // ── Fetch ─────────────────────────────────────────────────
//   const fetchCollection = useCallback(() => {
//     setLoading(true);
//     setError(null);

//     // collectionApi.getById(id)
//     //   .then(res => setCollection(res.data))
//     //   .catch(err => { if (err.response?.status === 404) navigate("/collections"); else setError(err.userMessage); })
//     //   .finally(() => setLoading(false));

//     setTimeout(() => {
//       setCollection(MOCK_COLLECTION);
//       setLoading(false);
//     }, 500);

//     window.scrollTo({ top: 0 });
//   }, [id]);

const fetchCollection = useCallback(() => {
  setLoading(true);

  setTimeout(() => {
    setCollection(MOCK_COLLECTION);
    setLoading(false);
  }, 300);

}, []);

  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  // ── Toast helper ───────────────────────────────────────────
  const showToast = useCallback((text) => {
    clearTimeout(toastTimer.current);
    setToast({ text });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Selection handlers ────────────────────────────────────
  const toggleSelect = useCallback((productId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!collection) return;
    const inStockIds = collection.products
      .filter(p => p.in_stock)
      .map(p => p.id);
    setSelected(prev =>
      prev.size === inStockIds.length ? new Set() : new Set(inStockIds)
    );
  }, [collection]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // ── Selected products derived data ────────────────────────
  const selectedProducts = useMemo(() => {
    if (!collection) return [];
    return collection.products.filter(p => selected.has(p.id));
  }, [collection, selected]);

  const selectedTotal = useMemo(() =>
    selectedProducts.reduce((sum, p) => sum + p.price, 0),
    [selectedProducts]
  );

  // ── Bulk add to cart ──────────────────────────────────────
//   const handleBulkAdd = useCallback(async () => {
//     if (!collection || bulkAdding) return;
//     setBulkAdding(true);
//     try {
//       const inStockProducts = collection.products.filter(p => p.in_stock);

//       // Real API: cartApi.addMultiple(items)
//       // Fallback: hər biri üçün ayrıca
//       await Promise.all(
//         inStockProducts.map(p => cartApi.addItem(p.id, 1))
//       );

//       showToast(`${inStockProducts.length} items added to cart ✓`);
//     } catch {
//       showToast("Something went wrong. Please try again.");
//     } finally {
//       setTimeout(() => setBulkAdding(false), 1200);
//     }
//   }, [collection, bulkAdding, showToast]);

//   // ── Selected add to cart ──────────────────────────────────
//   const handleSelectedAdd = useCallback(async () => {
//     if (selected.size === 0 || selAdding) return;
//     setSelAdding(true);
//     try {
//       await Promise.all(
//         Array.from(selected).map(pid => cartApi.addItem(pid, 1))
//       );
//       showToast(`${selected.size} items added to cart ✓`);
//       setSelected(new Set());
//     } catch {
//       showToast("Something went wrong. Please try again.");
//     } finally {
//       setTimeout(() => setSelAdding(false), 1200);
//     }
//   }, [selected, selAdding, showToast]);

  // ── Single product add (bulk mode card button) ─────────────
//   const handleSingleAdd = useCallback(async (product) => {
//     if (singleAddId === product.id) return;
//     setSingleAddId(product.id);
//     try {
//       await cartApi.addItem(product.id, 1);
//       showToast(`${product.name} added to cart ✓`);
//     } catch {}
//     setTimeout(() => setSingleAddId(null), 1400);
//   }, [singleAddId, showToast]);

const handleBulkAdd = useCallback(async () => {
  showToast("Mock: All items added to cart ✓");
}, [showToast]);

const handleSingleAdd = useCallback(async (product) => {
  showToast(`${product.name} added (mock) ✓`);
}, [showToast]);

const handleSelectedAdd = useCallback(async () => {
  showToast(`Mock: ${selected.size} items added ✓`);
  setSelected(new Set());
}, [selected, showToast]);
  // ── In-stock products ─────────────────────────────────────
  const inStockCount = useMemo(() =>
    collection?.products.filter(p => p.in_stock).length ?? 0,
    [collection]
  );

  const allInStockSelected = useMemo(() =>
    inStockCount > 0 && selected.size === inStockCount,
    [inStockCount, selected]
  );

  // ── Sticky bar visibility ─────────────────────────────────
  // Select mode → show when something is selected
  const stickyVisible = mode === "select" && selected.size > 0;

  // ─────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="cd-page">
        {/* <Navbar /> */}
        <div className="cd-skeleton">
          <div className="cd-sk-hero" />
          <div className="cd-sk-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cd-sk-card" style={{ animationDelay:`${i*.1}s` }} />
            ))}
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </>
  );

//   if (error) return (
//     <>
//       <style>{CSS}</style>
//       <div className="cd-page">
//         <Navbar />
//         <div className="cd-error" style={{ marginTop:80 }}>
//           <span>⚠️</span>
//           <p style={{ flex:1, fontSize:14 }}>{error}</p>
//           <button className="cd-retry" onClick={fetchCollection}>Retry</button>
//         </div>
//         <Footer />
//       </div>
//     </>
//   );

  if (!collection) return null;

  const saveAmount = collection.total_price - collection.discounted_price;

  return (
    <>
      <style>{CSS}</style>
      <div className="cd-page">
        {/* <Navbar /> */}

        {/* ── HERO ── */}
        <div className="cd-hero">
          <div className="cd-hero-bg" style={{ backgroundImage:`url(${collection.image})` }} />
          <div className="cd-hero-ov" />
          <div className="cd-hero-ct">
            <div className="cd-hero-left">
              <div className="cd-hero-bread">
                <Link to="/">Home</Link>
                <span className="cd-hero-bread-sep">/</span>
                <Link to="/collections">Collections</Link>
                <span className="cd-hero-bread-sep">/</span>
                {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
                <span className="cd-hero-bread-cur">{collection.name}</span>
              </div>
              <div className="cd-hero-tag">Complete Collection</div>
              <h1 className="cd-hero-h1">{collection.name}</h1>
              {collection.tagline && (
                <p className="cd-hero-tagline">"{collection.tagline}"</p>
              )}
            </div>

            {/* Price card */}
            <div className="cd-hero-price-card">
              <p className="cd-hero-price-label">Collection Price</p>
              <p className="cd-hero-price-full">{fmt(collection.total_price)}</p>
              <p className="cd-hero-price-disc">{fmt(collection.discounted_price)}</p>
              {collection.discount_pct > 0 && (
                <span className="cd-hero-save-tag">
                  Save {collection.discount_pct}% · {fmt(saveAmount)} off
                </span>
              )}
              <p className="cd-hero-items-count">
                {collection.products.length} pieces · {inStockCount} in stock
              </p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="cd-scroll-hint">
            <span>Scroll</span>
            <div className="cd-scroll-line" />
          </div>
        </div>

        {/* ── INFO BAND ── */}
        <div className="cd-info-band">
          <div className="cd-info-band-inner">
            {/* DB-dən — TƏRCÜMƏ OLUNMUR */}
            <p className="cd-description reveal">{collection.description}</p>
            <div className="cd-info-stats">
              <div className="cd-stat">
                <span className="cd-stat-n">{collection.products.length}</span>
                <span className="cd-stat-l">Pieces</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-n">{collection.discount_pct}%</span>
                <span className="cd-stat-l">Bundle saving</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-n">{fmt(saveAmount)}</span>
                <span className="cd-stat-l">You save</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODE SELECTOR ── */}
        <div className="cd-mode-wrap reveal">
          <h2 className="cd-mode-heading">
            Choose <em>how you shop</em>
          </h2>
          <p className="cd-mode-sub">
            Take the whole room or handpick only what you need.
          </p>
          <div className="cd-mode-tabs">
            {/* BULK MODE */}
            <button
              className={`cd-mode-tab${mode === "bulk" ? " active" : ""}`}
              onClick={() => { setMode("bulk"); clearSelection(); }}
            >
              <span className="cd-mode-tab-icon">🛍</span>
              Full Collection
              {mode === "bulk" && (
                <span className="cd-mode-tab-badge">{fmt(collection.discounted_price)}</span>
              )}
            </button>

            {/* SELECT MODE */}
            <button
              className={`cd-mode-tab${mode === "select" ? " active" : ""}`}
              onClick={() => setMode("select")}
            >
              <span className="cd-mode-tab-icon">☑</span>
              Pick & Choose
              {mode === "select" && selected.size > 0 && (
                <span className="cd-mode-tab-badge">{selected.size} selected</span>
              )}
            </button>
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <div className="cd-products-wrap">

          {/* ── BULK MODE summary + button ── */}
          {mode === "bulk" && (
            <div className="cd-bulk-summary">
              <div className="cd-bulk-text">
                <h3 className="cd-bulk-title">Add the complete collection</h3>
                <p className="cd-bulk-detail">
                  All{" "}
                  <strong>{inStockCount} in-stock pieces</strong>{" "}
                  added at the bundled price.
                  {inStockCount < collection.products.length && (
                    <> · {collection.products.length - inStockCount} item(s) currently out of stock are excluded.</>
                  )}
                </p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                <div className="cd-bulk-price-group">
                  {collection.total_price !== collection.discounted_price && (
                    <span className="cd-bulk-old">{fmt(collection.total_price)}</span>
                  )}
                  <span className="cd-bulk-price">{fmt(collection.discounted_price)}</span>
                  {saveAmount > 0 && (
                    <span className="cd-bulk-save">−{fmt(saveAmount)}</span>
                  )}
                </div>
                <button
                  className={`cd-bulk-add-btn${bulkAdding ? " adding" : ""}`}
                  disabled={bulkAdding || inStockCount === 0}
                  onClick={handleBulkAdd}
                >
                  {bulkAdding
                    ? "Added to Cart ✓"
                    : `Add All ${inStockCount} Items →`}
                </button>
              </div>
            </div>
          )}

          {/* ── SELECT MODE bar ── */}
          {mode === "select" && (
            <div className="cd-select-bar">
              <div className="cd-select-bar-left">
                <button className="cd-select-all-btn" onClick={selectAll}>
                  {allInStockSelected ? "☑ Deselect All" : "☐ Select All"}
                </button>
                <span className="cd-select-count">
                  <strong>{selected.size}</strong> of {inStockCount} selected
                </span>
              </div>
              {selectedTotal > 0 && (
                <span className="cd-select-total">{fmt(selectedTotal)}</span>
              )}
            </div>
          )}

          {/* ── PRODUCT GRID ── */}
          <div className="cd-grid">
            {collection.products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                mode={mode}
                isSelected={selected.has(product.id)}
                onToggleSelect={toggleSelect}
                addingId={singleAddId}
                onAddSingle={handleSingleAdd}
                idx={idx}
              />
            ))}
          </div>
        </div>

        {/* ── STICKY CART BAR (select mode, when items selected) ── */}
        <div className={`cd-sticky-bar${stickyVisible ? " visible" : ""}`}>
          <div className="cd-sticky-bar-left">
            {/* Thumbnail previews */}
            <div className="cd-sticky-items">
              {selectedProducts.slice(0, 4).map(p => (
                <div key={p.id} className="cd-sticky-thumb">
                  <img src={p.images[0]} alt={p.name} />
                </div>
              ))}
              {selectedProducts.length > 4 && (
                <div className="cd-sticky-more">+{selectedProducts.length - 4}</div>
              )}
            </div>
            <div className="cd-sticky-info">
              <p className="cd-sticky-count">{selected.size} item{selected.size !== 1 ? "s" : ""} selected</p>
              <p className="cd-sticky-total">{fmt(selectedTotal)}</p>
            </div>
          </div>

          <div className="cd-sticky-bar-right">
            <button className="cd-sticky-clear" onClick={clearSelection}>
              Clear selection
            </button>
            <button
              className={`cd-sticky-cart-btn${selAdding ? " adding" : ""}`}
              disabled={selAdding || selected.size === 0}
              onClick={handleSelectedAdd}
            >
              {selAdding
                ? "Added ✓"
                : `Add ${selected.size} Item${selected.size !== 1 ? "s" : ""} to Cart →`}
            </button>
          </div>
        </div>

        {/* ── TOAST ── */}
        {toast && (
          <div className="cd-toast">
            <span className="cd-toast-icon">✓</span>
            <span>{toast.text}</span>
          </div>
        )}

        {/* <Footer /> */}
      </div>
    </>
  );
}
