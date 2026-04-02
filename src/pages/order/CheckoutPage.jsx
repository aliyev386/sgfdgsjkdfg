// src/pages/public/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────
// Tam Checkout Səhifəsi
// 4 addım: İstifadəçi → Ünvan → Ödəniş (kart/nağd/kredit) → Təsdiq
// Kredit kalkulyatoru daxili
// Bütün stillər daxilindədir
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import CreditCalculator, { AZ_BANKS, PERIODS, calcCredit } from "../../components/credit/CreditCalculator";

// ── Mock cart items ──────────────────────────────────────
const CART = [
  { id:1, name:"Velour Lounge Sofa", category:"Divanlar",  qty:1, price:2490, img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80" },
  { id:2, name:"Nordic Oak Chair",   category:"Kreslolar", qty:2, price:680,  img:"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200&q=80" },
];

const fmt = (n) => `₼${Number(n).toLocaleString("az-AZ",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const FREE_SHIPPING = 500;

// ══════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes ckFadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
@keyframes ckShake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
@keyframes ckSpin     { to{transform:rotate(360deg)} }
@keyframes ckCheck    { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
@keyframes ckSuccess  { 0%{opacity:0;transform:scale(.88)} 60%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }

.ck { font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#F7F3EE; min-height:100vh; padding-top:80px }

/* ── Progress bar ── */
.ck-progress { background:#fff; border-bottom:1px solid #E5DDD4; padding:0 60px; display:flex; overflow-x:auto; position:sticky; top:80px; z-index:10 }
.ck-step { display:flex; align-items:center; gap:10px; padding:20px 0; position:relative; white-space:nowrap }
.ck-step:not(:last-child)::after { content:'→'; margin:0 20px; color:#E5DDD4; font-size:14px }
.ck-step-circle { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; border:1.5px solid #E5DDD4; background:#fff; color:#6B6B6B; transition:all .3s; flex-shrink:0 }
.ck-step.active .ck-step-circle { background:#1C1C1C; border-color:#1C1C1C; color:#fff }
.ck-step.done .ck-step-circle   { background:#7A9E7E; border-color:#7A9E7E; color:#fff }
.ck-step-lbl { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#6B6B6B; transition:color .3s }
.ck-step.active .ck-step-lbl { color:#1C1C1C; font-weight:600 }
.ck-step.done .ck-step-lbl   { color:#7A9E7E }
@media(max-width:700px){ .ck-progress{padding:0 20px} .ck-step-lbl{display:none} .ck-step:not(:last-child)::after{margin:0 10px} }

/* ── Layout ── */
.ck-body { max-width:1200px; margin:0 auto; padding:48px 60px; display:grid; grid-template-columns:1fr 380px; gap:48px; align-items:start }
@media(max-width:1000px){ .ck-body{grid-template-columns:1fr;padding:32px 24px} }
@media(max-width:600px){ .ck-body{padding:24px 16px} }

/* ── Card container ── */
.ck-card { background:#fff; border:1px solid #E5DDD4; padding:36px; animation:ckFadeUp .4s ease }
.ck-card + .ck-card { margin-top:16px }
.ck-card-title { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; margin:0 0 24px }
.ck-card-title em { font-style:italic; color:#7A9E7E }
.ck-eyebrow { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#7A9E7E; margin-bottom:8px; display:block }

/* ── Form ── */
.ck-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px }
.ck-grid.full { grid-template-columns:1fr }
@media(max-width:600px){ .ck-grid{grid-template-columns:1fr} }
.ck-field { display:flex; flex-direction:column; gap:6px }
.ck-field.span2 { grid-column:1/-1 }
.ck-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#6B6B6B; font-weight:500 }
.ck-input { background:#F7F3EE; border:1px solid #E5DDD4; padding:13px 16px; font-size:14px; color:#1C1C1C; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .25s,background .25s,box-shadow .25s; border-radius:0; -webkit-appearance:none }
.ck-input:focus { border-color:#7A9E7E; background:#fff; box-shadow:0 0 0 3px rgba(122,158,126,.1) }
.ck-input.err { border-color:#C0392B; animation:ckShake .3s ease }
.ck-field-err { font-size:10px; color:#C0392B }
.ck-select { appearance:none; -webkit-appearance:none; background:#F7F3EE url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6B6B' fill='none' strokeWidth='1.5'/%3E%3C/svg%3E") no-repeat right 14px center; background-size:12px; padding-right:40px; cursor:pointer }

/* ── Payment method cards ── */
.ck-pay-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px }
@media(max-width:600px){ .ck-pay-grid{grid-template-columns:1fr} }
.ck-pay-opt { border:1.5px solid #E5DDD4; padding:20px 16px; cursor:pointer; transition:all .25s; background:#fff; display:flex; flex-direction:column; gap:10px; align-items:center; text-align:center; position:relative }
.ck-pay-opt:hover { border-color:#C8DBC9; background:#F7F3EE }
.ck-pay-opt.sel { border-color:#7A9E7E; background:#F0F7F1 }
.ck-pay-opt.sel::after { content:'✓'; position:absolute; top:8px; right:10px; font-size:11px; color:#7A9E7E; font-weight:700 }
.ck-pay-icon { width:44px; height:44px; background:#F7F3EE; display:flex; align-items:center; justify-content:center; border-radius:2px; transition:background .25s }
.ck-pay-opt.sel .ck-pay-icon { background:#C8DBC9 }
.ck-pay-icon svg { width:22px; height:22px; color:#1C1C1C }
.ck-pay-name { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:300; color:#1C1C1C }
.ck-pay-desc { font-size:11px; color:#6B6B6B; line-height:1.5 }

/* ── Card input row ── */
.ck-card-input-row { display:grid; grid-template-columns:1fr 90px 70px; gap:12px }
@media(max-width:500px){ .ck-card-input-row{grid-template-columns:1fr} }
.ck-card-preview {
  background:linear-gradient(135deg,#1C1C1C 0%,#2D3A2E 100%);
  padding:24px; margin-bottom:20px; position:relative; overflow:hidden;
  font-family:'DM Sans',sans-serif;
}
.ck-card-preview::before { content:''; position:absolute; top:-40%; right:-15%; width:200px; height:200px; border-radius:50%; background:rgba(122,158,126,.1); pointer-events:none }
.ck-card-chip { width:32px; height:24px; background:linear-gradient(135deg,#C8A47A,#E5C89A); border-radius:4px; margin-bottom:20px }
.ck-card-num  { font-size:18px; letter-spacing:3px; color:rgba(255,255,255,.8); margin-bottom:16px }
.ck-card-btm  { display:flex; justify-content:space-between }
.ck-card-lbl2 { font-size:9px; letter-spacing:1.5px; color:rgba(255,255,255,.35); text-transform:uppercase; margin-bottom:4px }
.ck-card-val  { font-size:12px; color:rgba(255,255,255,.7) }
.ck-card-brand{ position:absolute; top:18px; right:20px; font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; color:rgba(255,255,255,.15) }

/* ── Credit section ── */
.ck-credit-wrap { border:1px solid #E5DDD4; padding:24px; background:#F7F3EE; margin-top:4px; animation:ckFadeUp .35s ease }

/* ── Installment summary bar ── */
.ck-install-bar {
  background:linear-gradient(135deg,#1C1C1C,#2D3A2E); padding:16px 20px;
  display:flex; justify-content:space-between; align-items:center; margin-top:16px; flex-wrap:wrap; gap:12px;
}
.ck-install-bar-item { text-align:center }
.ck-install-bar-lbl { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:4px }
.ck-install-bar-val { font-family:'Cormorant Garamond',serif; font-size:20px; color:#fff; font-weight:300 }
.ck-install-bar-val.green { color:#7A9E7E }

/* ── Order summary (right) ── */
.ck-summary { background:#fff; border:1px solid #E5DDD4; position:sticky; top:140px; animation:ckFadeUp .4s ease }
.ck-summary-header { background:#1C1C1C; padding:20px 24px }
.ck-summary-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:300; color:#fff }
.ck-summary-body { padding:20px 24px }
.ck-sum-item { display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #F0EBE3; align-items:center }
.ck-sum-item:last-child { border-bottom:none }
.ck-sum-img { width:56px; height:64px; object-fit:cover; background:#EDE7DC; flex-shrink:0 }
.ck-sum-info { flex:1; min-width:0 }
.ck-sum-name { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:300; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.ck-sum-cat  { font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#6B6B6B }
.ck-sum-qty  { font-size:11px; color:#6B6B6B }
.ck-sum-price{ font-family:'Cormorant Garamond',serif; font-size:18px; flex-shrink:0 }
.ck-sum-rows { padding:16px 24px; border-top:1px solid #E5DDD4 }
.ck-sum-row  { display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px }
.ck-sum-row-lbl { color:#6B6B6B }
.ck-sum-row-val { color:#1C1C1C; font-weight:500 }
.ck-sum-row-val.free { color:#7A9E7E; font-size:10px; letter-spacing:1px; text-transform:uppercase }
.ck-sum-total { padding:16px 24px; border-top:1.5px solid #1C1C1C; display:flex; justify-content:space-between; align-items:flex-end }
.ck-sum-total-lbl { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:300 }
.ck-sum-total-val { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300 }

/* ── Buttons ── */
.ck-btn { display:flex; align-items:center; justify-content:center; gap:10px; padding:16px 32px; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:500; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .3s }
.ck-btn-primary { background:#1C1C1C; color:#fff; width:100%; margin-top:16px }
.ck-btn-primary:hover:not(:disabled) { background:#7A9E7E; transform:translateY(-2px); box-shadow:0 10px 24px rgba(122,158,126,.3) }
.ck-btn-primary:disabled { opacity:.4; cursor:not-allowed }
.ck-btn-back { background:none; border:1.5px solid #E5DDD4; color:#6B6B6B; padding:12px 24px; font-size:10px }
.ck-btn-back:hover { border-color:#1C1C1C; color:#1C1C1C }
.ck-form-actions { display:flex; align-items:center; gap:12px; margin-top:24px; padding-top:20px; border-top:1px solid #E5DDD4 }
.ck-spin { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:ckSpin .7s linear infinite; display:inline-block; flex-shrink:0 }

/* ── Confirm step ── */
.ck-confirm-block { border:1px solid #E5DDD4; padding:20px 24px; margin-bottom:14px; background:#FDFAF7; transition:border-color .2s }
.ck-confirm-block:hover { border-color:#C8DBC9 }
.ck-confirm-label { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#7A9E7E; margin-bottom:6px }
.ck-confirm-val   { font-size:14px; color:#1C1C1C; line-height:1.7 }
.ck-terms { display:flex; align-items:flex-start; gap:12px; margin-top:20px; cursor:pointer }
.ck-terms-box { width:18px; height:18px; border:1.5px solid #E5DDD4; background:#fff; flex-shrink:0; display:flex; align-items:center; justify-content:center; margin-top:2px; transition:all .2s }
.ck-terms-box.on { background:#7A9E7E; border-color:#7A9E7E }
.ck-terms-box.on::after { content:'✓'; font-size:10px; color:#fff }
.ck-terms-text { font-size:12px; color:#6B6B6B; line-height:1.6 }

/* ── Success ── */
.ck-success { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px 40px; text-align:center; min-height:60vh; animation:ckSuccess .7s cubic-bezier(.22,1,.36,1) forwards }
.ck-success-ring { width:88px; height:88px; border-radius:50%; background:#EAF3EB; display:flex; align-items:center; justify-content:center; margin-bottom:28px }
.ck-success-ring svg { width:40px; height:40px }
.ck-success-title { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,5vw,56px); font-weight:300; margin:0 0 14px; line-height:1.1 }
.ck-success-title em { font-style:italic; color:#7A9E7E }
.ck-success-desc { font-size:14px; color:#6B6B6B; max-width:380px; line-height:1.8; margin:0 auto 40px }
.ck-success-order { background:#F7F3EE; border:1px solid #E5DDD4; padding:16px 28px; font-size:13px; color:#1C1C1C; margin-bottom:32px }
.ck-success-order strong { font-family:'Cormorant Garamond',serif; font-size:18px }
`;

// ══════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════

// ── Reusable field ──
function Field({ label, name, value, onChange, error, type="text", placeholder, children, className="" }) {
  return (
    <div className={`ck-field${className?` ${className}`:""}`}>
      <label className="ck-label">{label}</label>
      {children || (
        <input
          className={`ck-input${error?" err":""}`}
          name={name} type={type} value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      )}
      {error && <span className="ck-field-err">{error}</span>}
    </div>
  );
}

// ── Card payment panel ──
function CardPanel({ card, onCard }) {
  const displayNum = (card.number || "0000 0000 0000 0000")
    .replace(/\d(?=(?:\D*\d){4})/g, '•')
    .padEnd(19, '0');

  const fmtNum = (v) => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp = (v) => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1/$2").slice(0,5);

  return (
    <div>
      <div className="ck-card-preview">
        <div className="ck-card-chip"/>
        <div className="ck-card-num">
          {card.number
            ? card.number.replace(/\d(?=(?:\D*\d){4})/g,'•')
            : "•••• •••• •••• ••••"
          }
        </div>
        <div className="ck-card-btm">
          <div>
            <p className="ck-card-lbl2">Kart sahibi</p>
            <p className="ck-card-val">{card.name || "AD SOYAD"}</p>
          </div>
          <div>
            <p className="ck-card-lbl2">Bitmə tarixi</p>
            <p className="ck-card-val">{card.expiry || "MM/YY"}</p>
          </div>
        </div>
        <div className="ck-card-brand">VISA</div>
      </div>
      <div className="ck-grid full">
        <div className="ck-field">
          <label className="ck-label">Kart nömrəsi</label>
          <input className="ck-input" placeholder="0000 0000 0000 0000" maxLength={19}
            value={card.number} onChange={e=>onCard("number",fmtNum(e.target.value))}/>
        </div>
        <div className="ck-field">
          <label className="ck-label">Kart sahibi</label>
          <input className="ck-input" placeholder="AD SOYAD"
            value={card.name} onChange={e=>onCard("name",e.target.value.toUpperCase())}/>
        </div>
      </div>
      <div className="ck-card-input-row" style={{marginTop:12}}>
        <div className="ck-field">
          <label className="ck-label">Bitmə tarixi</label>
          <input className="ck-input" placeholder="MM/YY" maxLength={5}
            value={card.expiry} onChange={e=>onCard("expiry",fmtExp(e.target.value))}/>
        </div>
        <div className="ck-field">
          <label className="ck-label">CVV</label>
          <input className="ck-input" placeholder="•••" type="password" maxLength={3}
            value={card.cvv} onChange={e=>onCard("cvv",e.target.value.replace(/\D/g,"").slice(0,3))}/>
        </div>
      </div>
    </div>
  );
}

// ── Credit payment panel ──
function CreditPanel({ price, creditSel, onCreditSel }) {
  return (
    <div className="ck-credit-wrap">
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:300, marginBottom:20 }}>
        Kredit <em style={{ fontStyle:"italic", color:"#7A9E7E" }}>Kalkulyatoru</em>
      </p>
      <CreditCalculator
        price={price}
        onSelect={sel => onCreditSel(sel)}
      />
      {creditSel && (
        <div className="ck-install-bar" style={{ marginTop:16 }}>
          <div className="ck-install-bar-item">
            <p className="ck-install-bar-lbl">Bank</p>
            <p className="ck-install-bar-val">{creditSel.bank.name}</p>
          </div>
          <div className="ck-install-bar-item">
            <p className="ck-install-bar-lbl">İlkin ödəniş</p>
            <p className="ck-install-bar-val">₼{creditSel.result.downAmount.toFixed(2)}</p>
          </div>
          <div className="ck-install-bar-item">
            <p className="ck-install-bar-lbl">Aylıq</p>
            <p className="ck-install-bar-val green">₼{creditSel.result.monthly.toFixed(2)}</p>
          </div>
          <div className="ck-install-bar-item">
            <p className="ck-install-bar-lbl">Müddət</p>
            <p className="ck-install-bar-val">{creditSel.months} ay</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Order summary sidebar ──
function OrderSummary({ items, payMethod, creditSel }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= FREE_SHIPPING ? 0 : 15;
  const base      = subtotal + shipping;

  let displayTotal = base;
  if (payMethod === "credit" && creditSel) {
    displayTotal = creditSel.result.totalPay;
  }

  return (
    <div className="ck-summary">
      <div className="ck-summary-header">
        <p className="ck-summary-title">Sifariş <em style={{ fontStyle:"italic", color:"#C8DBC9" }}>xülasəsi</em></p>
      </div>
      <div className="ck-summary-body">
        {items.map(item => (
          <div key={item.id} className="ck-sum-item">
            <img src={item.img} alt={item.name} className="ck-sum-img"/>
            <div className="ck-sum-info">
              <p className="ck-sum-name">{item.name}</p>
              <p className="ck-sum-cat">{item.category}</p>
              <p className="ck-sum-qty">×{item.qty}</p>
            </div>
            <span className="ck-sum-price">{fmt(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <div className="ck-sum-rows">
        <div className="ck-sum-row">
          <span className="ck-sum-row-lbl">Aralıq cəm</span>
          <span className="ck-sum-row-val">{fmt(subtotal)}</span>
        </div>
        <div className="ck-sum-row">
          <span className="ck-sum-row-lbl">Çatdırılma</span>
          <span className={`ck-sum-row-val${shipping===0?" free":""}`}>
            {shipping === 0 ? "Pulsuz" : fmt(shipping)}
          </span>
        </div>
        {payMethod === "credit" && creditSel && (
          <>
            <div className="ck-sum-row">
              <span className="ck-sum-row-lbl">İlkin ödəniş</span>
              <span className="ck-sum-row-val">{fmt(creditSel.result.downAmount)}</span>
            </div>
            <div className="ck-sum-row">
              <span className="ck-sum-row-lbl">Aylıq ödəniş</span>
              <span className="ck-sum-row-val" style={{ color:"#7A9E7E" }}>×{creditSel.months} ay</span>
            </div>
            {!creditSel.result.isZeroRate && creditSel.result.overpay > 0 && (
              <div className="ck-sum-row">
                <span className="ck-sum-row-lbl">Faiz artımı</span>
                <span className="ck-sum-row-val" style={{ color:"#C9A84C" }}>+{fmt(creditSel.result.overpay)}</span>
              </div>
            )}
          </>
        )}
      </div>
      <div className="ck-sum-total">
        <span className="ck-sum-total-lbl">Cəmi</span>
        <span className="ck-sum-total-val">{fmt(displayTotal)}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STEP COMPONENTS
// ══════════════════════════════════════════════════════════

// Step 1 — User info
function StepUser({ data, errors, onChange, onNext, onBack }) {
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 1</span>
      <h2 className="ck-card-title">Şəxsi <em>məlumatlar</em></h2>
      <div className="ck-grid">
        <Field label="Ad Soyad"  name="name"  value={data.name}  onChange={onChange} error={errors.name}  placeholder="Adınız Soyadınız"/>
        <Field label="Telefon"   name="phone" value={data.phone} onChange={onChange} error={errors.phone} placeholder="+994 50 000 00 00" type="tel"/>
        <Field label="E-poçt"    name="email" value={data.email} onChange={onChange} error={errors.email} placeholder="email@example.com" type="email" className="span2"/>
      </div>
      <div className="ck-form-actions">
        <button className="ck-btn ck-btn-primary" onClick={onNext}>
          Ünvan məlumatları →
        </button>
      </div>
    </div>
  );
}

// Step 2 — Address
function StepAddress({ data, errors, onChange, onNext, onBack }) {
  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 2</span>
      <h2 className="ck-card-title">Çatdırılma <em>ünvanı</em></h2>
      <div className="ck-grid">
        <div className="ck-field">
          <label className="ck-label">Şəhər</label>
          <select className="ck-input ck-select"
            value={data.city} onChange={e=>onChange("city",e.target.value)}>
            <option value="">Şəhər seçin</option>
            {["Bakı","Gəncə","Sumqayıt","Lənkəran","Naxçıvan","Şirvan","Mingəçevir"].map(c=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <span className="ck-field-err">{errors.city}</span>}
        </div>
        <Field label="Rayon" name="district" value={data.district} onChange={onChange} placeholder="Rayon / qəsəbə"/>
        <Field label="Küçə"  name="street"   value={data.street}   onChange={onChange} error={errors.street} placeholder="Küçə adı" className="span2"/>
        <Field label="Ev nömrəsi" name="house" value={data.house} onChange={onChange} placeholder="12"/>
        <Field label="Mənzil nömrəsi" name="apartment" value={data.apartment} onChange={onChange} placeholder="5 (mənzil yoxdursa boş buraxın)"/>
        <div className="ck-field span2">
          <label className="ck-label">Çatdırılma üçün qeyd</label>
          <textarea className="ck-input" style={{ minHeight:72, resize:"vertical" }}
            value={data.note} onChange={e=>onChange("note",e.target.value)}
            placeholder="Sürücüyə xüsusi qeyd (məsələn: zəng etməyin, məktub qutusu yanında)"/>
        </div>
      </div>
      <div className="ck-form-actions">
        <button className="ck-btn ck-btn-back" onClick={onBack}>← Geri</button>
        <button className="ck-btn ck-btn-primary" onClick={onNext}>
          Ödəniş üsulu →
        </button>
      </div>
    </div>
  );
}

// Step 3 — Payment
function StepPayment({ price, payMethod, setPayMethod, card, onCard, creditSel, onCreditSel, errors, onNext, onBack }) {
  const METHODS = [
    {
      id:"card", name:"Kart",  desc:"Visa / Mastercard online ödəniş",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20" strokeLinecap="round"/><path d="M6 15h4" strokeLinecap="round"/></svg>
    },
    {
      id:"cash", name:"Nağd",  desc:"Çatdırılma zamanı ödəyin",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
    },
    {
      id:"credit", name:"Kreditlə", desc:"4–24 ay hissə-hissə",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    },
  ];

  return (
    <div>
      <div className="ck-card">
        <span className="ck-eyebrow">Addım 3</span>
        <h2 className="ck-card-title">Ödəniş <em>üsulu</em></h2>

        <div className="ck-pay-grid">
          {METHODS.map(m => (
            <div key={m.id}
              className={`ck-pay-opt${payMethod===m.id?" sel":""}`}
              onClick={() => setPayMethod(m.id)}>
              <div className="ck-pay-icon">{m.icon}</div>
              <p className="ck-pay-name">{m.name}</p>
              <p className="ck-pay-desc">{m.desc}</p>
            </div>
          ))}
        </div>

        {payMethod === "card" && (
          <div style={{ animation:"ckFadeUp .35s ease" }}>
            <CardPanel card={card} onCard={onCard}/>
          </div>
        )}

        {payMethod === "cash" && (
          <div style={{ background:"#EAF3EB", border:"1px solid #C8DBC9", padding:"16px 20px", animation:"ckFadeUp .3s ease", display:"flex", alignItems:"center", gap:12 }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M9 12l2 2 4-4" stroke="#4A7A4E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="#4A7A4E" strokeWidth="1.4"/></svg>
            <div>
              <p style={{ fontSize:13, color:"#2E6B32", fontWeight:500 }}>Nağd ödəniş seçildi</p>
              <p style={{ fontSize:12, color:"#4A7A4E", marginTop:3 }}>Məhsul çatdırılanda ödəyirsiniz. Üstəgəl xərc yoxdur.</p>
            </div>
          </div>
        )}

        {payMethod === "credit" && (
          <CreditPanel price={price} creditSel={creditSel} onCreditSel={onCreditSel}/>
        )}

        {errors.payment && (
          <p style={{ color:"#C0392B", fontSize:12, marginTop:12 }}>{errors.payment}</p>
        )}
      </div>

      <div className="ck-form-actions" style={{ marginTop:0, paddingTop:0, border:"none", display:"flex", gap:12, marginTop:16 }}>
        <button className="ck-btn ck-btn-back" onClick={onBack}>← Geri</button>
        <button className="ck-btn ck-btn-primary" style={{ flex:1 }} onClick={onNext}>
          Sifarişi təsdiqlə →
        </button>
      </div>
    </div>
  );
}

// Step 4 — Confirm
function StepConfirm({ user, address, payMethod, card, creditSel, items, onPlace, onBack, placing }) {
  const [agreed, setAgreed] = useState(false);

  const payLabel = payMethod === "card"
    ? `Kart ilə — ${card.number || "Kart məlumatı yoxdur"}`
    : payMethod === "cash"
      ? "Nağd — çatdırılma zamanı"
      : creditSel
        ? `${creditSel.bank.name} · ${creditSel.months} ay · ₼${creditSel.result.monthly.toFixed(2)}/ay`
        : "Kredit seçimi tam deyil";

  return (
    <div className="ck-card">
      <span className="ck-eyebrow">Addım 4 — Son baxış</span>
      <h2 className="ck-card-title">Sifarişi <em>təsdiqlə</em></h2>

      <div className="ck-confirm-block">
        <p className="ck-confirm-label">Şəxsi məlumat</p>
        <p className="ck-confirm-val">{user.name} · {user.phone}<br/>{user.email}</p>
      </div>

      <div className="ck-confirm-block">
        <p className="ck-confirm-label">Çatdırılma ünvanı</p>
        <p className="ck-confirm-val">
          {address.city}{address.district?`, ${address.district}`:""}<br/>
          {address.street}{address.house?`, ev ${address.house}`:""}{address.apartment?`, mənzil ${address.apartment}`:""}
          {address.note && <><br/><em style={{color:"#6B6B6B"}}>{address.note}</em></>}
        </p>
      </div>

      <div className="ck-confirm-block">
        <p className="ck-confirm-label">Ödəniş üsulu</p>
        <p className="ck-confirm-val">{payLabel}</p>
        {payMethod === "credit" && creditSel && (
          <div className="ck-install-bar" style={{ marginTop:12 }}>
            <div className="ck-install-bar-item">
              <p className="ck-install-bar-lbl">İlkin</p>
              <p className="ck-install-bar-val">₼{creditSel.result.downAmount.toFixed(2)}</p>
            </div>
            <div className="ck-install-bar-item">
              <p className="ck-install-bar-lbl">Aylıq</p>
              <p className="ck-install-bar-val green">₼{creditSel.result.monthly.toFixed(2)}</p>
            </div>
            <div className="ck-install-bar-item">
              <p className="ck-install-bar-lbl">Müddət</p>
              <p className="ck-install-bar-val">{creditSel.months} ay</p>
            </div>
            <div className="ck-install-bar-item">
              <p className="ck-install-bar-lbl">Faiz</p>
              <p className="ck-install-bar-val">{creditSel.result.isZeroRate ? "0%" : `${creditSel.bank?.rate12}%/ay`}</p>
            </div>
          </div>
        )}
      </div>

      <div className="ck-terms" onClick={() => setAgreed(a=>!a)}>
        <div className={`ck-terms-box${agreed?" on":""}`}/>
        <span className="ck-terms-text">
          Saytın <Link to="/terms" style={{color:"#7A9E7E"}}>istifadə şərtlərini</Link> və 
          <Link to="/privacy" style={{color:"#7A9E7E"}}> məxfilik siyasətini</Link> oxudum, qəbul edirəm.
        </span>
      </div>

      <div className="ck-form-actions">
        <button className="ck-btn ck-btn-back" onClick={onBack}>← Geri</button>
        <button
          className="ck-btn ck-btn-primary"
          style={{ flex:1 }}
          disabled={!agreed || placing}
          onClick={onPlace}
        >
          {placing ? <><span className="ck-spin"/>&nbsp;İşlənir...</> : "Sifarişi ver →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════
const STEPS = ["Şəxsi məlumat","Ünvan","Ödəniş","Təsdiq"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(0);
  const [placing, setPlacing] = useState(false);
  const [done, setDone]     = useState(false);
  const [orderId, setOrderId] = useState("");

  // Form state
  const [user, setUser]       = useState({ name:"", phone:"", email:"" });
  const [address, setAddress] = useState({ city:"Bakı", district:"", street:"", house:"", apartment:"", note:"" });
  const [payMethod, setPayMethod] = useState("card");
  const [card, setCard]       = useState({ number:"", name:"", expiry:"", cvv:"" });
  const [creditSel, setCreditSel] = useState(null);
  const [errors, setErrors]   = useState({});

  const items = CART;
  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0);

  // ── Validation ──
  const validateUser = () => {
    const e = {};
    if (!user.name.trim())  e.name  = "Ad Soyad tələb olunur";
    if (!user.phone.trim()) e.phone = "Telefon tələb olunur";
    if (!/\S+@\S+\.\S+/.test(user.email)) e.email = "Düzgün e-poçt daxil edin";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const validateAddr = () => {
    const e = {};
    if (!address.city)         e.city   = "Şəhər seçin";
    if (!address.street.trim()) e.street = "Küçə adı tələb olunur";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const validatePay = () => {
    if (payMethod === "credit" && !creditSel) {
      setErrors({ payment:"Zəhmət olmasa kredit kalkulyatorunu tamamlayın" });
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (step === 0 && !validateUser()) return;
    if (step === 1 && !validateAddr()) return;
    if (step === 2 && !validatePay()) return;
    setErrors({});
    setStep(s=>s+1);
  };

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r=>setTimeout(r,1600));
    setOrderId(`AM-${Date.now().toString().slice(-6)}`);
    setDone(true);
    setPlacing(false);
  };

  // ── Success screen ──
  if (done) return (
    <>
      <style>{CSS}</style>
      <div className="ck">
        <Navbar/>
        <div className="ck-success">
          <div className="ck-success-ring">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5"/>
              <path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="24" strokeDashoffset="0"
                style={{ animation:"ckCheck .5s .2s ease both" }}/>
            </svg>
          </div>
          <h1 className="ck-success-title">Sifariş<br/><em>qəbul edildi!</em></h1>
          <p className="ck-success-desc">
            {user.name}, sifarişiniz üçün təşəkkür edirik. 
            Tezliklə {user.phone} nömrəsinə zəng edəcəyik.
          </p>
          <div className="ck-success-order">
            Sifariş nömrəsi: <strong>#{orderId}</strong>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
            <Link to="/" className="btn-dark" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", background:"#1C1C1C", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2, textTransform:"uppercase", border:"none", cursor:"pointer" }}>
              Ana səhifə
            </Link>
            <Link to="/categories" className="btn-ghost" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", background:"none", border:"1.5px solid #E5DDD4", color:"#1C1C1C", fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
              Alış-verişə davam et
            </Link>
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

        {/* Progress */}
        <div className="ck-progress">
          {STEPS.map((s,i) => (
            <div key={i} className={`ck-step${step===i?" active":""} ${step>i?"done":""}`}>
              <div className="ck-step-circle">
                {step>i ? <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : i+1}
              </div>
              <span className="ck-step-lbl">{s}</span>
              {i < STEPS.length-1 && <span style={{ color:"#E5DDD4", margin:"0 12px" }}>→</span>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="ck-body">
          <div>
            {step === 0 && (
              <StepUser data={user} errors={errors}
                onChange={(k,v)=>setUser(p=>({...p,[k]:v}))}
                onNext={next} onBack={()=>navigate(-1)}/>
            )}
            {step === 1 && (
              <StepAddress data={address} errors={errors}
                onChange={(k,v)=>setAddress(p=>({...p,[k]:v}))}
                onNext={next} onBack={()=>setStep(0)}/>
            )}
            {step === 2 && (
              <StepPayment
                price={subtotal}
                payMethod={payMethod} setPayMethod={setPayMethod}
                card={card} onCard={(k,v)=>setCard(p=>({...p,[k]:v}))}
                creditSel={creditSel} onCreditSel={setCreditSel}
                errors={errors} onNext={next} onBack={()=>setStep(1)}/>
            )}
            {step === 3 && (
              <StepConfirm
                user={user} address={address}
                payMethod={payMethod} card={card} creditSel={creditSel}
                items={items} placing={placing}
                onPlace={placeOrder} onBack={()=>setStep(2)}/>
            )}
          </div>
          <OrderSummary items={items} payMethod={payMethod} creditSel={creditSel}/>
        </div>
      </div>
    </>
  );
}
