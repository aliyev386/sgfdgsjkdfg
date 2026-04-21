import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { setCart, selectCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistStore";
import collectionApi from "../../api/collectionApi";
import cartApi       from "../../api/cartApi";
import Navbar        from "../../components/common/Navbar";
import Footer        from "../../components/common/Footer";
import { useAuthModal } from "../../hooks/useAuthModal";
import CreditCalculator from "../../components/credit/CreditCalculator";
import { fireCartAdded } from "../../components/common/CartAddedPopup";
import "../../assets/pagesCss/CollectionDetails.css";

const fmt = (n) => `₼${Number(n).toLocaleString()}`;
const BADGE_CLR = { best_seller:"#D4714A", new_in:"#7A9E7E", sale:"#C9A84C", NEW:"#7A9E7E", HOT:"#D4714A", SALE:"#C9A84C", LIMITED:"#5C8DB8" };

const IconHeart = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" width="20" height="20">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDelivery = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
  </svg>
);
const IconWarranty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4"/>
  </svg>
);
const IconReturn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M3 12a9 9 0 109-9H8M8 7l-5 2 2 5"/>
  </svg>
);

const ProdCard = memo(function ProdCard({ product, addingId, onAdd, onWish, wishlisted, t, delay, inCart }) {
  const navigate = useNavigate();
  const isAdding = addingId === product.id;
  const isInCart = inCart(product.id);
  const hasDisc  = !!product.old_price;
  const goDetail = () => navigate(`/details/${product.id}`);

  return (
    <article className="cd-prod-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="cd-prod-img-wrap" onClick={goDetail}>
        <img
          className="cd-prod-img"
          src={product.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"}
          alt={product.name}
          loading="lazy"
        />
        {product.badge && (
          <span className="cd-prod-badge" style={{ background: BADGE_CLR[product.badge] || "#7A9E7E" }}>
            {product.badge}
          </span>
        )}
        {!product.in_stock && (
          <div className="cd-prod-oos-overlay">
            <span className="cd-prod-oos-label">{t("common.out_of_stock")}</span>
          </div>
        )}

        <div className="cd-prod-hover-overlay">
          <button className="cd-prod-hover-btn" onClick={e => { e.stopPropagation(); goDetail(); }}>
            {t("collection_page.view_details")}
          </button>
          <button
            className={`cd-prod-hover-btn cart-btn${isAdding ? " adding" : ""}${isInCart ? " in-cart" : ""}`}
            onClick={e => { e.stopPropagation(); if (!isInCart) onAdd(product); }}
            disabled={!product.in_stock || isAdding || isInCart}
          >
            {isAdding ? "✓ Əlavə edildi" : isInCart ? "Səbətdə" : t("collection_page.add_to_cart")}
          </button>
        </div>

        <button
          className={`cd-prod-wish-btn${wishlisted ? " active" : ""}`}
          onClick={e => { e.stopPropagation(); onWish(product); }}
          title={wishlisted ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
        >
          <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" width="15" height="15">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="cd-prod-body">
        {product.categoryName && <p className="cd-prod-cat">{product.categoryName}</p>}
        <h3 className="cd-prod-name" onClick={goDetail}>{product.name}</h3>
        <div className="cd-prod-price-row">
          <span className="cd-prod-price">{fmt(product.price)}</span>
          {hasDisc && <span className="cd-prod-old-price">{fmt(product.old_price)}</span>}
        </div>
        <button
          className={`cd-prod-cart-btn${isAdding ? " adding" : ""}${isInCart ? " in-cart" : ""}${!product.in_stock ? " disabled" : ""}`}
          onClick={e => { e.stopPropagation(); if (!isInCart) onAdd(product); }}
          disabled={!product.in_stock || isAdding || isInCart}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isAdding ? "Əlavə edildi ✓" : isInCart ? "Səbətdə" : "Səbətə əlavə et"}
        </button>
      </div>
    </article>
  );
});

export default function CollectionDetailPage() {
  const { id: collId } = useParams();
  const { t }          = useTranslation();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();
  const lang           = useSelector(selectLang);
  const wishlist       = useSelector(s => s.wishlist.items);
  const cartItems      = useSelector(s => s.cart.items);
  const isAuthenticated = useSelector(s => s.auth.isAuthenticated);
  const { openAuthModal } = useAuthModal();
  const inCart         = (id) => cartItems.some(i => i.productId === id);

  const [coll,        setColl]       = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [activeImg,   setActiveImg]  = useState(0);
  const [lbOpen,      setLbOpen]     = useState(false);
  const [addingId,    setAddingId]   = useState(null);
  const [addingAll,   setAddingAll]  = useState(false);
  const [sortBy,      setSortBy]     = useState("default");
  const [creditOpen,  setCreditOpen] = useState(false);

  useEffect(() => {
    if (!collId) return;
    setLoading(true);
    setActiveImg(0);
    window.scrollTo({ top: 0 });

    collectionApi.getById(collId)
      .then(dto => {
        const mainImg = dto.imagesUrl || dto.imageUrl || null;
        const productImgs = (dto.products || [])
          .map(p => p.images?.[0]?.imageUrl)
          .filter(Boolean)
          .slice(0, 5);
        const gallery = mainImg
          ? [mainImg, ...productImgs.filter(i => i !== mainImg)]
          : productImgs;

        setColl({
          id:           dto.id,
          name:         dto.name,
          description:  dto.description || "",
          totalPrice:   dto.totalPrice,
          discountPrice: dto.discountPrice || null,
          pieces:       dto.products?.length ?? 0,
          room:         dto.categoryName || "",
          gallery,
          products: (dto.products || []).map(p => ({
            id:          p.id,
            name:        p.name,
            categoryName: p.categoryName || "",
            price:       p.discountPrice ?? p.price,
            old_price:   p.discountPrice ? p.price : null,
            badge:       p.label || null,
            in_stock:    (p.stock ?? 1) > 0,
            image:       p.images?.[0]?.imageUrl || null,
          })),
        });
      })
      .catch(() => navigate("/collections"))
      .finally(() => setLoading(false));
  }, [collId, lang, navigate]);

  const isCollSaved = coll ? wishlist.some(w => w.id === `coll_${coll.id}`) : false;

  const sortedProducts = coll ? (() => {
    const arr = [...(coll.products || [])];
    if (sortBy === "price_asc")  return arr.sort((a,b) => a.price - b.price);
    if (sortBy === "price_desc") return arr.sort((a,b) => b.price - a.price);
    return arr;
  })() : [];

  const handleAdd = useCallback(async (product) => {
    if (addingId === product.id || !product.in_stock) return;
    if (!isAuthenticated) { openAuthModal("login"); return; }
    setAddingId(product.id);
    try {
      const cart = await cartApi.addItem({ productId: product.id, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      // Global popup
      fireCartAdded({ name: product.name, image: product.image, price: product.price });
    } catch {}
    setTimeout(() => setAddingId(null), 1400);
  }, [addingId, isAuthenticated, openAuthModal, dispatch]);

  const handleAddAll = useCallback(async () => {
    if (addingAll || !coll) return;
    if (!isAuthenticated) { openAuthModal("login"); return; }
    setAddingAll(true);
    try {
      const inStock = coll.products.filter(p => p.in_stock);
      for (const p of inStock) {
        const cart = await cartApi.addItem({ productId: p.id, quantity: 1 });
        if (cart) dispatch(setCart(cart));
      }
      // Dəsti bir yekun popup kimi göstər
      fireCartAdded({
        name:  coll.name,
        image: coll.gallery[0] || null,
        price: coll.discountPrice ?? coll.totalPrice,
      });
    } catch {}
    setTimeout(() => setAddingAll(false), 1600);
  }, [addingAll, coll, isAuthenticated, openAuthModal, dispatch]);

  const handleSaveCollection = useCallback(() => {
    if (!coll) return;
    if (!isAuthenticated) { openAuthModal("login"); return; }
    dispatch(toggleWishlist({
      id:    `coll_${coll.id}`,
      name:  coll.name,
      price: coll.discountPrice ?? coll.totalPrice,
      image: coll.gallery[0] || null,
      type:  "collection",
    }));
  }, [coll, isAuthenticated, openAuthModal, dispatch]);

  const handleWish = useCallback((product) => {
    if (!isAuthenticated) { openAuthModal("login"); return; }
    dispatch(toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image }));
  }, [isAuthenticated, openAuthModal, dispatch]);

  useEffect(() => {
    if (!lbOpen || !coll?.gallery?.length) return;
    const handler = (e) => {
      if (e.key === "Escape")      setLbOpen(false);
      if (e.key === "ArrowLeft")   setActiveImg(i => (i - 1 + coll.gallery.length) % coll.gallery.length);
      if (e.key === "ArrowRight")  setActiveImg(i => (i + 1) % coll.gallery.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lbOpen, coll?.gallery?.length]);

  const save         = coll?.discountPrice ? coll.totalPrice - coll.discountPrice : 0;
  const displayPrice = coll?.discountPrice ?? coll?.totalPrice;

  if (loading) return (
    <div className="cd-page">
      <Navbar/>
      <div className="cd-loading-page">
        <div className="cd-loading-inner">
          <div className="cd-loader-ring"/>
          <span className="cd-loading-text">{t("common.loading")}</span>
        </div>
      </div>
    </div>
  );

  if (!coll) return null;

  return (
    <div className="cd-page">
      <Navbar/>

      <nav className="cd-breadcrumb">
        <Link to="/">{t("pdp.home")}</Link>
        <span className="cd-bc-sep">/</span>
        <Link to="/collections">{t("nav.collections")}</Link>
        <span className="cd-bc-sep">/</span>
        <span className="cd-bc-cur">{coll.name}</span>
      </nav>

      <div className="cd-split">

        <div className="cd-gallery">
          <div className="cd-main-img-wrap" onClick={() => coll.gallery.length > 0 && setLbOpen(true)}>
            {coll.gallery.length > 0 ? (
              <>
                <img key={activeImg} className="cd-main-img" src={coll.gallery[activeImg]} alt={coll.name} />
                {coll.discountPrice && (
                  <span className="cd-img-badge">-{Math.round((save / coll.totalPrice) * 100)}% ENDİRİM</span>
                )}
                <div className="cd-img-zoom-hint">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M8 3H3v5M3 3l6 6M12 17h5v-5M17 17l-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="cd-main-img-placeholder">
                <svg viewBox="0 0 64 64" fill="none" stroke="#1C1C1C" strokeWidth="1.2" width="64" height="64">
                  <rect x="8" y="18" width="48" height="36" rx="2"/>
                  <path d="M20 18V14a12 12 0 0124 0v4"/>
                  <circle cx="32" cy="36" r="6"/>
                </svg>
              </div>
            )}
          </div>

          {coll.gallery.length > 1 && (
            <div className="cd-thumbs">
              {coll.gallery.map((img, i) => (
                <div key={i} className={`cd-thumb${activeImg === i ? " active" : ""}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`${coll.name} ${i + 1}`} loading="lazy"/>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cd-info">
          <div className="cd-eyebrow">{t("cdp.collection")}</div>

          <h1 className="cd-title">
            {coll.name.split(" ").slice(0, -1).join(" ")}{" "}
            <em>{coll.name.split(" ").slice(-1)[0]}</em>
          </h1>

          {coll.description && <p className="cd-tagline">{coll.description}</p>}

          {coll.totalPrice > 0 && (
            <>
              <div className="cd-price-block">
                <span className="cd-price">{fmt(displayPrice)}</span>
                {save > 0 && (
                  <>
                    <span className="cd-price-old">{fmt(coll.totalPrice)}</span>
                    <span className="cd-price-save">-{Math.round((save/coll.totalPrice)*100)}%</span>
                  </>
                )}
              </div>
              <p className="cd-price-label">{t("cdp.meta_pieces")} · {coll.pieces} {t("collection_page.pieces")}</p>
            </>
          )}

          <div className="cd-meta">
            {coll.room && (
              <div className="cd-meta-row">
                <span className="cd-meta-label">{t("cdp.meta_room")}</span>
                <span className="cd-meta-val">{coll.room}</span>
              </div>
            )}
            <div className="cd-meta-row">
              <span className="cd-meta-label">{t("cdp.meta_pieces")}</span>
              <span className="cd-meta-val">{coll.pieces} {t("collection_page.pieces")}</span>
            </div>
            <div className="cd-meta-row">
              <span className="cd-meta-label">{t("cdp.meta_availability")}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className="cd-meta-dot"/>
                <span className="cd-meta-val" style={{ color:"#4A8A50" }}>{t("cdp.meta_available")}</span>
              </div>
            </div>
          </div>

          <div className="cd-cta-row">
            <button
              className={`cd-btn-primary cd-btn-cart${addingAll ? " adding" : ""}`}
              onClick={handleAddAll}
              disabled={addingAll}
            >
              <IconCart/>
              {addingAll ? t("common.loading") : t("cdp.add_all_to_cart", "Hamısını səbətə at")}
            </button>

            <button
              className={`cd-btn-save${isCollSaved ? " saved" : ""}`}
              onClick={handleSaveCollection}
              title={isCollSaved ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
            >
              <IconHeart filled={isCollSaved}/>
              <span>{isCollSaved ? t("cdp.saved", "Saxlanıldı") : t("cdp.save", "Saxla")}</span>
            </button>
          </div>
          
          {coll.totalPrice > 0 && (
            <div className="cd-credit-section">
              <button className="cd-credit-toggle" onClick={() => setCreditOpen(o => !o)}>
                <span className="cd-credit-toggle-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <path d="M1 10h22" strokeLinecap="round"/>
                    <path d="M5 15h4M15 15h4" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="cd-credit-toggle-text">
                  {t("cdp.credit_calculator", "Kredit kalkulyatoru")}
                  <span className="cd-credit-toggle-sub">{t("cdp.credit_sub", "Aylıq ödənişi hesabla")}</span>
                </span>
                <span className={`cd-credit-toggle-arrow${creditOpen ? " open" : ""}`}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="16" height="16">
                    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>

              {creditOpen && (
                <div className="cd-credit-body">
                  <CreditCalculator price={displayPrice} compact={false} />
                </div>
              )}
            </div>
          )}

          <div className="cd-secondary-link-row">
            <Link to="/collections" className="cd-btn-secondary">
              {t("cdp.collection")} →
            </Link>
          </div>

          <div className="cd-perks">
            <div className="cd-perk">
              <div className="cd-perk-icon"><IconDelivery/></div>
              <div className="cd-perk-text">
                <strong>{t("pdp.perk_delivery_title")}</strong>
                {t("pdp.perk_delivery_desc")}
              </div>
            </div>
            <div className="cd-perk">
              <div className="cd-perk-icon"><IconWarranty/></div>
              <div className="cd-perk-text">
                <strong>{t("pdp.perk_guarantee_title")}</strong>
                {t("pdp.perk_guarantee_desc")}
              </div>
            </div>
            <div className="cd-perk">
              <div className="cd-perk-icon"><IconReturn/></div>
              <div className="cd-perk-text">
                <strong>{t("pdp.perk_returns_title")}</strong>
                {t("pdp.perk_returns_desc")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cd-section-divider">
        <div className="cd-section-divider-line"/>
      </div>

      <section className="cd-products-section" id="cd-products">
        <div className="cd-products-inner">
          <div className="cd-products-head">
            <div className="cd-products-head-left">
              <div className="cd-products-eyebrow">{t("cdp.products_in")}</div>
              <h2 className="cd-products-title">
                {t("cdp.collection_short")} <em>{t("collection_page.pieces")}</em>
              </h2>
              <p className="cd-products-count">{sortedProducts.length} {t("collection_page.pieces")}</p>
            </div>
            <div className="cd-sort-wrap">
              <span className="cd-sort-label">{t("fcp.sort_label")}</span>
              <select className="cd-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">{t("fcp.sort_featured")}</option>
                <option value="price_asc">{t("fcp.sort_price_asc")}</option>
                <option value="price_desc">{t("fcp.sort_price_desc")}</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="cd-empty">
              <span className="cd-empty-ic">🛋</span>
              <h3 className="cd-empty-t">{t("collection_page.no_products")}</h3>
              <p className="cd-empty-s">{t("rooms_coll.no_collections_hint")}</p>
            </div>
          ) : (
            <div className="cd-prod-grid">
              {sortedProducts.map((product, i) => (
                <ProdCard
                  key={product.id}
                  product={product}
                  addingId={addingId}
                  onAdd={handleAdd}
                  onWish={handleWish}
                  wishlisted={wishlist.some(w => w.id === product.id)}
                  inCart={inCart}
                  t={t}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {lbOpen && coll.gallery.length > 0 && (
        <div className="cd-lb" onClick={() => setLbOpen(false)}>
          <button className="cd-lb-close" onClick={() => setLbOpen(false)}>✕</button>
          {coll.gallery.length > 1 && (
            <>
              <button className="cd-lb-prev" onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + coll.gallery.length) % coll.gallery.length); }}>‹</button>
              <button className="cd-lb-next" onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % coll.gallery.length); }}>›</button>
            </>
          )}
          <img className="cd-lb-img" src={coll.gallery[activeImg]} alt={`${coll.name} ${activeImg + 1}`} onClick={e => e.stopPropagation()} />
          {coll.gallery.length > 1 && (
            <div className="cd-lb-counter">{activeImg + 1} / {coll.gallery.length}</div>
          )}
        </div>
      )}

      <Footer/>
    </div>
  );
}
