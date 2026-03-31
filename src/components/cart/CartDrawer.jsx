// ─────────────────────────────────────────────────────────────
// Navbar-dan açılan böyük sliding cart panel
// + Full-screen checkout (nağd / kreditlə)
// 3 dil dəstəyi: AZ / EN / RU
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cartApi from "../../api/cartApi";
import "../../assets/pagesCss/CartDrawer.css";

// ── Azerbaijan banks & installment config ──────────────────
const BANKS = [
  { id: "kapital", name: "Kapital Bank",  rate: 1.8 },
  { id: "abbank",  name: "ABB",           rate: 2.0 },
  { id: "pasha",   name: "PAŞA Bank",     rate: 1.7 },
  { id: "access",  name: "AccessBank",    rate: 2.2 },
  { id: "atb",     name: "ATB",           rate: 1.9 },
  { id: "leobank", name: "Leobank",       rate: 2.1 },
];
const PERIODS = [3, 6, 12, 24];
const FREE_SHIPPING = 500;

// ── Tiny helpers ───────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`cd-toast${type === "error" ? " error" : ""}`}>
      <span className="cd-toast-dot" />
      {msg}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CHECKOUT MODAL
// ──────────────────────────────────────────────────────────
function CheckoutModal({ items, onClose, onSuccess, t }) {
  const [step,       setStep]       = useState(1);  // 1=delivery, 2=payment, 3=confirm
  const [payMethod,  setPayMethod]  = useState("cash"); // cash | credit
  const [bank,       setBank]       = useState(null);
  const [period,     setPeriod]     = useState(12);
  const [agreed,     setAgreed]     = useState(false);
  const [placing,    setPlacing]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [errors,     setErrors]     = useState({});
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", phone: "", city: "Bakı", address: "",
  });

  const subtotal  = items.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);
  const shipping  = subtotal >= FREE_SHIPPING ? 0 : 15;
  const orderBase = subtotal + shipping;

  // Credit calc
  const selectedBank    = BANKS.find(b => b.id === bank);
  const monthlyRate     = selectedBank ? selectedBank.rate / 100 : 0;
  const creditTotal     = selectedBank
    ? orderBase * Math.pow(1 + monthlyRate, period)
    : orderBase;
  const monthlyPayment  = selectedBank ? creditTotal / period : 0;
  const displayTotal    = payMethod === "credit" && selectedBank
    ? creditTotal
    : orderBase;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateStep1 = () => {
    const err = {};
    if (!form.name.trim())    err.name    = t("cart.name_required");
    if (!form.phone.trim())   err.phone   = t("cart.phone_required");
    if (!form.address.trim()) err.address = t("cart.address_required");
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    if (payMethod === "credit" && !bank) {
      setErrors({ bank: t("cart.bank_required") });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handlePlaceOrder = async () => {
    if (!agreed) return;
    setPlacing(true);
    try {
      // Simulate API call — replace with real order API
      await new Promise(r => setTimeout(r, 1400));
      setSuccess(true);
    } catch {
      setErrors({ submit: t("cart.error") });
    } finally {
      setPlacing(false);
    }
  };

  if (success) return (
    <div className="cko">
      <header className="cko-header">
        <span className="cko-logo"><span>AMORE</span> MEBEL</span>
        <div />
      </header>
      <div className="cko-success">
        <div className="cko-success-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="24" cy="24" r="20"/>
            <path d="M15 24l7 7 11-11" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="cko-success-title">
          {t("cart.order_placed").split(" ").slice(0,-1).join(" ")}{" "}
          <em>{t("cart.order_placed").split(" ").slice(-1)}</em>
        </h1>
        <p className="cko-success-desc">{t("cart.order_placed_desc")}</p>
        <button className="cko-success-btn" onClick={() => { onSuccess(); navigate("/"); }}>
          ← Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="cko">
      {/* Header */}
      <header className="cko-header">
        <Link to="/" className="cko-logo" onClick={onClose}><span>AMORE</span> MEBEL</Link>
        <button className="cko-back" onClick={step > 1 ? () => setStep(s => s-1) : onClose}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t("cart.back")}
        </button>
      </header>

      {/* Steps */}
      <div className="cko-steps">
        {[
          { n:1, label: t("cart.step_delivery") },
          { n:2, label: t("cart.step_payment") },
          { n:3, label: t("cart.step_confirm") },
        ].map(({ n, label }, i, arr) => (
          <div key={n} style={{ display:"flex", alignItems:"center" }}>
            <div className={`cko-step ${step===n?"active":""} ${step>n?"done":""}`}>
              <div className="cko-step-num">
                {step > n
                  ? <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : n
                }
              </div>
              <span className="cko-step-label">{label}</span>
            </div>
            {i < arr.length-1 && <div className={`cko-step-line ${step>n?"done":""}`} />}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="cko-body">
        {/* Left: Form */}
        <div className="cko-form-area">

          {/* STEP 1: Delivery */}
          {step === 1 && (
            <>
              <h2 className="cko-section-title">
                {t("cart.delivery_info").split(" ")[0]}{" "}
                <em>{t("cart.delivery_info").split(" ").slice(1).join(" ")}</em>
              </h2>
              <div className="cko-grid">
                <div className="cko-field">
                  <label className="cko-label">{t("cart.full_name")}</label>
                  <input
                    className={`cko-input${errors.name?" error":""}`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("cart.full_name_ph")}
                  />
                  {errors.name && <span className="cko-field-error">{errors.name}</span>}
                </div>
                <div className="cko-field">
                  <label className="cko-label">{t("cart.phone")}</label>
                  <input
                    className={`cko-input${errors.phone?" error":""}`}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t("cart.phone_ph")}
                  />
                  {errors.phone && <span className="cko-field-error">{errors.phone}</span>}
                </div>
                <div className="cko-field">
                  <label className="cko-label">{t("cart.city")}</label>
                  <input
                    className="cko-input"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder={t("cart.city_ph")}
                  />
                </div>
                <div className="cko-field span2">
                  <label className="cko-label">{t("cart.address")}</label>
                  <input
                    className={`cko-input${errors.address?" error":""}`}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder={t("cart.address_ph")}
                  />
                  {errors.address && <span className="cko-field-error">{errors.address}</span>}
                </div>
              </div>
              <button className="cko-place-btn" style={{ marginTop:32 }} onClick={nextStep}>
                {t("cart.step_payment")} →
              </button>
            </>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <>
              <h2 className="cko-section-title">
                {t("cart.payment_method").split(" ").slice(0,1)}{" "}
                <em>{t("cart.payment_method").split(" ").slice(1).join(" ")}</em>
              </h2>

              {/* Method cards */}
              <div className="cko-pay-methods">
                <div
                  className={`cko-pay-card${payMethod==="cash"?" selected":""}`}
                  onClick={() => setPayMethod("cash")}
                >
                  <div className="cko-pay-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="6" width="20" height="12" rx="2"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M6 12h.01M18 12h.01"/>
                    </svg>
                  </div>
                  <div>
                    <p className="cko-pay-name">{t("cart.pay_cash")}</p>
                    <p className="cko-pay-desc">{t("cart.cash_desc")}</p>
                  </div>
                </div>
                <div
                  className={`cko-pay-card${payMethod==="credit"?" selected":""}`}
                  onClick={() => setPayMethod("credit")}
                >
                  <div className="cko-pay-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <path d="M2 10h20"/>
                      <path d="M6 15h4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="cko-pay-name">{t("cart.pay_credit")}</p>
                    <p className="cko-pay-desc">{t("cart.credit_desc")}</p>
                  </div>
                </div>
              </div>

              {/* Credit options */}
              {payMethod === "credit" && (
                <div className="cko-credit-section">
                  <h3 className="cko-credit-title">{t("cart.select_bank")}</h3>
                  <div className="cko-banks">
                    {BANKS.map(b => (
                      <button
                        key={b.id}
                        className={`cko-bank-btn${bank===b.id?" selected":""}`}
                        onClick={() => { setBank(b.id); setErrors({}); }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  {errors.bank && <p className="cko-field-error" style={{marginBottom:12}}>{errors.bank}</p>}

                  <p className="cko-label" style={{marginBottom:10}}>{t("cart.installment_period")}</p>
                  <div className="cko-periods">
                    {PERIODS.map(p => (
                      <button
                        key={p}
                        className={`cko-period-btn${period===p?" selected":""}`}
                        onClick={() => setPeriod(p)}
                      >
                        {p} {t("cart.months")}
                      </button>
                    ))}
                  </div>

                  {bank && (
                    <div className="cko-credit-calc">
                      <div className="cko-calc-row">
                        <span>{t("cart.interest_rate")}</span>
                        <span>{selectedBank?.rate}%/ay</span>
                      </div>
                      <div className="cko-calc-row">
                        <span>{t("cart.total_credit")}</span>
                        <span>₼{creditTotal.toFixed(2)}</span>
                      </div>
                      <div className="cko-calc-row highlight">
                        <span>{t("cart.monthly_payment")}</span>
                        <span>₼{monthlyPayment.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className="cko-place-btn" onClick={nextStep}>
                {t("cart.step_confirm")} →
              </button>
            </>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <>
              <h2 className="cko-section-title">
                <em>{t("cart.confirm_order")}</em>
              </h2>

              {/* Delivery summary */}
              <div style={{ background:"#F7F3EE", padding:"20px 24px", marginBottom:20, borderLeft:"3px solid #7A9E7E" }}>
                <p className="cko-label" style={{marginBottom:8}}>{t("cart.step_delivery")}</p>
                <p style={{fontSize:14, color:"#1C1C1C", lineHeight:1.7}}>
                  {form.name} · {form.phone}<br/>
                  {form.address}, {form.city}
                </p>
              </div>

              {/* Payment summary */}
              <div style={{ background:"#F7F3EE", padding:"20px 24px", marginBottom:32, borderLeft:"3px solid #C8DBC9" }}>
                <p className="cko-label" style={{marginBottom:8}}>{t("cart.step_payment")}</p>
                {payMethod === "cash"
                  ? <p style={{fontSize:14, color:"#1C1C1C"}}>{t("cart.pay_cash")} — ₼{orderBase.toFixed(2)}</p>
                  : <p style={{fontSize:14, color:"#1C1C1C", lineHeight:1.7}}>
                      {t("cart.pay_credit")} · {selectedBank?.name}<br/>
                      {period} {t("cart.months")} · ₼{monthlyPayment.toFixed(2)}/{t("cart.months").replace("s","")}<br/>
                      <span style={{color:"#6B6B6B"}}>{t("cart.total_credit")}: ₼{creditTotal.toFixed(2)}</span>
                    </p>
                }
              </div>

              {/* Terms */}
              <div
                className={`cko-terms${agreed?" checked":""}`}
                onClick={() => setAgreed(a => !a)}
              >
                <div className="cko-terms-box" />
                <span className="cko-terms-text">{t("cart.agree_terms")}</span>
              </div>

              {errors.submit && (
                <p className="cko-field-error" style={{marginTop:10}}>{errors.submit}</p>
              )}

              <button
                className="cko-place-btn"
                onClick={handlePlaceOrder}
                disabled={!agreed || placing}
              >
                {placing ? t("cart.processing") : t("cart.place_order")}
                {!placing && (
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right: Order panel */}
        <aside className="cko-order-panel">
          <h3 className="cko-order-title">{t("cart.order_summary")}</h3>
          <div className="cko-order-items">
            {items.map((item, i) => (
              <div className="cko-order-item" key={item.id ?? i}>
                {item.productImage
                  ? <img src={item.productImage} alt={item.productName ?? item.collectionName} className="cko-order-item-img"/>
                  : <div className="cko-order-item-img" style={{background:"#EDE7DC"}}/>
                }
                <div className="cko-order-item-name">
                  {item.productName ?? item.collectionName ?? "—"}
                  <div className="cko-order-item-qty">×{item.quantity}</div>
                </div>
                <span className="cko-order-item-price">₼{((item.productPrice ?? item.collectionPrice ?? 0)*item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="cko-order-divider"/>
          <div className="cko-order-row">
            <span className="cko-order-label">{t("cart.subtotal")}</span>
            <span className="cko-order-val">₼{subtotal.toFixed(2)}</span>
          </div>
          <div className="cko-order-row">
            <span className="cko-order-label">{t("cart.shipping")}</span>
            <span className={`cko-order-val${shipping===0?" free":""}`}>
              {shipping === 0 ? t("cart.shipping_free") : `₼${shipping.toFixed(2)}`}
            </span>
          </div>
          {payMethod === "credit" && bank && (
            <div className="cko-order-row">
              <span className="cko-order-label">{t("cart.interest_rate")}</span>
              <span className="cko-order-val" style={{color:"#C8A47A"}}>+₼{(creditTotal - orderBase).toFixed(2)}</span>
            </div>
          )}
          <div className="cko-order-total-row">
            <span className="cko-order-total-label">{t("cart.total")}</span>
            <span className="cko-order-total-val">₼{displayTotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CART DRAWER
// ──────────────────────────────────────────────────────────
export default function CartDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cart,     setCart]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [updating, setUpdating] = useState(new Set());
  const [toast,    setToast]    = useState(null);
  const [closing,  setClosing]  = useState(false);
  const [checkout, setCheckout] = useState(false);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    cartApi.get()
      .then(res => setCart(res))
      .catch(() => showToast(t("cart.error"), "error"))
      .finally(() => setLoading(false));
  }, [isOpen, t]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const showToast = (msg, type="info") => setToast({ msg, type });

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 350);
  };

  const handleUpdate = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(p => new Set(p).add(itemId));
    try {
      await cartApi.updateItem(itemId, newQty);
      setCart(p => ({ ...p, items: p.items.map(it => it.id===itemId ? {...it,quantity:newQty} : it) }));
    } catch { showToast(t("cart.update_error"), "error"); }
    finally { setUpdating(p => { const s=new Set(p); s.delete(itemId); return s; }); }
  };

  const handleRemove = async (itemId) => {
    setUpdating(p => new Set(p).add(itemId));
    try {
      await cartApi.removeItem(itemId);
      setCart(p => ({ ...p, items: p.items.filter(it => it.id !== itemId) }));
    } catch {
      showToast(t("cart.remove_error"), "error");
      setUpdating(p => { const s=new Set(p); s.delete(itemId); return s; });
    }
  };

  const handleClear = async () => {
    try {
      await cartApi.clear();
      setCart(p => ({ ...p, items: [] }));
    } catch { showToast(t("cart.error"), "error"); }
  };

  const items      = cart?.items ?? [];
  const totalItems = items.reduce((s, it) => s + (it.quantity ?? 1), 0);
  const subtotal   = items.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0)*it.quantity, 0);
  const shippingFree = subtotal >= FREE_SHIPPING;

  if (!isOpen) return null;

  // Full-screen checkout
  if (checkout) return (
    <CheckoutModal
      items={items}
      onClose={() => setCheckout(false)}
      onSuccess={() => { setCheckout(false); setCart(null); handleClose(); }}
      t={t}
    />
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`cd-overlay${closing?" closing":""}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`cd${closing?" closing":""}`} role="dialog" aria-modal="true">

        {/* Header */}
        <header className="cd-header">
          <div className="cd-header-left">
            <p className="cd-eyebrow">{t("nav.cart")}</p>
            <h2 className="cd-title">
              {t("cart.title").split(" ")[0]}{" "}
              <em>{t("cart.title").split(" ").slice(1).join(" ") || ""}</em>
            </h2>
            {!loading && items.length > 0 && (
              <p className="cd-count">{totalItems} {t("cart.items")}</p>
            )}
          </div>
          <button className="cd-close" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="cd-body">

          {/* Loading */}
          {loading && (
            <div className="cd-loading">
              <div className="cd-spinner" />
              <span className="cd-loading-text">{t("cart.loading")}</span>
            </div>
          )}

          {/* Empty */}
          {!loading && items.length === 0 && (
            <div className="cd-empty">
              <div className="cd-empty-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M10 14h4l3 18h14l3-14H17"/>
                  <circle cx="20" cy="36" r="2"/>
                  <circle cx="32" cy="36" r="2"/>
                  <path d="M6 8h5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="cd-empty-title">{t("cart.empty_title")}</h3>
              <p className="cd-empty-desc">{t("cart.empty_desc")}</p>
              <Link to="/categories" className="cd-empty-btn" onClick={handleClose}>
                {t("cart.go_shopping")} →
              </Link>
            </div>
          )}

          {/* Items column */}
          {!loading && items.length > 0 && (
            <div className="cd-items-col">
              {/* Col header */}
              <div className="cd-col-head">
                <span>{t("featured_products.tabs.all")}</span>
                <span>{t("cart.title")}</span>
                <span style={{textAlign:"center"}}>{t("cart.quantity")}</span>
                <span style={{textAlign:"right"}}>{t("cart.subtotal")}</span>
                <span />
              </div>

              {items.map((item, idx) => {
                const price    = item.productPrice ?? item.collectionPrice ?? 0;
                const image    = item.productImage ?? null;
                const name     = item.productName ?? item.collectionName ?? "—";
                const isUpd    = updating.has(item.id);
                return (
                  <div key={item.id ?? idx} className={`cd-item${isUpd?" updating":""}`}>
                    {/* Image */}
                    {image
                      ? <img src={image} alt={name} className="cd-item-img"/>
                      : <div className="cd-item-img-placeholder">
                          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                            <rect x="8" y="14" width="32" height="24" rx="2"/>
                            <path d="M16 14V12a8 8 0 0116 0v2"/>
                          </svg>
                        </div>
                    }

                    {/* Info */}
                    <div className="cd-item-info">
                      <p className="cd-item-name">{name}</p>
                      {item.selectedColor && <p className="cd-item-cat">{item.selectedColor}</p>}
                      <p className="cd-item-unit-price">₼{price.toFixed(2)} / {t("cart.price_each")}</p>
                      {/* Qty (shown inline on mobile) */}
                      <div style={{marginTop:10}}>
                        <div className="cd-qty">
                          <button className="cd-qty-btn" onClick={() => handleUpdate(item.id, item.quantity-1)} disabled={item.quantity<=1||isUpd}>−</button>
                          <span className="cd-qty-val">{item.quantity}</span>
                          <button className="cd-qty-btn" onClick={() => handleUpdate(item.id, item.quantity+1)} disabled={isUpd}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Line price */}
                    <span className="cd-item-line-price">₼{(price*item.quantity).toFixed(2)}</span>

                    {/* Remove */}
                    <button
                      className="cd-item-remove"
                      onClick={() => handleRemove(item.id)}
                      aria-label={t("cart.remove")}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Clear */}
              {items.length > 0 && (
                <button className="cd-clear-btn" onClick={handleClear}>
                  <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
                    <path d="M4 5h12M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t("cart.clear_cart")}
                </button>
              )}
            </div>
          )}

          {/* Summary column */}
          {!loading && items.length > 0 && (
            <div className="cd-summary-col">
              <div className="cd-summary-inner">
                <h3 className="cd-summary-title">{t("cart.order_summary")}</h3>

                <div className="cd-sum-row">
                  <span className="cd-sum-label">{t("cart.subtotal")}</span>
                  <span className="cd-sum-val">₼{subtotal.toFixed(2)}</span>
                </div>
                <div className="cd-sum-row">
                  <span className="cd-sum-label">{t("cart.shipping")}</span>
                  <span className={`cd-sum-val${shippingFree?" free":""}`}>
                    {shippingFree ? t("cart.shipping_free") : t("cart.shipping_calc")}
                  </span>
                </div>

                <div className="cd-divider"/>

                <div className="cd-total-row">
                  <span className="cd-total-label">{t("cart.total")}</span>
                  <span className="cd-total-val">₼{subtotal.toFixed(2)}</span>
                </div>

                {!shippingFree && (
                  <div className="cd-shipping-note">{t("cart.free_shipping_msg")}</div>
                )}

                <button className="cd-checkout-btn" onClick={() => { handleClose(); navigate("/checkout"); }}>
                  {t("cart.checkout")}
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <button className="cd-continue-link" onClick={handleClose}>
                  ← {t("cart.continue_shopping")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
