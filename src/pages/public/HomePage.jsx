// src/pages/public/HomePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";

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

import heroApi       from "../../api/heroApi";
import productApi    from "../../api/productApi";
import categoryApi   from "../../api/categoryApi";
import collectionApi from "../../api/collectionApi";

import "../../assets/pagesCss/HomeMain.css";

// ── Hero slides — HeroSectionDto[] ────────────────────────────
function useHeroSlides(lang) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    heroApi.getActive()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [lang]);
  return { data, loading };
}

// ── Featured products — ProductDto[] ──────────────────────────
function useFeaturedProducts(lang) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setLoading(true);
    productApi.getFeatured()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [lang]);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
}

// ── Furniture categories — FurnitureCategoryDto[] ─────────────
function useProductCategories(lang) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    categoryApi.getAll()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [lang]);
  return { data, loading };
}

// ── Collection categories — CollectionCategoryDto[] ───────────
function useRoomCategories(lang) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    collectionApi.getCategories()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [lang]);
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
    <button
      className={`scroll-top${show ? " show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >↑</button>
  );
}

export default function HomePage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const lang     = useSelector(selectLang);

  const { data: slides                              } = useHeroSlides(lang);
  const { data: products,   loading: prodsLoading   } = useFeaturedProducts(lang);
  const { data: prodCats,   loading: prodCatsLoad   } = useProductCategories(lang);
  const { data: roomCats,   loading: roomCatsLoading} = useRoomCategories(lang);

  useScrollReveal([prodsLoading, prodCatsLoad, roomCatsLoading]);

  // HeroSectionDto-nu slider formatına çevir
  const slides_mapped = slides.map(s => ({
    id:         s.id,
    image:      s.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=85",
    heading:    s.title,
    subheading: s.subtitle,
    badge:      s.badgeText,
  }));

  // FurnitureCategoryDto-nu ShopByCategory formatına çevir
  const prodCats_mapped = prodCats.map((c, i) => ({
    id:    c.id,
    slug:  String(c.id),
    name:  c.name,
    image: c.imageUrl || `https://images.unsplash.com/photo-155504${1469 + i}?w=600&q=80`,
    count: 0,
    color: "#EDE7DC",
    icon:  "sofa",
  }));

  // CollectionCategoryDto-nu room kategoriya formatına çevir
  const roomCats_mapped = roomCats.map(c => ({
    id:   c.id,
    slug: String(c.id),
    name: c.name,
    image: c.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
  }));

  return (
    <main className="hp">
      <Navbar />

      <HeroSlider slides={slides_mapped} t={t} />

      <section className="hp-sec" id="featured-products">
        <div className="rv">
          <FeaturedProductsSection products={products} categories={prodCats_mapped} t={t} lang={lang} />
        </div>
      </section>

      {!prodCatsLoad && prodCats_mapped.length > 0 && (
        <ShopByCategory categories={prodCats_mapped.slice(0, 8)} t={t} />
      )}

      {!roomCatsLoading && roomCats_mapped.length > 0 && (
        <CollectionCategorySection
          categories={roomCats_mapped}
          t={t}
          onNavigate={navigate}
        />
      )}
      <div className="rv">
        <CTABanner t={t} />
      </div>
      <div className="rv">
        <WhyUsSection t={t} />
      </div>
      <Footer />
      <ScrollTop />
    </main>
  );
}
