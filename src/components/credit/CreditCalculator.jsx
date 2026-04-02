// src/components/credit/CreditCalculator.jsx
// ─────────────────────────────────────────────────────────────
// Azərbaycan bazarına uyğun kredit kalkulyatoru
// Reusable — ProductDetail, CartDrawer, CheckoutPage-də istifadə olunur
// Bütün stillər daxilindədir
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";

// ── Azərbaycan bankları ─────────────────────────────────────
export const AZ_BANKS = [
  { id: "kapital", name: "Kapital Bank",  logo: "KB", color: "#E30613", rate12: 1.5, rate24: 1.8 },
  { id: "abb",     name: "ABB",           logo: "ABB", color: "#004A97", rate12: 1.7, rate24: 2.0 },
  { id: "pasha",   name: "PAŞA Bank",    logo: "PB", color: "#003087", rate12: 1.6, rate24: 1.9 },
  { id: "access",  name: "AccessBank",   logo: "AC", color: "#E4002B", rate12: 1.8, rate24: 2.1 },
  { id: "atb",     name: "AtaBank",      logo: "AT", color: "#005B99", rate12: 1.9, rate24: 2.2 },
  { id: "leobank", name: "Leobank",      logo: "LB", color: "#FF6B00", rate12: 2.0, rate24: 2.3 },
];

// ── Müddətlər ──────────────────────────────────────────────
export const PERIODS = [
  { months: 4,  label: "4 ay",  interest: 0,    badge: "0%" },
  { months: 6,  label: "6 ay",  interest: 0,    badge: "0%" },
  { months: 12, label: "12 ay", interest: null, badge: null }, // bank rate
  { months: 24, label: "24 ay", interest: null, badge: null },
];

// ── İlkin ödəniş seçimləri ─────────────────────────────────
export const DOWN_OPTIONS = [
  { pct: 0,  label: "0%"  },
  { pct: 10, label: "10%" },
  { pct: 20, label: "20%" },
  { pct: 30, label: "30%" },
];

// ── Hesablama məntiqi ──────────────────────────────────────
export function calcCredit({ price, downPct, months, bankRate }) {
  const downAmount  = Math.round(price * downPct / 100);
  const principal   = price - downAmount;
  const isZeroRate  = months <= 6;
  const monthlyRate = isZeroRate ? 0 : bankRate / 100;

  let monthly, totalCredit;
  if (monthlyRate === 0) {
    monthly      = principal / months;
    totalCredit  = principal;
  } else {
    // annuity formula
    const r = monthlyRate;
    const n = months;
    monthly     = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalCredit = monthly * n;
  }

  const overpay = totalCredit - principal;
  return {
    downAmount,
    principal,
    monthly:     Math.round(monthly * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    totalPay:    Math.round((downAmount + totalCredit) * 100) / 100,
    overpay:     Math.round(overpay * 100) / 100,
    isZeroRate,
  };
}

const fmt = (n) => `₼${Number(n).toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Inline CSS ─────────────────────────────────────────────
const CSS = `
@keyframes ccFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes ccSpin { to{transform:rotate(360deg)} }

.cc { font-family:'DM Sans',sans-serif; animation: ccFadeUp .4s ease }
.cc-banks { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px }
.cc-bank {
  display:flex; align-items:center; gap:8px;
  padding:9px 14px; border:1.5px solid #E5DDD4;
  background:#fff; cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif;
  transition:all .22s; color:#1C1C1C; font-weight:500;
}
.cc-bank:hover { border-color:#7A9E7E; background:#F0F7F1 }
.cc-bank.sel   { border-color:#7A9E7E; background:#7A9E7E; color:#fff }
.cc-bank-dot   { width:8px; height:8px; border-radius:50%; flex-shrink:0 }
.cc-bank.sel .cc-bank-dot { background:rgba(255,255,255,.6) }

.cc-row { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap }
.cc-pill {
  padding:9px 18px; border:1.5px solid #E5DDD4;
  background:#fff; cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif;
  color:#1C1C1C; transition:all .2s; position:relative; white-space:nowrap;
}
.cc-pill:hover { border-color:#7A9E7E }
.cc-pill.sel   { border-color:#7A9E7E; background:#7A9E7E; color:#fff }
.cc-pill-badge {
  position:absolute; top:-8px; right:-6px;
  background:#D4714A; color:#fff; font-size:8px; font-weight:700;
  letter-spacing:.5px; padding:2px 5px; line-height:1;
}
.cc-pill.sel .cc-pill-badge { background:rgba(255,255,255,.3) }

.cc-section-lbl {
  font-size:10px; letter-spacing:2px; text-transform:uppercase;
  color:#6B6B6B; margin-bottom:10px; display:block;
}

.cc-result {
  background:linear-gradient(135deg,#1C1C1C 0%,#2D3A2E 100%);
  padding:28px; margin-top:4px; animation:ccFadeUp .35s ease;
  position:relative; overflow:hidden;
}
.cc-result::before {
  content:''; position:absolute; top:-40%; right:-10%;
  width:200px; height:200px; border-radius:50%;
  background:radial-gradient(circle,rgba(122,158,126,.2) 0%,transparent 70%);
  pointer-events:none;
}
.cc-result-main { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px }
.cc-result-monthly-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.4); margin-bottom:6px }
.cc-result-monthly { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:300; color:#fff; line-height:1 }
.cc-result-monthly span { font-size:18px; margin-right:2px }
.cc-result-tag {
  background:rgba(122,158,126,.25); border:1px solid rgba(122,158,126,.4);
  color:#C8DBC9; font-size:10px; letter-spacing:1.5px; text-transform:uppercase;
  padding:6px 12px; align-self:flex-start;
}
.cc-result-rows { border-top:1px solid rgba(255,255,255,.08); padding-top:16px; display:flex; flex-direction:column; gap:10px }
.cc-result-row { display:flex; justify-content:space-between; align-items:center }
.cc-result-row-lbl { font-size:12px; color:rgba(255,255,255,.4) }
.cc-result-row-val { font-size:14px; color:#fff; font-weight:500 }
.cc-result-row-val.green { color:#7A9E7E }
.cc-result-row-val.amber { color:#C9A84C }
.cc-result-row-total { font-family:'Cormorant Garamond',serif; font-size:20px; color:#fff }

.cc-no-bank {
  padding:28px; border:1.5px dashed #E5DDD4; text-align:center;
  color:#6B6B6B; font-size:13px; margin-top:4px;
}
.cc-no-bank svg { margin:0 auto 10px; display:block; color:#C0B5AA }

.cc-down-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:20px }
.cc-down-btn {
  padding:12px 8px; border:1.5px solid #E5DDD4; background:#fff; cursor:pointer;
  font-size:13px; font-weight:600; color:#1C1C1C; font-family:'DM Sans',sans-serif;
  transition:all .2s; text-align:center;
}
.cc-down-btn:hover { border-color:#7A9E7E }
.cc-down-btn.sel   { border-color:#7A9E7E; background:#7A9E7E; color:#fff }
.cc-down-sub { font-size:10px; font-weight:400; opacity:.75; display:block; margin-top:2px }

@media(max-width:600px){
  .cc-down-grid { grid-template-columns:repeat(2,1fr) }
  .cc-result-monthly { font-size:34px }
}
`;

// ══════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════
export default function CreditCalculator({ price, compact = false, onSelect }) {
  const [bank,     setBank]    = useState(AZ_BANKS[0].id);
  const [months,   setMonths]  = useState(12);
  const [downPct,  setDownPct] = useState(20);

  const selBank = AZ_BANKS.find(b => b.id === bank);
  const bankRate = months <= 12 ? selBank?.rate12 : selBank?.rate24;

  const result = useMemo(() =>
    calcCredit({ price, downPct, months, bankRate }),
    [price, downPct, months, bankRate]
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="cc">

        {/* ── Banks ── */}
        {!compact && (
          <>
            <span className="cc-section-lbl">Bank seçin</span>
            <div className="cc-banks">
              {AZ_BANKS.map(b => (
                <button
                  key={b.id}
                  className={`cc-bank${bank === b.id ? " sel" : ""}`}
                  onClick={() => setBank(b.id)}
                >
                  <span className="cc-bank-dot" style={{ background: bank === b.id ? "rgba(255,255,255,.6)" : b.color }} />
                  {b.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── İlkin ödəniş ── */}
        <span className="cc-section-lbl">İlkin ödəniş</span>
        <div className="cc-down-grid">
          {DOWN_OPTIONS.map(d => (
            <button
              key={d.pct}
              className={`cc-down-btn${downPct === d.pct ? " sel" : ""}`}
              onClick={() => setDownPct(d.pct)}
            >
              {d.label}
              <span className="cc-down-sub">
                {d.pct === 0 ? "ödəniş yoxdur" : `₼${Math.round(price * d.pct / 100)}`}
              </span>
            </button>
          ))}
        </div>

        {/* ── Müddət ── */}
        <span className="cc-section-lbl">Müddət</span>
        <div className="cc-row">
          {PERIODS.map(p => (
            <button
              key={p.months}
              className={`cc-pill${months === p.months ? " sel" : ""}`}
              onClick={() => setMonths(p.months)}
            >
              {p.label}
              {p.badge && <span className="cc-pill-badge">{p.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Nəticə ── */}
        {compact && (
          <>
            <span className="cc-section-lbl">Bank seçin</span>
            <div className="cc-banks">
              {AZ_BANKS.map(b => (
                <button
                  key={b.id}
                  className={`cc-bank${bank === b.id ? " sel" : ""}`}
                  onClick={() => setBank(b.id)}
                >
                  <span className="cc-bank-dot" style={{ background: bank === b.id ? "rgba(255,255,255,.6)" : b.color }} />
                  {b.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="cc-result">
          <div className="cc-result-main">
            <div>
              <p className="cc-result-monthly-lbl">Aylıq ödəniş</p>
              <p className="cc-result-monthly">
                <span>₼</span>{result.monthly.toFixed(2)}
              </p>
            </div>
            <div className="cc-result-tag">
              {result.isZeroRate ? "0% FAİZ" : `${bankRate}%/ay`}
            </div>
          </div>
          <div className="cc-result-rows">
            {downPct > 0 && (
              <div className="cc-result-row">
                <span className="cc-result-row-lbl">İlkin ödəniş</span>
                <span className="cc-result-row-val">{fmt(result.downAmount)}</span>
              </div>
            )}
            <div className="cc-result-row">
              <span className="cc-result-row-lbl">Kredit məbləği</span>
              <span className="cc-result-row-val">{fmt(result.principal)}</span>
            </div>
            {!result.isZeroRate && result.overpay > 0 && (
              <div className="cc-result-row">
                <span className="cc-result-row-lbl">Artıq ödəniş</span>
                <span className="cc-result-row-val amber">+{fmt(result.overpay)}</span>
              </div>
            )}
            {result.isZeroRate && (
              <div className="cc-result-row">
                <span className="cc-result-row-lbl">Faiz</span>
                <span className="cc-result-row-val green">0.00 AZN — pulsuz!</span>
              </div>
            )}
            <div className="cc-result-row" style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:10, marginTop:2 }}>
              <span className="cc-result-row-lbl" style={{ color:"rgba(255,255,255,.7)", fontWeight:500 }}>Ümumi ödəniş</span>
              <span className="cc-result-row-total">{fmt(result.totalPay)}</span>
            </div>
          </div>
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect({ bank: selBank, months, downPct, result })}
            style={{
              marginTop:12, width:"100%", background:"#1C1C1C", color:"#fff",
              padding:"14px", border:"none", cursor:"pointer",
              fontSize:11, letterSpacing:2, textTransform:"uppercase",
              fontFamily:"'DM Sans',sans-serif", transition:"background .3s",
            }}
            onMouseEnter={e => e.target.style.background="#7A9E7E"}
            onMouseLeave={e => e.target.style.background="#1C1C1C"}
          >
            Bu seçimlə davam et →
          </button>
        )}
      </div>
    </>
  );
}
