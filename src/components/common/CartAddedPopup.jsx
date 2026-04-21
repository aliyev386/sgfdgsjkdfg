import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const CART_ADDED_EVENT = "cart:item-added";

export function fireCartAdded({ name, image, price }) {
  window.dispatchEvent(
    new CustomEvent(CART_ADDED_EVENT, { detail: { name, image, price } })
  );
}

const CSS = `
@keyframes capSlideIn {
  from { opacity: 0; transform: translateX(120px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes capSlideOut {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(120px); }
}
@keyframes capProgress {
  from { width: 100%; }
  to   { width: 0%; }
}

.cap-popup {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 99999;
  width: 340px;
  background: #fff;
  border: 1px solid #E5DDD4;
  box-shadow: 0 12px 48px rgba(28,28,28,0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
.cap-popup.entering { animation: capSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }
.cap-popup.leaving  { animation: capSlideOut 0.3s ease forwards; }

.cap-body {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 16px 14px;
}
.cap-img-wrap {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  background: #F5F1EC;
  overflow: hidden;
}
.cap-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cap-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cap-check-wrap {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: #7A9E7E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cap-check-wrap svg { color: #fff; }

.cap-text { flex: 1; min-width: 0; }
.cap-label {
  font-size: 10px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #7A9E7E;
  font-weight: 600;
  margin-bottom: 3px;
}
.cap-name {
  font-size: 13px;
  color: #1C1C1C;
  font-weight: 500;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cap-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9B9189;
  font-size: 16px;
  padding: 4px;
  line-height: 1;
  align-self: flex-start;
  margin-top: -2px;
  transition: color 0.2s;
}
.cap-close:hover { color: #1C1C1C; }

.cap-actions {
  display: flex;
  border-top: 1px solid #F0EBE4;
}
.cap-btn {
  flex: 1;
  padding: 11px 8px;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.cap-btn-outline {
  background: #fff;
  color: #6B6B6B;
  border-right: 1px solid #F0EBE4;
}
.cap-btn-outline:hover { background: #FAF7F4; color: #1C1C1C; }
.cap-btn-filled {
  background: #1C1C1C;
  color: #fff;
}
.cap-btn-filled:hover { background: #7A9E7E; }

.cap-progress {
  height: 2px;
  background: #7A9E7E;
  transform-origin: left;
}
.cap-progress.running {
  animation: capProgress 3s linear forwards;
}

@media (max-width: 480px) {
  .cap-popup {
    bottom: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
`;

export default function CartAddedPopup() {
  const { t } = useTranslation();
  const [popup,    setPopup]    = useState(null);   // { name, image, price }
  const [phase,    setPhase]    = useState("idle");  // idle | entering | visible | leaving
  const leaveTimer  = useRef(null);
  const removeTimer = useRef(null);
  const progressKey = useRef(0);

  const dismiss = useCallback(() => {
    clearTimeout(leaveTimer.current);
    clearTimeout(removeTimer.current);
    setPhase("leaving");
    removeTimer.current = setTimeout(() => {
      setPhase("idle");
      setPopup(null);
    }, 320);
  }, []);

  const show = useCallback((detail) => {
    clearTimeout(leaveTimer.current);
    clearTimeout(removeTimer.current);
    progressKey.current += 1;
    setPopup(detail);
    setPhase("entering");
    // entering → visible after animation
    setTimeout(() => setPhase("visible"), 10);
    leaveTimer.current = setTimeout(() => dismiss(), 3000);
  }, [dismiss]);

  useEffect(() => {
    const handler = (e) => show(e.detail);
    window.addEventListener(CART_ADDED_EVENT, handler);
    return () => window.removeEventListener(CART_ADDED_EVENT, handler);
  }, [show]);

  useEffect(() => () => {
    clearTimeout(leaveTimer.current);
    clearTimeout(removeTimer.current);
  }, []);

  if (phase === "idle" || !popup) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={`cap-popup ${phase === "entering" ? "entering" : phase === "leaving" ? "leaving" : ""}`}>
        <div className="cap-body">
          {popup.image ? (
            <div className="cap-img-wrap">
              <img className="cap-img" src={popup.image} alt={popup.name} />
            </div>
          ) : (
            <div className="cap-check-wrap">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
                <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          <div className="cap-text">
            <p className="cap-label">{t("cart_popup.added", "Səbətə əlavə edildi")}</p>
            <p className="cap-name">{popup.name}</p>
            {popup.price != null && (
              <p style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>
                ₼{Number(popup.price).toFixed(2)}
              </p>
            )}
          </div>

          <button className="cap-close" onClick={dismiss} aria-label="Bağla">✕</button>
        </div>

        <div className="cap-actions">
          <button className="cap-btn cap-btn-outline" onClick={dismiss}>
            {t("cart_popup.continue", "Davam et")}
          </button>
          <Link to="/cart" className="cap-btn cap-btn-filled" onClick={dismiss}>
            {t("cart_popup.go_cart", "Səbətə get")}
          </Link>
        </div>

        <div
          key={progressKey.current}
          className={`cap-progress${phase === "visible" ? " running" : ""}`}
        />
      </div>
    </>
  );
}
