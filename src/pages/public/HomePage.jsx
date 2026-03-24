// src/pages/public/HomePage.jsx
// ═══════════════════════════════════════════════════════════════
//  Ana Səhifə
//
//  Bölmələr (yuxarıdan aşağı):
//  1. Hero Slider        ← heroApi.getHeroSlides()
//  2. Kampaniyalar       ← campaignApi.getActiveCampaigns()
//  3. Öne çıxan məhsullar← productApi.getFeaturedProducts()
//  4. Otaq Kateqoriyaları← categoryApi.getRoomCategories()
//  5. Kolleksiyalar      ← collectionApi.getFeaturedCollections()
//  6. Niyə bizi seçirsiniz — statik (i18n)
//  7. CTA Banner          — statik (i18n)
//  8. Newsletter          — statik (i18n)
//
//  Bütün API çağırışları bu faylın altındakı custom hook-larda.
//  DB-dən gələn mətnlər (ad, açıqlama, qiymət) TƏRCÜMƏ OLUNMUR.
//  Yalnız statik UI mətnlər t() ilə tərcümə olunur.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { MOCK_SLIDES } from "../../components/mockdatas";

// ── Components ────────────────────────────────────────────────
// import Navbar          from "@/components/common/Navbar";        // App.jsx-də qlobal render olunur
// import Footer          from "@/components/common/Footer";        // App.jsx-də qlobal render olunur

// ── API (qoşulduqda bu import-ları aktivləşdirin) ─────────────
// import heroApi         from "@/api/heroApi";
// import campaignApi     from "@/api/campaignApi";
// import productApi      from "@/api/productApi";
// import categoryApi     from "@/api/categoryApi";
// import collectionApi   from "@/api/collectionApi";


// ─────────────────────────────────────────────────────────────
//  CUSTOM HOOKS  (real API-ya keçid üçün yalnız buranı dəyişin)
// ─────────────────────────────────────────────────────────────

function useHeroSlides() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // ── Real API: ──
    // heroApi.getHeroSlides()
    //   .then(res => { if(!cancelled) setData(res.data); })
    //   .catch(err => { if(!cancelled) setError(err.message); })
    //   .finally(() => { if(!cancelled) setLoading(false); });

    // ── Mock (sil): ──
    const t = setTimeout(() => {
      if (!cancelled) { setData(MOCK_SLIDES); setLoading(false); }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  return { data, loading, error };
}

function useActiveCampaigns() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    // campaignApi.getActiveCampaigns()
    //   .then(res => { if(!cancelled) setData(res.data); })
    //   .catch(err => { if(!cancelled) setError(err.message); })
    //   .finally(() => { if(!cancelled) setLoading(false); });

    const t = setTimeout(() => {
      if (!cancelled) { setData(MOCK_CAMPAIGNS); setLoading(false); }
    }, 700);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  return { data, loading, error };
}

function useFeaturedProducts() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    // productApi.getFeaturedProducts({ limit: 8 })
    //   .then(res => setData(res.data))
    //   .catch(err => setError(err.message))
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      setData(MOCK_FEATURED_PRODUCTS);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

function useRoomCategories() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    // categoryApi.getRoomCategories()
    //   .then(res => { if(!cancelled) setData(res.data); })
    //   .catch(err => { if(!cancelled) setError(err.message); })
    //   .finally(() => { if(!cancelled) setLoading(false); });

    const t = setTimeout(() => {
      if (!cancelled) { setData(MOCK_CATEGORIES); setLoading(false); }
    }, 550);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  return { data, loading, error };
}

function useFeaturedCollections() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    // collectionApi.getFeaturedCollections({ limit: 3 })
    //   .then(res => { if(!cancelled) setData(res.data); })
    //   .catch(err => { if(!cancelled) setError(err.message); })
    //   .finally(() => { if(!cancelled) setLoading(false); });

    const t = setTimeout(() => {
      if (!cancelled) { setData(MOCK_COLLECTIONS); setLoading(false); }
    }, 650);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────
//  SMALL HELPERS
// ─────────────────────────────────────────────────────────────

const formatPrice = (price, currency = "$") => `${currency}${price.toLocaleString()}`;

function Stars({ n }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color:"#C9A84C", fontSize:11 }}>{i < n ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CSS (Arvana dizayn sistemi — homepage-ə aid əlavə stillər)
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes hpHeroFade  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hpHeroZoom  { from{transform:scale(1.06)} to{transform:scale(1)} }
  @keyframes hpFadeUp    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hpFadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes hpSlideIn   { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hpSlide     { 0%{opacity:0;transform:scale(1.06)} 8%{opacity:1;transform:scale(1)} 90%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1)} }
  @keyframes scrollDrop  { 0%{top:-100%} 100%{top:100%} }
  @keyframes dotPulse    { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
  @keyframes campIn      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pgIn        { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#F7F3EE}
  ::-webkit-scrollbar-thumb{background:#7A9E7E;border-radius:3px}
  ::selection{background:#C8DBC9;color:#1C1C1C}

  .hp { font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff; overflow-x:hidden; padding-top:0; }

  /* ── SHARED ── */
  .hp-sec   { padding:110px 60px; }
  .hp-cream { background:#F7F3EE; }
  .hp-ey    { font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:500;margin-bottom:14px;display:flex;align-items:center;gap:12px }
  .hp-ey::before { content:'';display:block;width:28px;height:1px;background:#7A9E7E;flex-shrink:0 }
  .hp-ey.center { justify-content:center }
  .hp-ey.center::before { display:none }
  .hp-h2    { font-family:'Cormorant Garamond',serif;font-size:clamp(34px,4vw,54px);font-weight:300;line-height:1.12;color:#1C1C1C }
  .hp-h2 em { font-style:italic;color:#7A9E7E }
  .hp-sec-head { display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:56px }
  .hp-va    { font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B;border-bottom:1px solid #E5DDD4;padding-bottom:2px;transition:all .3s;cursor:pointer;background:none;border-top:none;border-left:none;border-right:none;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px }
  .hp-va:hover { color:#7A9E7E;border-bottom-color:#7A9E7E }
  .hp-va .arr { transition:transform .3s;display:inline-block }
  .hp-va:hover .arr { transform:translateX(5px) }

  /* Reveal animation util */
  .rv { opacity:0 }
  .rv.visible { animation:hpFadeUp .8s cubic-bezier(.25,.46,.45,.94) forwards }
  .rv-l.visible { animation:hpSlideIn .8s cubic-bezier(.25,.46,.45,.94) forwards }
  .d1.visible { animation-delay:.1s !important }
  .d2.visible { animation-delay:.2s !important }
  .d3.visible { animation-delay:.3s !important }
  .d4.visible { animation-delay:.4s !important }

  /* ── BUTTONS ── */
  .btn-dark  { display:inline-flex;align-items:center;gap:10px;background:#1C1C1C;color:#fff;padding:16px 36px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .35s,transform .35s,box-shadow .35s;text-decoration:none }
  .btn-dark:hover  { background:#7A9E7E;transform:translateY(-2px);box-shadow:0 12px 32px rgba(122,158,126,.3) }
  .btn-ghost { font-size:13px;color:#1C1C1C;letter-spacing:.5px;border-bottom:1px solid #1C1C1C;padding-bottom:2px;transition:color .3s,border-color .3s;cursor:pointer;background:none;border-top:none;border-left:none;border-right:none;font-family:'DM Sans',sans-serif;text-decoration:none }
  .btn-ghost:hover { color:#7A9E7E;border-bottom-color:#7A9E7E }
  .btn-white { display:inline-flex;align-items:center;gap:10px;background:#fff;color:#7A9E7E;padding:16px 40px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .35s;text-decoration:none }
  .btn-white:hover { background:#1C1C1C;color:#fff;transform:translateY(-2px);box-shadow:0 12px 32px rgba(28,28,28,.25) }
  .btn-outline-white { display:inline-flex;align-items:center;gap:10px;background:transparent;color:#fff;padding:15px 36px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;border:1.5px solid rgba(255,255,255,.55);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .3s;text-decoration:none }
  .btn-outline-white:hover { border-color:#fff;background:rgba(255,255,255,.1);transform:translateY(-2px) }

  /* ══════════════════════════════════════
     1. HERO SLIDER
  ══════════════════════════════════════ */
  .hp-hero { position:relative;height:100vh;min-height:680px;overflow:hidden;display:flex;align-items:center }

  .hp-slide { position:absolute;inset:0;opacity:0;animation:hpSlide var(--slide-duration,6s) ease-in-out both }
  .hp-slide-bg { position:absolute;inset:0;background-size:cover;background-position:center }
  .hp-slide-ov { position:absolute;inset:0;background:linear-gradient(105deg,rgba(247,243,238,.86) 0%,rgba(247,243,238,.46) 55%,rgba(247,243,238,.06) 100%) }

  .hp-hero-ct { position:relative;z-index:2;max-width:700px;padding-left:90px;animation:hpHeroFade 1s cubic-bezier(.25,.46,.45,.94) .3s both }
  .hp-badge   { font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:500;margin-bottom:20px;display:flex;align-items:center;gap:12px }
  .hp-badge::before { content:'';display:block;width:32px;height:1px;background:#7A9E7E;flex-shrink:0 }
  .hp-h1      { font-family:'Cormorant Garamond',serif;font-size:clamp(46px,6vw,84px);font-weight:300;line-height:1.07;letter-spacing:-.5px;color:#1C1C1C;margin-bottom:22px }
  .hp-h1 em   { font-style:italic;color:#7A9E7E }
  .hp-sub     { font-size:16px;color:#6B6B6B;max-width:440px;line-height:1.8;margin-bottom:44px;font-weight:300 }
  .hp-cta-row { display:flex;align-items:center;gap:28px;flex-wrap:wrap }
  .hero{position:relative;height:100vh;min-height:680px;overflow:hidden;display:flex;align-items:center}
  .h-bg{position:absolute;inset:0;background-size:cover;background-position:center;animation:heroZ 1.4s cubic-bezier(.25,.46,.45,.94) forwards}
  .h-ov{position:absolute;inset:0;background:linear-gradient(105deg,rgba(247,243,238,.84) 0%,rgba(247,243,238,.45) 55%,rgba(247,243,238,.05) 100%)}
  .h-ct{position:relative;z-index:2;max-width:680px;padding-left:90px;animation:heroF 1s cubic-bezier(.25,.46,.45,.94) .3s both}
  .ey{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:500;margin-bottom:20px;display:flex;align-items:center;gap:12px}
  .ey::before{content:'';display:block;width:32px;height:1px;background:#7A9E7E;flex-shrink:0}
  .H1{font-family:'Cormorant Garamond',serif;font-size:clamp(46px,6vw,82px);font-weight:300;line-height:1.08;color:#1C1C1C;margin-bottom:24px}
  .H1 em{font-style:italic;color:#7A9E7E}
  .h-sub{font-size:16px;color:#6B6B6B;max-width:420px;line-height:1.8;margin-bottom:44px;font-weight:300}
  .c-row{display:flex;align-items:center;gap:28px;flex-wrap:wrap}
  .h-sts{position:absolute;bottom:60px;right:80px;z-index:2;display:flex;gap:48px;animation:stF 1s ease .7s both}
  .s-n{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:300;color:#1C1C1C;display:block}
  .s-l{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B}
  .sc-hint{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;animation:rvFade 1s ease 1.2s both}
  .sc-hint span{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#6B6B6B}
  .sc-line{width:1px;height:48px;background:#E5DDD4;position:relative;overflow:hidden}
  .sc-line::after{content:'';position:absolute;top:-100%;left:0;width:100%;height:100%;background:#7A9E7E;animation:scrollD 1.6s ease-in-out 1.2s infinite}

  /* Slider dots */
  .hp-dots { position:absolute;bottom:44px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:10px }
  .hp-dot  { width:8px;height:8px;border-radius:50%;background:#1C1C1C;opacity:.2;cursor:pointer;border:none;transition:all .3s;padding:0 }
  .hp-dot.active { background:#7A9E7E;opacity:1;width:28px;border-radius:4px }

  /* Slider arrows */
  .hp-arrow { position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:48px;height:48px;background:rgba(255,255,255,.8);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.6);cursor:pointer;font-size:18px;color:#1C1C1C;display:flex;align-items:center;justify-content:center;transition:all .3s }
  .hp-arrow:hover { background:#fff;box-shadow:0 8px 24px rgba(28,28,28,.14) }
  .hp-arrow.prev { left:28px }
  .hp-arrow.next { right:28px }

  /* Scroll hint */
  .hp-scroll { position:absolute;bottom:40px;right:60px;z-index:10;display:flex;flex-direction:column;align-items:center;gap:8px;animation:hpFadeIn 1s ease 1.2s both }
  .hp-scroll span { font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#6B6B6B }
  .hp-scroll-line { width:1px;height:48px;background:#E5DDD4;position:relative;overflow:hidden }
  .hp-scroll-line::after { content:'';position:absolute;top:-100%;left:0;width:100%;height:100%;background:#7A9E7E;animation:scrollDrop 1.6s ease-in-out 1.2s infinite }

  /* ══════════════════════════════════════
     2. CAMPAIGNS
  ══════════════════════════════════════ */
  .hp-camp-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px }
  .hp-camp-card { position:relative;overflow:hidden;cursor:pointer;background:#EDE7DC;min-height:280px;display:flex;flex-direction:column;justify-content:flex-end;animation:campIn .6s cubic-bezier(.25,.46,.45,.94) both }
  .hp-camp-img  { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94) }
  .hp-camp-card:hover .hp-camp-img { transform:scale(1.06) }
  .hp-camp-ov   { position:absolute;inset:0;background:linear-gradient(to top,rgba(28,28,28,.7) 0%,rgba(28,28,28,.1) 60%,transparent 100%);transition:opacity .4s }
  .hp-camp-card:hover .hp-camp-ov  { opacity:.9 }
  .hp-camp-inf  { position:relative;z-index:1;padding:28px 24px }
  .hp-camp-badge{ display:inline-block;padding:5px 12px;font-size:11px;font-weight:600;letter-spacing:.5px;color:#fff;margin-bottom:10px }
  .hp-camp-name { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#fff;margin-bottom:6px }
  .hp-camp-desc { font-size:13px;color:rgba(255,255,255,.7);margin-bottom:16px;line-height:1.5 }
  .hp-camp-until{ font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:16px }
  .hp-camp-cta  { display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s }
  .hp-camp-card:hover .hp-camp-cta { opacity:1;transform:translateY(0) }

  /* ══════════════════════════════════════
     3. FEATURED PRODUCTS
  ══════════════════════════════════════ */
  .hp-prod-tabs  { display:flex;border:1px solid #E5DDD4 }
  .hp-prod-tab   { padding:10px 22px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;background:none;border:none;cursor:pointer;color:#6B6B6B;font-family:'DM Sans',sans-serif;transition:background .3s,color .3s }
  .hp-prod-tab.a,.hp-prod-tab:hover { background:#1C1C1C;color:#fff }

  .hp-prod-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:28px }
  .hp-prod-card { background:#fff;transition:box-shadow .4s }
  .hp-prod-card:hover { box-shadow:0 20px 56px rgba(28,28,28,.1) }
  .hp-prod-iw   { position:relative;overflow:hidden;aspect-ratio:4/5;background:#F7F3EE }
  .hp-prod-im   { width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.25,.46,.45,.94);display:block }
  .hp-prod-card:hover .hp-prod-im { transform:scale(1.05) }
  .hp-prod-badge{ position:absolute;top:14px;left:14px;color:#fff;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:5px 11px;font-weight:500;font-family:'DM Sans',sans-serif }
  .hp-prod-acts { position:absolute;bottom:0;left:0;right:0;padding:14px;background:rgba(28,28,28,.88);transform:translateY(100%);transition:transform .38s cubic-bezier(.25,.46,.45,.94);display:flex;gap:10px }
  .hp-prod-card:hover .hp-prod-acts { transform:translateY(0) }
  .hp-prod-add  { flex:1;padding:12px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;background:#fff;color:#1C1C1C;transition:background .3s,color .3s }
  .hp-prod-add:hover { background:#7A9E7E;color:#fff }
  .hp-prod-wish { background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;width:44px;padding:0;cursor:pointer;transition:background .3s;font-size:14px }
  .hp-prod-wish:hover { background:rgba(255,255,255,.12) }
  .hp-prod-inf  { padding:18px 14px 22px }
  .hp-prod-cat  { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9E7E;margin-bottom:5px }
  .hp-prod-nm   { font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:400;color:#1C1C1C;margin-bottom:10px;text-decoration:none;display:block }
  .hp-prod-nm:hover { color:#7A9E7E }
  .hp-prod-pr   { display:flex;align-items:center;justify-content:space-between }
  .hp-price     { font-size:16px;font-weight:500;color:#1C1C1C }
  .hp-old-price { font-size:13px;color:#6B6B6B;text-decoration:line-through;margin-left:8px }

  /* ══════════════════════════════════════
     4. CATEGORIES
  ══════════════════════════════════════ */
  .hp-cat-grid  { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;grid-template-rows:auto }
  .hp-cat-big   { grid-column:1/3 }
  .hp-cat-card  { position:relative;overflow:hidden;cursor:pointer;background:#EDE7DC;min-height:320px }
  .hp-cat-big.hp-cat-card { min-height:440px }
  .hp-cat-img   { width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94);display:block;position:absolute;inset:0 }
  .hp-cat-card:hover .hp-cat-img { transform:scale(1.06) }
  .hp-cat-ov    { position:absolute;inset:0;background:linear-gradient(to top,rgba(28,28,28,.6) 0%,transparent 60%);transition:opacity .4s }
  .hp-cat-card:hover .hp-cat-ov  { opacity:.85 }
  .hp-cat-inf   { position:absolute;bottom:0;left:0;right:0;padding:30px 28px }
  .hp-cat-tag   { font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:6px }
  .hp-cat-nm    { font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;margin-bottom:14px }
  .hp-cat-cnt   { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5) }
  .hp-cat-cta   { display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#fff;margin-top:12px;opacity:0;transform:translateY(10px);transition:opacity .35s,transform .35s;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif }
  .hp-cat-card:hover .hp-cat-cta { opacity:1;transform:translateY(0) }

  /* ══════════════════════════════════════
     5. COLLECTIONS
  ══════════════════════════════════════ */
  .hp-col-grid  { display:grid;grid-template-columns:repeat(3,1fr);gap:28px }
  .hp-col-card  { position:relative;overflow:hidden;cursor:pointer;background:#F7F3EE;text-decoration:none }
  .hp-col-iw    { aspect-ratio:3/4;overflow:hidden;position:relative }
  .hp-col-img   { width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94);display:block }
  .hp-col-card:hover .hp-col-img { transform:scale(1.05) }
  .hp-col-bar   { height:3px;transition:width .4s ease;width:48px }
  .hp-col-card:hover .hp-col-bar { width:80px }
  .hp-col-inf   { padding:22px 0 10px }
  .hp-col-nm    { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#1C1C1C;margin-bottom:6px }
  .hp-col-cnt   { font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B }
  .hp-col-cta   { display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A9E7E;margin-top:14px;opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s }
  .hp-col-card:hover .hp-col-cta { opacity:1;transform:translateY(0) }

  /* ══════════════════════════════════════
     6. WHY US
  ══════════════════════════════════════ */
  .hp-why-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:40px }
  .hp-why-card { text-align:center;padding:48px 28px;border:1px solid #E5DDD4;transition:border-color .4s,transform .4s,box-shadow .4s }
  .hp-why-card:hover { border-color:#C8DBC9;transform:translateY(-6px);box-shadow:0 20px 48px rgba(122,158,126,.12) }
  .hp-why-ic   { width:56px;height:56px;border-radius:50%;background:#F7F3EE;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:24px;transition:background .4s,transform .4s }
  .hp-why-card:hover .hp-why-ic { background:#7A9E7E;transform:scale(1.1) rotate(-5deg) }
  .hp-why-t    { font-family:'Cormorant Garamond',serif;font-size:20px;color:#1C1C1C;margin-bottom:12px }
  .hp-why-d    { font-size:13px;color:#6B6B6B;line-height:1.75 }

  /* ══════════════════════════════════════
     7. CTA BANNER
  ══════════════════════════════════════ */
  .hp-cta      { background:#7A9E7E;padding:100px 60px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden }
  .hp-cta::before { content:'';position:absolute;top:-80px;right:-80px;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none }
  .hp-cta::after  { content:'';position:absolute;bottom:-120px;left:20%;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none }
  .hp-cta-ey   { font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:16px }
  .hp-cta-h    { font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4vw,58px);font-weight:300;color:#fff;line-height:1.1 }
  .hp-cta-h em { font-style:italic }
  .hp-cta-sub  { font-size:15px;color:rgba(255,255,255,.72);margin-top:16px }
  .hp-cta-acts { display:flex;gap:16px;flex-wrap:wrap;position:relative;z-index:1 }
  .hp-cta-t    { position:relative;z-index:1 }

  /* ══════════════════════════════════════
     8. NEWSLETTER
  ══════════════════════════════════════ */
  .hp-nl       { background:#fff;padding:80px 60px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #E5DDD4 }
  .hp-nl-t     { font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:300;color:#1C1C1C }
  .hp-nl-s     { font-size:14px;color:#6B6B6B;margin-top:6px }
  .hp-nl-f     { display:flex }
  .hp-nl-i     { padding:14px 24px;font-size:13px;border:1px solid #E5DDD4;border-right:none;outline:none;font-family:'DM Sans',sans-serif;color:#1C1C1C;width:280px;background:#F7F3EE;transition:border-color .3s }
  .hp-nl-i:focus { border-color:#7A9E7E }
  .hp-nl-i::placeholder { color:#A8A8A8 }
  .hp-nl-b     { padding:14px 28px;background:#1C1C1C;color:#fff;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .3s }
  .hp-nl-b:hover { background:#7A9E7E }

  /* ── RESPONSIVE ── */
  @media(max-width:1100px) {
    .hp-prod-grid { grid-template-columns:repeat(2,1fr) }
    .hp-why-grid  { grid-template-columns:repeat(2,1fr) }
    .hp-camp-grid { grid-template-columns:1fr 1fr }
    .hp-camp-grid > *:last-child { grid-column:1/3 }
  }
  @media(max-width:900px) {
    .hp-sec { padding:80px 24px }
    .hp-hero-ct { padding-left:24px }
    .hp-cat-grid { grid-template-columns:1fr;grid-template-rows:auto }
    .hp-cat-big  { grid-column:auto }
    .hp-col-grid { grid-template-columns:1fr 1fr }
    .hp-cta { flex-direction:column;gap:36px;text-align:center;padding:80px 24px }
    .hp-nl  { flex-direction:column;gap:28px;text-align:center;padding:60px 24px }
    .hp-sec-head { flex-direction:column;align-items:flex-start;gap:16px }
    .hp-arrow { display:none }
  }
  @media(max-width:640px) {
    .hp-prod-grid { grid-template-columns:1fr }
    .hp-why-grid  { grid-template-columns:1fr }
    .hp-col-grid  { grid-template-columns:1fr }
    .hp-camp-grid { grid-template-columns:1fr }
    .hp-camp-grid > *:last-child { grid-column:auto }
    .hp-cta-acts  { flex-direction:column }
    .hp-nl-f { flex-direction:column }
    .hp-nl-i { width:100%;border-right:1px solid #E5DDD4;border-bottom:none }
  }
`;

// ─────────────────────────────────────────────────────────────
//  SECTION COMPONENTS  (hər biri ayrı komponent fayla çıxarıla bilər)
// ─────────────────────────────────────────────────────────────

// ── 1. Hero Slider ────────────────────────────────────────────
// ── 2. Campaigns ──────────────────────────────────────────────
function CampaignsSection({ campaigns, t }) {
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("az-AZ", { day:"numeric", month:"short", year:"numeric" });
    } catch { return dateStr; }
  };

  return (
    <section className="hp-sec hp-cream" id="campaigns">
      <div className="hp-sec-head">
        <div>
          {/* i18n */}
          <div className="hp-ey">{t("campaigns.subtitle")}</div>
          <h2 className="hp-h2">{t("campaigns.title")}</h2>
        </div>
      </div>

      <div className="hp-camp-grid">
        {campaigns.map((camp, i) => (
          <Link
            key={camp.id}
            to={`/campaigns/${camp.slug}`}
            className="hp-camp-card"
            style={{ animationDelay:`${i * 0.1}s`, textDecoration:"none" }}
          >
            {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
            <img className="hp-camp-img" src={camp.image} alt={camp.name} loading="lazy" />
            <div className="hp-camp-ov" />
            <div className="hp-camp-inf">
              {camp.discount_label && (
                <span className="hp-camp-badge" style={{ background: camp.color }}>
                  {camp.discount_label}
                </span>
              )}
              <h3 className="hp-camp-name">{camp.title}</h3>
              <p className="hp-camp-desc">{camp.description}</p>
              {camp.end_date && (
                <p className="hp-camp-until">
                  {t("campaigns.until")} {formatDate(camp.end_date)}
                </p>
              )}
              {/* CTA — i18n */}
              <span className="hp-camp-cta">{t("campaigns.cta")} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 3. Featured Products ──────────────────────────────────────
const BADGE_COLORS = {
  best_seller: "#D4714A",
  new_in:      "#7A9E7E",
  sale:        "#C9A84C",
};

function FeaturedProductsSection({ products, t }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = useMemo(() => [
    { key:"all",    label: t("featured_products.tabs.all") },
    { key:"sofas",  label: t("featured_products.tabs.sofas") },
    { key:"chairs", label: t("featured_products.tabs.chairs") },
    { key:"tables", label: t("featured_products.tabs.tables") },
  ], [t]);

  const filtered = useMemo(() =>
    activeTab === "all"
      ? products
      : products.filter(p => p.category === activeTab),
    [activeTab, products]
  );

  return (
    <section className="hp-sec" id="featured-products">
      <div className="hp-sec-head">
        <div>
          {/* i18n */}
          <div className="hp-ey">{t("featured_products.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("featured_products.title")} <em>{t("featured_products.title_em")}</em>
          </h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:20 }}>
          {/* Tabs — i18n */}
          <div className="hp-prod-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`hp-prod-tab${activeTab === tab.key ? " a" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link to="/shop" className="hp-va">
            {t("featured_products.view_all")} <span className="arr">→</span>
          </Link>
        </div>
      </div>

      <div className="hp-prod-grid">
        {filtered.map((product, i) => (
          <div
            key={product.id}
            className="hp-prod-card"
            style={{ animation:`hpFadeUp .6s cubic-bezier(.25,.46,.45,.94) ${i * 0.08}s both` }}
          >
            <div className="hp-prod-iw">
              {/* DB-dən gəlir — alt, src TƏRCÜMƏ OLUNMUR */}
              <img className="hp-prod-im" src={product.image} alt={product.name} loading="lazy" />

              {/* Badge — i18n key-lə eşlənir */}
              {product.badge && (
                <span
                  className="hp-prod-badge"
                  style={{ background: BADGE_COLORS[product.badge] || "#7A9E7E" }}
                >
                  {t(`common.${product.badge}`)}
                </span>
              )}

              <div className="hp-prod-acts">
                {/* Button mətni — i18n */}
                <button className="hp-prod-add">{t("common.add_to_cart")}</button>
                <button className="hp-prod-wish">♡</button>
              </div>
            </div>
            <div className="hp-prod-inf">
              {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
              <p className="hp-prod-cat">{product.category}</p>
              <Link to={`/products/${product.slug}`} className="hp-prod-nm">
                {product.name}
              </Link>
              <div className="hp-prod-pr">
                <div>
                  <span className="hp-price">{formatPrice(product.price)}</span>
                  {product.old_price && (
                    <span className="hp-old-price">{formatPrice(product.old_price)}</span>
                  )}
                </div>
                <Stars n={product.stars} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 4. Room Categories ────────────────────────────────────────
function CategoriesSection({ categories, t, onNavigate }) {
  // İlk kart böyük göstərilir (featured layout)
  const [first, ...rest] = categories;

  return (
    <section className="hp-sec hp-cream" id="categories">
      <div className="hp-sec-head">
        <div>
          {/* i18n */}
          <div className="hp-ey">{t("categories.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("categories.title")} <em>{t("categories.title_em")}</em>
          </h2>
        </div>
        <Link to="/collections" className="hp-va">
          {t("categories.view_all")} <span className="arr">→</span>
        </Link>
      </div>

      <div className="hp-cat-grid">
        {/* Big card */}
        {first && (
          <Link
            to={`/category/${first.slug}`}
            className="hp-cat-card hp-cat-big"
            style={{ textDecoration:"none" }}
          >
            <img className="hp-cat-img" src={first.image} alt={first.name} loading="lazy" />
            <div className="hp-cat-ov" />
            <div className="hp-cat-inf">
              <p className="hp-cat-tag">{t("categories.eyebrow")}</p>
              {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
              <h3 className="hp-cat-nm">{first.name}</h3>
              <p className="hp-cat-cnt">{first.product_count} pieces</p>
              <button className="hp-cat-cta">{t("categories.explore")} →</button>
            </div>
          </Link>
        )}

        {/* Regular cards */}
        {rest.slice(0, 4).map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="hp-cat-card"
            style={{ textDecoration:"none" }}
          >
            <img className="hp-cat-img" src={cat.image} alt={cat.name} loading="lazy" />
            <div className="hp-cat-ov" />
            <div className="hp-cat-inf">
              <p className="hp-cat-tag">{t("categories.eyebrow")}</p>
              {/* DB-dən gəlir */}
              <h3 className="hp-cat-nm">{cat.name}</h3>
              <p className="hp-cat-cnt">{cat.product_count} pieces</p>
              <button className="hp-cat-cta">{t("categories.explore")} →</button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 5. Collections ────────────────────────────────────────────
function CollectionsSection({ collections, t }) {
  return (
    <section className="hp-sec" id="collections">
      <div className="hp-sec-head">
        <div>
          {/* i18n */}
          <div className="hp-ey">{t("collections.eyebrow")}</div>
          <h2 className="hp-h2">
            {t("collections.title")} <em>{t("collections.title_em")}</em>
          </h2>
        </div>
        <Link to="/collections" className="hp-va">
          {t("collections.view_all")} <span className="arr">→</span>
        </Link>
      </div>

      <div className="hp-col-grid">
        {collections.map((col, i) => (
          <Link
            key={col.id}
            to={`/collections/${col.slug}`}
            className="hp-col-card"
            style={{ animation:`hpFadeUp .7s cubic-bezier(.25,.46,.45,.94) ${i * 0.12}s both` }}
          >
            <div className="hp-col-iw">
              {/* DB-dən gəlir */}
              <img className="hp-col-img" src={col.image} alt={col.name} loading="lazy" />
            </div>
            <div
              className="hp-col-bar"
              style={{ background: col.accent || "#7A9E7E", marginTop:20 }}
            />
            <div className="hp-col-inf">
              {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
              <h3 className="hp-col-nm">{col.name}</h3>
              <p className="hp-col-cnt">{col.product_count} pieces</p>
              {/* CTA — i18n */}
              <span className="hp-col-cta">{t("collections.explore")} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 6. Why Choose Us — tam statik, i18n ──────────────────────
function WhyUsSection({ t }) {
  const items = t("why_us.items", { returnObjects: true });

  return (
    <section className="hp-sec hp-cream">
      <div style={{ textAlign:"center", marginBottom:72 }}>
        <div className="hp-ey center">{t("why_us.eyebrow")}</div>
        <h2 className="hp-h2">
          {t("why_us.title")} <em>{t("why_us.title_em")}</em>
        </h2>
      </div>
      <div className="hp-why-grid">
        {items.map((item, i) => (
          <div key={i} className="hp-why-card">
            <div className="hp-why-ic">{item.icon}</div>
            <h3 className="hp-why-t">{item.title}</h3>
            <p className="hp-why-d">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 7. CTA Banner — tam statik, i18n ─────────────────────────
function CTABanner({ t }) {
  return (
    <div className="hp-cta">
      <div className="hp-cta-t">
        <p className="hp-cta-ey">{t("cta_banner.eyebrow")}</p>
        <h2 className="hp-cta-h">
          {t("cta_banner.title")}<br />
          <em>{t("cta_banner.title_em")}</em>
        </h2>
        <p className="hp-cta-sub">{t("cta_banner.subtitle")}</p>
      </div>
      <div className="hp-cta-acts">
        <Link to="/shop"    className="btn-white">         {t("cta_banner.btn_primary")} →</Link>
        <Link to="/contact" className="btn-outline-white"> {t("cta_banner.btn_secondary")}</Link>
      </div>
    </div>
  );
}

// ── 8. Newsletter — tam statik, i18n ─────────────────────────
function NewsletterSection({ t }) {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: newsletterApi.subscribe(email)
    setSent(true);
  };

  return (
    <div className="hp-nl">
      <div>
        <h3 className="hp-nl-t">{t("newsletter.title")}</h3>
        <p className="hp-nl-s">{t("newsletter.subtitle")}</p>
      </div>
      {sent ? (
        <p style={{ fontSize:14, color:"#7A9E7E", fontFamily:"'DM Sans',sans-serif" }}>
          ✓ Thank you for subscribing!
        </p>
      ) : (
        <form className="hp-nl-f" onSubmit={handleSubmit}>
          <input
            className="hp-nl-i"
            type="email"
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="hp-nl-b">{t("newsletter.cta")}</button>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SCROLL REVEAL HOOK  (bütün proyektdə istifadə üçün
//  hooks/useScrollReveal.js-ə köçürülə bilər)
// ─────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rv, .rv-l");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // API hooks
  const { data: slides,      loading: slidesLoading,   error: slidesError   } = useHeroSlides();
  const { data: campaigns,   loading: campaignsLoading, error: campaignsError } = useActiveCampaigns();
  const { data: products,    loading: productsLoading,  error: productsError, refetch: refetchProducts } = useFeaturedProducts();
  const { data: categories,  loading: catsLoading,      error: catsError     } = useRoomCategories();
  const { data: collections, loading: colsLoading,      error: colsError     } = useFeaturedCollections();

  // Scroll reveal init
  useScrollReveal();

  return (
    <>
      <style>{CSS}</style>
      <main className="hp">
<Navbar/>
        {/* ── 1. HERO SLIDER ──────────────────────────── */}
        {/* heroApi.getHeroSlides() → Navbar.jsx altında başlayır */}
        {/* {slidesLoading
          ? <div style={{ height:"100vh", background:"#F7F3EE" }} />
          : slidesError
            ? <ErrorMessage message={slidesError} />
            : <HeroSlider slides={slides} t={t} />
        } */}
      <section className="hero">
        <div className="h-bg" style={{ backgroundImage:"url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=85')" }} />
        <div className="h-ov" />
        <div className="h-ct">
          <div className="ey">New Collection 2025</div>
          <h1 className="H1">Timeless Furniture<br />for <em>Modern Living</em></h1>
          <p className="h-sub">Handcrafted pieces that blend artisan tradition with contemporary design — curated to make every space feel like home.</p>
          <div className="c-row">
            <button className="bp" onClick={() => go("products")}>Explore Collection →</button>
            <button className="b-ghost" onClick={() => go("story")}>Our Story</button>
          </div>
        </div>
        <div className="h-sts">
          {[["14+","Years of Craft"],["2.4k","Happy Homes"],["380","Unique Pieces"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <span className="s-n">{n}</span><span className="s-l">{l}</span>
            </div>
          ))}
        </div>
        <div className="sc-hint"><span>Scroll</span><div className="sc-line" /></div>
      </section>
 

        {/* ── 2. KAMPANIYALAR ─────────────────────────── */}
        {/* campaignApi.getActiveCampaigns() */}
        {!campaignsLoading && !campaignsError && campaigns.length > 0 && (
          <CampaignsSection campaigns={campaigns} t={t} />
        )}
        {/* {campaignsError && (
          <section className="hp-sec hp-cream">
            <ErrorMessage message={campaignsError} />
          </section>
        )} */}

        {/* ── 3. ÖNƏ ÇIXAN MƏHSULLAR ──────────────────── */}
        {/* productApi.getFeaturedProducts() */}
        <section className="hp-sec" id="featured-products">
          {/* {productsLoading
            ? <Loader variant="skeleton" count={8} />
            : productsError
              ? <ErrorMessage message={productsError} onRetry={refetchProducts} /> } */}
              <FeaturedProductsSection products={products} t={t} />
         
        </section>

        {/* ── 4. OTAQ KATEQORİYALARI ──────────────────── */}
        {/* categoryApi.getRoomCategories() */}
        {/* {!catsLoading && !catsError && ( */}
          <CategoriesSection categories={categories} t={t} onNavigate={navigate} />
        {/* )} */}
        {/* {catsError && (
          <section className="hp-sec hp-cream">
            <ErrorMessage message={catsError} />
          </section>
        )} */}

        {/* ── 5. KOLLEKSİYALAR ───────────────────────── */}
        {/* collectionApi.getFeaturedCollections() */}
        {!colsLoading && !colsError && (
          <CollectionsSection collections={collections} t={t} />
        )}

        {/* ── 6. NİYƏ BİZİ SEÇİRSİNİZ — statik, i18n ── */}
        <WhyUsSection t={t} />

        {/* ── 7. CTA BANNER — statik, i18n ────────────── */}
        <CTABanner t={t} />

        {/* ── 8. NEWSLETTER — statik, i18n ─────────────── */}
        <NewsletterSection t={t} />
<Footer/>
      </main>
    </>
  );
}