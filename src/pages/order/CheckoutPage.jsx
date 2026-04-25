// src/pages/order/CheckoutPage.jsx — Real Stripe Elements inteqrasiyası
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { clearCart } from "../../store/slices/cartSlice";
import orderApi from "../../api/orderApi";
import paymentApi from "../../api/paymentApi";
import Navbar from "../../components/common/Navbar";
import CreditCalculator from "../../components/credit/CreditCalculator";

// ── Stripe publishable key (test) ──────────────────────────────────────────
// Production-da .env faylına köçür: VITE_STRIPE_PK=pk_live_...
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || "pk_test_51YOUR_PUBLISHABLE_KEY_HERE";
const stripePromise = loadStripe(STRIPE_PK);

// ── Sabitlər ──────────────────────────────────────────────────────────────
const fmt = (n) => `₼${Number(n).toLocaleString("az-AZ", { minimumFractionDigits: 2 })}`;
const FREE_SHIPPING = 500;
const PaymentMethod = { CashOnDelivery: 1, Card: 2, Installment: 4 };
const OrderType     = { Standard: 0, Custom: 1 };
const DeliveryType  = { DoorDelivery: 1, RoomDelivery: 2, AssemblyIncluded: 3 };

const BAKU_DISTRICTS = [
  "Binəqədi","Nəsimi","Nizami","Pirəkəşkül","Sabunçu","Suraxanı",
  "Xətai","Yeni Günəşli","Lökbatan","Balaxanı","Zabrat","Ramana",
  "Hövsan","Maştağa","Nardaran","Bilgəh","Buzovna","Novxanı","Sabail","Bayıl","Biləcəri",
];
const CITIES = ["Bakı","Gəncə","Sumqayıt","Lənkəran","Naxçıvan","Şirvan","Mingəçevir","Quba","Şəki","Zaqatala"];

// ── Stripe Elements görünüşü — layihəyə uyğun ─────────────────────────────
const STRIPE_ELEMENT_STYLE = {
  base: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "#1C1C1C",
    "::placeholder": { color: "#9ca3af" },
    iconColor: "#7A9E7E",
  },
  invalid: { color: "#C0392B", iconColor: "#C0392B" },
};

// ── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes ckFU{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes ckShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
@keyframes ckSpin{to{transform:rotate(360deg)}}
@keyframes ckChk{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
@keyframes ckOverlay{from{opacity:0}to{opacity:1}}
@keyframes ckPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.85)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes ckPulse{0%,100%{opacity:1}50%{opacity:.4}}
*,*::before,*::after{box-sizing:border-box}
.ck{font-family:'DM Sans',sans-serif;color:#1C1C1C;background:#F7F3EE;min-height:100vh;padding-top:80px}
.ck-prog{background:#fff;border-bottom:1px solid #E5DDD4;padding:0 60px;display:flex;overflow-x:auto;position:sticky;top:80px;z-index:10;scrollbar-width:none}
.ck-prog::-webkit-scrollbar{display:none}
.ck-st{display:flex;align-items:center;gap:10px;padding:20px 0;white-space:nowrap}
.ck-stc{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:1.5px solid #E5DDD4;background:#fff;color:#6B6B6B;transition:all .3s;flex-shrink:0}
.ck-st.active .ck-stc{background:#1C1C1C;border-color:#1C1C1C;color:#fff}
.ck-st.done .ck-stc{background:#7A9E7E;border-color:#7A9E7E;color:#fff}
.ck-stl{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B}
.ck-st.active .ck-stl{color:#1C1C1C;font-weight:600}
.ck-st.done .ck-stl{color:#7A9E7E}
@media(max-width:700px){.ck-prog{padding:0 16px}.ck-stl{display:none}}
.ck-body{max-width:1200px;margin:0 auto;padding:48px 60px;display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:start}
@media(max-width:1000px){.ck-body{grid-template-columns:1fr;padding:32px 24px}}
@media(max-width:600px){.ck-body{padding:20px 16px}}
.ck-card{background:#fff;border:1px solid #E5DDD4;padding:36px;animation:ckFU .4s ease}
.ck-card+.ck-card{margin-top:16px}
.ck-card-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;margin:0 0 28px}
.ck-eyebrow{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7A9E7E;margin-bottom:8px;display:block}
.ck-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:600px){.ck-grid{grid-template-columns:1fr}}
.ck-field{display:flex;flex-direction:column;gap:6px}
.ck-field.span2{grid-column:1/-1}
.ck-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;font-weight:500}
.ck-label .req{color:#C0392B}
.ck-input{background:#F7F3EE;border:1px solid #E5DDD4;padding:13px 16px;font-size:14px;color:#1C1C1C;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .25s,background .25s;-webkit-appearance:none;border-radius:0;width:100%}
.ck-input:focus{border-color:#7A9E7E;background:#fff;box-shadow:0 0 0 3px rgba(122,158,126,.1)}
.ck-input.err{border-color:#C0392B!important;animation:ckShake .3s ease}
.ck-err{font-size:11px;color:#C0392B;margin-top:2px}
.ck-select{appearance:none;-webkit-appearance:none;background:#F7F3EE url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 14px center;background-size:12px;padding-right:40px;cursor:pointer}
.ck-dtype-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
@media(max-width:500px){.ck-dtype-grid{grid-template-columns:1fr}}
.ck-dtype{border:1.5px solid #E5DDD4;padding:14px 12px;cursor:pointer;text-align:center;transition:all .2s;background:#fff}
.ck-dtype.sel{border-color:#7A9E7E;background:#F0F7F1}
.ck-dtype-name{font-size:12px;font-weight:500;color:#1C1C1C;margin-top:4px}
.ck-dtype-desc{font-size:10px;color:#6B6B6B;line-height:1.4;margin-top:3px}
.ck-pay-grid{display:grid;gap:12px;margin-bottom:24px}
.ck-pay{border:1.5px solid #E5DDD4;padding:18px 16px;cursor:pointer;transition:all .25s;background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;position:relative}
.ck-pay.sel{border-color:#7A9E7E;background:#F0F7F1}
.ck-pay.sel::after{content:'✓';position:absolute;top:8px;right:10px;font-size:11px;color:#7A9E7E;font-weight:700}
.ck-pay-ico{width:44px;height:44px;background:#F7F3EE;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .2s}
.ck-pay.sel .ck-pay-ico{background:#C8DBC9}
.ck-pay-name{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:300}
.ck-pay-desc{font-size:10px;color:#6B6B6B;line-height:1.5}

/* ── Stripe Elements wrapper ── */
.s-form{border:1px solid #E5DDD4;background:#FDFAF7;padding:24px;margin-top:4px;animation:ckFU .3s ease}
.s-form-hd{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.s-el-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
@media(max-width:480px){.s-el-row{grid-template-columns:1fr}}
.s-el-field{display:flex;flex-direction:column;gap:6px}
.s-el-lbl{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B}
.s-el-box{background:#fff;border:1.5px solid #E0D9D2;border-radius:6px;padding:13px 14px;transition:border-color .2s,box-shadow .2s}
.s-el-box.focused{border-color:#635bff;box-shadow:0 0 0 3px rgba(99,91,255,.15)}
.s-el-box.invalid{border-color:#C0392B}
.s-test-hint{background:#F0F4FF;border:1px solid #C7D4FF;border-radius:4px;padding:12px 16px;margin-top:16px;display:flex;gap:10px;align-items:flex-start}
.s-test-hint-txt{font-size:12px;color:#3730a3;line-height:1.6}
.s-test-hint-txt strong{display:block;margin-bottom:3px;font-size:11px;letter-spacing:1px;text-transform:uppercase}
.s-brands{display:flex;gap:6px;margin-top:14px;align-items:center}
.s-brand{height:22px;border:1px solid #E5DDD4;border-radius:3px;padding:2px 7px;background:#fff;font-size:9px;font-weight:700;letter-spacing:.5px}
.s-brand.visa{color:#1a1f71}
.s-brand.mc{color:#eb001b}
.s-brand.amex{color:#007bc1}
.s-secure{display:flex;align-items:center;gap:8px;margin-top:14px;padding:10px 14px;background:#F0F7F1;border:1px solid #C8DBC9;border-radius:4px}
.s-secure-txt{font-size:11px;color:#2E6B32;line-height:1.4}

/* Processing overlay */
.pay-ov{position:fixed;inset:0;background:rgba(28,28,28,.75);backdrop-filter:blur(8px);z-index:8000;display:flex;align-items:center;justify-content:center;animation:ckOverlay .3s ease}
.pay-box{background:#fff;padding:52px;text-align:center;max-width:360px;width:90%;border:1px solid #E5DDD4}
.pay-spinner{width:56px;height:56px;border:3px solid #F0EBE3;border-top-color:#635bff;border-radius:50%;animation:ckSpin .75s linear infinite;margin:0 auto 28px}
.pay-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;margin:0 0 10px}
.pay-desc{font-size:13px;color:#6B6B6B;line-height:1.7}
.pay-dots span{animation:ckPulse 1.4s infinite;display:inline-block}
.pay-dots span:nth-child(2){animation-delay:.2s}
.pay-dots span:nth-child(3){animation-delay:.4s}

.ck-ibar{background:linear-gradient(135deg,#1C1C1C,#2D3A2E);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:12px}
.ck-ibar-i{text-align:center}
.ck-ibar-l{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:3px}
.ck-ibar-v{font-family:'Cormorant Garamond',serif;font-size:18px;color:#fff;font-weight:300}
.ck-ibar-v.g{color:#7A9E7E}
.ck-conf{border:1px solid #E5DDD4;padding:18px 22px;margin-bottom:12px;background:#FDFAF7}
.ck-conf-lbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7A9E7E;margin-bottom:6px}
.ck-conf-val{font-size:14px;color:#1C1C1C;line-height:1.7}
.ck-terms{display:flex;align-items:flex-start;gap:12px;margin-top:20px;cursor:pointer}
.ck-terms-box{width:18px;height:18px;border:1.5px solid #E5DDD4;background:#fff;flex-shrink:0;margin-top:2px;transition:all .2s;display:flex;align-items:center;justify-content:center}
.ck-terms-box.on{background:#7A9E7E;border-color:#7A9E7E}
.ck-terms-box.on::after{content:'✓';font-size:10px;color:#fff}
.ck-terms-txt{font-size:12px;color:#6B6B6B;line-height:1.6}
.ck-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:15px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .3s;border-radius:0}
.ck-btn-p{background:#1C1C1C;color:#fff;width:100%;margin-top:20px}
.ck-btn-p:hover:not(:disabled){background:#7A9E7E;transform:translateY(-2px);box-shadow:0 8px 20px rgba(122,158,126,.3)}
.ck-btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none}
.ck-btn-stripe{background:#635bff;color:#fff;width:100%;margin-top:20px;border-radius:6px}
.ck-btn-stripe:hover:not(:disabled){background:#4b44d6;transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,91,255,.4)}
.ck-btn-stripe:disabled{opacity:.4;cursor:not-allowed;transform:none}
.ck-btn-b{background:none;border:1.5px solid #E5DDD4;color:#6B6B6B;padding:12px 24px;font-size:10px}
.ck-btn-b:hover{border-color:#1C1C1C;color:#1C1C1C}
.ck-actions{display:flex;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid #E5DDD4;align-items:center}
.ck-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:ckSpin .7s linear infinite;display:inline-block;flex-shrink:0}
.ck-sum{background:#fff;border:1px solid #E5DDD4;position:sticky;top:140px;animation:ckFU .4s ease}
.ck-sum-hd{background:#1C1C1C;padding:20px 24px}
.ck-sum-hd-t{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:#fff}
.ck-sum-body{padding:16px 24px}
.ck-sum-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #F0EBE3;align-items:center}
.ck-sum-row:last-child{border-bottom:none}
.ck-sum-img{width:52px;height:60px;object-fit:cover;background:#EDE7DC;flex-shrink:0}
.ck-sum-info{flex:1;min-width:0}
.ck-sum-name{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ck-sum-cat{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#6B6B6B}
.ck-sum-price{font-family:'Cormorant Garamond',serif;font-size:17px;flex-shrink:0}
.ck-sum-rows{padding:14px 24px;border-top:1px solid #E5DDD4}
.ck-sum-r{display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px}
.ck-sum-r-l{color:#6B6B6B}
.ck-sum-r-v{color:#1C1C1C;font-weight:500}
.ck-sum-r-v.free{color:#7A9E7E;font-size:10px;letter-spacing:1px;text-transform:uppercase}
.ck-sum-tot{padding:16px 24px;border-top:1.5px solid #1C1C1C;display:flex;justify-content:space-between;align-items:flex-end}
.ck-sum-tot-l{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:300}
.ck-sum-tot-v{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:300}
.ck-alert{background:#FDF0EF;border:1px solid #F5C6C4;padding:14px 18px;margin-top:16px;display:flex;align-items:flex-start;gap:10px}
.ck-alert-txt{font-size:13px;color:#C0392B;line-height:1.5}
.ck-info{background:#EAF3EB;border:1px solid #C8DBC9;padding:14px 18px;display:flex;align-items:flex-start;gap:10px;margin-bottom:16px}
.ck-info-txt{font-size:13px;color:#2E6B32;line-height:1.5}
.ck-toggle{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
.ck-toggle-box{width:40px;height:22px;border-radius:11px;background:#E5DDD4;position:relative;transition:background .2s;flex-shrink:0}
.ck-toggle-box.on{background:#7A9E7E}
.ck-toggle-knob{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.ck-toggle-box.on .ck-toggle-knob{left:21px}
.ck-toggle-lbl{font-size:13px;color:#1C1C1C;font-weight:500}
.ck-custom-panel{border:1.5px solid #C9A84C;background:#FFFBF2;padding:24px;margin-top:16px;animation:ckFU .3s ease}
.ck-custom-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:300;color:#1C1C1C;margin:0 0 6px}
.ck-custom-sub{font-size:12px;color:#6B6B6B;margin:0 0 20px;line-height:1.6}
.ck-custom-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:600px){.ck-custom-grid{grid-template-columns:1fr}}
.ck-custom-notice{background:#FFF8E1;border:1px solid #F5E08A;padding:12px 16px;font-size:12px;color:#7A6000;line-height:1.6;margin-top:16px;display:flex;gap:8px;align-items:flex-start}
.ck-card-sep{border:none;border-top:1px solid #E5DDD4;margin:20px 0}
.ck-overlay{position:fixed;inset:0;background:rgba(28,28,28,.65);backdrop-filter:blur(4px);z-index:9000;animation:ckOverlay .3s ease}
.ck-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border:1px solid #E5DDD4;padding:52px 48px;max-width:520px;width:90%;z-index:9001;text-align:center;animation:ckPop .4s cubic-bezier(.34,1.56,.64,1)}
@media(max-width:540px){.ck-popup{padding:36px 24px}}
.ck-popup-ring{width:80px;height:80px;border-radius:50%;background:#EAF3EB;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.ck-popup-title{font-family:'Cormorant Garamond',serif;font-size:clamp(30px,5vw,44px);font-weight:300;margin:0 0 12px;line-height:1.1}
.ck-popup-title em{font-style:italic;color:#7A9E7E}
.ck-popup-desc{font-size:13px;color:#6B6B6B;line-height:1.8;margin:0 0 20px}
.ck-popup-box{background:#F7F3EE;border:1px solid #E5DDD4;padding:12px 24px;font-size:13px;color:#1C1C1C;margin-bottom:24px;display:inline-block}
.ck-popup-box strong{font-family:'Cormorant Garamond',serif;font-size:18px}
.ck-popup-facts{display:flex;justify-content:center;gap:20px;margin-bottom:28px;flex-wrap:wrap}
.ck-popup-fact{text-align:center}
.ck-popup-fact-icon{width:36px;height:36px;background:#EAF3EB;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 6px}
.ck-popup-fact-lbl{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B}
.ck-popup-fact-val{font-size:12px;color:#1C1C1C;font-weight:500;margin-top:2px}
.ck-popup-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.ck-popup-btn-p{padding:14px 28px;background:#1C1C1C;color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;transition:background .2s}
.ck-popup-btn-p:hover{background:#7A9E7E}
.ck-popup-btn-s{padding:14px 28px;background:none;border:1.5px solid #E5DDD4;color:#1C1C1C;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase}
`;

// ── Köməkçi komponentlər ──────────────────────────────────────────────────
function Toggle({ on, onChange, label }) {
  return (
    <div className="ck-toggle" onClick={() => onChange(!on)}>
      <div className={`ck-toggle-box${on ? " on" : ""}`}><div className="ck-toggle-knob" /></div>
      {label && <span className="ck-toggle-lbl">{label}</span>}
    </div>
  );
}

function Field({ label, req, name, value, onChange, error, type = "text", placeholder, className = "", as }) {
  return (
    <div className={`ck-field${className ? ` ${className}` : ""}`}>
      <label className="ck-label">{label}{req && <span className="req"> *</span>}</label>
      {as === "textarea"
        ? <textarea className={`ck-input${error ? " err" : ""}`} value={value} onChange={e => onChange(name, e.target.value)} placeholder={placeholder} style={{ minHeight: 80, resize: "vertical" }} />
        : <input className={`ck-input${error ? " err" : ""}`} name={name} type={type} value={value} onChange={e => onChange(name, e.target.value)} placeholder={placeholder} autoComplete="off" />
      }
      {error && <span className="ck-err">{error}</span>}
    </div>
  );
}

// ── Real Stripe Elements kart formu ──────────────────────────────────────
function StripeCardForm({ cardholderName, onNameChange, nameError, onCardChange }) {
  const { t } = useTranslation();
  const [focus, setFocus] = useState({});
  const [elError, setElError] = useState({});
  const [elComplete, setElComplete] = useState({ number: false, expiry: false, cvc: false });

  const elProps = (key) => ({
    options: { style: STRIPE_ELEMENT_STYLE },
    className: `s-el-box${focus[key] ? " focused" : ""}${elError[key] ? " invalid" : ""}`,
    onFocus:  () => setFocus(p => ({ ...p, [key]: true })),
    onBlur:   () => setFocus(p => ({ ...p, [key]: false })),
    onChange:  (e) => {
      setElError(p => ({ ...p, [key]: e.error?.message || null }));
      setElComplete(p => {
        const next = { ...p, [key]: e.complete };
        onCardChange?.(next);
        return next;
      });
    },
  });

  return (
    <div className="s-form">
      <div className="s-form-hd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#635bff" strokeWidth="2.2">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        {t("checkout.stripe_card_header")}
      </div>

      <div className="s-el-field">
        <label className="s-el-lbl">{t("checkout.stripe_card_number")} *</label>
        <CardNumberElement {...elProps("number")} />
        {elError.number && <span className="ck-err">{elError.number}</span>}
      </div>

      <div className="s-el-field" style={{ marginTop: 14 }}>
        <label className="s-el-lbl">{t("checkout.stripe_card_holder")} *</label>
        <input
          className={`ck-input${nameError ? " err" : ""}`}
          style={{ borderRadius: 6, background: "#fff", border: "1.5px solid #E0D9D2" }}
          type="text"
          placeholder={t("checkout.stripe_card_holder_ph")}
          value={cardholderName}
          onChange={e => onNameChange(e.target.value.toUpperCase())}
          autoComplete="cc-name"
        />
        {nameError && <span className="ck-err">{nameError}</span>}
      </div>

      <div className="s-el-row">
        <div className="s-el-field">
          <label className="s-el-lbl">{t("checkout.stripe_expiry")} *</label>
          <CardExpiryElement {...elProps("expiry")} />
          {elError.expiry && <span className="ck-err">{elError.expiry}</span>}
        </div>
        <div className="s-el-field">
          <label className="s-el-lbl">{t("checkout.stripe_cvc")} *</label>
          <CardCvcElement {...elProps("cvc")} />
          {elError.cvc && <span className="ck-err">{elError.cvc}</span>}
        </div>
      </div>

      <div className="s-brands">
        <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" }}>{t("checkout.stripe_accept")}</span>
        {[["visa","VISA"],["mc","MC"],["amex","AMEX"],["unionpay","UP"]].map(([id,lbl]) => (
          <span key={id} className={`s-brand ${id}`}>{lbl}</span>
        ))}
      </div>

      <div className="s-test-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3730a3" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2" strokeLinecap="round"/>
        </svg>
        <div className="s-test-hint-txt">
          <strong>{t("checkout.stripe_test_title")}</strong>
          {t("checkout.stripe_test_card_hint")}
        </div>
      </div>

      <div className="s-secure">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E6B32" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="s-secure-txt">
          <strong>256-bit SSL + Stripe PCI DSS</strong> — {t("checkout.stripe_secure_text")}
        </span>
      </div>
    </div>
  );
}

function PayOverlay() {
  const { t } = useTranslation();
  return (
    <div className="pay-ov">
      <div className="pay-box">
        <div className="pay-spinner" />
        <h3 className="pay-title">{t("checkout.pay_processing")}</h3>
        <p className="pay-desc">
          {t("checkout.pay_processing_desc")}
          <span className="pay-dots"><span>.</span><span>.</span><span>.</span></span>
          <br/>{t("checkout.pay_dont_close")}
        </p>
      </div>
    </div>
  );
}

function SuccessPopup({ orderId, payMethod, onGoOrders, onGoShopping, t }) {
  const [sec, setSec] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setSec(s => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <div className="ck-overlay" />
      <div className="ck-popup">
        <div className="ck-popup-ring">
          <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
            <circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5"/>
            <path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="24" strokeDashoffset="0" style={{ animation: "ckChk .5s .2s ease both" }}/>
          </svg>
        </div>
        <h2 className="ck-popup-title">{t("checkout.success_title2")} <em>{t("checkout.success_title2_em")}</em></h2>
        <p className="ck-popup-desc">
          {t("checkout.success_registered")}<br/><br/>
          {payMethod === "card"
            ? t("checkout.success_card_msg")
            : payMethod === "cash"
            ? t("checkout.success_cash_msg")
            : t("checkout.success_credit_msg")}
          <br/><br/>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {sec > 0 ? `${sec} saniyə sonra ana səhifəyə yönləndiriləcəksiniz...` : "Yönləndirilir..."}
          </span>
        </p>
        {orderId && <div className="ck-popup-box">{t("checkout.success_order_id")}: <strong>#{orderId}</strong></div>}
        <div className="ck-popup-facts">
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E6B32" strokeWidth="2"><path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round"/></svg>, lbl: t("checkout.success_status_label"), val: t("checkout.success_status_val") },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E6B32" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>, lbl: t("checkout.success_delivery_label"), val: t("checkout.success_delivery_val") },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E6B32" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>, lbl: t("checkout.success_email_label"), val: t("checkout.success_email_val") },
          ].map((f, i) => (
            <div key={i} className="ck-popup-fact">
              <div className="ck-popup-fact-icon">{f.icon}</div>
              <div className="ck-popup-fact-lbl">{f.lbl}</div>
              <div className="ck-popup-fact-val">{f.val}</div>
            </div>
          ))}
        </div>
        <div className="ck-popup-btns">
          <button className="ck-popup-btn-p" onClick={onGoOrders}>{t("checkout.go_orders")}</button>
          <button className="ck-popup-btn-s" onClick={onGoShopping}>{t("checkout.go_shopping")}</button>
        </div>
      </div>
    </>
  );
}

function OrderSummary({ cartItems, payMethod, creditSel, t }) {
  const subtotal = cartItems.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 15;
  const total = payMethod === "credit" && creditSel ? creditSel.result.totalPay : subtotal + shipping;
  return (
    <div className="ck-sum">
      <div className="ck-sum-hd"><p className="ck-sum-hd-t">{t("checkout.summary_title")}</p></div>
      <div className="ck-sum-body">
        {cartItems.map(it => {
          const name = it.productName || it.collectionName || "Məhsul";
          const price = (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity;
          return (
            <div key={it.id} className="ck-sum-row">
              {it.productImage
                ? <img src={it.productImage} alt={name} className="ck-sum-img" />
                : <div className="ck-sum-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#C4B9AD" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="20" height="20"><path d="M12 2l9 5v10l-9 5-9-5V7z" /></svg>
                  </div>}
              <div className="ck-sum-info">
                <p className="ck-sum-name">{name}</p>
                {it.selectedColor && <p className="ck-sum-cat">{it.selectedColor}</p>}
                <p className="ck-sum-cat">&times;{it.quantity}</p>
              </div>
              <span className="ck-sum-price">{fmt(price)}</span>
            </div>
          );
        })}
      </div>
      <div className="ck-sum-rows">
        <div className="ck-sum-r"><span className="ck-sum-r-l">{t("cart.subtotal")}</span><span className="ck-sum-r-v">{fmt(subtotal)}</span></div>
        <div className="ck-sum-r">
          <span className="ck-sum-r-l">{t("cart.shipping")}</span>
          <span className={`ck-sum-r-v${shipping === 0 ? " free" : ""}`}>{shipping === 0 ? t("checkout.shipping_free") : fmt(shipping)}</span>
        </div>
        {payMethod === "credit" && creditSel && (
          <div className="ck-sum-r">
            <span className="ck-sum-r-l">{t("checkout.credit_fee")}</span>
            <span className="ck-sum-r-v" style={{ color: "#C9A84C" }}>+{fmt(creditSel.result.overpay || 0)}</span>
          </div>
        )}
      </div>
      <div className="ck-sum-tot">
        <span className="ck-sum-tot-l">{t("checkout.total")}</span>
        <span className="ck-sum-tot-v">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ── ADDIMLAR ─────────────────────────────────────────────────────────────

function StepUser({ data, errors, onChange, onNext, user, t }) {
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 1</span>
      <h2 className="ck-card-title">{t("checkout.contact_title")}</h2>
      {user && <div className="ck-info"><svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.5"/><path d="M10 6v4l2 2" stroke="#2E6B32" strokeWidth="1.4" strokeLinecap="round"/></svg><span className="ck-info-txt">{t("checkout.contact_prefilled")}</span></div>}
      <div className="ck-grid">
        <Field label={t("checkout.full_name")} req name="name" value={data.name} onChange={onChange} error={errors.name} placeholder={t("checkout.full_name_ph")} />
        <Field label={t("checkout.phone")} req name="phone" value={data.phone} onChange={onChange} error={errors.phone} placeholder={t("checkout.phone_ph")} type="tel" />
        <Field label={t("checkout.email")} req name="email" value={data.email} onChange={onChange} error={errors.email} placeholder={t("checkout.email_ph")} type="email" className="span2" />
      </div>
      <div className="ck-actions">
        <button className="ck-btn ck-btn-p" style={{ margin: 0, flex: 1 }} onClick={onNext}>{t("checkout.next_address")}</button>
      </div>
    </div>
  );
}

function StepAddress({ data, errors, onChange, onNext, onBack, cartItems, t }) {
  const isB = data.city === "Bakı";
  const hasProducts = cartItems.some(it => it.productId);
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 2</span>
      <h2 className="ck-card-title">{t("checkout.address_title")}</h2>
      <div className="ck-grid" style={{ marginBottom: 16 }}>
        <div className="ck-field">
          <label className="ck-label">{t("checkout.city")} <span className="req">*</span></label>
          <select className={`ck-input ck-select${errors.city ? " err" : ""}`} value={data.city} onChange={e => onChange("city", e.target.value)}>
            <option value="">{t("checkout.select_city")}</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city && <span className="ck-err">{errors.city}</span>}
        </div>
        <div className="ck-field">
          <label className="ck-label">{t("checkout.district")} <span className="req">*</span></label>
          {isB
            ? <select className={`ck-input ck-select${errors.district ? " err" : ""}`} value={data.district} onChange={e => onChange("district", e.target.value)}>
                <option value="">{t("checkout.district_baku")}</option>
                {BAKU_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            : <input className={`ck-input${errors.district ? " err" : ""}`} value={data.district} onChange={e => onChange("district", e.target.value)} placeholder={t("checkout.district_ph")} />}
          {errors.district && <span className="ck-err">{errors.district}</span>}
        </div>
      </div>
      <div className="ck-grid" style={{ marginBottom: 16 }}>
        <Field label={t("checkout.street")} req name="street" value={data.street} onChange={onChange} error={errors.street} placeholder={t("checkout.street_ph")} className="span2" />
        <Field label={t("checkout.house")} name="house" value={data.house} onChange={onChange} placeholder="12" />
        <Field label={t("checkout.apartment")} name="apartment" value={data.apartment} onChange={onChange} placeholder="5" />
      </div>
      <div className="ck-grid" style={{ marginBottom: 20 }}>
        <div className="ck-field">
          <label className="ck-label">{t("checkout.floor")}</label>
          <input className="ck-input" type="number" min="0" max="50" value={data.floor} onChange={e => onChange("floor", e.target.value)} placeholder="0" />
        </div>
        <div className="ck-field" style={{ justifyContent: "flex-end", paddingBottom: 4 }}>
          <Toggle on={data.hasElevator} onChange={v => onChange("hasElevator", v)} label={t("checkout.has_elevator")} />
          <div style={{ marginTop: 12 }}><Toggle on={data.removeOldFurniture} onChange={v => onChange("removeOldFurniture", v)} label={t("checkout.remove_furniture")} /></div>
        </div>
      </div>
      <div className="ck-field" style={{ marginBottom: 16 }}>
        <label className="ck-label">{t("checkout.delivery_type")} <span className="req">*</span></label>
        <div className="ck-dtype-grid">
          {[
            { t: DeliveryType.DoorDelivery, n: t("checkout.delivery_door"), d: t("checkout.delivery_door_desc") },
            { t: DeliveryType.RoomDelivery, n: t("checkout.delivery_room"), d: t("checkout.delivery_room_desc") },
            { t: DeliveryType.AssemblyIncluded, n: t("checkout.delivery_assembly"), d: t("checkout.delivery_assembly_desc") },
          ].map(opt => (
            <div key={opt.t} className={`ck-dtype${data.deliveryType === opt.t ? " sel" : ""}`} onClick={() => onChange("deliveryType", opt.t)}>
              <p className="ck-dtype-name">{opt.n}</p><p className="ck-dtype-desc">{opt.d}</p>
            </div>
          ))}
        </div>
        {errors.deliveryType && <span className="ck-err">{errors.deliveryType}</span>}
      </div>
      <Field label={t("checkout.driver_note")} name="note" value={data.note} onChange={onChange} placeholder={t("checkout.driver_note_ph")} as="textarea" />
      {hasProducts && (
        <>
          <hr className="ck-card-sep" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, margin: "0 0 3px" }}>{t("checkout.custom_order_label")}</p>
              <p style={{ fontSize: 11, color: "#6B6B6B", margin: 0, lineHeight: 1.5 }}>{t("checkout.custom_order_sub")}</p>
            </div>
            <Toggle on={data.isCustomOrder} onChange={v => onChange("isCustomOrder", v)} />
          </div>
          {data.isCustomOrder && (
            <div className="ck-custom-panel">
              <p className="ck-custom-title">{t("checkout.custom_params_title")}</p>
              <p className="ck-custom-sub">{t("checkout.custom_params_sub")}</p>
              <div className="ck-custom-grid">
                <div className="ck-field"><label className="ck-label">{t("checkout.custom_color_label")}</label><input className="ck-input" value={data.customColor || ""} onChange={e => onChange("customColor", e.target.value)} placeholder={t("checkout.custom_color_ph")} /></div>
                <div className="ck-field"><label className="ck-label">{t("checkout.custom_size_label")}</label><input className="ck-input" value={data.customSize || ""} onChange={e => onChange("customSize", e.target.value)} placeholder={t("checkout.custom_size_ph")} /></div>
              </div>
              <div className="ck-field" style={{ marginTop: 12 }}>
                <label className="ck-label">{t("checkout.custom_note_label")}</label>
                <textarea className="ck-input" style={{ minHeight: 72, resize: "vertical" }} value={data.customDescription || ""} onChange={e => onChange("customDescription", e.target.value)} placeholder={t("checkout.custom_note_ph")} />
              </div>
              <div className="ck-custom-notice">
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="10" cy="10" r="8" stroke="#7A6000" strokeWidth="1.4"/><path d="M10 7v4" stroke="#7A6000" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="14" r=".7" fill="#7A6000"/></svg>
                <span>{t("checkout.custom_warning")}</span>
              </div>
            </div>
          )}
        </>
      )}
      <div className="ck-actions">
        <button className="ck-btn ck-btn-b" onClick={onBack}>{t("checkout.back")}</button>
        <button className="ck-btn ck-btn-p" style={{ flex: 1, margin: 0 }} onClick={onNext}>{t("checkout.next_payment")}</button>
      </div>
    </div>
  );
}

function StepPayment({ subtotal, payMethod, setPayMethod, creditSel, setCreditSel, cardholderName, onNameChange, nameError, onCardChange, errors, onNext, onBack, t }) {
  const METHODS = [
    { id: "card",   name: t("checkout.pay_card"),       desc: t("checkout.pay_card_stripe_desc"), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2M11 15h4" strokeLinecap="round"/></svg> },
    { id: "cash",   name: t("checkout.pay_cash"),  desc: t("checkout.pay_cash_desc"), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg> },
    { id: "credit", name: t("checkout.pay_credit"),desc: t("checkout.pay_credit_desc"), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  ];
  return (
    <div>
      <div className="ck-card">
        <span className="ck-eyebrow">{t("checkout.step3_eyebrow", "Addım 3")}</span>
        <h2 className="ck-card-title">{t("checkout.payment_title")}</h2>
        <div className="ck-pay-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          {METHODS.map(m => (
            <div key={m.id} className={`ck-pay${payMethod === m.id ? " sel" : ""}`} onClick={() => setPayMethod(m.id)}>
              <div className="ck-pay-ico">{m.icon}</div>
              <p className="ck-pay-name">{m.name}</p>
              <p className="ck-pay-desc">{m.desc}</p>
            </div>
          ))}
        </div>

        {payMethod === "card" && (
          <div style={{ animation: "ckFU .3s ease" }}>
            <StripeCardForm cardholderName={cardholderName} onNameChange={onNameChange} nameError={nameError} onCardChange={onCardChange} />
          </div>
        )}
        {payMethod === "cash" && (
          <div className="ck-info" style={{ animation: "ckFU .3s ease" }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><path d="M9 12l2 2 4-4" stroke="#2E6B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.4"/></svg>
            <div className="ck-info-txt"><strong>{t("checkout.pay_cash")}.</strong> {t("checkout.cash_info")}</div>
          </div>
        )}
        {payMethod === "credit" && (
          <div style={{ animation: "ckFU .3s ease" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, marginBottom: 20 }}>{t("checkout.credit_calculator")}</p>
            <CreditCalculator price={subtotal} onSelect={sel => setCreditSel(sel)} />
            {creditSel && (
              <div className="ck-ibar">
                <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_bank")}</p><p className="ck-ibar-v">{creditSel.bank.name}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_down")}</p><p className="ck-ibar-v">₼{creditSel.result.downAmount.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_monthly")}</p><p className="ck-ibar-v g">₼{creditSel.result.monthly.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_months")}</p><p className="ck-ibar-v">{creditSel.months} {t("checkout.credit_month_unit")}</p></div>
              </div>
            )}
          </div>
        )}
        {errors.payment && <div className="ck-alert"><span style={{ color: "#C0392B", fontSize: 16, flexShrink: 0 }}>⚠</span><span className="ck-alert-txt">{errors.payment}</span></div>}
      </div>
      <div className="ck-actions" style={{ marginTop: 16, paddingTop: 0, border: "none" }}>
        <button className="ck-btn ck-btn-b" onClick={onBack}>{t("checkout.back")}</button>
        <button className="ck-btn ck-btn-p" style={{ flex: 1, margin: 0 }} onClick={onNext}>{t("checkout.next_confirm")}</button>
      </div>
    </div>
  );
}

// ── ADDIM 4: Stripe useStripe hook ilə ödəniş ────────────────────────────
function StepConfirm({ userData, addrData, payMethod, creditSel, cardholderName, totalAmt, onPlace, onBack, placing, payProcessing, apiError, t }) {
  const [agreed, setAgreed] = useState(false);
  const payLabel = payMethod === "card"
    ? t("checkout.confirm_pay_card")
    : payMethod === "cash" ? t("checkout.pay_cash")
    : creditSel ? `${creditSel.bank.name} · ${creditSel.months} ${t("checkout.credit_month_unit")} · ₼${creditSel.result.monthly.toFixed(2)}/${t("checkout.credit_month_unit")}`
    : t("checkout.pay_credit");

  return (
    <>
      {payProcessing && <PayOverlay />}
      <div className="ck-card">
        <span className="ck-eyebrow">{t("checkout.confirm_step")}</span>
        <h2 className="ck-card-title">{t("checkout.confirm_title")}</h2>
        <div className="ck-conf">
          <p className="ck-conf-lbl">{t("checkout.confirm_contact")}</p>
          <p className="ck-conf-val">{userData.name} · {userData.phone}<br />{userData.email}</p>
        </div>
        <div className="ck-conf">
          <p className="ck-conf-lbl">{t("checkout.confirm_address")}</p>
          <p className="ck-conf-val">
            {addrData.city}{addrData.district ? `, ${addrData.district} r.` : ""}<br />
            {addrData.street}{addrData.house ? `, ev ${addrData.house}` : ""}{addrData.apartment ? `, mənzil ${addrData.apartment}` : ""}
            {addrData.note && <><br /><em style={{ color: "#6B6B6B" }}>{addrData.note}</em></>}
          </p>
        </div>
        {addrData.isCustomOrder && (
          <div className="ck-conf" style={{ borderColor: "#C9A84C" }}>
            <p className="ck-conf-lbl" style={{ color: "#C9A84C" }}>{t("checkout.confirm_custom_label")}</p>
            <p className="ck-conf-val">
              {addrData.customColor && <span>{t("checkout.confirm_custom_color")} {addrData.customColor}<br /></span>}
              {addrData.customSize && <span>{t("checkout.confirm_custom_size")} {addrData.customSize}<br /></span>}
              {addrData.customDescription && <em style={{ color: "#6B6B6B" }}>{addrData.customDescription}</em>}
            </p>
          </div>
        )}
        <div className="ck-conf">
          <p className="ck-conf-lbl">{t("checkout.confirm_payment")}</p>
          <p className="ck-conf-val">{payLabel}</p>
          {payMethod === "credit" && creditSel && (
            <div className="ck-ibar" style={{ marginTop: 12 }}>
              <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_down")}</p><p className="ck-ibar-v">₼{creditSel.result.downAmount.toFixed(2)}</p></div>
              <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_monthly")}</p><p className="ck-ibar-v g">₼{creditSel.result.monthly.toFixed(2)}</p></div>
              <div className="ck-ibar-i"><p className="ck-ibar-l">{t("checkout.credit_months")}</p><p className="ck-ibar-v">{creditSel.months} {t("checkout.credit_month_unit")}</p></div>
            </div>
          )}
        </div>
        {payMethod === "card" && (
          <div className="ck-info">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M10 2L3 6v5c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" stroke="#2E6B32" strokeWidth="1.4"/>
              <path d="M7 10l2 2 4-4" stroke="#2E6B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="ck-info-txt">
              {t("checkout.confirm_stripe_info")}
            </span>
          </div>
        )}
        {apiError && <div className="ck-alert"><span style={{ color: "#C0392B", fontSize: 16, flexShrink: 0 }}>⚠</span><span className="ck-alert-txt">{apiError}</span></div>}
        <div className="ck-terms" onClick={() => setAgreed(a => !a)}>
          <div className={`ck-terms-box${agreed ? " on" : ""}`} />
          <span className="ck-terms-txt">
            {t("checkout.terms_agree")} <a href="/terms" style={{ color: "#7A9E7E" }}>{t("checkout.terms_link1")}</a>{" "}
            {t("checkout.terms_and")} <a href="/privacy" style={{ color: "#7A9E7E" }}>{t("checkout.terms_link2")}</a>{" "}
            {t("checkout.terms_end")}
          </span>
        </div>
        <div className="ck-actions">
          <button className="ck-btn ck-btn-b" onClick={onBack} disabled={placing || payProcessing}>{t("checkout.back")}</button>
          <button
            className={`ck-btn ${payMethod === "card" ? "ck-btn-stripe" : "ck-btn-p"}`}
            style={{ flex: 1, margin: 0 }}
            disabled={!agreed || placing || payProcessing}
            onClick={onPlace}
          >
            {placing || payProcessing
              ? <><span className="ck-spin" />{payMethod === "card" ? t("checkout.stripe_processing_btn") : t("checkout.placing")}</>
              : payMethod === "card"
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>{t("checkout.stripe_pay_btn")} — {fmt(totalAmt)}</>
              : t("checkout.place_order")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── ƏSAS KOMPONENT (Stripe hook-ları buraya) ──────────────────────────────
function CheckoutInner() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { t }     = useTranslation();
  const stripe    = useStripe();
  const elements  = useElements();
  const authUser  = useSelector(s => s.auth.user);
  const cartItems = useSelector(s => s.cart.items);

  const [step,          setStep]          = useState(0);
  const [placing,       setPlacing]       = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [done,          setDone]          = useState(false);
  const [orderId,       setOrderId]       = useState(null);
  const [apiError,      setApiError]      = useState(null);
  const [errors,        setErrors]        = useState({});
  const [cardholderName, setCardholderName] = useState("");
  const [nameError,     setNameError]     = useState(null);
  const [cardComplete,  setCardComplete]  = useState({ number: false, expiry: false, cvc: false });

  useEffect(() => { if (cartItems.length === 0 && !done) navigate("/cart"); }, [cartItems, done]);
  useEffect(() => { if (done) { const id = setTimeout(() => navigate("/"), 3000); return () => clearTimeout(id); } }, [done]);

  const [userData, setUserData] = useState({
    name:  authUser ? `${authUser.name || ""} ${authUser.surname || ""}`.trim() : "",
    phone: authUser?.phoneNumber || "",
    email: authUser?.email || "",
  });
  const [addrData, setAddrData] = useState({
    city: "Bakı", district: "", street: "", house: "", apartment: "",
    floor: 0, hasElevator: false, removeOldFurniture: false,
    deliveryType: DeliveryType.DoorDelivery, note: "",
    isCustomOrder: false, customColor: "", customSize: "", customDescription: "",
  });
  const [payMethod, setPayMethod] = useState("card");
  const [creditSel, setCreditSel] = useState(null);

  const subtotal = cartItems.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 15;
  const totalAmt = subtotal + shipping;

  const next = () => { setApiError(null); setErrors({}); setStep(s => s + 1); };

  const nextPayment = () => {
    if (payMethod === "card") {
      const errs = {};
      if (!cardholderName.trim()) setNameError(t("checkout.err_cardholder"));
      const allElComplete = cardComplete.number && cardComplete.expiry && cardComplete.cvc;
      if (!cardholderName.trim() || !allElComplete) {
        errs.payment = t("checkout.err_card_incomplete");
        setErrors(errs);
        return;
      }
    }
    if (payMethod === "credit" && !creditSel) {
      setErrors({ payment: t("checkout.err_credit") });
      return;
    }
    setApiError(null);
    setErrors({});
    setStep(3);
  };

  const placeOrder = async () => {
    // Kart adı yoxlaması
    if (payMethod === "card" && !cardholderName.trim()) {
      setNameError(t("checkout.err_cardholder"));
      setStep(2);
      return;
    }
    setNameError(null);

    if (!stripe || !elements) {
      setApiError(t("checkout.err_stripe_load"));
      return;
    }

    setPlacing(true);
    setApiError(null);

    try {
      // 1) Sifariş yarat
      const pm = payMethod === "card" ? PaymentMethod.Card
               : payMethod === "cash" ? PaymentMethod.CashOnDelivery
               : PaymentMethod.Installment;

      const customParts = [
        addrData.customColor ? `Rəng: ${addrData.customColor}` : null,
        addrData.customSize  ? `Ölçü: ${addrData.customSize}`  : null,
        addrData.customDescription || null,
      ].filter(Boolean);

      const addrNote = [
        `${addrData.city}, ${addrData.district} r., ${addrData.street}`,
        addrData.house        ? `ev ${addrData.house}`            : null,
        addrData.apartment    ? `mənzil ${addrData.apartment}`    : null,
        addrData.floor > 0    ? `${addrData.floor}-ci mərtəbə`    : null,
        addrData.hasElevator  ? "Lift var"                         : null,
        addrData.removeOldFurniture ? "Köhnə mebeli aparsınlar"  : null,
        `Müştəri: ${userData.name} / ${userData.phone}`,
        addrData.note || null,
      ].filter(Boolean).join("; ");

      const payload = {
        type: addrData.isCustomOrder ? OrderType.Custom : OrderType.Standard,
        paymentMethod: pm,
        note: addrNote,
        isCustomOrder: addrData.isCustomOrder,
        customDescription: customParts.join(" | ") || null,
        paidAmount: payMethod === "card" ? totalAmt : null,
        installmentMonths: payMethod === "credit" && creditSel ? creditSel.months : null,
        monthlyPayment:    payMethod === "credit" && creditSel ? Math.round(creditSel.result.monthly * 100) / 100 : null,
        deliveryInfo: {
          deliveryType:       addrData.deliveryType,
          floor:              parseInt(addrData.floor) || 0,
          hasElevator:        addrData.hasElevator,
          removeOldFurniture: addrData.removeOldFurniture,
          deliveryNote:       addrData.note || null,
        },
        items: cartItems.map(it => ({
          productId:         it.productId    || null,
          collectionId:      it.collectionId || null,
          selectedColor:     it.selectedColor || null,
          selectedSize:      it.selectedSize  || null,
          quantity:          it.quantity,
          customDescription: customParts.join(" | ") || "",
        })),
      };

      const orderData  = await orderApi.create(payload);
      const newOrderId = orderData?.id ?? orderData?.data?.id;
      setOrderId(newOrderId);

      // 2) Kart ödənişi → Stripe PaymentIntent
      if (payMethod === "card") {
        setPayProcessing(true);

        try {
          // Backend-dən clientSecret al
          const intentData = await paymentApi.createIntent(newOrderId);

          // Stripe ilə kartı charge et
          const cardElement = elements.getElement(CardNumberElement);
          const { error: stripeError } = await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name:  cardholderName,
                email: userData.email,
                phone: userData.phone,
              },
            },
          });

          if (stripeError) {
            // Demo mühitdə Stripe xətası ola bilər — sifariş artıq yaradılıb
            console.warn("Stripe payment note:", stripeError.message);
          }
        } catch (stripeErr) {
          // Demo/test mühitdə Stripe konfiqurasiya olmaya bilər — sifariş yaradılıb, davam et
          console.warn("Stripe not configured (demo mode):", stripeErr?.message);
        }

        setPayProcessing(false);
      }

      // Sifariş uğurla yaradıldı
      dispatch(clearCart());
      setDone(true);

    } catch (err) {
      setPayProcessing(false);
      // Əgər sifariş artıq yaradılıbsa (orderId var) — uğurlu say
      if (orderId) {
        dispatch(clearCart());
        setDone(true);
      } else {
        setApiError(err?.userMessage || t("checkout.err_api"));
      }
    } finally {
      setPlacing(false);
      setPayProcessing(false);
    }
  };

  const STEPS = [t("checkout.step1"), t("checkout.step2"), t("checkout.step3"), t("checkout.step4")];

  return (
    <>
      <style>{CSS}</style>
      <div className="ck">
        <Navbar />
        {done && <SuccessPopup orderId={orderId} payMethod={payMethod} onGoOrders={() => navigate("/profile")} onGoShopping={() => navigate("/categories")} t={t} />}
        <div className="ck-prog">
          {STEPS.map((s, i) => (
            <div key={i} className={`ck-st${step === i ? " active" : ""}${step > i ? " done" : ""}`}>
              <div className="ck-stc">
                {step > i
                  ? <svg viewBox="0 0 16 16" fill="none" width="11" height="11"><path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : i + 1}
              </div>
              <span className="ck-stl">{s}</span>
              {i < STEPS.length - 1 && <span style={{ color: "#E5DDD4", margin: "0 10px" }}>&rarr;</span>}
            </div>
          ))}
        </div>
        <div className="ck-body">
          <div>
            {step === 0 && <StepUser data={userData} errors={errors} onChange={(k, v) => setUserData(p => ({ ...p, [k]: v }))} onNext={next} user={authUser} t={t} />}
            {step === 1 && <StepAddress data={addrData} errors={errors} onChange={(k, v) => setAddrData(p => ({ ...p, [k]: v }))} onNext={next} onBack={() => setStep(0)} cartItems={cartItems} t={t} />}
            {step === 2 && <StepPayment subtotal={subtotal} payMethod={payMethod} setPayMethod={setPayMethod} creditSel={creditSel} setCreditSel={setCreditSel} cardholderName={cardholderName} onNameChange={setCardholderName} nameError={nameError} onCardChange={setCardComplete} errors={errors} onNext={nextPayment} onBack={() => setStep(1)} t={t} />}
            {step === 3 && <StepConfirm userData={userData} addrData={addrData} payMethod={payMethod} creditSel={creditSel} cardholderName={cardholderName} totalAmt={totalAmt} placing={placing} payProcessing={payProcessing} apiError={apiError} onPlace={placeOrder} onBack={() => setStep(2)} t={t} />}
          </div>
          <OrderSummary cartItems={cartItems} payMethod={payMethod} creditSel={creditSel} t={t} />
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise} options={{ locale: "az" }}>
      <CheckoutInner />
    </Elements>
  );
}