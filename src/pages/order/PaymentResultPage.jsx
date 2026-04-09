import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import paymentApi from "../../api/paymentApi";
import Navbar from "../../components/common/Navbar";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes prFU  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
@keyframes prSpin{ to{transform:rotate(360deg)} }
@keyframes prChk { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
*,*::before,*::after{box-sizing:border-box}
.pr{font-family:'DM Sans',sans-serif;color:#1C1C1C;background:#F7F3EE;min-height:100vh;padding-top:80px;display:flex;align-items:center;justify-content:center}
.pr-box{background:#fff;border:1px solid #E5DDD4;padding:60px 48px;max-width:520px;width:90%;text-align:center;animation:prFU .5s ease}
.pr-ring{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 28px}
.pr-ring.success{background:#EAF3EB}
.pr-ring.fail{background:#FDECEA}
.pr-ring.loading{background:#F0EBE3}
.pr-spin{width:36px;height:36px;border:3px solid #E5DDD4;border-top-color:#7A9E7E;border-radius:50%;animation:prSpin .8s linear infinite}
.pr-title{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,5vw,48px);font-weight:300;margin:0 0 14px;line-height:1.1}
.pr-title em{font-style:italic;color:#7A9E7E}
.pr-title.fail em{color:#C0392B}
.pr-desc{font-size:14px;color:#6B6B6B;line-height:1.8;margin:0 0 32px}
.pr-order{background:#F7F3EE;border:1px solid #E5DDD4;padding:12px 28px;font-size:13px;color:#1C1C1C;margin-bottom:32px;display:inline-block}
.pr-order strong{font-family:'Cormorant Garamond',serif;font-size:18px}
.pr-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.pr-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;transition:all .3s}
.pr-btn-p{background:#1C1C1C;color:#fff}
.pr-btn-p:hover{background:#7A9E7E}
.pr-btn-s{background:none;border:1.5px solid #E5DDD4;color:#6B6B6B}
.pr-btn-s:hover{border-color:#1C1C1C;color:#1C1C1C}
`;

export default function PaymentResultPage({ mode }) {
  const [params]  = useSearchParams();
  const orderId   = params.get("orderId");
  const payriffId = params.get("session_order_id") || params.get("orderId_payriff");
  const sessionId = params.get("session_id") || params.get("sessionId");

  const [status, setStatus] = useState(
    mode === "success" ? "verifying" : "done"
  );

  useEffect(() => {
    if (mode !== "success" || !orderId) return;

    const verify = async () => {
      try {
        if (payriffId && sessionId) {
          const res = await paymentApi.verify({
            orderId:       parseInt(orderId),
            payriffOrderId: payriffId,
            sessionId,
          });
          setStatus(res?.success ? "paid" : "failed_verify");
        } else {

          setStatus("paid");
        }
      } catch {
        setStatus("paid");
      }
    };

    verify();
  }, [mode, orderId, payriffId, sessionId]);

  const isFail   = mode === "cancel" || mode === "failed" || status === "failed_verify";
  const isLoading = status === "verifying";

  return (
    <>
      <style>{CSS}</style>
      <div className="pr">
        <Navbar />
        <div className="pr-box">
          {isLoading ? (
            <>
              <div className="pr-ring loading">
                <div className="pr-spin" />
              </div>
              <h1 className="pr-title">Yoxlanılır<em>...</em></h1>
              <p className="pr-desc">Ödəniş statusu yoxlanılır, bir az gözləyin.</p>
            </>
          ) : isFail ? (
            <>
              <div className="pr-ring fail">
                <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
                  <circle cx="24" cy="24" r="22" stroke="#C0392B" strokeWidth="1.5"/>
                  <path d="M16 16l16 16M32 16L16 32" stroke="#C0392B" strokeWidth="2"
                    strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="pr-title fail">
                {mode === "cancel" ? <>Ödəniş<br/><em>ləğv edildi</em></> : <>Ödəniş<br/><em>uğursuz oldu</em></>}
              </h1>
              <p className="pr-desc">
                {mode === "cancel"
                  ? "Ödənişdən imtina etdiniz. Sifariş saxlanılıb, istəsəniz yenidən ödəyə bilərsiniz."
                  : "Ödəniş zamanı xəta baş verdi. Kartınızı yoxlayıb yenidən cəhd edin."}
              </p>
              {orderId && (
                <div className="pr-order">
                  Sifariş №: <strong>#{orderId}</strong>
                </div>
              )}
              <div className="pr-btns">
                <Link to="/checkout" className="pr-btn pr-btn-p">Yenidən cəhd et</Link>
                <Link to="/profile"  className="pr-btn pr-btn-s">Sifarişlərim</Link>
              </div>
            </>
          ) : (
            <>
              <div className="pr-ring success">
                <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
                  <circle cx="24" cy="24" r="22" stroke="#7A9E7E" strokeWidth="1.5"/>
                  <path d="M14 24l8 8 12-12" stroke="#7A9E7E" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="24" strokeDashoffset="0"
                    style={{animation:"prChk .5s .1s ease both"}}/>
                </svg>
              </div>
              <h1 className="pr-title">
                Ödəniş<br/><em>uğurlu oldu!</em>
              </h1>
              <p className="pr-desc">
                Sifarişiniz ödənildi və işlənməyə başladı.<br/>
                Təsdiq e-poçtu ünvanınıza göndərildi.
              </p>
              {orderId && (
                <div className="pr-order">
                  Sifariş №: <strong>#{orderId}</strong>
                </div>
              )}
              <div className="pr-btns">
                <Link to="/profile"    className="pr-btn pr-btn-p">Sifarişlərimə bax</Link>
                <Link to="/categories" className="pr-btn pr-btn-s">Alış-verişə davam</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
