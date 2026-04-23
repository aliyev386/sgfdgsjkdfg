import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

const WA_SVG = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M11.99 2C6.476 2 2 6.477 2 11.99c0 1.982.567 3.83 1.547 5.395L2 22l4.718-1.535A9.953 9.953 0 0011.99 22C17.504 22 22 17.522 22 12.01 22 6.497 17.504 2 11.99 2zm0 18.058c-1.74 0-3.36-.476-4.748-1.302l-.34-.202-3.524 1.146 1.175-3.413-.222-.35A8.044 8.044 0 013.95 11.99c0-4.444 3.596-8.06 8.04-8.06 4.443 0 8.06 3.616 8.06 8.06 0 4.443-3.617 8.068-8.06 8.068z"/>
  </svg>
);

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const STYLE_ICONS = ["◻", "◆", "○", "✦"];

function CustomDesignSection({ t }) {
  const [ref, visible] = useReveal();
  const steps = ["step1", "step2", "step3"];
  const styles = ["style1", "style2", "style3", "style4"];

  return (
    <section className={`atl-wrap ${visible ? "atl-in" : ""}`} ref={ref}>

      {/* subtle dot grid */}
      <div className="atl-dots" aria-hidden="true" />

      {/* giant ghost index */}
      <span className="atl-ghost-num" aria-hidden="true">01</span>

      {/* ── top meta bar ── */}
      <div className="atl-meta">
        <span className="atl-meta-tag">{t("custom_design.tag")}</span>
        <div className="atl-meta-rule" />
        <span className="atl-meta-idx">01 / 02</span>
      </div>

      {/* ── hero headline ── */}
      <div className="atl-hero">
        <h2 className="atl-h">
          <span className="atl-h-thin">{t("custom_design.title")}</span>
          {" "}
          <em className="atl-h-em">{t("custom_design.title_em")}</em>
        </h2>
        <div className="atl-h-accent" aria-hidden="true" />
      </div>

      {/* ── content row ── */}
      <div className="atl-body">

        {/* left: description + cta */}
        <div className="atl-desc-col">
          <p className="atl-desc">{t("custom_design.desc")}</p>
          <div className="atl-cta-row">
            <Link to="/contact" className="atl-btn-primary">
              {t("custom_design.btn_main")} {ARROW}
            </Link>
            <a
              href="https://wa.me/994551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="atl-btn-wa"
            >
              {WA_SVG}
              {t("custom_design.btn_whatsapp")}
            </a>
          </div>
        </div>

        {/* right: style cards */}
        <div className="atl-styles">
          {styles.map((s, i) => (
            <div className="atl-style-card" key={s}>
              <span className="atl-style-icon">{STYLE_ICONS[i]}</span>
              <span className="atl-style-name">{t(`custom_design.${s}`)}</span>
              <span className="atl-style-arrow">→</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── horizontal process steps ── */}
      <div className="atl-process">
        <div className="atl-process-label">{t("custom_design.process_label")}</div>
        <div className="atl-steps">
          {steps.map((key, i) => (
            <div className="atl-step" key={key} style={{ transitionDelay: `${0.15 + i * 0.12}s` }}>
              <span className="atl-step-ghost">{String(i + 1).padStart(2, "0")}</span>
              <div className="atl-step-top">
                <span className="atl-step-num">{String(i + 1).padStart(2, "0")}</span>
                <div className="atl-step-divider" />
              </div>
              <strong className="atl-step-title">{t(`custom_design.${key}_title`)}</strong>
              <p className="atl-step-desc">{t(`custom_design.${key}_desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── promise bar ── */}
      <div className="atl-promise">
        <span className="atl-promise-star">★</span>
        <span>{t("custom_design.promise")}</span>
      </div>

    </section>
  );
}

function RestorationSection({ t }) {
  const [ref, visible] = useReveal();
  const features = ["feat1","feat2","feat3","feat4"];

  return (
    <section className="rst-wrap" ref={ref}>
      <div className="rst-badge">{t("restoration.badge")}</div>
      <div className="rst-inner">
        <div className={`rst-content ${visible ? "rst-anim-r" : ""}`}>
          <span className="rst-eyebrow">{t("restoration.eyebrow")}</span>
          <h2 className="rst-h">
            {t("restoration.title")}<br />
            <em>{t("restoration.title_em")}</em>
          </h2>
          <p className="rst-desc">{t("restoration.desc")}</p>
          <ul className="rst-features">
            {features.map(f => (
              <li className="rst-feat" key={f}>
                <span className="rst-feat-dot"/>
                {t(`restoration.${f}`)}
              </li>
            ))}
          </ul>
          <div className="rst-actions">
          <Link to="/contact" className="rst-btn">
            {t("restoration.btn")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a
            href="https://wa.me/994551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="rst-btn-wa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.476 2 2 6.477 2 11.99c0 1.982.567 3.83 1.547 5.395L2 22l4.718-1.535A9.953 9.953 0 0011.99 22C17.504 22 22 17.522 22 12.01 22 6.497 17.504 2 11.99 2zm0 18.058c-1.74 0-3.36-.476-4.748-1.302l-.34-.202-3.524 1.146 1.175-3.413-.222-.35A8.044 8.044 0 013.95 11.99c0-4.444 3.596-8.06 8.04-8.06 4.443 0 8.06 3.616 8.06 8.06 0 4.443-3.617 8.068-8.06 8.068z"/></svg>
            {t("restoration.btn_whatsapp")}
          </a>
          </div>
          <p className="rst-note">{t("restoration.note")}</p>
        </div>
        <div className="refactor-img">
          <div ><img src="/images/Media.jpg" alt="" /></div>
        </div>
      </div>

      <div className="rst-bg-circle rst-bg-c1" aria-hidden="true"/>
      <div className="rst-bg-circle rst-bg-c2" aria-hidden="true"/>
    </section>
  );
}

export default function CTABanner({ t }) {
  return (
    <>
      <CustomDesignSection t={t} />
      <RestorationSection t={t} />
    </>
  );
}
