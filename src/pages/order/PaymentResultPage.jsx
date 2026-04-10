// src/pages/order/PaymentResultPage.jsx
// Payriff redirect-dən sonra gəlir:
//   /payment/success?orderId=X&payriffOrderId=Y&sessionId=Z
//   /payment/cancel?orderId=X
//   /payment/failed?orderId=X
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import Navbar from "../../components/common/Navbar";

const CSS = `
@keyframes prSpin { to{transform:rotate(360deg)} }
@keyframes prFU { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
.pr { font-family:'DM Sans',sans-serif; min-height:100vh; background:#F7F3EE; display:flex; flex-direction:column; padding-top:80px; }
.pr-body { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 20px; }
.pr-card { background:#fff; border:1px solid #E5DDD4; padding:48px 40px; max-width:480px; width:100%; text-align:center; animation:prFU .4s ease; }
.pr-icon { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; }
.pr-icon.success { background:#EAF3EB; }
.pr-icon.cancel  { background:#FDF6EC; }
.pr-icon.failed  { background:#FDF0EF; }
.pr-icon.loading { background:#F0F0F0; }
.pr-spin { width:32px; height:32px; border:3px solid #E5DDD4; border-top-color:#7A9E7E; border-radius:50%; animation:prSpin .8s linear infinite; }
.pr-title { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; margin:0 0 12px; color:#1C1C1C; }
.pr-desc { font-size:14px; color:#6B6B6B; line-height:1.7; margin:0 0 28px; }
.pr-order { background:#F7F3EE; border:1px solid #E5DDD4; padding:12px 24px; font-size:13px; color:#1C1C1C; margin-bottom:28px; }
.pr-btns { display:flex; flex-direction:column; gap:10px; }
.pr-btn-p { display:flex; align-items:center; justify-content:center; padding:14px 28px; background:#1C1C1C; color:#fff; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; text-decoration:none; border:none; cursor:pointer; }
.pr-btn-s { display:flex; align-items:center; justify-content:center; padding:14px 28px; background:none; border:1.5px solid #E5DDD4; color:#6B6B6B; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; text-decoration:none; cursor:pointer; }
`;

export default function PaymentResultPage({ type }) {
  // type: "success" | "cancel" | "failed"
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [status, setStatus]   = useState("loading"); // loading | success | partial | cancel | failed | error
  const [orderId, setOrderId] = useState(null);

  const rawOrderId      = params.get("orderId");
  const payriffOrderId  = params.get("payriffOrderId") || params.get("order_id");
  const sessionId       = params.get("sessionId")      || params.get("session_id");

  useEffect(() => {
    if (!rawOrderId) { setStatus(type === "success" ? "error" : type); return; }
    setOrderId(Number(rawOrderId));

    if (type === "cancel") { setStatus("cancel"); return; }
    if (type === "failed") { setStatus("failed"); return; }

    // success — verify with backend
    if (type === "success") {
      (async () => {
        try {
          const res = await orderApi.verifyPayment(
            Number(rawOrderId),
            payriffOrderId || "",
            sessionId      || ""
          );
          setStatus(res?.success ? "success" : "failed");
        } catch {
          setStatus("error");
        }
      })();
    }
  }, [type, rawOrderId, payriffOrderId, sessionId]);

  const STATES = {
    loading: {
      icon: <div className="pr-spin" />,
      cls:  "loading",
      title: "Ödəniş yoxlanılır...",
      desc:  "Bir az gözləyin, nəticə yoxlanılır.",
      btns:  null,
    },
    success: {
      icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5"/><path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      cls:  "success",
      title: "Ödəniş uğurlu!",
      desc:  "Sifarişiniz təsdiqləndi. Tezliklə sizinlə əlaqə saxlayacağıq.",
      btns: (
        <div className="pr-btns">
          <Link to="/profile" className="pr-btn-p">Sifarişlərimə bax</Link>
          <Link to="/categories" className="pr-btn-s">Alış-verişə davam et</Link>
        </div>
      ),
    },
    cancel: {
      icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><circle cx="24" cy="24" r="22" stroke="#C9A84C" strokeWidth="1.5"/><path d="M24 14v12M24 30v2" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/></svg>,
      cls:  "cancel",
      title: "Ödəniş ləğv edildi",
      desc:  "Sifariş hələ saxlanılıb. İstəsəniz yenidən ödəniş edə bilərsiniz.",
      btns: (
        <div className="pr-btns">
          <Link to="/profile" className="pr-btn-p">Sifarişə qayıt</Link>
          <Link to="/cart" className="pr-btn-s">Səbətə qayıt</Link>
        </div>
      ),
    },
    failed: {
      icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><circle cx="24" cy="24" r="22" stroke="#C0392B" strokeWidth="1.5"/><path d="M16 16l16 16M32 16L16 32" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"/></svg>,
      cls:  "failed",
      title: "Ödəniş uğursuz oldu",
      desc:  "Kart məlumatlarını yoxlayın və yenidən cəhd edin.",
      btns: (
        <div className="pr-btns">
          <button className="pr-btn-p" onClick={() => navigate(-1)}>Yenidən cəhd et</button>
          <Link to="/profile" className="pr-btn-s">Sifarişlərimə bax</Link>
        </div>
      ),
    },
    error: {
      icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><circle cx="24" cy="24" r="22" stroke="#C0392B" strokeWidth="1.5"/><path d="M24 14v12M24 30v2" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"/></svg>,
      cls:  "failed",
      title: "Xəta baş verdi",
      desc:  "Ödəniş statusu yoxlanarkən problem yarandı. Sifarişlərinizə baxın.",
      btns: (
        <div className="pr-btns">
          <Link to="/profile" className="pr-btn-p">Sifarişlərimə bax</Link>
          <Link to="/" className="pr-btn-s">Ana səhifə</Link>
        </div>
      ),
    },
  };

  const s = STATES[status] || STATES.loading;

  return (
    <>
      <style>{CSS}</style>
      <div className="pr">
        <Navbar />
        <div className="pr-body">
          <div className="pr-card">
            <div className={`pr-icon ${s.cls}`}>{s.icon}</div>
            <h1 className="pr-title">{s.title}</h1>
            <p className="pr-desc">{s.desc}</p>
            {orderId && status !== "loading" && (
              <div className="pr-order">Sifariş №: <strong>#{orderId}</strong></div>
            )}
            {s.btns}
          </div>
        </div>
      </div>
    </>
  );
}
