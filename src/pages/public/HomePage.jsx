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