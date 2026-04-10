// src/pages/order/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { clearCart } from "../../store/slices/cartSlice";
import orderApi from "../../api/orderApi";
import Navbar from "../../components/common/Navbar";
import CreditCalculator from "../../components/credit/CreditCalculator";

const fmt = n => `\u20BC${Number(n).toLocaleString("az-AZ", { minimumFractionDigits: 2 })}`;
const FREE_SHIPPING = 500;
const PaymentMethod = { Card: 2, CashOnDelivery: 1, BankTransfer: 3, Installment: 4, PartialCard: 5 };
const OrderType     = { Standard: 0, Custom: 1 };
const DeliveryType  = { DoorDelivery: 1, RoomDelivery: 2, AssemblyIncluded: 3 };

const BAKU_DISTRICTS = [
  "Bin\u0259q\u0259di","N\u0259simi","Nizami","Pir\u0259k\u0259\u015fk\xfcl","Sabun\xe7u","Suraxan\u0131",
  "X\u0259tai","Yeni G\xfcn\u0259\u015fli","L\xf6kbatan","Balaxan\u0131","Zabrat","Ramana",
  "H\xf6vsan","Ma\u015fta\u011fa","Nardaran","Bilg\u0259h","Buzovna",
  "Novxan\u0131","Sabail","Bay\u0131l","Bil\u0259c\u0259ri",
];
const CITIES = ["Bak\u0131","G\u0259nc\u0259","Sumqay\u0131t","L\u0259nk\u0259ran","Nax\xe7\u0131van","\u015eirvan","Ming\u0259\xe7evir","Quba","\u015e\u0259ki","Zaqatala"];

const isValidPhone = (p) => {
  const clean = p.replace(/[\s\-\(\)]/g, "");
  return /^(\+994|0)(50|51|55|60|70|77|99|10|12)\d{7}$/.test(clean);
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes ckFU{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes ckShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
@keyframes ckSpin{to{transform:rotate(360deg)}}
@keyframes ckChk{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
@keyframes ckOverlay{from{opacity:0}to{opacity:1}}
@keyframes ckPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.85)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
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
.ck-pay-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
@media(max-width:700px){.ck-pay-grid{grid-template-columns:repeat(2,1fr)}}
.ck-pay{border:1.5px solid #E5DDD4;padding:18px 12px;cursor:pointer;transition:all .25s;background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;position:relative}
.ck-pay.sel{border-color:#7A9E7E;background:#F0F7F1}
.ck-pay.sel::after{content:'checkmark';position:absolute;top:8px;right:10px;font-size:11px;color:#7A9E7E;font-weight:700;content:'✓'}
.ck-pay-ico{width:40px;height:40px;background:#F7F3EE;display:flex;align-items:center;justify-content:center;border-radius:2px}
.ck-pay.sel .ck-pay-ico{background:#C8DBC9}
.ck-pay-name{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:300}
.ck-pay-desc{font-size:10px;color:#6B6B6B;line-height:1.5}
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
.ck-popup-desc{font-size:13px;color:#6B6B6B;line-height:1.8;margin:0 0 24px}
.ck-popup-box{background:#F7F3EE;border:1px solid #E5DDD4;padding:12px 24px;font-size:13px;color:#1C1C1C;margin-bottom:28px;display:inline-block}
.ck-popup-box strong{font-family:'Cormorant Garamond',serif;font-size:18px}
.ck-popup-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.ck-popup-btn-p{padding:14px 28px;background:#1C1C1C;color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;transition:background .2s}
.ck-popup-btn-p:hover{background:#7A9E7E}
.ck-popup-btn-s{padding:14px 28px;background:none;border:1.5px solid #E5DDD4;color:#1C1C1C;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase}
.ck-card-field{margin-top:16px;padding:20px;border:1px solid #E5DDD4;background:#FDFAF7}
.ck-card-field-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;margin-bottom:14px}
.ck-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:500px){.ck-card-grid{grid-template-columns:1fr}}
`;

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

// ── Success Popup ────────────────────────────────────────
function SuccessPopup({ orderId, userName, userPhone, onGoOrders, onGoShopping }) {
  return (
    <>
      <div className="ck-overlay" />
      <div className="ck-popup">
        <div className="ck-popup-ring">
          <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
            <circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5" />
            <path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="24" strokeDashoffset="0" style={{ animation: "ckChk .5s .2s ease both" }} />
          </svg>
        </div>
        <h2 className="ck-popup-title">
          Sifari\u015finiz <em>q\u0259bul edildi!</em>
        </h2>
        <p className="ck-popup-desc">
          H\xf6rm\u0259tli <strong>{userName}</strong>, sifari\u015finiz sistemimiz\u0259 daxil oldu.<br />
          Ən qısa zamanda menecerlərimiz <strong>{userPhone}</strong> n\xf6mr\u0259sin\u0259
          z\u0259ng ed\u0259r\u0259k \xe7atd\u0131r\u0131lma vaxt\u0131n\u0131 razıla\u015fd\u0131racaq.
        </p>
        {orderId && (
          <div className="ck-popup-box">
            Sifari\u015f n\xf6mr\u0259si: <strong>#{orderId}</strong>
          </div>
        )}
        <div className="ck-popup-btns">
          <button className="ck-popup-btn-p" onClick={onGoOrders}>Sifari\u015fl\u0259rim</button>
          <button className="ck-popup-btn-s" onClick={onGoShopping}>Al\u0131\u015f-veri\u015f\u0259 davam</button>
        </div>
      </div>
    </>
  );
}

function OrderSummary({ cartItems, payMethod, creditSel, t }) {
  const subtotal = cartItems.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 15;
  const displayTotal = (payMethod === "credit" && creditSel) ? creditSel.result.totalPay : subtotal + shipping;

  return (
    <div className="ck-sum">
      <div className="ck-sum-hd"><p className="ck-sum-hd-t">{t("checkout.summary_title")}</p></div>
      <div className="ck-sum-body">
        {cartItems.map(it => {
          const name = it.productName || it.collectionName || "M\u0259hsul";
          const price = (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity;
          const img = it.productImage || null;
          return (
            <div key={it.id} className="ck-sum-row">
              {img
                ? <img src={img} alt={name} className="ck-sum-img" />
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
        <span className="ck-sum-tot-v">{fmt(displayTotal)}</span>
      </div>
    </div>
  );
}

// STEP 1
function StepUser({ data, errors, onChange, onNext, user, t }) {
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Add\u0131m 1</span>
      <h2 className="ck-card-title">{t("checkout.contact_title")}</h2>
      {user && (
        <div className="ck-info">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.5" /><path d="M10 6v4l2 2" stroke="#2E6B32" strokeWidth="1.4" strokeLinecap="round" /></svg>
          <span className="ck-info-txt">{t("checkout.contact_prefilled")}</span>
        </div>
      )}
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

// STEP 2
function StepAddress({ data, errors, onChange, onNext, onBack, cartItems, t }) {
  const isB = data.city === "Bak\u0131";
  const hasProducts = cartItems.some(it => it.productId);

  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Add\u0131m 2</span>
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
            : <input className={`ck-input${errors.district ? " err" : ""}`} value={data.district} onChange={e => onChange("district", e.target.value)} placeholder={t("checkout.district_ph")} />
          }
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
          <div style={{ marginTop: 12 }}>
            <Toggle on={data.removeOldFurniture} onChange={v => onChange("removeOldFurniture", v)} label={t("checkout.remove_furniture")} />
          </div>
        </div>
      </div>

      <div className="ck-field" style={{ marginBottom: 16 }}>
        <label className="ck-label">{t("checkout.delivery_type")} <span className="req">*</span></label>
        <div className="ck-dtype-grid">
          {[
            { t: DeliveryType.DoorDelivery,     n: t("checkout.delivery_door"),     d: t("checkout.delivery_door_desc") },
            { t: DeliveryType.RoomDelivery,     n: t("checkout.delivery_room"),     d: t("checkout.delivery_room_desc") },
            { t: DeliveryType.AssemblyIncluded, n: t("checkout.delivery_assembly"), d: t("checkout.delivery_assembly_desc") },
          ].map(opt => (
            <div key={opt.t} className={`ck-dtype${data.deliveryType === opt.t ? " sel" : ""}`} onClick={() => onChange("deliveryType", opt.t)}>
              <p className="ck-dtype-name">{opt.n}</p>
              <p className="ck-dtype-desc">{opt.d}</p>
            </div>
          ))}
        </div>
        {errors.deliveryType && <span className="ck-err">{errors.deliveryType}</span>}
      </div>

      {/* Çatdırılma vaxtı haqqında bildiriş */}
      <div className="ck-info">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.5" />
          <path d="M10 6v5l3 2" stroke="#2E6B32" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="ck-info-txt">
          <strong>Çatdırılma vaxtı</strong> — Sifarişiniz qəbul edildikdən sonra menecerimiz zəng edərək sizinlə razılaşdıracaq.
        </span>
      </div>

      <Field label={t("checkout.driver_note")} name="note" value={data.note} onChange={onChange} placeholder={t("checkout.driver_note_ph")} as="textarea" />

      {/* Xüsusi Sifariş */}
      {hasProducts && (
        <>
          <hr className="ck-card-sep" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: data.isCustomOrder ? 0 : 4 }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, margin: "0 0 3px" }}>
                ✦ Xüsusi Sifariş
              </p>
              <p style={{ fontSize: 11, color: "#6B6B6B", margin: 0, lineHeight: 1.5 }}>
                Rəng, ölçü və ya material dəyişikliyi istəyirsiniz?
              </p>
            </div>
            <Toggle on={data.isCustomOrder} onChange={v => onChange("isCustomOrder", v)} />
          </div>

          {data.isCustomOrder && (
            <div className="ck-custom-panel">
              <p className="ck-custom-title">Xüsusi Parametrlər</p>
              <p className="ck-custom-sub">İstədiyiniz dəyişiklikləri qeyd edin. Menecerimiz ətraflı məlumat üçün zəng edəcək.</p>
              <div className="ck-custom-grid">
                <div className="ck-field">
                  <label className="ck-label">İstədiyiniz Rəng</label>
                  <input className="ck-input" value={data.customColor || ""} onChange={e => onChange("customColor", e.target.value)} placeholder="məs: Tünd qəhvəyi, Bej, Ağ..." />
                </div>
                <div className="ck-field">
                  <label className="ck-label">İstədiyiniz Ölçü</label>
                  <input className="ck-input" value={data.customSize || ""} onChange={e => onChange("customSize", e.target.value)} placeholder="məs: 180x90cm, XL..." />
                </div>
              </div>
              <div className="ck-field" style={{ marginTop: 12 }}>
                <label className="ck-label">Əlavə Qeydlər</label>
                <textarea className="ck-input" style={{ minHeight: 72, resize: "vertical" }} value={data.customDescription || ""} onChange={e => onChange("customDescription", e.target.value)} placeholder="məs: Dəri üzlük, metal ayaqlar, xüsusi ölçü..." />
              </div>
              <div className="ck-custom-notice">
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="10" cy="10" r="8" stroke="#7A6000" strokeWidth="1.4" />
                  <path d="M10 7v4" stroke="#7A6000" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="10" cy="14" r="0.7" fill="#7A6000" />
                </svg>
                <span>Xüsusi sifarişlər 0-dan hazırlandığı üçün çatdırılma müddəti uzana bilər. Dəqiq müddət menecer tərəfindən bildiriləcək.</span>
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

// STEP 3
function StepPayment({ subtotal, payMethod, setPayMethod, creditSel, setCreditSel, errors, onNext, onBack, t }) {
  const partial30 = Math.round(subtotal * 0.3 * 100) / 100;

  const METHODS = [
    { id: "card",    name: t("checkout.pay_card"),    desc: t("checkout.pay_card_desc"),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" strokeLinecap="round" /></svg> },
    { id: "partial", name: t("checkout.pay_partial"), desc: `\u20BC${partial30.toFixed(2)} indi, qalan\u00a0çatdırılmada`,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h2M10 15h2" strokeLinecap="round" /></svg> },
    { id: "cash",    name: t("checkout.pay_cash"),    desc: t("checkout.pay_cash_desc"),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></svg> },
    { id: "credit",  name: t("checkout.pay_credit"),  desc: t("checkout.pay_credit_desc"),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg> },
  ];

  return (
    <div>
      <div className="ck-card">
        <span className="ck-eyebrow">Add\u0131m 3</span>
        <h2 className="ck-card-title">{t("checkout.payment_title")}</h2>

        <div className="ck-pay-grid">
          {METHODS.map(m => (
            <div key={m.id} className={`ck-pay${payMethod === m.id ? " sel" : ""}`} onClick={() => setPayMethod(m.id)}>
              <div className="ck-pay-ico">{m.icon}</div>
              <p className="ck-pay-name">{m.name}</p>
              <p className="ck-pay-desc">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Kart ödənişi */}
        {payMethod === "card" && (
          <div className="ck-info" style={{ animation: "ckFU .3s ease" }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><rect x="2" y="5" width="16" height="11" rx="2" stroke="#2E6B32" strokeWidth="1.4" /><path d="M2 9h16" stroke="#2E6B32" strokeWidth="1.4" /></svg>
            <div className="ck-info-txt"><strong>{t("checkout.pay_card")}.</strong> {t("checkout.card_info")}</div>
          </div>
        )}

        {/* İlkin ödəniş — kart sahəsi göstər */}
        {payMethod === "partial" && (
          <div style={{ animation: "ckFU .3s ease" }}>
            <div className="ck-info">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><path d="M9 12l2 2 4-4" stroke="#2E6B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.4" /></svg>
              <div className="ck-info-txt"><strong>\u20BC{partial30.toFixed(2)} {t("checkout.partial_info")}</strong> {t("checkout.card_info")}</div>
            </div>
            <div className="ck-card-field">
              <p className="ck-card-field-title">İlkin ödəniş üçün kart məlumatları</p>
              <div className="ck-card-grid">
                <div className="ck-field" style={{ gridColumn: "1/-1" }}>
                  <label className="ck-label">Kart nömrəsi</label>
                  <input className="ck-input" placeholder="0000 0000 0000 0000" maxLength={19} style={{ fontFamily: "monospace, monospace" }} />
                </div>
                <div className="ck-field" style={{ gridColumn: "1/-1" }}>
                  <label className="ck-label">Kart üzərindəki ad</label>
                  <input className="ck-input" placeholder="AD SOYAD" style={{ textTransform: "uppercase", fontFamily: "monospace, monospace" }} />
                </div>
                <div className="ck-field">
                  <label className="ck-label">Bitmə tarixi</label>
                  <input className="ck-input" placeholder="MM/YY" maxLength={5} style={{ fontFamily: "monospace, monospace" }} />
                </div>
                <div className="ck-field">
                  <label className="ck-label">CVV</label>
                  <input className="ck-input" placeholder="•••" maxLength={3} type="password" style={{ fontFamily: "monospace, monospace" }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#6B6B6B", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <svg viewBox="0 0 16 16" fill="none" width="11" height="11"><rect x="2" y="6" width="12" height="9" rx="1.5" stroke="#6B6B6B" strokeWidth="1.3" /><path d="M5 6V4.5a3 3 0 016 0V6" stroke="#6B6B6B" strokeWidth="1.3" /></svg>
                SSL şifrələmə ilə qorunur
              </p>
            </div>
          </div>
        )}

        {payMethod === "cash" && (
          <div className="ck-info" style={{ animation: "ckFU .3s ease" }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0 }}><path d="M9 12l2 2 4-4" stroke="#2E6B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.4" /></svg>
            <div className="ck-info-txt"><strong>{t("checkout.pay_cash")}.</strong> {t("checkout.cash_info")}</div>
          </div>
        )}

        {payMethod === "credit" && (
          <div style={{ animation: "ckFU .3s ease" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, marginBottom: 20 }}>
              {t("checkout.credit_calculator")}
            </p>
            <CreditCalculator price={subtotal} onSelect={sel => setCreditSel(sel)} />
            {creditSel && (
              <div className="ck-ibar">
                <div className="ck-ibar-i"><p className="ck-ibar-l">Bank</p><p className="ck-ibar-v">{creditSel.bank.name}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">İlkin</p><p className="ck-ibar-v">\u20BC{creditSel.result.downAmount.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">Aylıq</p><p className="ck-ibar-v g">\u20BC{creditSel.result.monthly.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">Müddət</p><p className="ck-ibar-v">{creditSel.months} ay</p></div>
              </div>
            )}
          </div>
        )}

        {errors.payment && (
          <div className="ck-alert">
            <span style={{ color: "#C0392B", fontSize: 16, flexShrink: 0 }}>⚠</span>
            <span className="ck-alert-txt">{errors.payment}</span>
          </div>
        )}
      </div>

      <div className="ck-actions" style={{ marginTop: 16, paddingTop: 0, border: "none" }}>
        <button className="ck-btn ck-btn-b" onClick={onBack}>{t("checkout.back")}</button>
        <button className="ck-btn ck-btn-p" style={{ flex: 1, margin: 0 }} onClick={onNext}>{t("checkout.next_confirm")}</button>
      </div>
    </div>
  );
}

// STEP 4
function StepConfirm({ userData, addrData, payMethod, creditSel, subtotal, onPlace, onBack, placing, apiError, t }) {
  const [agreed, setAgreed] = useState(false);
  const partial30 = Math.round(subtotal * 0.3 * 100) / 100;

  const payLabel = payMethod === "card"    ? `${t("checkout.pay_card")} — Payriff`
                 : payMethod === "partial" ? `${t("checkout.pay_partial")} (\u20BC${partial30.toFixed(2)}) — Payriff`
                 : payMethod === "cash"    ? t("checkout.pay_cash")
                 : creditSel
                   ? `${creditSel.bank.name} · ${creditSel.months} ay · \u20BC${creditSel.result.monthly.toFixed(2)}/ay`
                   : t("checkout.pay_credit");

  return (
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
          {addrData.street}{addrData.house ? `, ev ${addrData.house}` : ""}{addrData.apartment ? `, m\u0259nzil ${addrData.apartment}` : ""}
          {addrData.note && <><br /><em style={{ color: "#6B6B6B" }}>{addrData.note}</em></>}
        </p>
      </div>

      {addrData.isCustomOrder && (
        <div className="ck-conf" style={{ borderColor: "#C9A84C" }}>
          <p className="ck-conf-lbl" style={{ color: "#C9A84C" }}>✦ Xüsusi Sifariş</p>
          <p className="ck-conf-val">
            {addrData.customColor && <span>R\u0259ng: {addrData.customColor}<br /></span>}
            {addrData.customSize && <span>Ölçü: {addrData.customSize}<br /></span>}
            {addrData.customDescription && <em style={{ color: "#6B6B6B" }}>{addrData.customDescription}</em>}
          </p>
        </div>
      )}

      <div className="ck-conf">
        <p className="ck-conf-lbl">{t("checkout.confirm_payment")}</p>
        <p className="ck-conf-val">{payLabel}</p>
        {payMethod === "credit" && creditSel && (
          <div className="ck-ibar" style={{ marginTop: 12 }}>
            <div className="ck-ibar-i"><p className="ck-ibar-l">İlkin</p><p className="ck-ibar-v">\u20BC{creditSel.result.downAmount.toFixed(2)}</p></div>
            <div className="ck-ibar-i"><p className="ck-ibar-l">Aylıq</p><p className="ck-ibar-v g">\u20BC{creditSel.result.monthly.toFixed(2)}</p></div>
            <div className="ck-ibar-i"><p className="ck-ibar-l">Müddət</p><p className="ck-ibar-v">{creditSel.months} ay</p></div>
          </div>
        )}
      </div>

      <div className="ck-info">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.5" />
          <path d="M10 6v5l3 2" stroke="#2E6B32" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="ck-info-txt">
          Sifari\u015finiz q\u0259bul edildikd\u0259n sonra menecerlərimiz <strong>{userData.phone}</strong> n\xf6mr\u0259sin\u0259 z\u0259ng ed\u0259r\u0259k \xe7atd\u0131r\u0131lma vaxt\u0131n\u0131 razılaşdıracaq.
        </span>
      </div>

      {apiError && (
        <div className="ck-alert">
          <span style={{ color: "#C0392B", fontSize: 16, flexShrink: 0 }}>⚠</span>
          <span className="ck-alert-txt">{apiError}</span>
        </div>
      )}

      <div className="ck-terms" onClick={() => setAgreed(a => !a)}>
        <div className={`ck-terms-box${agreed ? " on" : ""}`} />
        <span className="ck-terms-txt">
          {t("checkout.terms_agree")} <a href="/terms" style={{ color: "#7A9E7E" }}>{t("checkout.terms_link1")}</a>{" "}
          {t("checkout.terms_and")} <a href="/privacy" style={{ color: "#7A9E7E" }}>{t("checkout.terms_link2")}</a>{" "}
          {t("checkout.terms_end")}
        </span>
      </div>

      <div className="ck-actions">
        <button className="ck-btn ck-btn-b" onClick={onBack} disabled={placing}>{t("checkout.back")}</button>
        <button className="ck-btn ck-btn-p" style={{ flex: 1, margin: 0 }} disabled={!agreed || placing} onClick={onPlace}>
          {placing ? <><span className="ck-spin" />{t("checkout.placing")}</> : t("checkout.place_order")}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { t }     = useTranslation();
  const authUser  = useSelector(s => s.auth.user);
  const cartItems = useSelector(s => s.cart.items);

  const [step,     setStep]     = useState(0);
  const [placing,  setPlacing]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [orderId,  setOrderId]  = useState(null);
  const [apiError, setApiError] = useState(null);
  const [errors,   setErrors]   = useState({});

  useEffect(() => { if (cartItems.length === 0 && !done) navigate("/cart"); }, [cartItems, done]);

  const [userData, setUserData] = useState({
    name:  authUser ? `${authUser.name || ""} ${authUser.surname || ""}`.trim() : "",
    phone: authUser?.phoneNumber || "",
    email: authUser?.email || "",
  });
  const [addrData, setAddrData] = useState({
    city: "Bak\u0131", district: "", street: "", house: "", apartment: "",
    floor: 0, hasElevator: false, removeOldFurniture: false,
    deliveryType: DeliveryType.DoorDelivery, note: "",
    isCustomOrder: false, customColor: "", customSize: "", customDescription: "",
  });
  const [payMethod, setPayMethod] = useState("card");
  const [creditSel, setCreditSel] = useState(null);
  const subtotal = cartItems.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);

  const validateUser = () => {
    const e = {};
    if (!userData.name.trim()) e.name = t("checkout.err_name");
    if (!userData.phone.trim()) e.phone = t("checkout.err_phone");
    else if (!isValidPhone(userData.phone)) e.phone = t("checkout.err_phone_fmt");
    if (!/\S+@\S+\.\S+/.test(userData.email)) e.email = t("checkout.err_email");
    setErrors(e); return !Object.keys(e).length;
  };
  const validateAddr = () => {
    const e = {};
    if (!addrData.city) e.city = t("checkout.err_city");
    if (!addrData.district.trim()) e.district = t("checkout.err_district");
    if (!addrData.street.trim()) e.street = t("checkout.err_street");
    if (!addrData.deliveryType) e.deliveryType = t("checkout.err_delivery_type");
    setErrors(e); return !Object.keys(e).length;
  };
  const validatePay = () => {
    const e = {};
    if (payMethod === "credit" && !creditSel) e.payment = t("checkout.err_credit");
    setErrors(e); return !Object.keys(e).length;
  };

  const next = () => {
    setApiError(null);
    if (step === 0 && !validateUser()) return;
    if (step === 1 && !validateAddr()) return;
    if (step === 2 && !validatePay()) return;
    setErrors({});
    setStep(s => s + 1);
  };

  const placeOrder = async () => {
    setPlacing(true); setApiError(null);
    try {
      const pm = payMethod === "card" ? PaymentMethod.Card
               : payMethod === "cash" ? PaymentMethod.CashOnDelivery
               : payMethod === "partial" ? PaymentMethod.PartialCard
               : PaymentMethod.Installment;

      const customParts = [
        addrData.customColor ? `R\u0259ng: ${addrData.customColor}` : null,
        addrData.customSize ? `Ölçü: ${addrData.customSize}` : null,
        addrData.customDescription || null,
      ].filter(Boolean);

      const addrNote = [
        `${addrData.city}, ${addrData.district} r., ${addrData.street}`,
        addrData.house ? `ev ${addrData.house}` : null,
        addrData.apartment ? `m\u0259nzil ${addrData.apartment}` : null,
        addrData.floor > 0 ? `${addrData.floor}-ci m\u0259rt\u0259b\u0259` : null,
        addrData.hasElevator ? "Lift var" : null,
        addrData.removeOldFurniture ? "Köhn\u0259 mebeli aparsinlar" : null,
        `M\xfc\u015ft\u0259ri: ${userData.name} / ${userData.phone}`,
        addrData.note || null,
      ].filter(Boolean).join("; ");

      const partialAmount     = payMethod === "partial" ? Math.round(subtotal * 0.3 * 100) / 100 : null;
      const installmentMonths = payMethod === "credit" && creditSel ? creditSel.months : null;
      const monthlyPayment    = payMethod === "credit" && creditSel ? Math.round(creditSel.result.monthly * 100) / 100 : null;

      const payload = {
        type: addrData.isCustomOrder ? OrderType.Custom : OrderType.Standard,
        paymentMethod: pm,
        note: addrNote,
        isCustomOrder: addrData.isCustomOrder,
        customDescription: customParts.join(" | ") || null,
        paidAmount: partialAmount,
        installmentMonths,
        monthlyPayment,
        deliveryInfo: {
          deliveryType:       addrData.deliveryType,
          floor:              parseInt(addrData.floor) || 0,
          hasElevator:        addrData.hasElevator,
          removeOldFurniture: addrData.removeOldFurniture,
          deliveryNote:       addrData.note || null,
        },
        items: cartItems.map(it => ({
          productId:    it.productId    || null,
          collectionId: it.collectionId || null,
          selectedColor: it.selectedColor || null,
          selectedSize:  it.selectedSize  || null,
          quantity:     it.quantity,
        })),
      };

      const data = await orderApi.create(payload);
      const id = data?.id ?? data?.data?.id;
      setOrderId(id);

      if ((payMethod === "card" || payMethod === "partial") && id) {
        const payRes = await orderApi.initiatePayment(id, partialAmount);
        const payUrl = payRes?.paymentUrl || payRes?.data?.paymentUrl;
        if (payUrl) { dispatch(clearCart()); window.location.href = payUrl; return; }
      }

      dispatch(clearCart());
      setDone(true);
    } catch (err) {
      setApiError(err?.userMessage || t("checkout.err_api"));
    } finally {
      setPlacing(false);
    }
  };

  const STEPS = [t("checkout.step1"), t("checkout.step2"), t("checkout.step3"), t("checkout.step4")];

  return (
    <>
      <style>{CSS}</style>
      <div className="ck">
        <Navbar />

        {done && (
          <SuccessPopup
            orderId={orderId}
            userName={userData.name}
            userPhone={userData.phone}
            onGoOrders={() => navigate("/profile")}
            onGoShopping={() => navigate("/categories")}
          />
        )}

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
            {step === 2 && <StepPayment subtotal={subtotal} payMethod={payMethod} setPayMethod={setPayMethod} creditSel={creditSel} setCreditSel={setCreditSel} errors={errors} onNext={next} onBack={() => setStep(1)} t={t} />}
            {step === 3 && <StepConfirm userData={userData} addrData={addrData} payMethod={payMethod} creditSel={creditSel} subtotal={subtotal} placing={placing} apiError={apiError} onPlace={placeOrder} onBack={() => setStep(2)} t={t} />}
          </div>
          <OrderSummary cartItems={cartItems} payMethod={payMethod} creditSel={creditSel} t={t} />
        </div>
      </div>
    </>
  );
}
