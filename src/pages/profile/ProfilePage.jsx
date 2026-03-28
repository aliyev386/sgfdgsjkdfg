// src/pages/public/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// Amore Mebel — Profil Səhifəsi
// Tablar: Overview · Profil · Təhlükəsizlik · Ödəniş · Sifarişlər · Saxlananlar
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate }  from "react-router-dom";
import { useTranslation }      from "react-i18next";
import { getUser, logout }     from "../../api/authApi";
import "../../assets/pagesCss/ProfilePage.css";

// ── Mock data ──────────────────────────────────────────────
const MOCK_ORDERS = [
  { id:"AM-2025-0041", date:"12 Mar 2025", total:1240, status:"delivered",  payMethod:"credit", bank:"Kapital Bank", items:[{name:"Velvet Sofa",qty:1,price:890},{name:"Side Table",qty:2,price:175}] },
  { id:"AM-2025-0037", date:"28 Feb 2025", total:560,  status:"shipped",    payMethod:"cash",   bank:null,           items:[{name:"Dining Chair",qty:4,price:140}] },
  { id:"AM-2025-0029", date:"10 Feb 2025", total:2100, status:"delivered",  payMethod:"credit", bank:"PAŞA Bank",    items:[{name:"King Bed Frame",qty:1,price:1650},{name:"Nightstand",qty:2,price:225}] },
  { id:"AM-2024-0184", date:"14 Dec 2024", total:340,  status:"cancelled",  payMethod:"cash",   bank:null,           items:[{name:"Floor Lamp",qty:1,price:340}] },
];
const MOCK_SAVED = [
  { id:1, name:"Oslo Armchair",     price:690  },
  { id:2, name:"Linen Sectional",   price:2340 },
  { id:3, name:"Marble Coffee Tbl", price:480  },
  { id:4, name:"Rattan Lounge",     price:310  },
];
const MOCK_CREDITS = [
  { id:1, bank:"Kapital Bank", monthly:103.33, remaining:8, total:1240, paid:4 },
];
const MOCK_CARDS = [
  { id:1, number:"•••• •••• •••• 4821", name:"AYAN MAMMADOV", expiry:"09/27", type:"VISA" },
];

// ── Toast ──────────────────────────────────────────────────
function Toast({ msg, type="info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return <div className={`pr-toast ${type}`}><span className="pr-toast-dot" />{msg}</div>;
}

// ── Password Strength ──────────────────────────────────────
function PwStrength({ pw }) {
  const score = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 9 ? 2 : /[^a-zA-Z0-9]/.test(pw) && pw.length >= 10 ? 4 : 3;
  const labels = ["","Zəif","Orta","Güclü","Mükəmməl"];
  return (
    <div className="pr-pw-strength">
      <div className="pr-pw-bars">
        {[1,2,3,4].map(i=><div key={i} className={`pr-pw-bar${score>=i?` active-${score}`:""}`}/>)}
      </div>
      {pw.length>0 && <p className="pr-pw-hint">{labels[score]}</p>}
    </div>
  );
}

// ── Spinner inline ─────────────────────────────────────────
const Spin = () => <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"prSpin .8s linear infinite",display:"inline-block",verticalAlign:"middle"}}/>;

// ════════════════════════════════════════════════════════════
// TAB: Overview
// ════════════════════════════════════════════════════════════
function OverviewTab({ user, orders, saved, setActiveTab, t }) {
  const totalSpent = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const statCards = [
    { icon:"orders",   val:orders.length,          label:t("profile.overview.total_orders"), tab:"orders"  },
    { icon:"heart",    val:saved.length,            label:t("profile.overview.saved_items"),  tab:"saved"   },
    { icon:"money",    val:`₼${totalSpent.toLocaleString()}`, label:t("profile.overview.total_spent"),  tab:null      },
    { icon:"credit",   val:MOCK_CREDITS.length,    label:t("profile.overview.active_credit"),tab:"payments"},
  ];
  const icons = {
    orders:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4a2 2 0 012-2h2a2 2 0 012 2M7 4h6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    heart:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656L10 18l-6.828-6.828a4 4 0 010-5.656z" strokeLinejoin="round"/></svg>,
    money:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="10" cy="10" r="8"/><path d="M10 6v8M7.5 8.5C7.5 7.4 8.6 7 10 7s2.5.4 2.5 1.5c0 2-5 2-5 4C7.5 13.6 8.6 14 10 14s2.5-.4 2.5-1.5" strokeLinecap="round"/></svg>,
    credit:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 9h16" strokeLinecap="round"/></svg>,
  };
  return (
    <div style={{animation:"prTabIn .4s ease"}}>
      <div className="pr-overview-grid">
        {statCards.map((s,i)=>(
          <div key={i} className="pr-ov-card" style={{animationDelay:`${i*.08}s`}} onClick={()=>s.tab&&setActiveTab(s.tab)}>
            <div className="pr-ov-icon">{icons[s.icon]}</div>
            <div className="pr-ov-val">{s.val}</div>
            <div className="pr-ov-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="pr-card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
          <div>
            <p className="pr-sec-eyebrow">{t("profile.overview.quick_stats")}</p>
            <h3 className="pr-sec-title" style={{fontSize:26,margin:0}}><em>{t("profile.orders.title")}</em></h3>
          </div>
          <button className="pr-btn-ghost" style={{fontSize:10,padding:"8px 16px"}} onClick={()=>setActiveTab("orders")}>{t("profile.orders.title")} →</button>
        </div>
        {orders.slice(0,3).map((o,i)=>(
          <div key={o.id} className="pr-recent-order" style={{animationDelay:`${i*.1}s`}}>
            <div className="pr-rec-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4a2 2 0 012-2h2a2 2 0 012 2M7 4h6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="pr-rec-info">
              <p className="pr-rec-id">{o.id}</p>
              <p className="pr-rec-date">{o.date} · {o.items.length} {t("profile.orders.items")}</p>
            </div>
            <span className={`pr-status ${o.status}`}>{t(`profile.orders.status_${o.status}`)}</span>
            <span className="pr-rec-total">₼{o.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Profile Edit
// ════════════════════════════════════════════════════════════
function ProfileTab({ user, t }) {
  const [form, setForm] = useState({
    fullName: user?.fullName||user?.name||"", email: user?.email||"",
    phone: user?.phone||"", city: user?.city||"Bakı", address: user?.address||"", bio: ""
  });
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [errors,setErrors]=useState({});
  const [preview,setPreview]=useState(null);
  const [drag,setDrag]=useState(false);
  const fileRef=useRef();

  const handleChange = e => {
    const {name,value}=e.target;
    setForm(p=>({...p,[name]:value}));
    if(errors[name]) setErrors(p=>({...p,[name]:""}));
    setSaved(false);
  };
  const handleFile = file => {
    if(!file||file.size>5*1024*1024) return;
    setPreview(URL.createObjectURL(file));
  };
  const handleSubmit = async () => {
    const errs={};
    if(!form.fullName.trim()) errs.fullName=t("cart.name_required");
    if(!form.email.trim())    errs.email=t("cart.phone_required");
    if(Object.keys(errs).length){setErrors(errs);return;}
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    setSaving(false); setSaved(true);
  };
  const initials=(form.fullName||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,animation:"prTabIn .4s ease"}}>
      <div className="pr-card">
        <div className="pr-sec-head">
          <p className="pr-sec-eyebrow">{t("profile.edit_avatar")}</p>
          <h3 className="pr-sec-title" style={{fontSize:26}}>{t("profile.profile_form.title").split(" ")[0]} <em>{t("profile.profile_form.title").split(" ").slice(1).join(" ")}</em></h3>
          <p className="pr-sec-sub">{t("profile.profile_form.subtitle")}</p>
        </div>
        <div className={`pr-upload-zone${drag?" drag":""}`}
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
          onClick={()=>fileRef.current?.click()}>
          {preview
            ? <img src={preview} className="pr-upload-preview" alt="avatar"/>
            : <div className="pr-upload-preview-ph">{initials}</div>
          }
          <div className="pr-upload-text">
            <p className="pr-upload-title">{t("profile.edit_avatar")}</p>
            <p className="pr-upload-hint">{t("profile.profile_form.upload_hint")}</p>
          </div>
          <button className="pr-upload-btn" type="button" onClick={e=>{e.stopPropagation();fileRef.current?.click()}}>
            <svg viewBox="0 0 20 20" fill="none" width="13" height="13"><path d="M10 3v11M5 8l5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {t("profile.edit_avatar")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      </div>
      <div className="pr-card">
        <div className="pr-grid">
          <div className="pr-field">
            <label className="pr-label">{t("profile.profile_form.full_name")}</label>
            <input className={`pr-input${errors.fullName?" error":""}`} name="fullName" value={form.fullName} onChange={handleChange}/>
            {errors.fullName&&<span className="pr-field-error">{errors.fullName}</span>}
          </div>
          <div className="pr-field">
            <label className="pr-label">{t("profile.profile_form.email")}</label>
            <input className={`pr-input${errors.email?" error":""}`} name="email" value={form.email} onChange={handleChange} type="email"/>
            {errors.email&&<span className="pr-field-error">{errors.email}</span>}
          </div>
          <div className="pr-field">
            <label className="pr-label">{t("profile.profile_form.phone")}</label>
            <input className="pr-input" name="phone" value={form.phone} onChange={handleChange}/>
          </div>
          <div className="pr-field">
            <label className="pr-label">{t("profile.profile_form.city")}</label>
            <input className="pr-input" name="city" value={form.city} onChange={handleChange}/>
          </div>
          <div className="pr-field span2">
            <label className="pr-label">{t("profile.profile_form.address")}</label>
            <input className="pr-input" name="address" value={form.address} onChange={handleChange}/>
          </div>
          <div className="pr-field span2">
            <label className="pr-label">{t("profile.profile_form.bio")}</label>
            <textarea className="pr-input pr-textarea" name="bio" value={form.bio} onChange={handleChange}/>
          </div>
        </div>
        <div className="pr-form-actions">
          <button className={`pr-btn-primary${saved?" success":""}`} onClick={handleSubmit} disabled={saving}>
            {saving?<><Spin/> {t("cart.processing")}</>:saved?<>✓ {t("profile.profile_form.saved_ok")}</>:<>{t("profile.profile_form.save")} →</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Security
// ════════════════════════════════════════════════════════════
function SecurityTab({ t }) {
  const [form,setForm]=useState({current:"",newPw:"",confirm:""});
  const [show,setShow]=useState({current:false,newPw:false,confirm:false});
  const [errors,setErrors]=useState({});
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [twoFA,setTwoFA]=useState(false);

  const handleChange = e => {
    const {name,value}=e.target;
    setForm(p=>({...p,[name]:value}));
    setErrors(p=>({...p,[name]:""}));
    setSaved(false);
  };
  const handleSubmit = async () => {
    const errs={};
    if(!form.current)             errs.current=t("cart.required");
    if(form.newPw.length<8)       errs.newPw=t("profile.security.too_short");
    if(form.newPw!==form.confirm) errs.confirm=t("profile.security.mismatch");
    if(Object.keys(errs).length){setErrors(errs);return;}
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    setSaving(false);setSaved(true);
    setForm({current:"",newPw:"",confirm:""});
  };

  const PwField=({name,label,placeholder})=>(
    <div className="pr-field">
      <label className="pr-label">{label}</label>
      <div style={{position:"relative"}}>
        <input className={`pr-input${errors[name]?" error":""}`} name={name} type={show[name]?"text":"password"} value={form[name]} onChange={handleChange} placeholder={placeholder} style={{paddingRight:44}}/>
        <button type="button" onClick={()=>setShow(p=>({...p,[name]:!p[name]}))} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",display:"flex"}}>
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="1.4">
            {show[name]?<><path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"/><circle cx="10" cy="10" r="2.5"/></>:<><path d="M9.9 4C4.4 4 1 10 1 10s3.4 6 9 6c.7 0 1.4-.1 2-.2M17.5 6.5C18.7 7.8 19 10 19 10s-3.4 6-9 6"/><path d="M1 1l18 18" strokeLinecap="round"/></>}
          </svg>
        </button>
      </div>
      {errors[name]&&<span className="pr-field-error">{errors[name]}</span>}
      {name==="newPw"&&<PwStrength pw={form.newPw}/>}
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,animation:"prTabIn .4s ease"}}>
      <div className="pr-card">
        <div className="pr-sec-head">
          <p className="pr-sec-eyebrow">{t("profile.tabs.security")}</p>
          <h3 className="pr-sec-title" style={{fontSize:26}}>{t("profile.security.title").split(" ")[0]} <em>{t("profile.security.title").split(" ").slice(1).join(" ")}</em></h3>
          <p className="pr-sec-sub">{t("profile.security.subtitle")}</p>
        </div>
        <div className="pr-grid" style={{gridTemplateColumns:"1fr"}}>
          <PwField name="current" label={t("profile.security.current_pw")} placeholder="••••••••"/>
          <PwField name="newPw"   label={t("profile.security.new_pw")}     placeholder="En az 8 simvol"/>
          <PwField name="confirm" label={t("profile.security.confirm_pw")} placeholder="••••••••"/>
        </div>
        <div className="pr-form-actions">
          <button className={`pr-btn-primary${saved?" success":""}`} onClick={handleSubmit} disabled={saving}>
            {saving?<><Spin/> {t("cart.processing")}</>:saved?`✓ ${t("profile.security.saved_ok")}`:t("profile.security.save")}
          </button>
        </div>
      </div>
      <div className="pr-card">
        <div className="pr-twofa-row">
          <div>
            <p className="pr-twofa-title">{t("profile.security.two_fa_title")}</p>
            <p className="pr-twofa-desc">{t("profile.security.two_fa_desc")}</p>
          </div>
          <button className={`pr-toggle${twoFA?" on":""}`} onClick={()=>setTwoFA(p=>!p)}/>
        </div>
        {twoFA&&<div style={{marginTop:14,padding:"12px 16px",background:"#EAF3EB",border:"1px solid #C8DBC9",fontSize:12,color:"#4A7A4E",animation:"prFadeUp .3s ease"}}>✓ {t("profile.security.two_fa_active")}</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Payments
// ════════════════════════════════════════════════════════════
function PaymentsTab({ t }) {
  const [cards,setCards]=useState(MOCK_CARDS);
  const [addOpen,setAddOpen]=useState(false);
  const [newCard,setNewCard]=useState({number:"",name:"",expiry:"",cvv:""});
  const fmt4=(v)=>v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp=(v)=>v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1/$2").slice(0,5);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,animation:"prTabIn .4s ease"}}>
      <div className="pr-card">
        <div className="pr-sec-head">
          <p className="pr-sec-eyebrow">{t("profile.tabs.payments")}</p>
          <h3 className="pr-sec-title" style={{fontSize:26}}>{t("profile.payments.title").split(" ")[0]} <em>{t("profile.payments.title").split(" ").slice(1).join(" ")}</em></h3>
          <p className="pr-sec-sub">{t("profile.payments.subtitle")}</p>
        </div>
        {cards.length>0?(
          <div className="pr-cards-grid">
            {cards.map((c,i)=>(
              <div key={c.id} className="pr-bank-card" style={{animationDelay:`${i*.1}s`}}>
                <div className="pr-card-chip"/>
                <div className="pr-card-mid"><div className="pr-card-number">{c.number}</div></div>
                <div className="pr-card-bottom">
                  <div><div className="pr-card-name">{c.name}</div><div className="pr-card-expiry">{t("profile.payments.expires")} {c.expiry}</div></div>
                </div>
                <div className="pr-card-type">{c.type}</div>
                <div className="pr-card-actions">
                  <button className="pr-card-del-btn" onClick={()=>setCards(p=>p.filter(x=>x.id!==c.id))}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V3h4v1M5 4l1 9h4l1-9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div className="pr-empty" style={{padding:"28px 0"}}>
            <div className="pr-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20" strokeLinecap="round"/></svg></div>
            <p className="pr-empty-desc">{t("profile.payments.no_cards")}</p>
          </div>
        )}
        <button className="pr-add-card-toggle" onClick={()=>setAddOpen(p=>!p)}>
          <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {t("profile.payments.add_card")}
        </button>
        {addOpen&&(
          <div className="pr-add-card-form">
            <div className="pr-grid">
              <div className="pr-field span2">
                <label className="pr-label">{t("profile.payments.card_number")}</label>
                <input className="pr-input" value={newCard.number} onChange={e=>setNewCard(p=>({...p,number:fmt4(e.target.value)}))} placeholder="0000 0000 0000 0000" maxLength={19}/>
              </div>
              <div className="pr-field span2">
                <label className="pr-label">{t("profile.payments.card_name")}</label>
                <input className="pr-input" value={newCard.name} onChange={e=>setNewCard(p=>({...p,name:e.target.value.toUpperCase()}))} placeholder="AD SOYAD"/>
              </div>
              <div className="pr-field">
                <label className="pr-label">{t("profile.payments.expiry")}</label>
                <input className="pr-input" value={newCard.expiry} onChange={e=>setNewCard(p=>({...p,expiry:fmtExp(e.target.value)}))} placeholder="MM/YY" maxLength={5}/>
              </div>
              <div className="pr-field">
                <label className="pr-label">{t("profile.payments.cvv")}</label>
                <input className="pr-input" value={newCard.cvv} onChange={e=>setNewCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder="•••" type="password"/>
              </div>
            </div>
            <div className="pr-form-actions">
              <button className="pr-btn-primary" onClick={()=>{setCards(p=>[...p,{id:Date.now(),number:newCard.number||"•••• •••• •••• 0000",name:newCard.name||"KART SAHİBİ",expiry:newCard.expiry||"--/--",type:"VISA"}]);setNewCard({number:"",name:"",expiry:"",cvv:""});setAddOpen(false);}}>
                {t("profile.payments.save_card")}
              </button>
              <button className="pr-btn-ghost" onClick={()=>setAddOpen(false)}>{t("cart.back")}</button>
            </div>
          </div>
        )}
      </div>
      <div className="pr-card">
        <div className="pr-sec-head"><h3 className="pr-sec-title" style={{fontSize:26,margin:0}}>{t("profile.payments.active_credits").split(" ")[0]} <em>{t("profile.payments.active_credits").split(" ").slice(1).join(" ")}</em></h3></div>
        {MOCK_CREDITS.length===0?(
          <p style={{fontSize:13,color:"#6B6B6B",textAlign:"center",padding:"20px 0"}}>{t("profile.payments.no_credits")}</p>
        ):MOCK_CREDITS.map(c=>(
          <div key={c.id} className="pr-credit-item">
            <div><p className="pr-credit-bank">{c.bank}</p><p className="pr-credit-detail">{c.paid}/{c.remaining+c.paid} {t("cart.months")} · ₼{c.total}</p></div>
            <div><p className="pr-credit-monthly">₼{c.monthly.toFixed(2)}</p><p className="pr-credit-remain">{c.remaining} {t("cart.months")} {t("profile.payments.remaining")}</p></div>
            <div className="pr-credit-bar-wrap"><div className="pr-credit-bar" style={{"--bar-w":`${(c.paid/(c.paid+c.remaining))*100}%`}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Orders
// ════════════════════════════════════════════════════════════
function OrdersTab({ orders, t }) {
  const [expanded,setExpanded]=useState(null);
  return (
    <div className="pr-card" style={{animation:"prTabIn .4s ease",padding:0,overflow:"hidden"}}>
      <div style={{padding:"28px 36px 20px"}}>
        <p className="pr-sec-eyebrow">{t("profile.tabs.orders")}</p>
        <h3 className="pr-sec-title" style={{fontSize:26}}>{t("profile.orders.title").split(" ")[0]} <em>{t("profile.orders.title").split(" ").slice(1).join(" ")}</em></h3>
        <p className="pr-sec-sub">{t("profile.orders.subtitle")}</p>
      </div>
      {orders.length===0?(
        <div className="pr-empty"><p className="pr-empty-title">{t("profile.orders.no_orders")}</p></div>
      ):(
        <table className="pr-orders-table">
          <thead>
            <tr><th>{t("profile.orders.order_id")}</th><th>{t("profile.orders.date")}</th><th>{t("profile.orders.items")}</th><th>{t("profile.orders.total")}</th><th>{t("profile.orders.status")}</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o,i)=>(
              <>
                <tr key={o.id} style={{animationDelay:`${i*.07}s`}}>
                  <td>
                    <div className="pr-order-id">{o.id}</div>
                    <div style={{fontSize:10,color:"#6B6B6B",marginTop:2}}>{o.payMethod==="credit"?`${t("profile.orders.payment_credit")} · ${o.bank}`:t("profile.orders.payment_cash")}</div>
                  </td>
                  <td><div className="pr-order-date">{o.date}</div></td>
                  <td>
                    <div className="pr-order-items-preview">
                      {o.items.slice(0,3).map((_,j)=>(
                        <div key={j} className="pr-order-thumb" style={{background:"#EDE7DC",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <svg viewBox="0 0 16 16" fill="none" width="10" height="10"><rect x="2" y="5" width="12" height="9" rx="1" stroke="#C0B5AA" strokeWidth="1.2"/><path d="M5 5V4a3 3 0 016 0v1" stroke="#C0B5AA" strokeWidth="1.2"/></svg>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td><div className="pr-order-total">₼{o.total}</div></td>
                  <td><span className={`pr-status ${o.status}`}>{t(`profile.orders.status_${o.status}`)}</span></td>
                  <td>
                    <button className="pr-order-view-btn" onClick={()=>setExpanded(p=>p===o.id?null:o.id)}>
                      {expanded===o.id?"↑":t("profile.orders.view")}
                    </button>
                  </td>
                </tr>
                {expanded===o.id&&(
                  <tr key={`${o.id}-d`} className="pr-order-detail-row">
                    <td colSpan={6}>
                      <div className="pr-order-detail-inner">
                        <div className="pr-order-detail-items">
                          {o.items.map((item,j)=>(
                            <div key={j} className="pr-order-detail-item">
                              <div className="pr-order-detail-img" style={{background:"#EDE7DC",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><rect x="2" y="5" width="12" height="9" rx="1" stroke="#C0B5AA" strokeWidth="1.2"/><path d="M5 5V4a3 3 0 016 0v1" stroke="#C0B5AA" strokeWidth="1.2"/></svg>
                              </div>
                              <div>
                                <div className="pr-order-detail-name">{item.name}</div>
                                <div className="pr-order-detail-qty">×{item.qty} · ₼{item.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Saved
// ════════════════════════════════════════════════════════════
function SavedTab({ t }) {
  const [items,setItems]=useState(MOCK_SAVED);
  return (
    <div style={{animation:"prTabIn .4s ease"}}>
      <div className="pr-card">
        <div className="pr-sec-head">
          <p className="pr-sec-eyebrow">{t("profile.tabs.saved")}</p>
          <h3 className="pr-sec-title" style={{fontSize:26}}>{t("profile.saved.title").split(" ")[0]} <em>{t("profile.saved.title").split(" ").slice(1).join(" ")}</em></h3>
          <p className="pr-sec-sub">{t("profile.saved.subtitle")}</p>
        </div>
        {items.length===0?(
          <div className="pr-empty" style={{padding:"40px 0"}}>
            <div className="pr-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <p className="pr-empty-title">{t("profile.saved.no_saved")}</p>
            <Link to="/categories" className="pr-btn-primary" style={{textDecoration:"none",marginTop:8}}>{t("profile.saved.browse")}</Link>
          </div>
        ):(
          <div className="pr-saved-grid">
            {items.map((item,i)=>(
              <div key={item.id} className="pr-saved-card" style={{animationDelay:`${i*.06}s`}}>
                <div className="pr-saved-img-wrap">
                  <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#EDE7DC,#F7F3EE)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg viewBox="0 0 48 48" fill="none" stroke="#C0B5AA" strokeWidth="1.2" width="40" height="40"><rect x="8" y="14" width="32" height="24" rx="2"/><path d="M16 14V12a8 8 0 0116 0v2"/></svg>
                  </div>
                  <button className="pr-saved-remove" onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))}>
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div className="pr-saved-body">
                  <p className="pr-saved-name">{item.name}</p>
                  <p className="pr-saved-price">₼{item.price.toLocaleString()}</p>
                  <button className="pr-saved-cart">
                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11"><path d="M1 1h2l1.5 7.5h8L14 5H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="13" r="1" fill="currentColor"/><circle cx="11" cy="13" r="1" fill="currentColor"/></svg>
                    {t("profile.saved.add_to_cart")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ════════════════════════════════════════════════════════════
const TABS = [
  { id:"overview", label_key:"profile.tabs.overview",  icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { id:"profile",  label_key:"profile.tabs.profile",   icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="10" cy="6" r="3"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round"/></svg> },
  { id:"security", label_key:"profile.tabs.security",  icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 2L4 5v5c0 3.9 2.6 7.5 6 8.5C14 17.5 16 14 16 10V5L10 2z" strokeLinejoin="round"/></svg> },
  { id:"payments", label_key:"profile.tabs.payments",  icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 9h16" strokeLinecap="round"/></svg> },
  { id:"orders",   label_key:"profile.tabs.orders",    icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4a2 2 0 012-2h2a2 2 0 012 2M7 4h6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:"saved",    label_key:"profile.tabs.saved",     icon:<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656L10 18l-6.828-6.828a4 4 0 010-5.656z" strokeLinejoin="round"/></svg> },
];

export default function ProfilePage() {
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [toast,     setToast]     = useState(null);

  const user = getUser() || {
    fullName: "Ayan Məmmədov",
    email:    "ayan@example.com",
    phone:    "+994 50 123 45 67",
    city:     "Bakı",
    joinDate: "Yanvar 2024",
  };

  const initials = (user.fullName||user.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  const handleLogout = () => {
    if (window.confirm(t("profile.logout_confirm"))) logout();
  };

  const totalSpent = MOCK_ORDERS.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);

  return (
    <div className="pr">
      {/* ── Hero ── */}
      <div className="pr-hero">
        <div className="pr-hero-noise"/>
        <div className="pr-hero-inner">
          <div className="pr-avatar-wrap">
            <div className="pr-avatar-placeholder">{initials}</div>
            <div className="pr-avatar-online"/>
            <div className="pr-avatar-edit" onClick={()=>setActiveTab("profile")} title={t("profile.edit_avatar")}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="pr-hero-info">
            <div className="pr-hero-badge">
              <svg viewBox="0 0 10 10" fill="currentColor" width="6" height="6"><circle cx="5" cy="5" r="5"/></svg>
              {t("profile.page_title")}
            </div>
            <h1 className="pr-hero-name">
              {(user.fullName||user.name||"").split(" ")[0]}{" "}
              <em>{(user.fullName||user.name||"").split(" ").slice(1).join(" ")}</em>
            </h1>
            <div className="pr-hero-meta">
              <span>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 1C3.8 1 2 2.8 2 5c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.5"/></svg>
                {user.city||"Bakı"}
              </span>
              <span>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1" strokeLinecap="round"/></svg>
                {t("profile.member_since")} {user.joinDate||"2024"}
              </span>
              <span>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2" width="10" height="8" rx="1"/><path d="M1 5h10" strokeLinecap="round"/></svg>
                {user.email}
              </span>
            </div>
          </div>
        </div>
        <div className="pr-hero-stats" style={{maxWidth:1200,margin:"0 auto"}}>
          {[
            {val:MOCK_ORDERS.length,        label:t("profile.overview.total_orders"),  delay:".1s"},
            {val:MOCK_SAVED.length,         label:t("profile.overview.saved_items"),   delay:".18s"},
            {val:`₼${totalSpent.toLocaleString()}`, label:t("profile.overview.total_spent"), delay:".26s"},
            {val:MOCK_CREDITS.length,       label:t("profile.overview.active_credit"), delay:".34s"},
          ].map((s,i)=>(
            <div key={i} className="pr-hero-stat" style={{animationDelay:s.delay}}>
              <div className="pr-hs-val">{s.val}</div>
              <div className="pr-hs-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="pr-tabs-bar">
        {TABS.map(tab=>(
          <button key={tab.id} className={`pr-tab${activeTab===tab.id?" active":""}`} onClick={()=>setActiveTab(tab.id)}>
            {tab.icon}
            {t(tab.label_key)}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="pr-content">
        {activeTab==="overview"  && <OverviewTab  user={user} orders={MOCK_ORDERS} saved={MOCK_SAVED} setActiveTab={setActiveTab} t={t}/>}
        {activeTab==="profile"   && <ProfileTab   user={user} t={t}/>}
        {activeTab==="security"  && <SecurityTab  t={t}/>}
        {activeTab==="payments"  && <PaymentsTab  t={t}/>}
        {activeTab==="orders"    && <OrdersTab    orders={MOCK_ORDERS} t={t}/>}
        {activeTab==="saved"     && <SavedTab     t={t}/>}

        {/* Logout */}
        <div className="pr-logout-section">
          <p className="pr-logout-text">{user.email} · {t("profile.member_since")} {user.joinDate||"2024"}</p>
          <button className="pr-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="14" height="14"><path d="M13 7l4 3-4 3M7 10h10M10 4H5a1 1 0 00-1 1v10a1 1 0 001 1h5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {t("profile.logout")}
          </button>
        </div>
      </div>

      {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
