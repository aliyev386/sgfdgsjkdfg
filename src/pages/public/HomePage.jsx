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
import { BADGE_COLORS, MOCK_CAMPAIGNS, MOCK_CATEGORIES, MOCK_COLLECTIONS, MOCK_FEATURED_PRODUCTS, MOCK_SLIDES } from "../../components/mockdatas";
import HeroSlider from "../../components/home/HeroSlider";
import FeaturedProductsSection from "../../components/home/FeaturedProducts";
import CollectionsSection from "../../components/home/CollectionsSection";
import { CollectionCategorySection } from "../../components/home/CollectionCategorySection";
import WhyUsSection from "../../components/home/WhyChooseus";
import CTABanner from "../../components/home/CtaBanner";
import NewsletterSection from "../../components/home/Newsletter";
import useScrollReveal from "../../hooks/useScrollReveal";
import CampaignsSection from "../../components/home/CampaignsSection";

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




export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // API hooks
  const { data: slides,      loading: slidesLoading,   error: slidesError   } = useHeroSlides();
  const { data: campaigns,   loading: campaignsLoading, error: campaignsError } = useActiveCampaigns();
  const { data: products,    loading: productsLoading,  error: productsError, refetch: refetchProducts } = useFeaturedProducts();
  const { data: categories,  loading: catsLoading,      error: catsError     } = useRoomCategories();
  const { data: collections, loading: colsLoading,      error: colsError     } = useFeaturedCollections();

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
        <HeroSlider slides={slides} t={t} />

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
          <CollectionCategorySection categories={categories} t={t} onNavigate={navigate} />
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