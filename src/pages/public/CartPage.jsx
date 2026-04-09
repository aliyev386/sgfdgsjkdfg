import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cartApi from "../../api/cartApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/CartPage.css";

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`cp-toast${type === "error" ? " error" : ""}`}>
      <span className="cp-toast-dot" />
      {message}
    </div>
  );
}

function CartItem({ item, onUpdate, onRemove, updating, t }) {
  const { product, quantity, id: itemId } = item;
  const price  = product?.price  ?? 0;
  const image  = product?.image  ?? product?.images?.[0] ?? null;
  const name   = product?.name   ?? "—";
  const slug   = product?.slug   ?? product?.id ?? "#";
  const subtotal = (price * quantity).toFixed(2);

  return (
    <div className={`cp-item${updating ? " updating" : ""}`}>
      <div className="cp-item-img-wrap">
        <Link to={`/details/${product?.id ?? slug}`}>
          {image
            ? <img src={image} alt={name} className="cp-item-img" />
            : (
              <div
                className="cp-item-img"
                style={{
                  background: "#EDE7DC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 48 48" fill="none" width="32" height="32">
                  <rect x="8" y="14" width="32" height="24" rx="2" stroke="#C0B5AA" strokeWidth="1.5"/>
                  <path d="M16 14V12a8 8 0 0116 0v2" stroke="#C0B5AA" strokeWidth="1.5"/>
                </svg>
              </div>
            )
          }
        </Link>
      </div>

      <div className="cp-item-body">
        <div className="cp-item-top">
          <div className="cp-item-info">
            <Link to={`/details/${product?.id ?? slug}`} style={{ textDecoration: "none" }}>
              <h3 className="cp-item-name">{name}</h3>
            </Link>
            {product?.category && (
              <p className="cp-item-meta">{product.category}</p>
            )}
            <p className="cp-item-price-each">
              ₼{price.toFixed(2)} / {t("cart.price_each")}
            </p>
          </div>
          <button
            className="cp-item-remove"
            onClick={() => onRemove(itemId)}
            aria-label={t("cart.remove")}
            title={t("cart.remove")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        <div className="cp-item-bottom">
          <div className="cp-qty" aria-label={t("cart.quantity")}>
            <button
              className="cp-qty-btn"
              onClick={() => onUpdate(itemId, quantity - 1)}
              disabled={quantity <= 1 || updating}
              aria-label="−"
            >
              −
            </button>
            <span className="cp-qty-val">{quantity}</span>
            <button
              className="cp-qty-btn"
              onClick={() => onUpdate(itemId, quantity + 1)}
              disabled={updating}
              aria-label="+"
            >
              +
            </button>
          </div>

          <span className="cp-item-subtotal">₼{subtotal}</span>
        </div>
      </div>
    </div>
  );
}

function CartSummary({ items, onCheckout, t }) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const FREE_SHIPPING_THRESHOLD = 500;
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <aside className="cp-summary">
      <h2 className="cp-summary-title">{t("cart.order_summary")}</h2>

      <div className="cp-summary-row">
        <span className="cp-summary-label">{t("cart.subtotal")}</span>
        <span className="cp-summary-value">₼{subtotal.toFixed(2)}</span>
      </div>

      <div className="cp-summary-row">
        <span className="cp-summary-label">{t("cart.shipping")}</span>
        <span className={`cp-summary-value${shippingFree ? " free" : ""}`}>
          {shippingFree ? t("cart.shipping_free") : t("cart.shipping_calc")}
        </span>
      </div>

      <div className="cp-summary-divider" />

      <div className="cp-summary-total-row">
        <span className="cp-summary-total-label">{t("cart.total")}</span>
        <span className="cp-summary-total-value">₼{subtotal.toFixed(2)}</span>
      </div>

      <button className="cp-checkout-btn" onClick={onCheckout}>
        {t("cart.checkout")}
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
          <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {!shippingFree && (
        <p className="cp-shipping-note">{t("cart.free_shipping_msg")}</p>
      )}
    </aside>
  );
}

export default function CartPage() {
  const { t }     = useTranslation();
  const navigate  = useNavigate();

  const [cart,       setCart]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [updating,   setUpdating]   = useState(new Set());
  const [toast,      setToast]      = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.get();
      setCart(res.data);
    } catch (err) {
      setError(err?.userMessage || t("cart.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
  };

  const handleUpdate = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(prev => new Set(prev).add(itemId));
    try {
      await cartApi.updateItem(itemId, newQty);
      setCart(prev => ({
        ...prev,
        items: prev.items.map(it =>
          it.id === itemId ? { ...it, quantity: newQty } : it
        ),
      }));
    } catch {
      showToast(t("cart.update_error"), "error");
    } finally {
      setUpdating(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  };

  const handleRemove = async (itemId) => {
    setUpdating(prev => new Set(prev).add(itemId));
    try {
      await cartApi.removeItem(itemId);
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(it => it.id !== itemId),
      }));
    } catch {
      showToast(t("cart.remove_error"), "error");
      setUpdating(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  };

  const handleClear = async () => {
    if (!window.confirm(t("cart.clear_cart") + "?")) return;
    try {
      await cartApi.clear();
      setCart(prev => ({ ...prev, items: [] }));
    } catch {
      showToast(t("cart.error"), "error");
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const items      = cart?.items ?? [];
  const totalItems = items.reduce((s, it) => s + (it.quantity ?? 1), 0);
  return (
    <>
    <Navbar />
    <div className="cp">
      <div className="cp-header">
        <div className="cp-header-inner">
          <p className="cp-eyebrow">{t("nav.cart")}</p>
          <h1 className="cp-title">
            {t("cart.title").split(" ")[0]}{" "}
            <em>{t("cart.title").split(" ").slice(1).join(" ") || ""}</em>
          </h1>
          {!loading && !error && items.length > 0 && (
            <p className="cp-item-count">
              {totalItems} {totalItems === 1 ? t("cart.item") : t("cart.items")}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="cp-loading">
          <div className="cp-spinner" />
          <span className="cp-loading-text">{t("cart.loading")}</span>
        </div>
      )}

      {!loading && error && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 60px" }}>
          <div className="cp-error">
            <span className="cp-error-icon">⚠</span>
            <span className="cp-error-msg">{error}</span>
            <button className="cp-error-retry" onClick={fetchCart}>
              {t("common.error").split(".")[0]} →
            </button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="cp-empty">
          <div className="cp-empty-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="24" cy="24" r="20"/>
              <path d="M15 24h18M24 15v18" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="cp-empty-title">{t("cart.empty_title")}</h2>
          <p className="cp-empty-desc">{t("cart.empty_desc")}</p>
          <Link to="/categories" className="cp-empty-btn">
            {t("cart.go_shopping")}
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="cp-body">

          <div>
            <div className="cp-section-label">
              <span>{t("nav.shop")}</span>
              <span>{t("cart.quantity")}</span>
              <span>{t("cart.subtotal")}</span>
              <span />
            </div>

            <div className="cp-items">
              {items.map((item, idx) => (
                <CartItem
                  key={item.id ?? idx}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  updating={updating.has(item.id)}
                  t={t}
                />
              ))}
            </div>

            <div className="cp-cart-actions">
              <button className="cp-clear-btn" onClick={handleClear}>
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path d="M4 5h12M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t("cart.clear_cart")}
              </button>

              <Link to="/categories" className="cp-continue-link">
                ← {t("cart.continue_shopping")}
              </Link>
            </div>
          </div>

          <CartSummary
            items={items}
            onCheckout={handleCheckout}
            t={t}
          />
        </div>
      )}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    <Footer />
    </>
  );
}