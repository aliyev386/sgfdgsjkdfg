// src/pages/public/CampaignsPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectLang } from "../../store/slices/langSlice";
import { selectIsAuth } from "../../store/slices/authSlice";
import { setCart, selectCart } from "../../store/slices/cartSlice";
import campaignApi from "../../api/campaignApi";
import productApi from "../../api/productApi";
import { useAuthModal } from "../../hooks/useAuthModal";
import collectionApi from "../../api/collectionApi";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const fmt = (n) => `₼${Number(n).toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function timeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { d, h, m, total: diff };
}

function Countdown({ endDate }) {
  const [left, setLeft] = useState(() => timeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(endDate)), 60000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!left) return <span className="cp-expired">Bitmişdir</span>;
  return (
    <div className="cp-countdown">
      {left.d > 0 && <><span className="cp-cd-n">{left.d}</span><span className="cp-cd-l">gün</span><span className="cp-cd-sep">:</span></>}
      <span className="cp-cd-n">{String(left.h).padStart(2, "0")}</span><span className="cp-cd-l">saat</span>
      <span className="cp-cd-sep">:</span>
      <span className="cp-cd-n">{String(left.m).padStart(2, "0")}</span><span className="cp-cd-l">dəq</span>
    </div>
  );
}

function Toast({ msg, ok, onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 3000); return () => clearTimeout(id); }, [onClose]);
  return (
    <div className={`cp-toast ${ok ? "ok" : "err"}`}>
      <span>{ok ? "✓" : "!"}</span> {msg}
    </div>
  );
}

function HeroBanner({ campaigns }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (campaigns.length < 2) return;
    timerRef.current = setInterval(() => setActive(a => (a + 1) % campaigns.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [campaigns.length]);

  if (!campaigns.length) return null;
  const camp = campaigns[active];

  return (
    <div className="cp-hero">
      {campaigns.map((c, i) => (
        <div key={c.id} className={`cp-hero-slide ${i === active ? "visible" : ""}`}
          style={{ backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : "none" }}>
          <div className="cp-hero-ov" />
        </div>
      ))}
      <div className="cp-hero-ct">
        <div className="cp-hero-eyebrow">
          <span className="cp-hero-line" />
          XÜSUSİ TƏKLİF
        </div>
        <h1 className="cp-hero-title">{camp.title}</h1>
        {camp.description && <p className="cp-hero-sub">{camp.description}</p>}
        <div className="cp-hero-meta">
          {camp.discountPercent && (
            <div className="cp-hero-discount">
              <span className="cp-hero-pct">−{camp.discountPercent}%</span>
              <span className="cp-hero-pct-lbl">endirim</span>
            </div>
          )}
          {camp.endDate && (
            <div className="cp-hero-timer">
              <span className="cp-hero-timer-lbl">Bitmə vaxtı</span>
              <Countdown endDate={camp.endDate} />
            </div>
          )}
        </div>
        <div className="cp-hero-btns">
          <button className="cp-btn-dark" onClick={() => document.getElementById("camp-products")?.scrollIntoView({ behavior: "smooth" })}>
            Məhsullara bax <span>↓</span>
          </button>
          <button className="cp-btn-ghost" onClick={() => document.getElementById("camp-collections")?.scrollIntoView({ behavior: "smooth" })}>
            Kolleksiyalar
          </button>
        </div>
      </div>
      {campaigns.length > 1 && (
        <div className="cp-hero-dots">
          {campaigns.map((_, i) => (
            <button key={i} className={`cp-hero-dot ${i === active ? "on" : ""}`}
              onClick={() => { clearInterval(timerRef.current); setActive(i); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignStrip({ campaigns }) {
  if (!campaigns.length) return null;
  return (
    <section className="cp-strip">
      <div className="cp-strip-inner">
        <div className="cp-strip-head">
          <div className="cp-eyebrow"><span />KAMPANİYALAR</div>
          <h2 className="cp-h2">Mövsümi <em>Endirimlər</em></h2>
        </div>
        <div className="cp-strip-grid">
          {campaigns.map((c, i) => (
            <div key={c.id} className="cp-strip-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="cp-strip-img-wrap">
                {c.imageUrl
                  ? <img src={c.imageUrl} alt={c.title} className="cp-strip-img" loading="lazy" />
                  : <div className="cp-strip-img-ph" />}
                {c.discountPercent && (
                  <div className="cp-strip-badge">−{c.discountPercent}%</div>
                )}
              </div>
              <div className="cp-strip-body">
                <h3 className="cp-strip-title">{c.title}</h3>
                {c.description && <p className="cp-strip-desc">{c.description}</p>}
                {c.endDate && (
                  <div className="cp-strip-timer">
                    <span className="cp-strip-timer-lbl">⏱ Bitiş:</span>
                    <Countdown endDate={c.endDate} />
                  </div>
                )}
                {c.buttonLink && (
                  <Link to={c.buttonLink} className="cp-strip-cta">
                    {c.buttonText || "Kəşf et"} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAddCart, adding, inCart }) {
  const navigate = useNavigate();
  const price = product.discountPrice ?? product.price;
  const oldPrice = product.discountPrice ? product.price : null;
  const img = product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";
  const pct = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const isInCart = inCart(product.id);

  return (
    <div className="cp-prod-card" onClick={() => navigate(`/details/${product.id}`)}>
      <div className="cp-prod-img-wrap">
        <img src={img} alt={product.name} className="cp-prod-img" loading="lazy" />
        {pct && <span className="cp-prod-badge">−{pct}%</span>}
        {product.label === "new_in" && !pct && <span className="cp-prod-badge new">YENİ</span>}
        <div className="cp-prod-hover">
          <button className={`cp-prod-hover-btn${isInCart ? " in-cart" : ""}`}
            onClick={e => { e.stopPropagation(); if (!isInCart) onAddCart(product.id); }}
            disabled={adding === product.id || product.stock === 0 || isInCart}>
            {adding === product.id ? "✓ Əlavə edildi" : isInCart ? "Səbətdə" : product.stock === 0 ? "Stokda yoxdur" : "+ Səbətə"}
          </button>
        </div>
      </div>
      <div className="cp-prod-body">
        <p className="cp-prod-cat">{product.categoryName || ""}</p>
        <h3 className="cp-prod-name">{product.name}</h3>
        <div className="cp-prod-prices">
          <span className="cp-prod-price">{fmt(price)}</span>
          {oldPrice && <span className="cp-prod-old">{fmt(oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ col }) {
  const navigate = useNavigate();
  const img = col.imageUrl || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80";
  return (
    <div className="cp-coll-card" onClick={() => navigate(`/collection-detail/${col.id}`)}>
      <div className="cp-coll-img-wrap">
        <img src={img} alt={col.name} className="cp-coll-img" loading="lazy" />
        <div className="cp-coll-ov" />
        <div className="cp-coll-inf">
          <h3 className="cp-coll-name">{col.name}</h3>
          {col.totalPrice && <p className="cp-coll-price">{fmt(col.totalPrice)}-dən</p>}
          <span className="cp-coll-cta">Kolleksiyaya bax →</span>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ count = 4, type = "prod" }) {
  return (
    <div className={`cp-sk-grid ${type}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cp-sk-card" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

export default function CampaignsPage() {
  const { t } = useTranslation();
  const lang = useSelector(selectLang);
  const isAuth = useSelector(selectIsAuth);
  const cartItems = useSelector(s => s.cart.items);
  const inCart = (id) => cartItems.some(i => i.productId === id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [collLoading, setCollLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("discount");

  useEffect(() => {
    window.scrollTo({ top: 0 });

    campaignApi.getActive()
      .then(res => setCampaigns(Array.isArray(res) ? res : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));

    productApi.getAll({ page: 1, pageSize: 24 })
      .then(res => {
        const arr = res?.data ?? (Array.isArray(res) ? res : []);
        const sorted = [...arr].sort((a, b) => {
          const aDisc = a.discountPrice ? (1 - a.discountPrice / a.price) : 0;
          const bDisc = b.discountPrice ? (1 - b.discountPrice / b.price) : 0;
          return bDisc - aDisc;
        });
        setProducts(sorted);
      })
      .catch(() => setProducts([]))
      .finally(() => setProdLoading(false));

    collectionApi.getAll()
      .then(res => setCollections(Array.isArray(res) ? res : []))
      .catch(() => setCollections([]))
      .finally(() => setCollLoading(false));
  }, [lang]);

  const handleAddCart = useCallback(async (productId) => {
    if (!isAuth) { openAuthModal("login"); return; }
    if (inCart(productId)) return;
    setAdding(productId);
    try {
      const cart = await cartApi.addItem({ productId, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      setToast({ msg: "Səbətə əlavə edildi", ok: true });
    } catch {
      setToast({ msg: "Xəta baş verdi", ok: false });
    } finally {
      setTimeout(() => setAdding(null), 1200);
    }
  }, [isAuth, openAuthModal, dispatch]);

  const filtered = products.filter(p => {
    if (activeTab === "sale") return !!p.discountPrice;
    if (activeTab === "new") return p.label === "new_in";
    if (activeTab === "bestseller") return p.label === "best_seller";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "discount") {
      const aD = a.discountPrice ? (1 - a.discountPrice / a.price) : 0;
      const bD = b.discountPrice ? (1 - b.discountPrice / b.price) : 0;
      return bD - aD;
    }
    if (sortBy === "price_asc") return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
    if (sortBy === "price_desc") return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
    return 0;
  });

  const saleCount = products.filter(p => p.discountPrice).length;

  return (
    <>
      <style>{CSS}</style>

      <Navbar />

      {!loading && <HeroBanner campaigns={campaigns} />}
      {loading && <div className="cp-hero-sk" />}

      {!loading && campaigns.length > 0 && <CampaignStrip campaigns={campaigns} />}

      <div className="cp-stats-bar">
        <div className="cp-stats-inner">
          <div className="cp-stat">
            <span className="cp-stat-n">{saleCount}</span>
            <span className="cp-stat-l">Endirimli məhsul</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">{collections.length}</span>
            <span className="cp-stat-l">Kolleksiya</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">{campaigns.length}</span>
            <span className="cp-stat-l">Aktiv kampaniya</span>
          </div>
          <div className="cp-stat-div" />
          <div className="cp-stat">
            <span className="cp-stat-n">₼0</span>
            <span className="cp-stat-l">Çatdırılma (₼500+)</span>
          </div>
        </div>
      </div>

      <section id="camp-products" className="cp-section">
        <div className="cp-section-inner">
          <div className="cp-section-head">
            <div>
              <div className="cp-eyebrow"><span />ENDİRİMLİ MƏHSULLAR</div>
              <h2 className="cp-h2">Xüsusi <em>Qiymətlər</em></h2>
            </div>
            <div className="cp-controls">
              <select className="cp-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="discount">Ən böyük endirim</option>
                <option value="price_asc">Qiymət: Aşağıdan</option>
                <option value="price_desc">Qiymət: Yuxarıdan</option>
              </select>
            </div>
          </div>

          <div className="cp-tabs">
            {[
              { key: "all", label: "Hamısı", count: products.length },
              { key: "sale", label: "Endirimdə", count: saleCount },
              { key: "new", label: "Yeni gələn", count: products.filter(p => p.label === "new_in").length },
              { key: "bestseller", label: "Ən çox satan", count: products.filter(p => p.label === "best_seller").length },
            ].map(tab => (
              <button key={tab.key}
                className={`cp-tab ${activeTab === tab.key ? "on" : ""}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
                {tab.count > 0 && <span className="cp-tab-count">{tab.count}</span>}
              </button>
            ))}
          </div>

          {prodLoading
            ? <Skeleton count={8} type="prod" />
            : sorted.length > 0
              ? (
                <div className="cp-prod-grid">
                  {sorted.map(p => (
                    <ProductCard key={p.id} product={p} onAddCart={handleAddCart} adding={adding} inCart={inCart} />
                  ))}
                </div>
              )
              : (
                <div className="cp-empty">
                  <span className="cp-empty-ic">🏷️</span>
                  <p className="cp-empty-t">Bu kateqoriyada məhsul yoxdur</p>
                </div>
              )
          }
        </div>
      </section>

      <div className="cp-divider-banner">
        <div className="cp-divider-ov" />
        <div className="cp-divider-ct">
          <p className="cp-divider-ey">ENDİRİM KAMPANIYASI</p>
          <h2 className="cp-divider-h">₼500-dən yuxarı sifarişlərə <em>pulsuz çatdırılma</em></h2>
          <Link to="/categories" className="cp-btn-dark">Alış-verişə başla →</Link>
        </div>
      </div>

      <section id="camp-collections" className="cp-section cream">
        <div className="cp-section-inner">
          <div className="cp-section-head">
            <div>
              <div className="cp-eyebrow"><span />KOLLEKSİYALAR</div>
              <h2 className="cp-h2">Tam <em>Dəstlər</em></h2>
            </div>
            <Link to="/collections" className="cp-view-all">Bütün kolleksiyalar →</Link>
          </div>

          {collLoading
            ? <Skeleton count={3} type="coll" />
            : collections.length > 0
              ? (
                <div className="cp-coll-grid">
                  {collections.slice(0, 6).map(c => (
                    <CollectionCard key={c.id} col={c} />
                  ))}
                </div>
              )
              : (
                <div className="cp-empty">
                  <span className="cp-empty-ic">🛋️</span>
                  <p className="cp-empty-t">Kolleksiya tapılmadı</p>
                </div>
              )
          }
        </div>
      </section>

      <section className="cp-bottom-cta">
        <div className="cp-bottom-cta-inner">
          <div className="cp-eyebrow center"><span />XÜSUSİ TƏKLİF</div>
          <h2 className="cp-h2 center">Kolleksiyalarımızı<br /><em>kəşf edin</em></h2>
          <p className="cp-bottom-sub">Zövqünüzə uyğun mebeli tapın. Pulsuz dizayn konsultasiyası üçün bizimlə əlaqə saxlayın.</p>
          <div className="cp-bottom-btns">
            <Link to="/categories" className="cp-btn-dark">Məhsullara bax →</Link>
            <Link to="/contact" className="cp-btn-ghost">Bizimlə əlaqə</Link>
          </div>
        </div>
      </section>

      <Footer />

      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

@keyframes cpFadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
@keyframes cpFadeIn  { from{opacity:0} to{opacity:1} }
@keyframes cpSk      { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes cpSlide   { 0%{opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0} }
@keyframes cpPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cp-eyebrow{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:12px}
.cp-eyebrow span{display:block;width:28px;height:1px;background:#7A9E7E;flex-shrink:0}
.cp-eyebrow.center{justify-content:center}
.cp-eyebrow.center span{display:none}
.cp-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,4vw,52px);font-weight:300;line-height:1.12;color:#1C1C1C;margin-bottom:0}
.cp-h2 em{font-style:italic;color:#7A9E7E}
.cp-h2.center{text-align:center}
.cp-btn-dark{display:inline-flex;align-items:center;gap:8px;padding:15px 36px;background:#1C1C1C;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;border:none;cursor:pointer;text-decoration:none;transition:all .3s}
.cp-btn-dark:hover{background:#7A9E7E;transform:translateY(-2px);box-shadow:0 12px 32px rgba(122,158,126,.28)}
.cp-btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:none;color:#1C1C1C;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Sans',sans-serif;font-weight:500;border:1.5px solid #E5DDD4;cursor:pointer;text-decoration:none;transition:all .3s}
.cp-btn-ghost:hover{border-color:#1C1C1C}
.cp-view-all{font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B;border-bottom:1px solid #E5DDD4;padding-bottom:2px;text-decoration:none;transition:all .3s;white-space:nowrap}
.cp-view-all:hover{color:#7A9E7E;border-bottom-color:#7A9E7E}

.cp-hero{position:relative;height:92vh;min-height:640px;overflow:hidden;display:flex;align-items:center;background:#1C1C1C}
.cp-hero-sk{height:92vh;min-height:640px;background:linear-gradient(135deg,#EDE7DC,#D6CFC5);animation:cpSk 1.8s ease infinite}
.cp-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.2s ease}
.cp-hero-slide.visible{opacity:1}
.cp-hero-ov{position:absolute;inset:0;background:linear-gradient(105deg,rgba(28,28,28,.88) 0%,rgba(28,28,28,.5) 55%,rgba(28,28,28,.15) 100%)}
.cp-hero-ct{position:relative;z-index:2;max-width:680px;padding:0 90px;animation:cpFadeUp .9s cubic-bezier(.25,.46,.45,.94) .3s both}
.cp-hero-eyebrow{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:#7A9E7E;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:12px}
.cp-hero-line{display:block;width:32px;height:1px;background:#7A9E7E;flex-shrink:0}
.cp-hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,6.5vw,88px);font-weight:300;line-height:1.05;color:#fff;margin-bottom:20px}
.cp-hero-sub{font-size:16px;color:rgba(255,255,255,.65);max-width:420px;line-height:1.8;margin-bottom:36px;font-weight:300}
.cp-hero-meta{display:flex;align-items:center;gap:40px;margin-bottom:44px;flex-wrap:wrap}
.cp-hero-discount{display:flex;align-items:baseline;gap:8px}
.cp-hero-pct{font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:300;color:#C9A84C;line-height:1}
.cp-hero-pct-lbl{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5)}
.cp-hero-timer{display:flex;flex-direction:column;gap:6px}
.cp-hero-timer-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4)}
.cp-hero-btns{display:flex;gap:16px;flex-wrap:wrap}
.cp-hero-dots{position:absolute;bottom:36px;left:90px;display:flex;gap:8px;z-index:5}
.cp-hero-dot{width:28px;height:2px;background:rgba(255,255,255,.3);border:none;cursor:pointer;transition:all .3s;padding:0}
.cp-hero-dot.on{background:#fff;width:48px}

.cp-countdown{display:flex;align-items:baseline;gap:4px}
.cp-cd-n{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;line-height:1;min-width:28px;text-align:center}
.cp-cd-l{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.45);margin-right:4px}
.cp-cd-sep{font-family:'Cormorant Garamond',serif;font-size:24px;color:rgba(255,255,255,.3);margin:0 2px}
.cp-expired{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.4)}

.cp-strip{background:#F7F3EE;padding:100px 60px}
.cp-strip-inner{max-width:1380px;margin:0 auto}
.cp-strip-head{margin-bottom:56px}
.cp-strip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:28px}
.cp-strip-card{background:#fff;border:1px solid #E5DDD4;overflow:hidden;animation:cpFadeUp .6s both;transition:box-shadow .3s,transform .3s}
.cp-strip-card:hover{box-shadow:0 24px 56px rgba(28,28,28,.1);transform:translateY(-4px)}
.cp-strip-img-wrap{position:relative;height:220px;overflow:hidden;background:#EDE7DC}
.cp-strip-img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94)}
.cp-strip-card:hover .cp-strip-img{transform:scale(1.06)}
.cp-strip-img-ph{width:100%;height:100%;background:linear-gradient(135deg,#EDE7DC,#D6CFC5)}
.cp-strip-badge{position:absolute;top:16px;left:16px;background:#C9A84C;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;letter-spacing:.5px}
.cp-strip-body{padding:28px}
.cp-strip-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:#1C1C1C;margin-bottom:10px}
.cp-strip-desc{font-size:13px;color:#6B6B6B;line-height:1.7;margin-bottom:16px}
.cp-strip-timer{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.cp-strip-timer-lbl{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9CA3AF}
.cp-strip-timer .cp-countdown .cp-cd-n{color:#1C1C1C;font-size:22px}
.cp-strip-timer .cp-countdown .cp-cd-l{color:#6B6B6B}
.cp-strip-timer .cp-countdown .cp-cd-sep{color:#D1D5DB}
.cp-strip-cta{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7A9E7E;text-decoration:none;border-bottom:1px solid #C8DBC9;padding-bottom:2px;transition:all .3s;font-weight:500}
.cp-strip-cta:hover{color:#5a8060;border-bottom-color:#5a8060}

.cp-stats-bar{background:#1C1C1C;padding:40px 60px}
.cp-stats-inner{max-width:1380px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:wrap}
.cp-stat{text-align:center;padding:0 60px;flex-shrink:0}
.cp-stat-n{font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;display:block;line-height:1}
.cp-stat-l{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.4);display:block;margin-top:8px}
.cp-stat-div{width:1px;height:48px;background:rgba(255,255,255,.1);flex-shrink:0}

.cp-section{padding:110px 60px}
.cp-section.cream{background:#F7F3EE}
.cp-section-inner{max-width:1380px;margin:0 auto}
.cp-section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;gap:24px;flex-wrap:wrap}
.cp-controls{display:flex;align-items:center;gap:12px}
.cp-sort{padding:10px 16px;border:1px solid #E5DDD4;background:#F7F3EE;font-size:12px;font-family:'DM Sans',sans-serif;color:#1C1C1C;outline:none;cursor:pointer;-webkit-appearance:none;appearance:none;padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
.cp-sort:focus{border-color:#7A9E7E}

.cp-tabs{display:flex;gap:0;border-bottom:1px solid #E5DDD4;margin-bottom:48px;overflow-x:auto}
.cp-tab{padding:14px 28px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;white-space:nowrap;transition:all .3s;display:flex;align-items:center;gap:8px}
.cp-tab.on{color:#1C1C1C;border-bottom-color:#1C1C1C}
.cp-tab:hover:not(.on){color:#7A9E7E;border-bottom-color:#C8DBC9}
.cp-tab-count{background:#F7F3EE;color:#6B6B6B;font-size:10px;padding:2px 7px;border-radius:20px}
.cp-tab.on .cp-tab-count{background:#1C1C1C;color:#fff}

.cp-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px}
.cp-prod-card{cursor:pointer;animation:cpFadeUp .5s both}
.cp-prod-img-wrap{position:relative;height:320px;overflow:hidden;background:#EDE7DC;margin-bottom:16px}
.cp-prod-img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94)}
.cp-prod-card:hover .cp-prod-img{transform:scale(1.06)}
.cp-prod-badge{position:absolute;top:14px;left:14px;background:#C0392B;color:#fff;font-size:10px;font-weight:700;padding:5px 12px;letter-spacing:.5px}
.cp-prod-badge.new{background:#7A9E7E}
.cp-prod-hover{position:absolute;inset:0;display:flex;align-items:flex-end;padding:20px;opacity:0;transition:opacity .3s}
.cp-prod-card:hover .cp-prod-hover{opacity:1}
.cp-prod-hover-btn{width:100%;padding:13px;background:#1C1C1C;color:#fff;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:background .3s}
.cp-prod-hover-btn:hover:not(:disabled){background:#7A9E7E}
.cp-prod-hover-btn:disabled{opacity:.6;cursor:not-allowed}
.cp-prod-hover-btn.in-cart{background:#4A8A50;cursor:default}
.cp-prod-hover-btn.in-cart:hover{background:#4A8A50}
.cp-prod-body{padding:0 4px}
.cp-prod-cat{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;margin-bottom:6px}
.cp-prod-name{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:300;color:#1C1C1C;margin-bottom:10px;line-height:1.3}
.cp-prod-prices{display:flex;align-items:center;gap:10px}
.cp-prod-price{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:#1C1C1C}
.cp-prod-old{font-size:14px;color:#9CA3AF;text-decoration:line-through}

.cp-coll-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cp-coll-card{cursor:pointer;animation:cpFadeUp .5s both}
.cp-coll-img-wrap{position:relative;height:400px;overflow:hidden;background:#EDE7DC}
.cp-coll-img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.25,.46,.45,.94)}
.cp-coll-card:hover .cp-coll-img{transform:scale(1.06)}
.cp-coll-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(28,28,28,.78) 0%,rgba(28,28,28,.1) 55%,transparent 100%);transition:opacity .4s}
.cp-coll-card:hover .cp-coll-ov{opacity:.9}
.cp-coll-inf{position:absolute;bottom:0;left:0;right:0;padding:28px 24px}
.cp-coll-name{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#fff;margin-bottom:6px}
.cp-coll-price{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:14px}
.cp-coll-cta{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(8px);transition:all .3s;display:inline-block}
.cp-coll-card:hover .cp-coll-cta{opacity:1;transform:translateY(0)}

.cp-divider-banner{position:relative;height:380px;overflow:hidden;background:linear-gradient(135deg,#1C1C1C 0%,#2D3A2E 100%);display:flex;align-items:center;justify-content:center}
.cp-divider-ov{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(122,158,126,.15) 0%,transparent 70%)}
.cp-divider-ct{position:relative;z-index:1;text-align:center;padding:0 40px}
.cp-divider-ey{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#7A9E7E;margin-bottom:20px}
.cp-divider-h{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,48px);font-weight:300;color:#fff;line-height:1.2;margin-bottom:36px}
.cp-divider-h em{font-style:italic;color:#C8DBC9}

.cp-bottom-cta{padding:120px 60px;background:#fff;text-align:center}
.cp-bottom-cta-inner{max-width:560px;margin:0 auto}
.cp-bottom-sub{font-size:15px;color:#6B6B6B;line-height:1.8;margin:24px 0 40px;font-weight:300}
.cp-bottom-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}

.cp-sk-grid{display:grid;gap:28px}
.cp-sk-grid.prod{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.cp-sk-grid.coll{grid-template-columns:repeat(3,1fr)}
.cp-sk-card{background:linear-gradient(90deg,#EDE7DC 25%,#E5DDD4 50%,#EDE7DC 75%);background-size:200% 100%;animation:cpSk 1.5s ease infinite;height:380px}
.cp-sk-grid.prod .cp-sk-card{height:400px}

.cp-empty{text-align:center;padding:80px 40px}
.cp-empty-ic{font-size:48px;display:block;margin-bottom:16px;opacity:.5}
.cp-empty-t{font-family:'Cormorant Garamond',serif;font-size:22px;color:#6B6B6B;font-weight:300}

.cp-toast{position:fixed;bottom:32px;right:32px;z-index:999;display:flex;align-items:center;gap:10px;padding:14px 24px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;animation:cpFadeUp .3s ease;box-shadow:0 12px 40px rgba(28,28,28,.2)}
.cp-toast.ok{background:#1C1C1C;color:#fff}
.cp-toast.err{background:#C0392B;color:#fff}

@media(max-width:1100px){
  .cp-coll-grid{grid-template-columns:repeat(2,1fr)}
  .cp-stats-inner{gap:0}
  .cp-stat{padding:0 40px}
}
@media(max-width:900px){
  .cp-strip{padding:70px 32px}
  .cp-section{padding:80px 32px}
  .cp-stats-bar{padding:32px}
  .cp-hero-ct{padding:0 32px}
  .cp-hero-dots{left:32px}
  .cp-bottom-cta{padding:80px 32px}
}
@media(max-width:640px){
  .cp-hero{height:80vh}
  .cp-hero-pct{font-size:40px}
  .cp-coll-grid{grid-template-columns:1fr}
  .cp-coll-img-wrap{height:280px}
  .cp-stat{padding:0 20px}
  .cp-stat-div{height:32px}
  .cp-strip-grid{grid-template-columns:1fr}
  .cp-tabs{gap:0}
  .cp-tab{padding:12px 16px;font-size:11px}
  .cp-hero-btns{flex-direction:column}
  .cp-bottom-btns{flex-direction:column;align-items:center}
}
`;