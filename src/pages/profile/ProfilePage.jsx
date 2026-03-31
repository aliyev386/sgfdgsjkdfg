// src/pages/profile/ProfilePage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsAuth, logoutAction } from "../../store/slices/authSlice";
import { selectLang } from "../../store/slices/langSlice";
import { getMe } from "../../api/authApi";
import axiosInstance from "../../api/axiosInstance";
import "../../assets/pagesCss/ProfilePage.css";

/* ─── BRAND COLOR ─────── */
const G = "#7A9E7E";
const GD = "#5a8060"; // darker
const GL = "#EAF3EB"; // lighter bg

/* ─── AZ_BANKS ─────── */
const AZ_BANKS = [
  { id:"kapital",  name:"Kapital Bank",  color:"#003087"},
  { id:"pasha",    name:"PAŞA Bank",     color:"#C8102E"},
  { id:"abb",      name:"ABB Bank",      color:"#005BAA"},
  { id:"atb",      name:"ATB Bank",      color:"#F7941D"},
  { id:"express",  name:"Express Bank",  color:"#00843D"},
  { id:"rabit",    name:"Rabitəbank",    color:"#002D72"},
  { id:"amrah",    name:"Amrahbank",     color:"#8B0000"},
  { id:"other",    name:"Digər",         color:"#6B7280"},
];

const fmt  = n => `₼${Number(n).toLocaleString()}`;
const fmt4 = v => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
const fmtE = v => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1/$2").slice(0,5);

const ST_CFG = {
  delivered: { lbl:"profile.status_delivered", cl:"st-green"  },
  shipped:   { lbl:"profile.status_shipped",   cl:"st-blue"   },
  processing:{ lbl:"profile.status_proc",      cl:"st-amber"  },
  cancelled: { lbl:"profile.status_cancel",    cl:"st-red"    },
};

/* ─── CONFIRM MODAL ──────────────────────────────────────── */
function ConfirmModal({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="pr-modal-backdrop" onClick={onCancel}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className={`pr-modal-ic ${danger ? "danger" : "info"}`}>
          {danger ? "⚠️" : "💬"}
        </div>
        <h3 className="pr-modal-title">{title}</h3>
        <p className="pr-modal-msg">{message}</p>
        <div className="pr-modal-btns">
          <button className="pr-modal-cancel" onClick={onCancel}>{cancelText}</button>
          <button className={`pr-modal-confirm ${danger ? "danger" : ""}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* hook to use confirm modal */
function useConfirm() {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise(resolve => {
    setState({ ...opts, resolve });
  }), []);
  const handleConfirm = () => { state?.resolve(true);  setState(null); };
  const handleCancel  = () => { state?.resolve(false); setState(null); };
  const Modal = state ? (
    <ConfirmModal
      title={state.title}
      message={state.message}
      confirmText={state.confirmText || "Təsdiqlə"}
      cancelText={state.cancelText   || "Ləğv et"}
      danger={state.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;
  return { confirm, Modal };
}

/* ─── TOAST ──────────────────────────────────────────────── */
function Toast({ msg, ok, onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 3200); return () => clearTimeout(id); }, [onClose]);
  return (
    <div className={`pr-toast ${ok ? "pr-toast-ok" : "pr-toast-err"}`}>
      <span className="pr-toast-ic">{ok ? "✓" : "!"}</span>
      {msg}
    </div>
  );
}

const Spin = () => <span className="pr-spin" />;

function PwStrength({ pw }) {
  const s = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 9 ? 2 : /[^a-zA-Z0-9]/.test(pw) && pw.length >= 10 ? 4 : 3;
  const cols = { 1:"#EF4444", 2:"#F59E0B", 3:"#10B981", 4:G };
  const lbs  = { 1:"Zəif",    2:"Orta",    3:"Güclü",   4:"Mükəmməl" };
  if (!pw) return null;
  return (
    <div className="pw-str">
      <div className="pw-str-bars">
        {[1,2,3,4].map(i => (
          <div key={i} className="pw-str-bar" style={{ background: s >= i ? cols[s] : "#E5E7EB" }} />
        ))}
      </div>
      <span style={{ fontSize:11, color:cols[s], fontWeight:700 }}>{lbs[s]}</span>
    </div>
  );
}

/* ─── TAB: OVERVIEW ──────────────────────────────────────── */
function OverviewTab({ user, setTab, t }) {
  const spent = orders.filter(o=>o.status!=="cancelled").reduce((a,o)=>a+o.total,0);
  const done  = orders.filter(o=>o.status==="delivered").length;

  const stats = [
    { val:orders.length, lbl:t("profile.ov_orders"), icon:"🛍️", tab:"orders"   },
    { val:done,               lbl:t("profile.ov_done"),   icon:"✅", tab:"orders"   },
    { val:savedItems.length,  lbl:t("profile.ov_saved"),  icon:"❤️", tab:"saved"    },
    { val:fmt(spent),         lbl:t("profile.ov_spent"),  icon:"💰", tab:null       },
  ];

  return (
    <div className="pr-body pr-ani">
      <div className="pr-stat-grid">
        {stats.map((s,i) => (
          <button key={i} className="pr-stat-card" style={{animationDelay:`${i*0.07}s`}}
            onClick={() => s.tab && setTab(s.tab)}>
            <span className="pr-stat-icon">{s.icon}</span>
            <span className="pr-stat-val">{s.val}</span>
            <span className="pr-stat-lbl">{s.lbl}</span>
            {s.tab && <span className="pr-stat-arr">→</span>}
          </button>
        ))}
      </div>

      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">{t("profile.recent_orders")}</h3>
          <button className="pr-see-all" onClick={() => setTab("orders")}>{t("profile.see_all")} →</button>
        </div>
        <div className="pr-order-list">
          {orders.slice(0,3).map((o,i) => {
            const s = ST_CFG[o.status] || ST_CFG.processing;
            return (
              <div key={o.id} className="pr-order-row" style={{animationDelay:`${i*0.06}s`}}>
                <div className="pr-order-imgs">
                  {o.items.slice(0,2).map((it,j) => <img key={j} src={it.img} alt="" className="pr-oimg"/>)}
                </div>
                <div className="pr-order-info">
                  <p className="pr-order-id">{o.id}</p>
                  <p className="pr-order-meta">{o.date} · {o.items.length} {t("profile.items")}</p>
                </div>
                <span className={`pr-st ${s.cl}`}>{t(s.lbl)}</span>
                <span className="pr-order-price">{fmt(o.total)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">{t("profile.saved_items")}</h3>
          <button className="pr-see-all" onClick={() => setTab("saved")}>{t("profile.see_all")} →</button>
        </div>
        <div className="pr-saved-mini">
          {savedItems.slice(0,4).map((item,i) => (
            <div key={item.id} className="pr-saved-mc" style={{animationDelay:`${i*0.05}s`}}>
              <img src={item.img || item.productImage || item.imageUrl} alt={item.name || item.productName} className="pr-saved-mimg"/>
              <p className="pr-saved-mname">{item.name || item.productName}</p>
              <p className="pr-saved-mprice">{fmt(item.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: PROFILE EDIT ──────────────────────────────────── */
function ProfileTab({ user, showToast, t }) {
  const { confirm, Modal } = useConfirm();
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || "",
    email:    user?.email    || "",
    phone:    user?.phone    || "",
    city:     user?.city     || "Bakı",
    address:  user?.address  || "",
    bio:      "",
  });
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState(false);
  const [errors,  setErrors]  = useState({});
  const [preview, setPreview] = useState(null);
  const [drag,    setDrag]    = useState(false);
  const fileRef = useRef();

  const ch = e => {
    setForm(p=>({...p,[e.target.name]:e.target.value}));
    setErrors(p=>({...p,[e.target.name]:""}));
    setDone(false);
  };
  const onFile = f => { if(f && f.size < 5e6) setPreview(URL.createObjectURL(f)); };

  const save = async () => {
    const errs={};
    if(!form.fullName.trim())       errs.fullName = t("profile.err_req");
    if(!form.email.includes("@"))   errs.email    = t("profile.err_email");
    if(Object.keys(errs).length)    { setErrors(errs); return; }
    const ok = await confirm({
      title: t("profile.confirm_save_title"),
      message: t("profile.confirm_save_msg"),
      confirmText: t("profile.save"),
      cancelText: t("profile.cancel"),
    });
    if (!ok) return;
    setSaving(true);
    await new Promise(r=>setTimeout(r,700));
    setSaving(false); setDone(true);
    showToast(t("profile.saved_ok"), true);
  };

  const initials = (form.fullName||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <h3 className="pr-card-title">{t("profile.photo_title")}</h3>
        <div className={`pr-avatar-drop${drag?" drag":""}`}
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0])}}
          onClick={()=>fileRef.current?.click()}>
          <div className="pr-av-circle">
            {preview ? <img src={preview} alt="" className="pr-av-img"/> : <span className="pr-av-init">{initials}</span>}
            <div className="pr-av-hover"><span>📷</span><span>{t("profile.photo_change")}</span></div>
          </div>
          <div className="pr-av-info">
            <p className="pr-av-title">{t("profile.photo_change")}</p>
            <p className="pr-av-hint">{t("profile.photo_hint")}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>onFile(e.target.files[0])}/>
        </div>
      </div>

      <div className="pr-card">
        <h3 className="pr-card-title">{t("profile.personal_info")}</h3>
        <div className="pr-fg">
          {[
            {name:"fullName",label:t("profile.f_name"),   type:"text",  span:true  },
            {name:"email",   label:t("profile.f_email"),  type:"email", span:false },
            {name:"phone",   label:t("profile.f_phone"),  type:"tel",   span:false },
            {name:"city",    label:t("profile.f_city"),   type:"text",  span:false },
            {name:"address", label:t("profile.f_address"),type:"text",  span:false },
          ].map(f => (
            <div key={f.name} className={`pr-field${f.span?" pr-fcol2":""}`}>
              <label className="pr-label">{f.label}</label>
              <input className={`pr-input${errors[f.name]?" pr-ierr":""}`}
                name={f.name} type={f.type} value={form[f.name]} onChange={ch}/>
              {errors[f.name] && <span className="pr-err">{errors[f.name]}</span>}
            </div>
          ))}
          <div className="pr-field pr-fcol2">
            <label className="pr-label">{t("profile.f_bio")}</label>
            <textarea className="pr-input pr-ta" name="bio" value={form.bio} onChange={ch} rows={3}/>
          </div>
        </div>
        <div className="pr-ffoot">
          <button className={`pr-btn-save${done?" pr-btn-done":""}`} onClick={save} disabled={saving}>
            {saving ? <><Spin/> {t("profile.saving")}</> : done ? <>✓ {t("profile.saved_ok")}</> : t("profile.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: SECURITY ──────────────────────────────────────── */
function SecurityTab({ showToast, t }) {
  const { confirm, Modal } = useConfirm();
  const [form,   setForm]   = useState({current:"",newPw:"",confirm:""});
  const [show,   setShow]   = useState({current:false,newPw:false,confirm:false});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [twoFA,  setTwoFA]  = useState(false);

  const ch = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); setErrors(p=>({...p,[e.target.name]:""})); };

  const save = async () => {
    const errs={};
    if(!form.current)             errs.current = t("profile.err_req");
    if(form.newPw.length<8)       errs.newPw   = t("profile.err_short");
    if(form.newPw!==form.confirm) errs.confirm  = t("profile.err_match");
    if(Object.keys(errs).length){ setErrors(errs); return; }
    const ok = await confirm({
      title:       t("profile.confirm_pw_title"),
      message:     t("profile.confirm_pw_msg"),
      confirmText: t("profile.change_pw"),
      cancelText:  t("profile.cancel"),
      danger:      true,
    });
    if(!ok) return;
    setSaving(true);
    await new Promise(r=>setTimeout(r,700));
    setSaving(false);
    setForm({current:"",newPw:"",confirm:""});
    showToast(t("profile.pw_changed"), true);
  };

  const toggle2FA = async () => {
    const ok = await confirm({
      title:       twoFA ? t("profile.twofa_off_title") : t("profile.twofa_on_title"),
      message:     twoFA ? t("profile.twofa_off_msg")   : t("profile.twofa_on_msg"),
      confirmText: twoFA ? t("profile.twofa_disable")   : t("profile.twofa_enable"),
      cancelText:  t("profile.cancel"),
      danger:      twoFA,
    });
    if(ok) setTwoFA(p=>!p);
  };

  const PwF = ({name, label}) => (
    <div className="pr-field">
      <label className="pr-label">{label}</label>
      <div className="pr-pw-wrap">
        <input className={`pr-input${errors[name]?" pr-ierr":""}`} name={name}
          type={show[name]?"text":"password"} value={form[name]} onChange={ch} placeholder="••••••••"/>
        <button type="button" className="pr-pw-eye" onClick={()=>setShow(p=>({...p,[name]:!p[name]}))}>
          {show[name]
            ? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"/><circle cx="10" cy="10" r="2.5"/></svg>
            : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M9.9 4C4.4 4 1 10 1 10s3.4 6 9 6c.7 0 1.4-.1 2-.2M17.5 6.5C18.7 7.8 19 10 19 10s-3.4 6-9 6"/><path d="M1 1l18 18" strokeLinecap="round"/></svg>
          }
        </button>
      </div>
      {errors[name] && <span className="pr-err">{errors[name]}</span>}
      {name==="newPw" && <PwStrength pw={form.newPw}/>}
    </div>
  );

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <h3 className="pr-card-title">{t("profile.change_pw")}</h3>
        <div className="pr-fg" style={{gridTemplateColumns:"1fr"}}>
          <PwF name="current" label={t("profile.cur_pw")}/>
          <PwF name="newPw"   label={t("profile.new_pw")}/>
          <PwF name="confirm" label={t("profile.conf_pw")}/>
        </div>
        <div className="pr-ffoot">
          <button className="pr-btn-save" onClick={save} disabled={saving}>
            {saving ? <><Spin/> {t("profile.saving")}</> : t("profile.save")}
          </button>
        </div>
      </div>

      <div className="pr-card">
        <div className="pr-twofa">
          <div className="pr-twofa-ic">🔐</div>
          <div className="pr-twofa-txt">
            <p className="pr-twofa-title">{t("profile.twofa_title")}</p>
            <p className="pr-twofa-desc">{t("profile.twofa_desc")}</p>
          </div>
          <button className={`pr-toggle${twoFA?" on":""}`} onClick={toggle2FA}>
            <span className="pr-knob"/>
          </button>
        </div>
        {twoFA && <div className="pr-twofa-ok">✓ {t("profile.twofa_on")}</div>}
      </div>
    </div>
  );
}

/* ─── TAB: PAYMENTS ──────────────────────────────────────── */
function PaymentsTab({ showToast, t }) {
  const { confirm, Modal } = useConfirm();
  const [cards,   setCards]   = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selBank, setSelBank] = useState(null);
  const [newCard, setNewCard] = useState({number:"",name:"",expiry:"",cvv:""});

  const deleteCard = async (id) => {
    const ok = await confirm({
      title:       t("profile.confirm_del_card_title"),
      message:     t("profile.confirm_del_card_msg"),
      confirmText: t("profile.delete"),
      cancelText:  t("profile.cancel"),
      danger:      true,
    });
    if(ok) { setCards(p=>p.filter(x=>x.id!==id)); showToast(t("profile.card_deleted"), true); }
  };

  const addCard = async () => {
    if(!newCard.number || !newCard.name || !newCard.expiry) return;
    const bank = AZ_BANKS.find(b=>b.id===selBank);
    const ok = await confirm({
      title:       t("profile.confirm_add_card_title"),
      message:     `${bank?.name||"Kart"} — ${newCard.number}`,
      confirmText: t("profile.save_card"),
      cancelText:  t("profile.cancel"),
    });
    if(!ok) return;
    setCards(p=>[...p,{
      id:Date.now(), number:newCard.number||"•••• •••• •••• 0000",
      name:newCard.name||"KART SAHİBİ", expiry:newCard.expiry||"--/--",
      type:"VISA", bank:bank?.name||"—", bankColor:bank?.color||"#6B7280",
    }]);
    setNewCard({number:"",name:"",expiry:"",cvv:""}); setSelBank(null); setAddOpen(false);
    showToast(t("profile.card_added"), true);
  };

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">{t("profile.my_cards")}</h3>
          <button className="pr-btn-add" onClick={()=>setAddOpen(p=>!p)}>
            {addOpen ? "✕ "+t("profile.cancel") : "+ "+t("profile.add_card")}
          </button>
        </div>

        {cards.length===0 ? (
          <div className="pr-empty"><span className="pr-empty-ic">💳</span><p>{t("profile.no_cards")}</p></div>
        ) : (
          <div className="pr-cards-row">
            {cards.map((c,i) => (
              <div key={c.id} className="pr-bank-card" style={{"--bk":c.bankColor||G, animationDelay:`${i*.08}s`}}>
                <div className="pr-bc-top">
                  <span className="pr-bc-bank">{c.bank||"Bank"}</span>
                  <button className="pr-bc-del" onClick={()=>deleteCard(c.id)}>🗑</button>
                </div>
                <div className="pr-bc-chip"/>
                <div className="pr-bc-num">{c.number}</div>
                <div className="pr-bc-bot">
                  <div><div className="pr-bc-lbl">{t("profile.card_holder")}</div><div className="pr-bc-val">{c.name}</div></div>
                  <div><div className="pr-bc-lbl">{t("profile.expires")}</div><div className="pr-bc-val">{c.expiry}</div></div>
                  <div className="pr-bc-type">{c.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {addOpen && (
          <div className="pr-add-form pr-ani">
            <p className="pr-add-title">{t("profile.choose_bank")}</p>
            <div className="pr-bank-grid">
              {AZ_BANKS.map(b => (
                <button key={b.id} className={`pr-bank-btn${selBank===b.id?" active":""}`}
                  style={{"--bk":b.color}} onClick={()=>setSelBank(b.id)}>
                  <span className="pr-bank-dot" style={{background:b.color}}/>
                  {b.name}
                  {selBank===b.id && <span className="pr-bank-chk">✓</span>}
                </button>
              ))}
            </div>
            <div className="pr-fg">
              <div className="pr-field pr-fcol2">
                <label className="pr-label">{t("profile.card_number")}</label>
                <input className="pr-input pr-mono" placeholder="0000 0000 0000 0000" maxLength={19}
                  value={newCard.number} onChange={e=>setNewCard(p=>({...p,number:fmt4(e.target.value)}))}/>
              </div>
              <div className="pr-field pr-fcol2">
                <label className="pr-label">{t("profile.card_name")}</label>
                <input className="pr-input pr-mono" placeholder="AD SOYAD"
                  value={newCard.name} onChange={e=>setNewCard(p=>({...p,name:e.target.value.toUpperCase()}))}/>
              </div>
              <div className="pr-field">
                <label className="pr-label">{t("profile.expiry")}</label>
                <input className="pr-input pr-mono" placeholder="MM/YY" maxLength={5}
                  value={newCard.expiry} onChange={e=>setNewCard(p=>({...p,expiry:fmtE(e.target.value)}))}/>
              </div>
              <div className="pr-field">
                <label className="pr-label">CVV</label>
                <input className="pr-input pr-mono" placeholder="•••" maxLength={3} type="password"
                  value={newCard.cvv} onChange={e=>setNewCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))}/>
              </div>
            </div>
            <div className="pr-ffoot">
              <button className="pr-btn-save" onClick={addCard}>{t("profile.save_card")}</button>
              <button className="pr-btn-ghost" onClick={()=>{setAddOpen(false);setSelBank(null);}}>{t("profile.cancel")}</button>
            </div>
          </div>
        )}
      </div>

      <div className="pr-card">
        <h3 className="pr-card-title">{t("profile.active_credits")}</h3>
        {[].length===0 ? (
          <div className="pr-empty"><span className="pr-empty-ic">📋</span><p>{t("profile.no_credits")}</p></div>
        ) : [].map(c => {
          const pct = Math.round((c.paid/(c.paid+c.remaining))*100);
          return (
            <div key={c.id} className="pr-credit">
              <div className="pr-credit-head">
                <div className="pr-credit-left">
                  <span className="pr-credit-bank-dot" style={{background:c.bankColor}}/>
                  <span className="pr-credit-bank">{c.bank}</span>
                </div>
                <span className="pr-credit-total">{fmt(c.total)}</span>
              </div>
              <div className="pr-credit-track"><div className="pr-credit-fill" style={{width:`${pct}%`}}/></div>
              <div className="pr-credit-foot">
                <span>{c.paid}/{c.paid+c.remaining} {t("profile.months")}</span>
                <span className="pr-credit-monthly">{fmt(c.monthly)}/{t("profile.month")}</span>
                <span>{c.remaining} {t("profile.months_left")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TAB: ORDERS ────────────────────────────────────────── */
function OrdersTab({ t, orders = [] }) {
  const [open, setOpen] = useState(null);
  // Normalize backend OrderDto fields
  const normalized = orders.map(o => ({
    id:     o.id,
    date:   o.createdAt ? new Date(o.createdAt).toLocaleDateString("az-AZ") : "",
    total:  o.grandTotal ?? o.total ?? 0,
    status: (o.status ?? "pending").toString().toLowerCase(),
    items: (o.orderItems ?? o.items ?? []).map(it => ({
      name:  it.productName  ?? it.name  ?? "",
      qty:   it.quantity     ?? it.qty   ?? 1,
      price: it.unitPrice    ?? it.price ?? 0,
      img:   it.imageUrl     ?? it.img   ?? "",
    })),
  }));

  return (
    <div className="pr-body pr-ani">
      <div className="pr-card pr-card-flush">
        <div className="pr-card-pad">
          <h3 className="pr-card-title">{t("profile.order_history")}</h3>
        </div>
        {normalized.length === 0 && (
          <div style={{padding:"32px",textAlign:"center",color:"#aaa"}}>
            <p>{t("profile.no_orders") || "Hələ sifariş yoxdur"}</p>
          </div>
        )}
        {normalized.map((o,i) => {
          const s = ST_CFG[o.status] || ST_CFG.processing;
          const isOpen = open === o.id;
          return (
            <div key={o.id} className={`pr-ord-item${isOpen?" open":""}`} style={{animationDelay:`${i*.05}s`}}>
              <div className="pr-ord-row" onClick={()=>setOpen(p=>p===o.id?null:o.id)}>
                <div className="pr-ord-imgs">
                  {o.items.slice(0,2).map((it,j) => <img key={j} src={it.img||"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=75"} alt="" className="pr-oimg"/>)}
                  {o.items.length>2 && <span className="pr-oimg-more">+{o.items.length-2}</span>}
                </div>
                <div className="pr-ord-info">
                  <p className="pr-ord-id">#{o.id}</p>
                  <p className="pr-ord-meta">{o.date}</p>
                </div>
                <span className={`pr-st ${s.cl}`}>{t(s.lbl)}</span>
                <span className="pr-ord-total">{fmt(o.total)}</span>
                <span className={`pr-ord-chev${isOpen?" up":""}`}>›</span>
              </div>
              {isOpen && (
                <div className="pr-ord-detail pr-ani">
                  {o.items.map((it,j) => (
                    <div key={j} className="pr-det-row">
                      <img src={it.img||"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=75"} alt="" className="pr-det-img"/>
                      <div className="pr-det-info">
                        <p className="pr-det-name">{it.name}</p>
                        <p className="pr-det-qty">×{it.qty}</p>
                      </div>
                      <span className="pr-det-price">{fmt(it.price)}</span>
                    </div>
                  ))}
                  <div className="pr-det-total">
                    <span>{t("profile.total")}</span>
                    <strong>{fmt(o.total)}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TAB: SAVED ─────────────────────────────────────────── */
function SavedTab({ showToast, t, savedItems: initialSaved = [] }) {
  const { confirm, Modal } = useConfirm();
  const [items, setItems] = useState(initialSaved);

  const removeItem = async (item) => {
    const ok = await confirm({
      title:       t("profile.confirm_rm_title"),
      message:     `"${item.name || item.productName}" ${t("profile.confirm_rm_msg")}`,
      confirmText: t("profile.remove"),
      cancelText:  t("profile.cancel"),
      danger:      true,
    });
    if(ok) { setItems(p=>p.filter(x=>x.id!==item.id)); showToast(t("profile.item_removed"), true); }
  };

  const addToCart = async (item) => {
    const ok = await confirm({
      title:       t("profile.confirm_cart_title"),
      message:     `"${item.name || item.productName}" — ${fmt(item.price)}`,
      confirmText: t("profile.add_cart"),
      cancelText:  t("profile.cancel"),
    });
    if(ok) showToast(`${item.name || item.productName} ${t("profile.added_cart")}`, true);
  };

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">
            {t("profile.saved_items")} <span className="pr-count-pill">{items.length}</span>
          </h3>
        </div>
        {items.length===0 ? (
          <div className="pr-empty">
            <span className="pr-empty-ic">❤️</span>
            <p>{t("profile.no_saved")}</p>
            <Link to="/furniture-categories" className="pr-btn-save" style={{textDecoration:"none",marginTop:12}}>
              {t("profile.browse")}
            </Link>
          </div>
        ) : (
          <div className="pr-saved-grid">
            {items.map((item,i) => (
              <div key={item.id} className="pr-saved-card" style={{animationDelay:`${i*0.05}s`}}>
                <div className="pr-saved-img-wrap">
                  <img src={item.img || item.productImage || item.imageUrl} alt={item.name || item.productName} className="pr-saved-img"/>
                  <button className="pr-saved-rm" onClick={()=>removeItem(item)} title={t("profile.remove")}>✕</button>
                  <div className="pr-saved-overlay">
                    <button className="pr-saved-cart" onClick={()=>addToCart(item)}>
                      🛒 {t("profile.add_cart")}
                    </button>
                  </div>
                </div>
                <p className="pr-saved-name">{item.name || item.productName}</p>
                <p className="pr-saved-price">{fmt(item.price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */
const TABS = [
  { id:"overview", ik:"profile.tab_overview", emoji:"⊞" },
  { id:"profile",  ik:"profile.tab_profile",  emoji:"◎" },
  { id:"security", ik:"profile.tab_security", emoji:"🔒" },
  { id:"payments", ik:"profile.tab_payments", emoji:"💳" },
  { id:"orders",   ik:"profile.tab_orders",   emoji:"📦" },
  { id:"saved",    ik:"profile.tab_saved",     emoji:"❤️" },
];

export default function ProfilePage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectUser);
  const isAuth    = useSelector(selectIsAuth);
  const lang      = useSelector(selectLang);
  const { confirm, Modal } = useConfirm();
  const [tab,    setTab]   = useState("overview");
  const [toast,  setToast] = useState(null);
  const [orders, setOrders]= useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [profileUser, setProfileUser] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuth) { navigate("/login"); return; }
    // Load user profile from API
    getMe()
      .then(u => setProfileUser(u))
      .catch(() => {});
    // Load orders
    axiosInstance.get("/orders")
      .then(r => setOrders(r.data?.data ?? r.data ?? []))
      .catch(() => setOrders([]));
    // Load wishlist as saved items
    axiosInstance.get("/wishlist")
      .then(r => {
        const arr = r.data?.data ?? r.data ?? [];
        setSavedItems(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setSavedItems([]));
  }, [isAuth, lang, navigate]);

  const user = profileUser || reduxUser || {
    name: "İstifadəçi", surname: "", email: "", phoneNumber: "",
  };

  const initials = ((user.name||"") + " " + (user.surname||"")).trim()
    .split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const spent    = orders.filter(o=>o.status!=="cancelled").reduce((a,o)=>a+o.total,0);
  const showToast = (msg, ok) => setToast({msg,ok});

  const handleLogout = async () => {
    const ok = await confirm({
      title:       t("profile.logout_title"),
      message:     t("profile.logout_msg"),
      confirmText: t("profile.logout"),
      cancelText:  t("profile.cancel"),
      danger:      true,
    });
    if(ok) dispatch(logoutAction()); navigate("/login");
  };

  return (
    <div className="pr-page">
      {Modal}

      {/* ── HERO BANNER ─────────────────────────── */}
      <div className="pr-hero">
        <div className="pr-hero-inner">
          <div className="pr-av-wrap" onClick={()=>setTab("profile")} title={t("profile.photo_change")}>
            <div className="pr-av-ring">
              <div className="pr-av">{initials}</div>
            </div>
            <div className="pr-av-edit">✏️</div>
            <div className="pr-av-online"/>
          </div>
          <div className="pr-hero-info">
            <div className="pr-hero-chip">✦ {t("profile.member")}</div>
            <h1 className="pr-hero-name">{user.name || user.fullName||user.name}</h1>
            <div className="pr-hero-meta">
              <span>📍 {user.city||"Bakı"}</span>
              <span>✉️ {user.email}</span>
              <span>🗓 {t("profile.since")} {user.joinDate||"2024"}</span>
            </div>
          </div>
          <div className="pr-hero-stats">
            {[
              {v:orders.length, l:t("profile.ov_orders")},
              {v:savedItems.length,  l:t("profile.ov_saved") },
              {v:fmt(spent),         l:t("profile.ov_spent") },
            ].map((s,i) => (
              <div key={i} className="pr-hs" style={{animationDelay:`${i*.1}s`}}>
                <span className="pr-hs-v">{s.v}</span>
                <span className="pr-hs-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SIDEBAR + CONTENT LAYOUT ─────────────── */}
      <div className="pr-layout">

        {/* Sidebar */}
        <aside className="pr-sidebar">
          <nav className="pr-nav">
            {TABS.map(tb => (
              <button key={tb.id} className={`pr-nav-item${tab===tb.id?" active":""}`}
                onClick={()=>setTab(tb.id)}>
                <span className="pr-nav-emoji">{tb.emoji}</span>
                <span className="pr-nav-label">{t(tb.ik)}</span>
                {tab===tb.id && <span className="pr-nav-dot"/>}
              </button>
            ))}
          </nav>

          <div className="pr-sidebar-user">
            <div className="pr-sb-av">{initials}</div>
            <div className="pr-sb-info">
              <p className="pr-sb-name">{(user.name || user.fullName||user.name||"").split(" ")[0]}</p>
              <p className="pr-sb-email">{user.email}</p>
            </div>
          </div>

          <button className="pr-logout-btn" onClick={handleLogout}>
            <span>→</span> {t("profile.logout")}
          </button>
        </aside>

        {/* Content */}
        <div className="pr-content">
          {tab==="overview" && <OverviewTab  user={user} setTab={setTab} t={t} orders={orders} savedItems={savedItems}/>}
          {tab==="profile"  && <ProfileTab   user={user} showToast={showToast} t={t}/>}
          {tab==="security" && <SecurityTab  showToast={showToast} t={t}/>}
          {tab==="payments" && <PaymentsTab  showToast={showToast} t={t}/>}
          {tab==="orders"   && <OrdersTab    t={t} orders={orders}/>}
          {tab==="saved"    && <SavedTab     showToast={showToast} t={t} savedItems={savedItems}/>}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}