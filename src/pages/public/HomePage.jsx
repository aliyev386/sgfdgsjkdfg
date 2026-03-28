// src/pages/public/HomePage.jsx
// ─────────────────────────────────────────────────────────────
// Bütün API çağırışları aşağıdakı custom hook-larda.
// DB-dən gələn mətnlər TƏRCÜMƏ OLUNMUR.
// Yalnız statik UI mətnlər t() ilə tərcümə olunur.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Navbar          from "../../components/common/Navbar";
import Footer          from "../../components/common/Footer";
import HeroSlider      from "../../components/home/HeroSlider";
import FeaturedProductsSection from "../../components/home/FeaturedProducts";
import { CollectionCategorySection } from "../../components/home/CollectionCategorySection";
import ShopByCategory  from "../../components/home/ShopByCategory";
import WhyUsSection    from "../../components/home/WhyChooseus";
import CTABanner       from "../../components/home/CtaBanner";
import NewsletterSection from "../../components/home/Newsletter";
import useScrollReveal from "../../hooks/useScrollReveal";

import {
  MOCK_SLIDES,
  MOCK_FEATURED_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_PRODUCT_CATEGORIES,
} from "../../components/mockdatas";

import "../../assets/pagesCss/HomeMain.css";

// ── Custom Hooks ───────────────────────────────────────────
function useHeroSlides() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    const t = setTimeout(() => { if (!c) { setData(MOCK_SLIDES); setLoading(false); } }, 400);
    return () => { c = true; clearTimeout(t); };
  }, []);
  return { data, loading };
}


function useFeaturedProducts() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setData(MOCK_FEATURED_PRODUCTS); setLoading(false); }, 450);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
}

function useRoomCategories() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    const t = setTimeout(() => { if (!c) { setData(MOCK_CATEGORIES); setLoading(false); } }, 480);
    return () => { c = true; clearTimeout(t); };
  }, []);
  return { data, loading };
}

function useFeaturedCollections() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    const t = setTimeout(() => { if (!c) { setData(MOCK_COLLECTIONS); setLoading(false); } }, 520);
    return () => { c = true; clearTimeout(t); };
  }, []);
  return { data, loading };
}

function useProductCategories() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    const t = setTimeout(() => { if (!c) { setData(MOCK_PRODUCT_CATEGORIES); setLoading(false); } }, 460);
    return () => { c = true; clearTimeout(t); };
  }, []);
  return { data, loading };
}

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <button className={`scroll-top${show ? " show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
  );
}
export default function HomePage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();

  const { data: slides      }                       = useHeroSlides();
  const { data: products,   loading: prodsLoading } = useFeaturedProducts();
  const { data: categories, loading: catsLoading  } = useRoomCategories();
  const { data: collections,loading: colsLoading  } = useFeaturedCollections();
  const { data: prodCats,   loading: prodCatsLoad } = useProductCategories();

  // Re-run reveal whenever any section finishes loading
  useScrollReveal([
    prodsLoading, catsLoading, colsLoading, prodCatsLoad
  ]);

  return (
    <main className="hp">
      <Navbar />

      <HeroSlider slides={slides} t={t} />

      {/* one cixan mehsullar */}
      <section className="hp-sec" id="featured-products">
        <div className="rv">
          <FeaturedProductsSection products={products} t={t} />
        </div>
      </section>

      {/* categoriyaya gore */}
      {!prodCatsLoad && prodCats.length > 0 && (
        <ShopByCategory categories={prodCats} t={t} />
      )}

      {/* otaga gore */}
      {!catsLoading && (
        <CollectionCategorySection
          categories={categories}
          t={t}
          onNavigate={navigate}
        />
      )}
      
            <div className="rv">
        <WhyUsSection t={t} />
      </div>

      {/*  */}
      <div className="rv">
        <CTABanner t={t} />
      </div>

      <NewsletterSection t={t} />

      <Footer />
    </main>
  );
}
