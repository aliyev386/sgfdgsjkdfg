// src/pages/order/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────
// Tam professional checkout — 4 addım
// Real API: POST /addresses (opsional), POST /orders
// Redux cart-dan məhsullar, auth-dan user info
// Tam validation: ünvan + kart + kredit
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/common/Navbar";
import CreditCalculator from "../../components/credit/CreditCalculator";

// ── Helpers ────────────────────────────────────────────────
const fmt   = n => `₼${Number(n).toLocaleString("az-AZ",{minimumFractionDigits:2})}`;
const fmtN  = v => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
const fmtE  = v => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1/$2").slice(0,5);
const FREE_SHIPPING = 500;

// Enums — backend ilə uyğun
const PaymentMethod = { Card: 2, CashOnDelivery: 1, BankTransfer: 3 };
const OrderType     = { Standard: 0, Custom: 1 };
const DeliveryType  = { DoorDelivery: 1, RoomDelivery: 2, AssemblyIncluded: 3 };

// Bakı rayonları
const BAKU_DISTRICTS = [
  "Binəqədi","Nəsimi","Nizami","Pirəkəşkül","Sabunçu","Suraxanı",
  "Xətai","Yeni Günəşli","Lökbatan","Balaxanı","Zabrat","Ramana",
  "Hövsan","Maştağa","Nardaran","Bilgəh","Buzovna",
  "Novxanı","Sabail","Bayıl","Biləcəri",
];
const CITIES = ["Bakı","Gəncə","Sumqayıt","Lənkəran","Naxçıvan","Şirvan","Mingəçevir","Quba","Şəki","Zaqatala"];
const TIME_SLOTS = ["09:00-12:00","12:00-15:00","15:00-18:00","18:00-21:00"];

// ── CSS ────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes ckFU    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
@keyframes ckShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
@keyframes ckSpin  { to{transform:rotate(360deg)} }
@keyframes ckChk   { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
@keyframes ckSucc  { 0%{opacity:0;transform:scale(.9)} 100%{opacity:1;transform:scale(1)} }
*,*::before,*::after{box-sizing:border-box}
.ck{font-family:'DM Sans',sans-serif;color:#1C1C1C;background:#F7F3EE;min-height:100vh;padding-top:80px}

/* Progress */
.ck-prog{background:#fff;border-bottom:1px solid #E5DDD4;padding:0 60px;display:flex;overflow-x:auto;position:sticky;top:80px;z-index:10;scrollbar-width:none}
.ck-prog::-webkit-scrollbar{display:none}
.ck-st{display:flex;align-items:center;gap:10px;padding:20px 0;white-space:nowrap}
.ck-st:not(:last-child)::after{content:'→';margin:0 16px;color:#E5DDD4;font-size:13px}
.ck-stc{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:1.5px solid #E5DDD4;background:#fff;color:#6B6B6B;transition:all .3s;flex-shrink:0}
.ck-st.active .ck-stc{background:#1C1C1C;border-color:#1C1C1C;color:#fff}
.ck-st.done .ck-stc{background:#7A9E7E;border-color:#7A9E7E;color:#fff}
.ck-stl{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6B6B}
.ck-st.active .ck-stl{color:#1C1C1C;font-weight:600}
.ck-st.done .ck-stl{color:#7A9E7E}
@media(max-width:700px){.ck-prog{padding:0 16px}.ck-stl{display:none}.ck-st:not(:last-child)::after{margin:0 8px}}

/* Layout */
.ck-body{max-width:1200px;margin:0 auto;padding:48px 60px;display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:start}
@media(max-width:1000px){.ck-body{grid-template-columns:1fr;padding:32px 24px}}
@media(max-width:600px){.ck-body{padding:20px 16px}}

/* Cards */
.ck-card{background:#fff;border:1px solid #E5DDD4;padding:36px;animation:ckFU .4s ease}
.ck-card+.ck-card{margin-top:16px}
.ck-card-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;margin:0 0 28px}
.ck-card-title em{font-style:italic;color:#7A9E7E}
.ck-eyebrow{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7A9E7E;margin-bottom:8px;display:block}

/* Form */
.ck-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ck-grid.cols1{grid-template-columns:1fr}
@media(max-width:600px){.ck-grid{grid-template-columns:1fr}}
.ck-field{display:flex;flex-direction:column;gap:6px}
.ck-field.span2{grid-column:1/-1}
.ck-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;font-weight:500}
.ck-label .req{color:#C0392B}
.ck-input{background:#F7F3EE;border:1px solid #E5DDD4;padding:13px 16px;font-size:14px;color:#1C1C1C;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .25s,background .25s,box-shadow .25s;-webkit-appearance:none;border-radius:0;width:100%}
.ck-input:focus{border-color:#7A9E7E;background:#fff;box-shadow:0 0 0 3px rgba(122,158,126,.1)}
.ck-input.err{border-color:#C0392B!important;animation:ckShake .3s ease}
.ck-err{font-size:11px;color:#C0392B;margin-top:2px}
.ck-select{appearance:none;-webkit-appearance:none;
  background:#F7F3EE url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6B6B' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 14px center;
  background-size:12px;padding-right:40px;cursor:pointer}

/* Delivery type */
.ck-dtype-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
@media(max-width:500px){.ck-dtype-grid{grid-template-columns:1fr}}
.ck-dtype{border:1.5px solid #E5DDD4;padding:14px 12px;cursor:pointer;text-align:center;transition:all .2s;background:#fff}
.ck-dtype:hover{border-color:#C8DBC9;background:#F7FAF7}
.ck-dtype.sel{border-color:#7A9E7E;background:#F0F7F1}
.ck-dtype-name{font-size:12px;font-weight:500;color:#1C1C1C;margin-top:4px}
.ck-dtype-desc{font-size:10px;color:#6B6B6B;line-height:1.4;margin-top:3px}

/* Payment method */
.ck-pay-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
@media(max-width:600px){.ck-pay-grid{grid-template-columns:1fr}}
.ck-pay{border:1.5px solid #E5DDD4;padding:18px 12px;cursor:pointer;transition:all .25s;background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;position:relative}
.ck-pay:hover{border-color:#C8DBC9;background:#F7F3EE}
.ck-pay.sel{border-color:#7A9E7E;background:#F0F7F1}
.ck-pay.sel::after{content:'✓';position:absolute;top:8px;right:10px;font-size:11px;color:#7A9E7E;font-weight:700}
.ck-pay-ico{width:40px;height:40px;background:#F7F3EE;display:flex;align-items:center;justify-content:center;border-radius:2px}
.ck-pay.sel .ck-pay-ico{background:#C8DBC9}
.ck-pay-name{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:300}
.ck-pay-desc{font-size:10px;color:#6B6B6B;line-height:1.5}

/* Card preview */
.ck-card-prev{background:linear-gradient(135deg,#1C1C1C 0%,#2D3A2E 100%);padding:24px;margin-bottom:20px;position:relative;overflow:hidden}
.ck-card-prev::before{content:'';position:absolute;top:-40%;right:-10%;width:180px;height:180px;border-radius:50%;background:rgba(122,158,126,.08);pointer-events:none}
.ck-card-chip{width:32px;height:24px;background:linear-gradient(135deg,#C8A47A,#E5C89A);border-radius:4px;margin-bottom:20px}
.ck-card-num{font-size:18px;letter-spacing:3px;color:rgba(255,255,255,.8);margin-bottom:16px;font-family:monospace}
.ck-card-btm{display:flex;justify-content:space-between;align-items:flex-end}
.ck-card-lbl2{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:3px}
.ck-card-val{font-size:12px;color:rgba(255,255,255,.7)}
.ck-card-brand{position:absolute;top:18px;right:20px;font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:rgba(255,255,255,.12)}

/* Install bar */
.ck-ibar{background:linear-gradient(135deg,#1C1C1C,#2D3A2E);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:12px}
.ck-ibar-i{text-align:center}
.ck-ibar-l{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:3px}
.ck-ibar-v{font-family:'Cormorant Garamond',serif;font-size:18px;color:#fff;font-weight:300}
.ck-ibar-v.g{color:#7A9E7E}

/* Confirm blocks */
.ck-conf{border:1px solid #E5DDD4;padding:18px 22px;margin-bottom:12px;background:#FDFAF7}
.ck-conf-lbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7A9E7E;margin-bottom:6px}
.ck-conf-val{font-size:14px;color:#1C1C1C;line-height:1.7}

/* Terms */
.ck-terms{display:flex;align-items:flex-start;gap:12px;margin-top:20px;cursor:pointer}
.ck-terms-box{width:18px;height:18px;border:1.5px solid #E5DDD4;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px;transition:all .2s}
.ck-terms-box.on{background:#7A9E7E;border-color:#7A9E7E}
.ck-terms-box.on::after{content:'✓';font-size:10px;color:#fff}
.ck-terms-txt{font-size:12px;color:#6B6B6B;line-height:1.6}

/* Buttons */
.ck-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:15px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .3s;border-radius:0}
.ck-btn-p{background:#1C1C1C;color:#fff;width:100%;margin-top:20px}
.ck-btn-p:hover:not(:disabled){background:#7A9E7E;transform:translateY(-2px);box-shadow:0 8px 20px rgba(122,158,126,.3)}
.ck-btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none}
.ck-btn-b{background:none;border:1.5px solid #E5DDD4;color:#6B6B6B;padding:12px 24px;font-size:10px}
.ck-btn-b:hover{border-color:#1C1C1C;color:#1C1C1C}
.ck-actions{display:flex;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid #E5DDD4;align-items:center}
.ck-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:ckSpin .7s linear infinite;display:inline-block;flex-shrink:0}

/* Summary */
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

/* Success */
.ck-succ{display:flex;flex-direction:column;align-items:center;padding:100px 40px;text-align:center;min-height:60vh;animation:ckSucc .6s ease}
.ck-succ-ring{width:88px;height:88px;border-radius:50%;background:#EAF3EB;display:flex;align-items:center;justify-content:center;margin-bottom:28px}
.ck-succ-title{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,5vw,56px);font-weight:300;margin:0 0 14px;line-height:1.1}
.ck-succ-title em{font-style:italic;color:#7A9E7E}
.ck-succ-desc{font-size:14px;color:#6B6B6B;max-width:400px;line-height:1.8;margin:0 auto 32px}
.ck-succ-box{background:#F7F3EE;border:1px solid #E5DDD4;padding:14px 28px;font-size:13px;color:#1C1C1C;margin-bottom:32px}
.ck-succ-box strong{font-family:'Cormorant Garamond',serif;font-size:18px}

/* Error alert */
.ck-alert{background:#FDF0EF;border:1px solid #F5C6C4;padding:14px 18px;margin-top:16px;display:flex;align-items:flex-start;gap:10px}
.ck-alert-txt{font-size:13px;color:#C0392B;line-height:1.5}

/* Info box */
.ck-info{background:#EAF3EB;border:1px solid #C8DBC9;padding:14px 18px;display:flex;align-items:center;gap:10px;margin-top:0}
.ck-info-txt{font-size:13px;color:#2E6B32;line-height:1.5}

/* Floor/elevator row */
.ck-inline{display:flex;align-items:center;gap:8px}
.ck-toggle{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.ck-toggle-box{width:36px;height:20px;border-radius:10px;background:#E5DDD4;position:relative;transition:background .2s;flex-shrink:0}
.ck-toggle-box.on{background:#7A9E7E}
.ck-toggle-knob{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.ck-toggle-box.on .ck-toggle-knob{left:19px}
.ck-toggle-lbl{font-size:12px;color:#6B6B6B}
`;

// ── OrderSummary ───────────────────────────────────────────
function OrderSummary({ cartItems, payMethod, creditSel }) {
  const subtotal = cartItems.reduce((s, it) => s + (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity, 0);
  const shipping  = subtotal >= FREE_SHIPPING ? 0 : 15;
  const base      = subtotal + shipping;
  const displayTotal = (payMethod === "credit" && creditSel) ? creditSel.result.totalPay : base;

  return (
    <div className="ck-sum">
      <div className="ck-sum-hd">
        <p className="ck-sum-hd-t">Sifariş <em style={{fontStyle:"italic",color:"#C8DBC9"}}>xülasəsi</em></p>
      </div>
      <div className="ck-sum-body">
        {cartItems.map(it => {
          const name  = it.productName  || it.collectionName  || "Məhsul";
          const price = (it.productPrice ?? it.collectionPrice ?? 0) * it.quantity;
          const img   = it.productImage || null;
          return (
            <div key={it.id} className="ck-sum-row">
              {img
                ? <img src={img} alt={name} className="ck-sum-img"/>
                : <div className="ck-sum-img" style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#C4B9AD"}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="20" height="20">
                      <path d="M12 2l9 5v10l-9 5-9-5V7z"/>
                    </svg>
                  </div>
              }
              <div className="ck-sum-info">
                <p className="ck-sum-name">{name}</p>
                {it.selectedColor && <p className="ck-sum-cat">{it.selectedColor}</p>}
                <p className="ck-sum-cat">×{it.quantity}</p>
              </div>
              <span className="ck-sum-price">{fmt(price)}</span>
            </div>
          );
        })}
      </div>
      <div className="ck-sum-rows">
        <div className="ck-sum-r"><span className="ck-sum-r-l">Aralıq cəm</span><span className="ck-sum-r-v">{fmt(subtotal)}</span></div>
        <div className="ck-sum-r">
          <span className="ck-sum-r-l">Çatdırılma</span>
          <span className={`ck-sum-r-v${shipping===0?" free":""}`}>{shipping===0?"Pulsuz":fmt(shipping)}</span>
        </div>
        {payMethod==="credit"&&creditSel&&(
          <div className="ck-sum-r">
            <span className="ck-sum-r-l">Kredit faizi</span>
            <span className="ck-sum-r-v" style={{color:"#C9A84C"}}>+{fmt(creditSel.result.overpay||0)}</span>
          </div>
        )}
      </div>
      <div className="ck-sum-tot">
        <span className="ck-sum-tot-l">Cəmi</span>
        <span className="ck-sum-tot-v">{fmt(displayTotal)}</span>
      </div>
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────
function Toggle({ on, onChange, label }) {
  return (
    <label className="ck-toggle" onClick={()=>onChange(!on)}>
      <div className={`ck-toggle-box${on?" on":""}`}><div className="ck-toggle-knob"/></div>
      <span className="ck-toggle-lbl">{label}</span>
    </label>
  );
}

// ── STEP 1: User info ──────────────────────────────────────
function StepUser({ data, errors, onChange, onNext, user }) {
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 1</span>
      <h2 className="ck-card-title">Əlaqə <em>məlumatları</em></h2>
      {user && (
        <div className="ck-info" style={{marginBottom:20}}>
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.5"/><path d="M10 6v4l2 2" stroke="#2E6B32" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span className="ck-info-txt">Hesabınızdan məlumatlar dolduruldu. Lazım olarsa dəyişin.</span>
        </div>
      )}
      <div className="ck-grid">
        <Field label="Ad Soyad" req name="name" value={data.name} onChange={onChange} error={errors.name} placeholder="Adınız Soyadınız"/>
        <Field label="Telefon" req name="phone" value={data.phone} onChange={onChange} error={errors.phone} placeholder="+994 50 000 00 00" type="tel"/>
        <Field label="E-poçt" req name="email" value={data.email} onChange={onChange} error={errors.email} placeholder="email@example.com" type="email" className="span2"/>
      </div>
      <div className="ck-actions">
        <button className="ck-btn ck-btn-p" style={{margin:0,flex:1}} onClick={onNext}>
          Ünvan məlumatları →
        </button>
      </div>
    </div>
  );
}

// ── STEP 2: Address + Delivery info ───────────────────────
function StepAddress({ data, errors, onChange, onNext, onBack }) {
  const isB = data.city === "Bakı";

  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 2</span>
      <h2 className="ck-card-title">Çatdırılma <em>ünvanı</em></h2>

      {/* Şəhər + Rayon */}
      <div className="ck-grid" style={{marginBottom:16}}>
        <div className="ck-field">
          <label className="ck-label">Şəhər <span className="req">*</span></label>
          <select className={`ck-input ck-select${errors.city?" err":""}`}
            value={data.city} onChange={e=>onChange("city",e.target.value)}>
            <option value="">Şəhər seçin</option>
            {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city&&<span className="ck-err">{errors.city}</span>}
        </div>
        <div className="ck-field">
          <label className="ck-label">
            {isB?"Rayon / qəsəbə":"Rayon"} <span className="req">*</span>
          </label>
          {isB ? (
            <select className={`ck-input ck-select${errors.district?" err":""}`}
              value={data.district} onChange={e=>onChange("district",e.target.value)}>
              <option value="">Rayon seçin</option>
              {BAKU_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input className={`ck-input${errors.district?" err":""}`}
              value={data.district} onChange={e=>onChange("district",e.target.value)}
              placeholder="Rayon / qəsəbə adı"/>
          )}
          {errors.district&&<span className="ck-err">{errors.district}</span>}
        </div>
      </div>

      {/* Küçə + Ev + Mənzil */}
      <div className="ck-grid" style={{marginBottom:16}}>
        <Field label="Küçə" req name="street" value={data.street} onChange={onChange} error={errors.street} placeholder="Küçə adı" className="span2"/>
        <Field label="Ev nömrəsi" name="house" value={data.house} onChange={onChange} placeholder="12"/>
        <Field label="Mənzil" name="apartment" value={data.apartment} onChange={onChange} placeholder="5"/>
      </div>

      {/* Mərtəbə + Lift */}
      <div className="ck-grid" style={{marginBottom:20}}>
        <div className="ck-field">
          <label className="ck-label">Mərtəbə</label>
          <input className="ck-input" type="number" min="0" max="50"
            value={data.floor} onChange={e=>onChange("floor",e.target.value)} placeholder="0"/>
        </div>
        <div className="ck-field" style={{justifyContent:"flex-end",paddingBottom:4}}>
          <Toggle on={data.hasElevator} onChange={v=>onChange("hasElevator",v)} label="Lift var"/>
          <div style={{marginTop:12}}>
            <Toggle on={data.removeOldFurniture} onChange={v=>onChange("removeOldFurniture",v)} label="Köhnə mebeli aparsınlar"/>
          </div>
        </div>
      </div>

      {/* Çatdırılma növü */}
      <div className="ck-field" style={{marginBottom:20}}>
        <label className="ck-label">Çatdırılma növü <span className="req">*</span></label>
        <div className="ck-dtype-grid">
          {[
            {t:DeliveryType.DoorDelivery,    n:"Qapıya qədər", d:"Yalnız giriş qapısına"},
            {t:DeliveryType.RoomDelivery,    n:"Otağa aparırlar", d:"Seçdiyiniz otağa"},
            {t:DeliveryType.AssemblyIncluded,n:"Quraşdırma ilə", d:"Otağa + montaj"},
          ].map(opt=>(
            <div key={opt.t} className={`ck-dtype${data.deliveryType===opt.t?" sel":""}`}
              onClick={()=>onChange("deliveryType",opt.t)}>
              <p className="ck-dtype-name">{opt.n}</p>
              <p className="ck-dtype-desc">{opt.d}</p>
            </div>
          ))}
        </div>
        {errors.deliveryType&&<span className="ck-err">{errors.deliveryType}</span>}
      </div>

      {/* Çatdırılma tarixi + zaman */}
      <div className="ck-grid" style={{marginBottom:16}}>
        <div className="ck-field">
          <label className="ck-label">Çatdırılma tarixi <span className="req">*</span></label>
          <input className={`ck-input${errors.scheduledDate?" err":""}`} type="date"
            value={data.scheduledDate} onChange={e=>onChange("scheduledDate",e.target.value)}
            min={new Date(Date.now()+86400000).toISOString().split("T")[0]}/>
          {errors.scheduledDate&&<span className="ck-err">{errors.scheduledDate}</span>}
        </div>
        <div className="ck-field">
          <label className="ck-label">Vaxt aralığı <span className="req">*</span></label>
          <select className={`ck-input ck-select${errors.timeSlot?" err":""}`}
            value={data.timeSlot} onChange={e=>onChange("timeSlot",e.target.value)}>
            <option value="">Vaxt seçin</option>
            {TIME_SLOTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {errors.timeSlot&&<span className="ck-err">{errors.timeSlot}</span>}
        </div>
      </div>

      <div className="ck-field span2" style={{marginBottom:0}}>
        <label className="ck-label">Sürücüyə qeyd</label>
        <textarea className="ck-input" style={{minHeight:68,resize:"vertical"}}
          value={data.note} onChange={e=>onChange("note",e.target.value)}
          placeholder="Məs: zəng etməyin, məktub qutusu yanında bekleyirəm..."/>
      </div>

      <div className="ck-actions">
        <button className="ck-btn ck-btn-b" onClick={onBack}>← Geri</button>
        <button className="ck-btn ck-btn-p" style={{flex:1,margin:0}} onClick={onNext}>
          Ödəniş üsulu →
        </button>
      </div>
    </div>
  );
}

// ── STEP 3: Payment ────────────────────────────────────────
function StepPayment({ subtotal, payMethod, setPayMethod, card, onCard, creditSel, setCreditSel, errors, onNext, onBack }) {
  const METHODS = [
    { id:"card",   name:"Kart",     desc:"Visa / Mastercard",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4" strokeLinecap="round"/></svg> },
    { id:"cash",   name:"Nağd",     desc:"Çatdırılmada ödəyin",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg> },
    { id:"credit", name:"Kreditlə", desc:"4–24 ay hissəli",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  ];

  return (
    <div>
      <div className="ck-card">
        <span className="ck-eyebrow">Addım 3</span>
        <h2 className="ck-card-title">Ödəniş <em>üsulu</em></h2>

        <div className="ck-pay-grid">
          {METHODS.map(m=>(
            <div key={m.id} className={`ck-pay${payMethod===m.id?" sel":""}`} onClick={()=>setPayMethod(m.id)}>
              <div className="ck-pay-ico">{m.icon}</div>
              <p className="ck-pay-name">{m.name}</p>
              <p className="ck-pay-desc">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Kart */}
        {payMethod==="card" && (
          <div style={{animation:"ckFU .3s ease"}}>
            <div className="ck-card-prev">
              <div className="ck-card-chip"/>
              <div className="ck-card-num">
                {card.number ? card.number.replace(/\d(?=(?:\D*\d){4})/g,"•") : "•••• •••• •••• ••••"}
              </div>
              <div className="ck-card-btm">
                <div>
                  <p className="ck-card-lbl2">Kart sahibi</p>
                  <p className="ck-card-val">{card.name||"AD SOYAD"}</p>
                </div>
                <div>
                  <p className="ck-card-lbl2">Bitmə tarixi</p>
                  <p className="ck-card-val">{card.expiry||"MM/YY"}</p>
                </div>
              </div>
              <div className="ck-card-brand">VISA</div>
            </div>
            <div className="ck-grid cols1">
              <Field label="Kart nömrəsi" req name="number" value={card.number} onChange={(n,v)=>onCard(n,fmtN(v))} error={errors.cardNumber} placeholder="0000 0000 0000 0000" maxLen={19}/>
              <Field label="Kart üzərindəki ad" req name="name" value={card.name} onChange={(n,v)=>onCard(n,v.toUpperCase())} error={errors.cardName} placeholder="AD SOYAD"/>
            </div>
            <div className="ck-grid" style={{marginTop:12}}>
              <Field label="Bitmə tarixi" req name="expiry" value={card.expiry} onChange={(n,v)=>onCard(n,fmtE(v))} error={errors.cardExpiry} placeholder="MM/YY" maxLen={5}/>
              <Field label="CVV" req name="cvv" value={card.cvv} onChange={(n,v)=>onCard(n,v.replace(/\D/g,"").slice(0,3))} error={errors.cardCvv} placeholder="•••" type="password" maxLen={3}/>
            </div>
          </div>
        )}

        {/* Nağd */}
        {payMethod==="cash" && (
          <div className="ck-info" style={{animation:"ckFU .3s ease"}}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M9 12l2 2 4-4" stroke="#2E6B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="#2E6B32" strokeWidth="1.4"/></svg>
            <div className="ck-info-txt">
              <strong>Nağd ödəniş seçildi.</strong> Məhsul çatdırılanda ödəyirsiniz. Əlavə xərc yoxdur.
            </div>
          </div>
        )}

        {/* Kredit */}
        {payMethod==="credit" && (
          <div style={{animation:"ckFU .3s ease"}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,marginBottom:20}}>
              Kredit <em style={{fontStyle:"italic",color:"#7A9E7E"}}>Kalkulyatoru</em>
            </p>
            <CreditCalculator price={subtotal} onSelect={sel=>setCreditSel(sel)}/>
            {creditSel && (
              <div className="ck-ibar">
                <div className="ck-ibar-i"><p className="ck-ibar-l">Bank</p><p className="ck-ibar-v">{creditSel.bank.name}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">İlkin</p><p className="ck-ibar-v">₼{creditSel.result.downAmount.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">Aylıq</p><p className="ck-ibar-v g">₼{creditSel.result.monthly.toFixed(2)}</p></div>
                <div className="ck-ibar-i"><p className="ck-ibar-l">Müddət</p><p className="ck-ibar-v">{creditSel.months} ay</p></div>
              </div>
            )}
          </div>
        )}

        {errors.payment && (
          <div className="ck-alert" style={{marginTop:16}}>
            <span style={{color:"#C0392B",fontSize:16,flexShrink:0}}>⚠</span>
            <span className="ck-alert-txt">{errors.payment}</span>
          </div>
        )}
      </div>

      <div className="ck-actions" style={{marginTop:16,paddingTop:0,border:"none"}}>
        <button className="ck-btn ck-btn-b" onClick={onBack}>← Geri</button>
        <button className="ck-btn ck-btn-p" style={{flex:1,margin:0}} onClick={onNext}>Sifarişi təsdiqlə →</button>
      </div>
    </div>
  );
}

// ── STEP 4: Confirm ────────────────────────────────────────
function StepConfirm({ userData, addrData, payMethod, card, creditSel, onPlace, onBack, placing, apiError }) {
  const [agreed, setAgreed] = useState(false);

  const payLabel = payMethod==="card"
    ? `Kart — ${card.number||"?"}`
    : payMethod==="cash"
      ? "Nağd — çatdırılmada"
      : creditSel
        ? `${creditSel.bank.name} · ${creditSel.months} ay · ₼${creditSel.result.monthly.toFixed(2)}/ay`
        : "Kredit seçilməyib";

  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 4 — Son baxış</span>
      <h2 className="ck-card-title">Sifarişi <em>təsdiqlə</em></h2>

      <div className="ck-conf">
        <p className="ck-conf-lbl">Əlaqə məlumatı</p>
        <p className="ck-conf-val">{userData.name} · {userData.phone}<br/>{userData.email}</p>
      </div>
      <div className="ck-conf">
        <p className="ck-conf-lbl">Çatdırılma ünvanı</p>
        <p className="ck-conf-val">
          {addrData.city}{addrData.district?`, ${addrData.district} r.`:""}<br/>
          {addrData.street}{addrData.house?`, ev ${addrData.house}`:""}{addrData.apartment?`, mənzil ${addrData.apartment}`:""}<br/>
          {addrData.scheduledDate} · {addrData.timeSlot}
          {addrData.note&&<><br/><em style={{color:"#6B6B6B"}}>{addrData.note}</em></>}
        </p>
      </div>
      <div className="ck-conf">
        <p className="ck-conf-lbl">Ödəniş</p>
        <p className="ck-conf-val">{payLabel}</p>
        {payMethod==="credit"&&creditSel&&(
          <div className="ck-ibar" style={{marginTop:12}}>
            <div className="ck-ibar-i"><p className="ck-ibar-l">İlkin</p><p className="ck-ibar-v">₼{creditSel.result.downAmount.toFixed(2)}</p></div>
            <div className="ck-ibar-i"><p className="ck-ibar-l">Aylıq</p><p className="ck-ibar-v g">₼{creditSel.result.monthly.toFixed(2)}</p></div>
            <div className="ck-ibar-i"><p className="ck-ibar-l">Müddət</p><p className="ck-ibar-v">{creditSel.months} ay</p></div>
          </div>
        )}
      </div>

      {apiError && (
        <div className="ck-alert">
          <span style={{color:"#C0392B",fontSize:16,flexShrink:0}}>⚠</span>
          <span className="ck-alert-txt">{apiError}</span>
        </div>
      )}

      <div className="ck-terms" onClick={()=>setAgreed(a=>!a)}>
        <div className={`ck-terms-box${agreed?" on":""}`}/>
        <span className="ck-terms-txt">
          Saytın <a href="/terms" style={{color:"#7A9E7E"}}>istifadə şərtlərini</a> və{" "}
          <a href="/privacy" style={{color:"#7A9E7E"}}>məxfilik siyasətini</a> oxudum, qəbul edirəm.
        </span>
      </div>

      <div className="ck-actions">
        <button className="ck-btn ck-btn-b" onClick={onBack} disabled={placing}>← Geri</button>
        <button className="ck-btn ck-btn-p" style={{flex:1,margin:0}} disabled={!agreed||placing} onClick={onPlace}>
          {placing ? <><span className="ck-spin"/> İşlənir...</> : "Sifarişi ver →"}
        </button>
      </div>
    </div>
  );
}

// ── Reusable Field ─────────────────────────────────────────
function Field({ label, req, name, value, onChange, error, type="text", placeholder, className="", maxLen }) {
  return (
    <div className={`ck-field${className?` ${className}`:""}`}>
      <label className="ck-label">{label}{req&&<span className="req"> *</span>}</label>
      <input
        className={`ck-input${error?" err":""}`}
        name={name} type={type} value={value}
        onChange={e=>onChange(name,e.target.value)}
        placeholder={placeholder} maxLength={maxLen}
        autoComplete="off"
      />
      {error&&<span className="ck-err">{error}</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════
const STEPS = ["Əlaqə","Ünvan","Ödəniş","Təsdiq"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux
  const authUser   = useSelector(s => s.auth.user);
  const cartItems  = useSelector(s => s.cart.items);

  const [step,     setStep]    = useState(0);
  const [placing,  setPlacing] = useState(false);
  const [done,     setDone]    = useState(false);
  const [orderId,  setOrderId] = useState(null);
  const [apiError, setApiError]= useState(null);
  const [errors,   setErrors]  = useState({});

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0 && !done) navigate("/cart");
  }, [cartItems, done, navigate]);

  // Form state — pre-fill from auth
  const [userData, setUserData] = useState({
    name:  authUser ? `${authUser.name||""} ${authUser.surname||""}`.trim() : "",
    phone: authUser?.phoneNumber || "",
    email: authUser?.email || "",
  });
  const [addrData, setAddrData] = useState({
    city:"Bakı", district:"", street:"", house:"", apartment:"",
    floor:0, hasElevator:false, removeOldFurniture:false,
    deliveryType: DeliveryType.DoorDelivery,
    scheduledDate:"", timeSlot:"", note:"",
  });
  const [payMethod,  setPayMethod]  = useState("card");
  const [card,       setCard]       = useState({number:"",name:"",expiry:"",cvv:""});
  const [creditSel,  setCreditSel]  = useState(null);

  const subtotal = cartItems.reduce((s,it)=>s+(it.productPrice??it.collectionPrice??0)*it.quantity,0);

  // ── Validators ─────────────────────────────────────────
  const validateUser = () => {
    const e={};
    if(!userData.name.trim())    e.name  = "Ad Soyad tələb olunur";
    if(!userData.phone.trim())   e.phone = "Telefon tələb olunur";
    if(!/\S+@\S+\.\S+/.test(userData.email)) e.email = "Düzgün e-poçt daxil edin";
    setErrors(e); return !Object.keys(e).length;
  };

  const validateAddr = () => {
    const e={};
    if(!addrData.city)            e.city         = "Şəhər seçin";
    if(!addrData.district.trim()) e.district     = "Rayon mütləqdir — çatdırılma üçün lazımdır";
    if(!addrData.street.trim())   e.street       = "Küçə adı tələb olunur";
    if(!addrData.deliveryType)    e.deliveryType = "Çatdırılma növü seçin";
    if(!addrData.scheduledDate)   e.scheduledDate= "Tarix seçin";
    else {
      const sel = new Date(addrData.scheduledDate);
      const tom = new Date(); tom.setDate(tom.getDate()+1); tom.setHours(0,0,0,0);
      if(sel < tom) e.scheduledDate = "Ən azı sabah üçün seçin";
    }
    if(!addrData.timeSlot) e.timeSlot = "Vaxt aralığı seçin";
    setErrors(e); return !Object.keys(e).length;
  };

  const validatePay = () => {
    const e={};
    if(payMethod==="card"){
      const num = card.number.replace(/\s/g,"");
      if(num.length !== 16)         e.cardNumber = "16 rəqəmli kart nömrəsi daxil edin";
      if(!card.name.trim())         e.cardName   = "Kart üzərindəki ad tələb olunur";
      if(!/^\d{2}\/\d{2}$/.test(card.expiry)) e.cardExpiry = "MM/YY formatında daxil edin";
      else {
        const [mm,yy]=card.expiry.split("/");
        const expDate = new Date(2000+parseInt(yy), parseInt(mm)-1, 1);
        if(expDate < new Date()) e.cardExpiry = "Kartın müddəti bitib";
      }
      if(card.cvv.length !== 3) e.cardCvv = "3 rəqəmli CVV daxil edin";
    }
    if(payMethod==="credit"&&!creditSel) e.payment = "Kredit kalkulyatorunu tamamlayın";
    setErrors(e); return !Object.keys(e).length;
  };

  const next = () => {
    setApiError(null);
    if(step===0&&!validateUser()) return;
    if(step===1&&!validateAddr()) return;
    if(step===2&&!validatePay()) return;
    setErrors({});
    setStep(s=>s+1);
  };

  // ── Place order ────────────────────────────────────────
  const placeOrder = async () => {
    setPlacing(true);
    setApiError(null);
    try {
      // Map payment method
      const pm = payMethod==="card" ? PaymentMethod.Card
               : payMethod==="cash" ? PaymentMethod.CashOnDelivery
               : PaymentMethod.BankTransfer;

      // Full address in note for rider
      const addrNote = [
        `${addrData.city}, ${addrData.district} r., ${addrData.street}`,
        addrData.house      ? `ev ${addrData.house}` : null,
        addrData.apartment  ? `mənzil ${addrData.apartment}` : null,
        addrData.floor>0    ? `${addrData.floor}-ci mərtəbə` : null,
        addrData.hasElevator ? "Lift var" : null,
        addrData.removeOldFurniture ? "Köhnə mebeli aparsınlar" : null,
        `Müştəri: ${userData.name} / ${userData.phone}`,
        addrData.note || null,
      ].filter(Boolean).join("; ");

      const payload = {
        type:          OrderType.Standard,
        paymentMethod: pm,
        note:          addrNote,
        deliveryInfo: {
          deliveryType:       addrData.deliveryType,
          scheduledDate:      new Date(addrData.scheduledDate).toISOString(),
          timeSlot:           addrData.timeSlot,
          floor:              parseInt(addrData.floor)||0,
          hasElevator:        addrData.hasElevator,
          removeOldFurniture: addrData.removeOldFurniture,
          deliveryNote:       addrData.note||null,
        },
        items: cartItems.map(it => ({
          productId:     it.productId    || null,
          collectionId:  it.collectionId || null,
          selectedColor: it.selectedColor || null,
          selectedSize:  it.selectedSize  || null,
          quantity:      it.quantity,
        })),
      };

      const { data } = await axiosInstance.post("/orders", payload);
      const id = data?.data?.id ?? data?.id;
      setOrderId(id);
      dispatch(clearCart());
      setDone(true);
    } catch(err) {
      const msg = err?.userMessage || "Sifariş göndərilmədi. Bir az sonra yenidən cəhd edin.";
      setApiError(msg);
    } finally {
      setPlacing(false);
    }
  };

  // ── Success screen ────────────────────────────────────
  if(done) return (
    <>
      <style>{CSS}</style>
      <div className="ck">
        <Navbar/>
        <div className="ck-succ">
          <div className="ck-succ-ring">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5"/>
              <path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="24" strokeDashoffset="0"
                style={{animation:"ckChk .5s .2s ease both"}}/>
            </svg>
          </div>
          <h1 className="ck-succ-title">Sifariş<br/><em>qəbul edildi!</em></h1>
          <p className="ck-succ-desc">
            {userData.name}, sifarişiniz üçün təşəkkür edirik!<br/>
            Təsdiq emaili <strong>{userData.email}</strong> ünvanına göndərildi.<br/>
            Tezliklə <strong>{userData.phone}</strong> nömrəsinə zəng edəcəyik.
          </p>
          {orderId && (
            <div className="ck-succ-box">
              Sifariş nömrəsi: <strong>#{orderId}</strong>
            </div>
          )}
          <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
            <Link to="/profile" style={{
              textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,
              padding:"14px 32px",background:"#1C1C1C",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase"
            }}>Sifarişlərimə bax</Link>
            <Link to="/categories" style={{
              textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,
              padding:"14px 32px",background:"none",border:"1.5px solid #E5DDD4",color:"#1C1C1C",
              fontFamily:"'DM Sans',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase"
            }}>Alış-verişə davam et</Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ck">
        <Navbar/>

        {/* Progress bar */}
        <div className="ck-prog">
          {STEPS.map((s,i) => (
            <div key={i} className={`ck-st${step===i?" active":""}${step>i?" done":""}`}>
              <div className="ck-stc">
                {step>i
                  ? <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                      <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  : i+1
                }
              </div>
              <span className="ck-stl">{s}</span>
              {i<STEPS.length-1 && <span style={{color:"#E5DDD4",margin:"0 10px"}}>→</span>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="ck-body">
          <div>
            {step===0 && (
              <StepUser
                data={userData} errors={errors}
                onChange={(k,v)=>setUserData(p=>({...p,[k]:v}))}
                onNext={next} user={authUser}
              />
            )}
            {step===1 && (
              <StepAddress
                data={addrData} errors={errors}
                onChange={(k,v)=>setAddrData(p=>({...p,[k]:v}))}
                onNext={next} onBack={()=>setStep(0)}
              />
            )}
            {step===2 && (
              <StepPayment
                subtotal={subtotal}
                payMethod={payMethod} setPayMethod={setPayMethod}
                card={card} onCard={(k,v)=>setCard(p=>({...p,[k]:v}))}
                creditSel={creditSel} setCreditSel={setCreditSel}
                errors={errors} onNext={next} onBack={()=>setStep(1)}
              />
            )}
            {step===3 && (
              <StepConfirm
                userData={userData} addrData={addrData}
                payMethod={payMethod} card={card} creditSel={creditSel}
                placing={placing} apiError={apiError}
                onPlace={placeOrder} onBack={()=>setStep(2)}
              />
            )}
          </div>
          <OrderSummary cartItems={cartItems} payMethod={payMethod} creditSel={creditSel}/>
        </div>
      </div>
    </>
  );
}