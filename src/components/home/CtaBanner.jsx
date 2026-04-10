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

function CustomDesignSection({ t }) {
  const [ref, visible] = useReveal();
  const steps = [
    { icon: "✦", key: "step1" },
    { icon: "◈", key: "step2" },
    { icon: "⬡", key: "step3" },
  ];
  return (
    <section className="cdb-wrap" ref={ref}>
      <div className={`cdb-left ${visible ? "cdb-anim" : ""}`}>
        <span className="cdb-tag">{t("custom_design.tag")}</span>
        <h2 className="cdb-h">
          {t("custom_design.title")}<br />
          <em>{t("custom_design.title_em")}</em>
        </h2>
        <p className="cdb-desc">{t("custom_design.desc")}</p>
        <div className="cdb-pills">
          {["style1","style2","style3","style4"].map(s => (
            <span className="cdb-pill" key={s}>{t(`custom_design.${s}`)}</span>
          ))}
        </div>
        <div className="cdb-acts">
          <Link to="/contact" className="cdb-btn-main">
            {t("custom_design.btn_main")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="tel:+994551234567" className="cdb-btn-call">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            {t("custom_design.btn_call")}
          </a>
        </div>
      </div>

      <div className={`cdb-right ${visible ? "cdb-anim-r" : ""}`}>
        <div className="cdb-process-label">{t("custom_design.process_label")}</div>
        <div className="cdb-steps">
          {steps.map((s, i) => (
            <div className="cdb-step" key={s.key} style={{ animationDelay: `${0.1 + i * 0.14}s` }}>
              <div className="cdb-step-num">{String(i+1).padStart(2,"0")}</div>
              <div className="cdb-step-icon">{s.icon}</div>
              <div className="cdb-step-body">
                <strong>{t(`custom_design.${s.key}_title`)}</strong>
                <span>{t(`custom_design.${s.key}_desc`)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="cdb-promise">
          <span className="cdb-promise-icon">★</span>
          {t("custom_design.promise")}
        </div>
        <div className="cdb-grid-deco" aria-hidden="true">
          {Array.from({length:5}).map((_,i) => <div key={i} className="cdb-grid-line"/>)}
        </div>
      </div>

      <div className="cdb-slash" aria-hidden="true"/>
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
          <Link to="/contact" className="rst-btn">
            {t("restoration.btn")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p className="rst-note">{t("restoration.note")}</p>
        </div>
        <div>
          <div><img src="" alt="" /></div>
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
