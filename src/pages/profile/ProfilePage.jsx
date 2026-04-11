
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateUser, logoutAction } from "../../store/slices/authSlice";
import { removeFromWishlist } from "../../store/slices/wishlistStore";
import { setCart } from "../../store/slices/cartSlice";
import axiosInstance from "../../api/axiosInstance";
import cartApi from "../../api/cartApi";
import { logout } from "../../api/authApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import "../../assets/pagesCss/ProfilePage.css";

const ICONS = {
  overview: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  shield:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>,
  card:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  package:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12L3 7"/><path d="M12 12v10"/><path d="M12 12l9-5"/><path d="M7.5 4.5l9 5"/></svg>,
  heart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  location: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  mail:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  camera:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  eye:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0112 20c-7 0-11-8-11-8a19 19 0 015.1-6.1M9.4 9.4A3 3 0 0012 15a3 3 0 002.6-4.6M1 1l22 22"/></svg>,
  trash:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  cart:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6l1.6-8.4H6"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  warning:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.5l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  chevron:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  lock:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  star:     <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  refresh:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
};

const Ico = ({ n, s = 17 }) => (
  <span style={{ width:s, height:s, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0, pointerEvents:"none" }}>
    {ICONS[n] || null}
  </span>
);

const fmt   = n => `₼${Number(n).toLocaleString()}`;
const fmt4  = v => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
const fmtE  = v => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1/$2").slice(0,5);

const ORDER_STATUS_MAP = {
  0: "pending",   
  1: "processing",
  2: "processing",
  3: "delivered", 
  4: "cancelled", 
  Pending:    "pending",
  Confirmed:  "processing",
  InProgress: "processing",
  Delivered:  "delivered",
  Cancelled:  "cancelled",
};
const ST = {
  delivered:  { lbl:"profile.status_delivered", cl:"st-green" },
  shipped:    { lbl:"profile.status_shipped",   cl:"st-blue"  },
  processing: { lbl:"profile.status_proc",      cl:"st-amber" },
  cancelled:  { lbl:"profile.status_cancel",    cl:"st-red"   },
  pending:    { lbl:"profile.status_pending",   cl:"st-amber" },
};

const AZ_BANKS = [
  {id:"kapital",name:"Kapital Bank",color:"#003087"},{id:"pasha",name:"PAŞA Bank",color:"#C8102E"},
  {id:"abb",name:"ABB Bank",color:"#005BAA"},{id:"atb",name:"ATB Bank",color:"#F7941D"},
  {id:"express",name:"Express Bank",color:"#00843D"},{id:"rabit",name:"Rabitəbank",color:"#002D72"},
  {id:"amrah",name:"Amrahbank",color:"#8B0000"},{id:"other",name:"Digər",color:"#6B7280"},
];

function ConfirmModal({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) {
  useEffect(() => {
    const h = e => { if(e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCancel]);
  return (
    <div className="pr-backdrop" onClick={onCancel}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className={`pr-modal-ic ${danger ? "danger" : "info"}`}>
          <Ico n={danger ? "warning" : "info"} s={24}/>
        </div>
        <h3 className="pr-modal-title">{title}</h3>
        <p className="pr-modal-msg">{message}</p>
        <div className="pr-modal-btns">
          <button className="pr-modal-cancel" onClick={onCancel}>{cancelText}</button>
          <button className={`pr-modal-ok${danger?" danger":""}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

function useConfirm() {
  const [state, setState] = useState(null);
  const confirm = useCallback(opts => new Promise(res => setState({...opts, res})), []);
  const ok  = () => { state?.res(true);  setState(null); };
  const no  = () => { state?.res(false); setState(null); };
  const Modal = state
    ? <ConfirmModal title={state.title} message={state.message} confirmText={state.confirmText||"Təsdiqlə"} cancelText={state.cancelText||"Ləğv et"} danger={state.danger} onConfirm={ok} onCancel={no}/>
    : null;
  return { confirm, Modal };
}

function Toast({ msg, ok, onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 3200); return () => clearTimeout(id); }, [onClose]);
  return (
    <div className={`pr-toast ${ok ? "pr-toast-ok" : "pr-toast-err"}`}>
      <Ico n={ok ? "check" : "warning"} s={14}/>
      {msg}
    </div>
  );
}

const Spin = () => <span className="pr-spin"/>;

function PwStrength({ pw }) {
  const s = !pw ? 0 : pw.length<6 ? 1 : pw.length<9 ? 2 : /[^a-zA-Z0-9]/.test(pw) && pw.length>=10 ? 4 : 3;
  const c = {1:"#EF4444",2:"#F59E0B",3:"#10B981",4:"#B8834A"};
  const l = {1:"Zəif",2:"Orta",3:"Güclü",4:"Mükəmməl"};
  if(!pw) return null;
  return (
    <div className="pw-str">
      <div className="pw-str-bars">{[1,2,3,4].map(i=><div key={i} className="pw-str-bar" style={{background:s>=i?c[s]:"#E5E7EB"}}/>)}</div>
      <span style={{fontSize:10,color:c[s],fontWeight:700}}>{l[s]}</span>
    </div>
  );
}

function useOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/orders/my");
      const arr = data?.data ?? data ?? [];
      setOrders(Array.isArray(arr) ? arr : []);
    } catch (err) {
      setError(err?.userMessage || "Sifarişlər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { orders, loading, error, reload: load };
}

function OverviewTab({ user, setTab, orders, ordersLoading, savedCount, t }) {
  const spent = orders.filter(o => {
    const st = ORDER_STATUS_MAP[o.status] ?? o.status?.toLowerCase?.();
    return st !== "cancelled";
  }).reduce((a, o) => a + (o.totalPrice ?? 0), 0);
  const done = orders.filter(o => (ORDER_STATUS_MAP[o.status] ?? o.status?.toLowerCase?.()) === "delivered").length;

  const stats = [
    {val: orders.length, lbl: t("profile.ov_orders"), ico:"package", tab:"orders"},
    {val: done,          lbl: t("profile.ov_done"),   ico:"check",   tab:"orders"},
    {val: savedCount,    lbl: t("profile.ov_saved"),  ico:"heart",   tab:"saved" },
    {val: fmt(spent),    lbl: t("profile.ov_spent"),  ico:"card",    tab:null    },
  ];

  return (
    <div className="pr-body pr-ani">
      <div className="pr-stat-grid">
        {stats.map((s,i) => (
          <button key={i} className="pr-stat-card" style={{animationDelay:`${i*0.07}s`}}
            onClick={()=>s.tab&&setTab(s.tab)}>
            <div className="pr-stat-ico-wrap"><Ico n={s.ico} s={19}/></div>
            <span className="pr-stat-val">{s.val}</span>
            <span className="pr-stat-lbl">{s.lbl}</span>
            {s.tab && <span className="pr-stat-arr"><Ico n="arrow" s={13}/></span>}
          </button>
        ))}
      </div>

      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">{t("profile.recent_orders")}</h3>
          <button className="pr-see-all" onClick={()=>setTab("orders")}>{t("profile.see_all")} →</button>
        </div>
        {ordersLoading ? (
          <div style={{padding:"24px",textAlign:"center"}}><Spin/></div>
        ) : orders.length === 0 ? (
          <div className="pr-empty" style={{padding:"24px"}}>
            <Ico n="package" s={32}/>
            <p style={{marginTop:8,color:"#A8A09A",fontSize:14}}>Hələ sifariş yoxdur</p>
          </div>
        ) : (
          <div className="pr-order-list">
            {orders.slice(0,3).map((o,i) => {
              const statusKey = ORDER_STATUS_MAP[o.status] ?? o.status?.toLowerCase?.() ?? "pending";
              const s = ST[statusKey] || ST.pending;
              const firstImg = o.items?.[0]?.productImage;
              return (
                <div key={o.id} className="pr-order-row" style={{animationDelay:`${i*0.06}s`}}>
                  <div className="pr-order-imgs">
                    {firstImg
                      ? <img src={firstImg} alt="" className="pr-oimg"/>
                      : <div className="pr-oimg" style={{background:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="package" s={14}/></div>
                    }
                  </div>
                  <div className="pr-order-info">
                    <p className="pr-order-id">#{o.id}</p>
                    <p className="pr-order-meta">{new Date(o.createdAt).toLocaleDateString("az-AZ")} · {o.items?.length || 0} {t("profile.items")}</p>
                  </div>
                  <span className={`pr-st ${s.cl}`}>{t(s.lbl)}</span>
                  <span className="pr-order-price">{fmt(o.totalPrice)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ user, showToast, t }) {
  const dispatch = useDispatch();
  const { confirm, Modal } = useConfirm();
  const [form,    setForm]    = useState({
    name:    user?.name    || "",
    surname: user?.surname || "",
    email:   user?.email   || "",
    phone:   user?.phoneNumber || "",
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
    const ok = await confirm({
      title: t("profile.confirm_save_title"),
      message: t("profile.confirm_save_msg"),
      confirmText: t("profile.save"),
      cancelText: t("profile.cancel"),
    });
    if (!ok) return;
    setSaving(true);
    try {
      await axiosInstance.put("/users/me", {
        name:        form.name.trim(),
        surname:     form.surname.trim(),
        phoneNumber: form.phone.trim() || null,
      });
      dispatch(updateUser({
        name:        form.name.trim(),
        surname:     form.surname.trim(),
        phoneNumber: form.phone.trim() || null,
      }));
      setDone(true);
      showToast(t("profile.saved_ok"), true);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([k,v]) => {
          mapped[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
      }
      showToast(err?.userMessage || t("common.error"), false);
    } finally {
      setSaving(false);
    }
  };

  const ini = `${(form.name||"?")[0]}${(form.surname||"")[0]||""}`.toUpperCase();

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <h3 className="pr-card-title">{t("profile.photo_title")}</h3>
        <div
          className={`pr-avatar-drop${drag?" drag":""}`}
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0])}}
          onClick={()=>fileRef.current?.click()}
        >
          <div className="pr-av-circle">
            {preview
              ? <img src={preview} alt="" className="pr-av-img"/>
              : <span className="pr-av-init">{ini}</span>
            }
            <div className="pr-av-hover"><Ico n="camera" s={20}/><span>{t("profile.photo_change")}</span></div>
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
          <div className="pr-field">
            <label className="pr-label">{t("profile.f_name")}</label>
            <input className={`pr-input${errors.name?" pr-ierr":""}`} name="name" type="text" value={form.name} onChange={ch}/>
            {errors.name && <span className="pr-err">{errors.name}</span>}
          </div>
          {/* Soyad */}
          <div className="pr-field">
            <label className="pr-label">Soyad</label>
            <input className={`pr-input${errors.surname?" pr-ierr":""}`} name="surname" type="text" value={form.surname} onChange={ch}/>
            {errors.surname && <span className="pr-err">{errors.surname}</span>}
          </div>
          {/* Email — read-only */}
          <div className="pr-field pr-fcol2">
            <label className="pr-label">{t("profile.f_email")}</label>
            <input className="pr-input" name="email" type="email" value={form.email} readOnly
              style={{background:"#F7F3EE",cursor:"not-allowed",color:"#A8A09A"}}/>
            <span className="pr-err" style={{color:"#A8A09A",marginTop:4,display:"block"}}>Email dəyişdirilə bilməz</span>
          </div>
          {/* Telefon */}
          <div className="pr-field pr-fcol2">
            <label className="pr-label">{t("profile.f_phone")}</label>
            <input className={`pr-input${errors.phone?" pr-ierr":""}`} name="phone" type="tel" value={form.phone} onChange={ch}
              placeholder="+994 50 123 45 67"/>
            {errors.phone && <span className="pr-err">{errors.phone}</span>}
          </div>
        </div>
        <div className="pr-ffoot">
          <button className={`pr-btn-save${done?" pr-btn-done":""}`} onClick={save} disabled={saving}>
            {saving ? <><Spin/> {t("profile.saving")}</> : done ? <><Ico n="check" s={14}/> {t("profile.saved_ok")}</> : t("profile.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: SECURITY ─────────────────────────────────────── */
function SecurityTab({ showToast, t }) {
  const { confirm, Modal } = useConfirm();
  const [form,   setForm]   = useState({current:"",newPw:"",confirmPw:""});
  const [show,   setShow]   = useState({current:false,newPw:false,confirmPw:false});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const ch = e => {
    setForm(p=>({...p,[e.target.name]:e.target.value}));
    setErrors(p=>({...p,[e.target.name]:""}));
  };

  const save = async () => {
    const ok = await confirm({
      title: t("profile.confirm_pw_title"),
      message: t("profile.confirm_pw_msg"),
      confirmText: t("profile.change_pw"),
      cancelText: t("profile.cancel"),
      danger: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await axiosInstance.put("/users/me/password", {
        currentPassword: form.current,
        newPassword:     form.newPw,
      });
      setForm({current:"",newPw:"",confirmPw:""});
      showToast(t("profile.pw_changed"), true);
    } catch (err) {
      if (err?.validationErrors) {
        const mapped = {};
        Object.entries(err.validationErrors).forEach(([k,v]) => {
          mapped[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
      } else {
        setErrors({current: err?.userMessage || t("common.error")});
      }
      showToast(err?.userMessage || t("common.error"), false);
    } finally {
      setSaving(false);
    }
  };

  const PwF = ({name,label}) => (
    <div className="pr-field">
      <label className="pr-label">{label}</label>
      <div className="pr-pw-wrap">
        <input
          className={`pr-input${errors[name]?" pr-ierr":""}`}
          name={name} type={show[name]?"text":"password"}
          value={form[name]} onChange={ch} placeholder="••••••••"
        />
        <button type="button" className="pr-pw-eye" onClick={()=>setShow(p=>({...p,[name]:!p[name]}))}>
          <Ico n={show[name]?"eye":"eyeOff"} s={16}/>
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
          <PwF name="current"   label={t("profile.cur_pw")}/>
          <PwF name="newPw"     label={t("profile.new_pw")}/>
          <PwF name="confirmPw" label={t("profile.conf_pw")}/>
        </div>
        <div className="pr-ffoot">
          <button className="pr-btn-save" onClick={save} disabled={saving}>
            {saving ? <><Spin/> {t("profile.saving")}</> : t("profile.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: PAYMENTS (lokal — backend endpoint yoxdur) ───── */
function PaymentsTab({ showToast, t }) {
  const { confirm, Modal } = useConfirm();
  const [cards,   setCards]   = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selBank, setSelBank] = useState(null);
  const [newCard, setNewCard] = useState({number:"",name:"",expiry:"",cvv:""});
  const [cardErrors, setCardErrors] = useState({});

  const validateCard = () => {
    const e = {};
    const num = newCard.number.replace(/\s/g,"");
    if(!num || num.length < 16) e.number = "Kart nömrəsi düzgün deyil";
    if(!newCard.name.trim()) e.name = "Ad Soyad daxil edin";
    if(!newCard.expiry || newCard.expiry.length < 5) e.expiry = "Bitmə tarixi düzgün deyil";
    if(!newCard.cvv || newCard.cvv.length < 3) e.cvv = "CVV daxil edin";
    setCardErrors(e);
    return !Object.keys(e).length;
  };

  const deleteCard = async (id) => {
    const ok = await confirm({
      title: t("profile.confirm_del_card_title"),
      message: t("profile.confirm_del_card_msg"),
      confirmText: t("profile.delete"), cancelText: t("profile.cancel"), danger: true,
    });
    if(ok){ setCards(p=>p.filter(x=>x.id!==id)); showToast(t("profile.card_deleted"),true); }
  };

  const addCard = async () => {
    if(!validateCard()) return;
    const bank = AZ_BANKS.find(b=>b.id===selBank);
    const ok = await confirm({
      title: t("profile.confirm_add_card_title"),
      message: `${bank?.name||"Kart"} — ${newCard.number}`,
      confirmText: t("profile.save_card"), cancelText: t("profile.cancel"),
    });
    if(!ok) return;
    setCards(p=>[...p,{
      id:Date.now(), number:newCard.number||"•••• •••• •••• 0000",
      name:newCard.name||"KART SAHİBİ", expiry:newCard.expiry||"--/--",
      type:"VISA", bank:bank?.name||"—", bankColor:bank?.color||"#6B7280",
    }]);
    setNewCard({number:"",name:"",expiry:"",cvv:""}); setSelBank(null); setAddOpen(false); setCardErrors({});
    showToast(t("profile.card_added"),true);
  };

  return (
    <div className="pr-body pr-ani">
      {Modal}
      <div className="pr-card">
        <div className="pr-card-top">
          <h3 className="pr-card-title">{t("profile.my_cards")}</h3>
          <button className="pr-btn-add" onClick={()=>setAddOpen(p=>!p)}>
            {addOpen
              ? <><Ico n="x" s={11}/> {t("profile.cancel")}</>
              : <><Ico n="plus" s={11}/> {t("profile.add_card")}</>
            }
          </button>
        </div>
        {cards.length === 0 ? (
          <div className="pr-empty">
            <div className="pr-empty-ic"><Ico n="card" s={40}/></div>
            <p>{t("profile.no_cards")}</p>
          </div>
        ) : (
          <div className="pr-cards-row">
            {cards.map((c,i)=>(
              <div key={c.id} className="pr-bank-card" style={{"--bk":c.bankColor||"#B8834A",animationDelay:`${i*.08}s`}}>
                <div className="pr-bc-top">
                  <span className="pr-bc-bank">{c.bank||"Bank"}</span>
                  <button className="pr-bc-del" onClick={()=>deleteCard(c.id)}><Ico n="trash" s={13}/></button>
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
              {AZ_BANKS.map(b=>(
                <button key={b.id} className={`pr-bank-btn${selBank===b.id?" active":""}`} style={{"--bk":b.color}} onClick={()=>setSelBank(b.id)}>
                  <span className="pr-bank-dot" style={{background:b.color}}/>{b.name}
                  {selBank===b.id&&<span className="pr-bank-chk"><Ico n="check" s={9}/></span>}
                </button>
              ))}
            </div>
            <div className="pr-fg">
              <div className="pr-field pr-fcol2">
                <label className="pr-label">{t("profile.card_number")}</label>
                <input className={`pr-input pr-mono${cardErrors.number?" pr-input-err":""}`} placeholder="0000 0000 0000 0000" maxLength={19} value={newCard.number} onChange={e=>setNewCard(p=>({...p,number:fmt4(e.target.value)}))}/>
                {cardErrors.number && <span className="pr-field-err">{cardErrors.number}</span>}
              </div>
              <div className="pr-field pr-fcol2">
                <label className="pr-label">{t("profile.card_name")}</label>
                <input className={`pr-input pr-mono${cardErrors.name?" pr-input-err":""}`} placeholder="AD SOYAD" value={newCard.name} onChange={e=>setNewCard(p=>({...p,name:e.target.value.toUpperCase()}))}/>
                {cardErrors.name && <span className="pr-field-err">{cardErrors.name}</span>}
              </div>
              <div className="pr-field">
                <label className="pr-label">{t("profile.expiry")}</label>
                <input className={`pr-input pr-mono${cardErrors.expiry?" pr-input-err":""}`} placeholder="MM/YY" maxLength={5} value={newCard.expiry} onChange={e=>setNewCard(p=>({...p,expiry:fmtE(e.target.value)}))}/>
                {cardErrors.expiry && <span className="pr-field-err">{cardErrors.expiry}</span>}
              </div>
              <div className="pr-field">
                <label className="pr-label">CVV</label>
                <input className={`pr-input pr-mono${cardErrors.cvv?" pr-input-err":""}`} placeholder="•••" maxLength={3} type="password" value={newCard.cvv} onChange={e=>setNewCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))}/>
                {cardErrors.cvv && <span className="pr-field-err">{cardErrors.cvv}</span>}
              </div>
            </div>
            <div className="pr-ffoot">
              <button className="pr-btn-save" onClick={addCard}>{t("profile.save_card")}</button>
              <button className="pr-btn-ghost" onClick={()=>{setAddOpen(false);setSelBank(null);}}>{t("profile.cancel")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TAB: ORDERS — GET /orders/my ─────────────────────── */
/* ─── Status Tracker ────────────────────────────────────── */
const STATUS_STEPS = [
  { key: "Pending",    label: "Gözlənilir",  icon: "🕐" },
  { key: "Confirmed",  label: "Təsdiqləndi", icon: "✅" },
  { key: "InProgress", label: "Hazırlanır",  icon: "⚙️" },
  { key: "Delivered",  label: "Çatdırıldı",  icon: "🎉" },
];

function OrderStatusTracker({ status, estimatedDeliveryDate, adminNote }) {
  const STATUS_ORDER = { Pending: 0, Confirmed: 1, InProgress: 2, Delivered: 3, Cancelled: -1 };
  const currentIdx = STATUS_ORDER[status] ?? 0;
  const isCancelled = status === "Cancelled" || status === 4 || Number(status) === 4;

  return (
    <div style={{ padding: "16px 0 8px" }}>
      {isCancelled ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6 }}>
          <span style={{ fontSize: 18 }}>❌</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#DC2626" }}>Sifariş ləğv edildi</p>
            {adminNote && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6B7280" }}>{adminNote}</p>}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 8 }}>
            {STATUS_STEPS.map((st, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={st.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                  {/* Connector line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div style={{
                      position: "absolute", top: 14, left: "50%", right: "-50%",
                      height: 2, background: idx < currentIdx ? "#7A9E7E" : "#E5DDD4",
                      transition: "background .4s", zIndex: 0,
                    }} />
                  )}
                  {/* Circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: done ? "#7A9E7E" : "#F0EDE8",
                    border: `2px solid ${active ? "#7A9E7E" : done ? "#7A9E7E" : "#E5DDD4"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: done ? "#fff" : "#9CA3AF",
                    fontWeight: 700, position: "relative", zIndex: 2,
                    boxShadow: active ? "0 0 0 3px rgba(122,158,126,.2)" : "none",
                    transition: "all .4s",
                  }}>
                    {done ? (idx === currentIdx ? st.icon : "✓") : idx + 1}
                  </div>
                  <p style={{
                    fontSize: 10, marginTop: 6, letterSpacing: 0.5, textAlign: "center",
                    color: active ? "#1C1C1C" : done ? "#7A9E7E" : "#9CA3AF",
                    fontWeight: active ? 600 : 400, lineHeight: 1.3,
                  }}>{st.label}</p>
                </div>
              );
            })}
          </div>

          {/* Admin note / estimated delivery */}
          {(adminNote || estimatedDeliveryDate) && (
            <div style={{ background: "#F0F7F1", border: "1px solid #C8DBC9", padding: "10px 14px", marginTop: 8, borderRadius: 4 }}>
              {estimatedDeliveryDate && (
                <p style={{ margin: 0, fontSize: 12, color: "#2E6B32" }}>
                  📅 <strong>Təxmini çatdırılma:</strong>{" "}
                  {new Date(estimatedDeliveryDate).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              {adminNote && (
                <p style={{ margin: estimatedDeliveryDate ? "6px 0 0" : 0, fontSize: 12, color: "#374151" }}>
                  💬 <em>{adminNote}</em>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrdersTab({ orders, loading, error, reload, t }) {
  const [open,         setOpen]         = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { confirm, Modal: CancelModal } = useConfirm();

  const canCancel = (status) => {
    const s = typeof status === "string" ? status
      : { 0:"Pending", 1:"Confirmed", 2:"InProgress", 3:"Delivered", 4:"Cancelled" }[status] ?? "Pending";
    return s === "Pending" || s === "Confirmed";
  };

  const handleCancel = async (e, orderId) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Sifarişi ləğv et",
      message: `#${orderId} nömrəli sifarişi ləğv etmək istədiyinizə əminsiniz?`,
      confirmText: "Bəli, ləğv et",
      cancelText: "Xeyr",
      danger: true,
    });
    if (!ok) return;
    setCancellingId(orderId);
    try {
      const { default: orderApi } = await import("../../api/orderApi");
      await orderApi.cancel(orderId);
      reload();
    } catch (err) {
      alert(err?.userMessage || "Ləğvetmə zamanı xəta baş verdi");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return (
    <div className="pr-body pr-ani">
      <div className="pr-card" style={{padding:"48px",textAlign:"center"}}><Spin/></div>
    </div>
  );

  if (error) return (
    <div className="pr-body pr-ani">
      <div className="pr-card" style={{padding:"32px",textAlign:"center"}}>
        <Ico n="warning" s={32}/>
        <p style={{marginTop:12,color:"#EF4444",fontSize:14}}>{error}</p>
        <button className="pr-btn-save" style={{marginTop:16}} onClick={reload}>
          <Ico n="refresh" s={14}/> Yenidən yüklə
        </button>
      </div>
    </div>
  );

  const getStatusLabel = (status) => {
    const map = { Pending:"Gözlənilir", Confirmed:"Təsdiqləndi", InProgress:"Hazırlanır", Delivered:"Çatdırıldı", Cancelled:"Ləğv edildi",
                  0:"Gözlənilir", 1:"Təsdiqləndi", 2:"Hazırlanır", 3:"Çatdırıldı", 4:"Ləğv edildi" };
    return map[status] ?? "Gözlənilir";
  };

  const getStatusColor = (status) => {
    const s = typeof status === "string" ? status : { 0:"Pending",1:"Confirmed",2:"InProgress",3:"Delivered",4:"Cancelled" }[status] ?? "Pending";
    return { Pending:"#C9A84C", Confirmed:"#2980b9", InProgress:"#7A9E7E", Delivered:"#2E6B32", Cancelled:"#EF4444" }[s] ?? "#C9A84C";
  };

  const getStatusBg = (status) => {
    const s = typeof status === "string" ? status : { 0:"Pending",1:"Confirmed",2:"InProgress",3:"Delivered",4:"Cancelled" }[status] ?? "Pending";
    return { Pending:"#FFFBEB", Confirmed:"#EFF6FF", InProgress:"#F0F7F1", Delivered:"#ECFDF5", Cancelled:"#FEF2F2" }[s] ?? "#FFFBEB";
  };

  return (
    <div className="pr-body pr-ani">
      {CancelModal}
      <div className="pr-card pr-card-flush">
        <div className="pr-card-pad">
          <h3 className="pr-card-title">{t("profile.order_history")}</h3>
        </div>
        {orders.length === 0 ? (
          <div className="pr-empty" style={{padding:"48px"}}>
            <div className="pr-empty-ic"><Ico n="package" s={40}/></div>
            <p>Hələ sifariş yoxdur</p>
            <Link to="/categories" className="pr-btn-save" style={{textDecoration:"none",marginTop:12}}>Alış-verişə başla</Link>
          </div>
        ) : (
          orders.map((o, i) => {
            const isOpen = open === o.id;
            const firstImg = o.items?.[0]?.productImage;
            const statusStr = typeof o.status === "string" ? o.status
              : { 0:"Pending",1:"Confirmed",2:"InProgress",3:"Delivered",4:"Cancelled" }[o.status] ?? "Pending";

            return (
              <div key={o.id} className={`pr-ord-item${isOpen?" open":""}`} style={{animationDelay:`${i*.05}s`}}>
                <div className="pr-ord-row" onClick={()=>setOpen(p=>p===o.id?null:o.id)}>
                  <div className="pr-ord-imgs">
                    {firstImg
                      ? <img src={firstImg} alt="" className="pr-oimg"/>
                      : <div className="pr-oimg" style={{background:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="package" s={14}/></div>
                    }
                    {o.items?.length > 1 && <span className="pr-oimg-more">+{o.items.length - 1}</span>}
                  </div>
                  <div className="pr-ord-info">
                    <p className="pr-ord-id">
                      #{o.id}
                      {o.isCustomOrder && <span style={{marginLeft:6,fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#C9A84C",background:"#FFFBEB",border:"1px solid #C9A84C",padding:"1px 5px"}}>XÜSUSİ</span>}
                    </p>
                    <p className="pr-ord-meta">
                      {new Date(o.createdAt).toLocaleDateString("az-AZ")} ·&nbsp;
                      {o.paymentMethod === 1 || o.paymentMethod === "CashOnDelivery" ? "Nağd" : "Kart"}
                    </p>
                  </div>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:"4px 10px",
                    background: getStatusBg(o.status), color: getStatusColor(o.status),
                    border:`1px solid ${getStatusColor(o.status)}33`, whiteSpace:"nowrap",
                  }}>{getStatusLabel(o.status)}</span>
                  <span className="pr-ord-total">{fmt(o.totalPrice)}</span>
                  <span className={`pr-ord-chev${isOpen?" up":""}`}><Ico n="chevron" s={16}/></span>
                </div>

                {isOpen && (
                  <div className="pr-ord-detail pr-ani">
                    {/* Status Tracker */}
                    <OrderStatusTracker
                      status={statusStr}
                      estimatedDeliveryDate={o.estimatedDeliveryDate}
                      adminNote={o.adminNote}
                    />

                    {/* Xüsusi sifariş qeydi */}
                    {o.isCustomOrder && o.customDescription && (
                      <div style={{background:"#FFFBF2",border:"1px solid #C9A84C",padding:"10px 14px",marginBottom:12,borderRadius:4}}>
                        <p style={{margin:0,fontSize:11,letterSpacing:1,textTransform:"uppercase",color:"#C9A84C",marginBottom:4}}>✦ Xüsusi Sifariş Tələbi</p>
                        <p style={{margin:0,fontSize:13,color:"#1C1C1C"}}>{o.customDescription}</p>
                      </div>
                    )}

                    {/* Məhsullar */}
                    {(o.items || []).map((it, j) => (
                      <div key={j} className="pr-det-row">
                        {it.productImage
                          ? <img src={it.productImage} alt="" className="pr-det-img"/>
                          : <div className="pr-det-img" style={{background:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="package" s={12}/></div>
                        }
                        <div className="pr-det-info">
                          <p className="pr-det-name">{it.productName || it.collectionName || "Məhsul"}</p>
                          {it.selectedColor && <p className="pr-det-qty" style={{color:"#6B7280"}}>🎨 {it.selectedColor}</p>}
                          {it.selectedSize && <p className="pr-det-qty" style={{color:"#6B7280"}}>📐 {it.selectedSize}</p>}
                          <p className="pr-det-qty">×{it.quantity}</p>
                        </div>
                        <span className="pr-det-price">{fmt(it.unitPrice ?? it.totalPrice ?? 0)}</span>
                      </div>
                    ))}

                    <div className="pr-det-total">
                      <span>{t("profile.total")}</span>
                      <strong>{fmt(o.totalPrice)}</strong>
                    </div>

                    {/* Ödəniş detalları */}
                    {(o.paidAmount || o.installmentMonths) && (
                      <div style={{background:"#F7F3EE",padding:"10px 14px",marginTop:8,borderRadius:4,fontSize:12,color:"#6B7280"}}>
                        {o.paidAmount && <span>İlkin ödəniş: <strong style={{color:"#1C1C1C"}}>{fmt(o.paidAmount)}</strong> · </span>}
                        {o.installmentMonths && <span>Kredit: <strong style={{color:"#1C1C1C"}}>{o.installmentMonths} ay</strong></span>}
                        {o.monthlyPayment && <span> · Aylıq: <strong style={{color:"#7A9E7E"}}>{fmt(o.monthlyPayment)}</strong></span>}
                      </div>
                    )}

                    {/* Ləğvetmə düyməsi */}
                    {canCancel(o.status) && (
                      <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #F0EDE8",display:"flex",justifyContent:"flex-end"}}>
                        <button
                          onClick={(e) => handleCancel(e, o.id)}
                          disabled={cancellingId === o.id}
                          style={{
                            display:"flex",alignItems:"center",gap:6,
                            padding:"8px 16px",fontSize:12,fontWeight:600,letterSpacing:.5,
                            background:"none",border:"1.5px solid #EF4444",color:"#EF4444",
                            cursor:cancellingId===o.id?"not-allowed":"pointer",
                            opacity:cancellingId===o.id?.5:1,transition:"all .2s",
                            fontFamily:"inherit",
                          }}
                          onMouseEnter={e=>{if(cancellingId!==o.id){e.currentTarget.style.background="#FEF2F2";}}}
                          onMouseLeave={e=>{e.currentTarget.style.background="none";}}
                        >
                          {cancellingId === o.id
                            ? <><Spin/> Ləğv edilir...</>
                            : <><Ico n="x" s={13}/> Sifarişi ləğv et</>
                          }
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── TAB: SAVED — Redux wishlist ───────────────────────── */
function SavedTab({ showToast, t }) {
  const dispatch  = useDispatch();
  const { confirm, Modal } = useConfirm();
  const [addingId, setAddingId] = useState(null);

  // Redux wishlist
  const items = useSelector(s => s.wishlist.items);

  const removeItem = async (item) => {
    const ok = await confirm({
      title: t("profile.confirm_rm_title"),
      message: `"${item.name}" ${t("profile.confirm_rm_msg")}`,
      confirmText: t("profile.remove"), cancelText: t("profile.cancel"), danger: true,
    });
    if (ok) {
      dispatch(removeFromWishlist(item.id));
      showToast(t("profile.item_removed"), true);
    }
  };

  const addToCart = async (item) => {
    if (!item.id || addingId === item.id) return;
    setAddingId(item.id);
    try {
      const cart = await cartApi.addItem({ productId: item.id, quantity: 1 });
      if (cart) dispatch(setCart(cart));
      showToast(`${item.name} ${t("profile.added_cart")}`, true);
    } catch (err) {
      showToast(err?.userMessage || t("common.error"), false);
    } finally {
      setTimeout(() => setAddingId(null), 1200);
    }
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
        {items.length === 0 ? (
          <div className="pr-empty">
            <div className="pr-empty-ic"><Ico n="heart" s={40}/></div>
            <p>{t("profile.no_saved")}</p>
            <Link to="/categories" className="pr-btn-save" style={{textDecoration:"none",marginTop:12}}>
              {t("profile.browse")}
            </Link>
          </div>
        ) : (
          <div className="pr-saved-grid">
            {items.map((item, i) => (
              <div key={item.id} className="pr-saved-card" style={{animationDelay:`${i*0.05}s`}}>
                <div className="pr-saved-img-wrap">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=75"}
                    alt={item.name} className="pr-saved-img"
                  />
                  <button className="pr-saved-rm" onClick={()=>removeItem(item)} title={t("profile.remove")}>
                    <Ico n="x" s={10}/>
                  </button>
                  <div className="pr-saved-overlay">
                    <button
                      className="pr-saved-cart"
                      onClick={()=>addToCart(item)}
                      disabled={addingId===item.id}
                    >
                      {addingId===item.id
                        ? <><Spin/> Əlavə edilir...</>
                        : <><Ico n="cart" s={13}/> {t("profile.add_cart")}</>
                      }
                    </button>
                  </div>
                </div>
                <p className="pr-saved-name">{item.name}</p>
                <p className="pr-saved-price">{fmt(item.price ?? 0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TABS CONFIG ────────────────────────────────────────── */
const TABS = [
  { id:"overview", ik:"profile.tab_overview", ico:"overview" },
  { id:"profile",  ik:"profile.tab_profile",  ico:"user"     },
  { id:"security", ik:"profile.tab_security", ico:"shield"   },
  { id:"payments", ik:"profile.tab_payments", ico:"card"     },
  { id:"orders",   ik:"profile.tab_orders",   ico:"package"  },
  { id:"saved",    ik:"profile.tab_saved",    ico:"heart"    },
];

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function ProfilePage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { confirm, Modal } = useConfirm();

  // Redux
  const user     = useSelector(s => s.auth.user);
  const wishlist = useSelector(s => s.wishlist.items);

  const [tab,   setTab]   = useState("overview");
  const [toast, setToast] = useState(null);

  // Orders from API
  const { orders, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useOrders();

  const showToast = (msg, ok) => setToast({msg, ok});

  const fullName = user
    ? `${user.name || ""} ${user.surname || ""}`.trim()
    : "İstifadəçi";
  const initials = `${(user?.name||"?")[0]}${(user?.surname||"")[0]||""}`.toUpperCase();

  const spent = orders
    .filter(o => (ORDER_STATUS_MAP[o.status] ?? o.status?.toLowerCase?.()) !== "cancelled")
    .reduce((a, o) => a + (o.totalPrice ?? 0), 0);

  const handleLogout = async () => {
    const ok = await confirm({
      title: t("profile.logout_title"),
      message: t("profile.logout_msg"),
      confirmText: t("profile.logout"),
      cancelText: t("profile.cancel"),
      danger: true,
    });
    if (!ok) return;
    await logout();
    dispatch(logoutAction());
    navigate("/");
  };

  return (
    <>
      <Navbar/>
      <div className="pr-page">
        {Modal}

        {/* HERO */}
        <div className="pr-hero">
          <div className="pr-hero-inner">
            <div className="pr-av-wrap" onClick={()=>setTab("profile")} title={t("profile.photo_change")}>
              <div className="pr-av-ring">
                <div className="pr-av">{initials}</div>
              </div>
              <div className="pr-av-edit"><Ico n="edit" s={11}/></div>
            </div>
            <div className="pr-hero-info">
              <div className="pr-hero-badge"><Ico n="star" s={10}/>{t("profile.member")}</div>
              <h1 className="pr-hero-name">{fullName}</h1>
              <div className="pr-hero-meta">
                <span><Ico n="mail" s={12}/>{user?.email || ""}</span>
                {user?.phoneNumber && <span><Ico n="location" s={12}/>{user.phoneNumber}</span>}
              </div>
            </div>
            <div className="pr-hero-stats">
              {[
                {v: orders.length,    l: t("profile.ov_orders")},
                {v: wishlist.length,  l: t("profile.ov_saved") },
                {v: fmt(spent),       l: t("profile.ov_spent") },
              ].map((s,i)=>(
                <div key={i} className="pr-hs" style={{animationDelay:`${i*.1}s`}}>
                  <span className="pr-hs-v">{s.v}</span>
                  <span className="pr-hs-l">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="pr-layout">
          <aside className="pr-sidebar">
            <div className="pr-sidebar-header">
              <div className="pr-sb-av">{initials}</div>
              <div className="pr-sb-info">
                <p className="pr-sb-name">{user?.name || fullName.split(" ")[0]}</p>
                <p className="pr-sb-email">{user?.email || ""}</p>
              </div>
            </div>
            <nav className="pr-nav">
              <p className="pr-nav-label-section">Menyu</p>
              {TABS.map(tb=>(
                <button key={tb.id} className={`pr-nav-item${tab===tb.id?" active":""}`} onClick={()=>setTab(tb.id)}>
                  <span className="pr-nav-icon"><Ico n={tb.ico} s={17}/></span>
                  <span className="pr-nav-text">{t(tb.ik)}</span>
                </button>
              ))}
            </nav>
            <button className="pr-logout-btn" onClick={handleLogout}>
              <Ico n="logout" s={16}/>
              {t("profile.logout")}
            </button>
          </aside>

          <div className="pr-content">
            {tab==="overview" && (
              <OverviewTab
                user={user}
                setTab={setTab}
                orders={orders}
                ordersLoading={ordersLoading}
                savedCount={wishlist.length}
                t={t}
              />
            )}
            {tab==="profile"  && <ProfileTab  user={user} showToast={showToast} t={t}/>}
            {tab==="security" && <SecurityTab showToast={showToast} t={t}/>}
            {tab==="payments" && <PaymentsTab showToast={showToast} t={t}/>}
            {tab==="orders"   && (
              <OrdersTab
                orders={orders}
                loading={ordersLoading}
                error={ordersError}
                reload={reloadOrders}
                t={t}
              />
            )}
            {tab==="saved" && <SavedTab showToast={showToast} t={t}/>}
          </div>
        </div>

        {toast && <Toast {...toast} onClose={()=>setToast(null)}/>}
      </div>
      <Footer/>
    </>
  );
}