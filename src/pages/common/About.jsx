import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

function Counter({ to, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p    = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setVal(Math.round(ease * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add("ab-visible"), +delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -48px 0px" });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

[data-reveal] { opacity:0; transform:translateY(32px); transition:opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1) }
[data-reveal="left"]  { transform:translateX(-32px) }
[data-reveal="right"] { transform:translateX(32px) }
[data-reveal="scale"] { transform:scale(.92) }
.ab-visible { opacity:1 !important; transform:none !important }

.ab { font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff; overflow-x:hidden }

.ab-hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; position:relative; overflow:hidden; padding-top:80px }
.ab-hero-left { background:#F7F3EE; display:flex; flex-direction:column; justify-content:center; padding:100px 80px; position:relative; z-index:2 }
.ab-hero-right { position:relative; overflow:hidden }
.ab-hero-right img { width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.05); animation:abHeroZoom 1.4s cubic-bezier(.25,.46,.45,.94) forwards }
@keyframes abHeroZoom { to { transform:scale(1) } }
.ab-hero-right-ov { position:absolute; inset:0; background:linear-gradient(to right,rgba(247,243,238,.3) 0%,transparent 40%); z-index:1 }

.ab-hero-card { position:absolute; bottom:60px; left:-40px; background:#1C1C1C; color:#fff; padding:28px 32px; z-index:3; animation:abCardIn 1s cubic-bezier(.22,1,.36,1) .6s both; min-width:260px }
@keyframes abCardIn { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
.ab-hero-card-val { font-family:'Cormorant Garamond',serif; font-size:48px; font-weight:300; line-height:1; margin-bottom:4px }
.ab-hero-card-lbl { font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,.5) }

.ab-eyebrow { font-size:11px; letter-spacing:3.5px; text-transform:uppercase; color:#7A9E7E; font-weight:500; display:flex; align-items:center; gap:12px; margin-bottom:20px; animation:abFadeUp .8s ease .2s both }
.ab-eyebrow::before { content:''; display:block; width:28px; height:1px; background:#7A9E7E }
.ab-hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(44px,5vw,72px); font-weight:300; line-height:1.08; margin:0 0 24px; animation:abFadeUp .8s ease .35s both }
.ab-hero-h1 em { font-style:italic; color:#7A9E7E }
.ab-hero-sub { font-size:15px; color:#6B6B6B; line-height:1.9; max-width:400px; margin-bottom:44px; font-weight:300; animation:abFadeUp .8s ease .5s both }
.ab-hero-cta { display:flex; align-items:center; gap:24px; animation:abFadeUp .8s ease .65s both }
.ab-vert-text { position:absolute; left:-16px; top:50%; transform:translateY(-50%) rotate(-90deg); font-size:10px; letter-spacing:4px; text-transform:uppercase; color:#C0B5AA; white-space:nowrap; transform-origin:center center; animation:abFadeIn 1s ease 1s both }
@keyframes abFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes abFadeIn { from{opacity:0} to{opacity:1} }

.ab-stats { background:#1C1C1C; display:grid; grid-template-columns:repeat(4,1fr) }
.ab-stat { padding:48px 40px; border-right:1px solid rgba(255,255,255,.07); transition:background .3s }
.ab-stat:hover { background:rgba(122,158,126,.12) }
.ab-stat:last-child { border-right:none }
.ab-stat-val { font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:#fff; line-height:1; margin-bottom:8px }
.ab-stat-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.35) }
.ab-stat-sep { width:24px; height:1px; background:#7A9E7E; margin-bottom:12px }

.ab-story { display:grid; grid-template-columns:1fr 1fr; min-height:700px; overflow:hidden }
.ab-story-img-wrap { position:relative; overflow:hidden }
.ab-story-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .8s cubic-bezier(.25,.46,.45,.94) }
.ab-story-img-wrap:hover .ab-story-img { transform:scale(1.04) }
.ab-story-img-badge { position:absolute; top:40px; right:40px; background:#7A9E7E; color:#fff; padding:16px 22px; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; line-height:1.6; font-family:'DM Sans',sans-serif }
.ab-story-text { background:#F7F3EE; display:flex; flex-direction:column; justify-content:center; padding:100px 80px }
.ab-story-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,4vw,54px); font-weight:300; line-height:1.12; margin:0 0 28px }
.ab-story-h2 em { font-style:italic; color:#7A9E7E }
.ab-story-p { font-size:15px; color:#6B6B6B; line-height:1.9; margin-bottom:18px; font-weight:300 }
.ab-story-quote { border-left:3px solid #7A9E7E; padding:16px 24px; margin:28px 0; font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:300; font-style:italic; color:#1C1C1C; line-height:1.5; background:rgba(122,158,126,.06) }

.ab-values { background:#1A2420; padding:120px 80px; position:relative; overflow:hidden }
.ab-values::before { content:'AMORE'; position:absolute; font-family:'Cormorant Garamond',serif; font-size:260px; font-weight:600; color:rgba(255,255,255,.025); top:50%; left:50%; transform:translate(-50%,-50%); letter-spacing:20px; pointer-events:none; user-select:none; white-space:nowrap }
.ab-values-head { text-align:center; margin-bottom:72px }
.ab-values-ey { font-size:11px; letter-spacing:3.5px; text-transform:uppercase; color:#7A9E7E; font-weight:500; margin-bottom:16px }
.ab-values-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,4vw,54px); font-weight:300; color:#fff; line-height:1.1 }
.ab-values-h2 em { font-style:italic; color:#C8DBC9 }
.ab-values-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; max-width:1040px; margin:0 auto }
.ab-val-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); padding:52px 48px; display:flex; gap:28px; transition:background .4s,border-color .4s,transform .4s; cursor:default }
.ab-val-card:hover { background:rgba(122,158,126,.1); border-color:rgba(122,158,126,.3); transform:translateY(-4px) }
.ab-val-left { flex-shrink:0 }
.ab-val-num { font-family:'Cormorant Garamond',serif; font-size:13px; color:#7A9E7E; letter-spacing:1px; margin-bottom:16px }
.ab-val-icon svg { width:40px; height:40px; color:rgba(255,255,255,.4); transition:color .35s }
.ab-val-card:hover .ab-val-icon svg { color:#7A9E7E }
.ab-val-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:300; color:#fff; margin:0 0 12px }
.ab-val-desc { font-size:13px; color:rgba(255,255,255,.45); line-height:1.8 }

@media(max-width:1100px){ .ab-values-grid { grid-template-columns:1fr } }
@media(max-width:900px){
  .ab-hero { grid-template-columns:1fr; min-height:auto }
  .ab-hero-right { height:55vw; min-height:320px }
  .ab-hero-left { padding:60px 28px 48px }
  .ab-hero-card { left:20px; bottom:24px }
  .ab-story { grid-template-columns:1fr }
  .ab-story-text { padding:60px 28px }
  .ab-stats { grid-template-columns:repeat(2,1fr) }
  .ab-values { padding-left:28px; padding-right:28px }
}
@media(max-width:560px){
  .ab-hero-h1 { font-size:38px }
  .ab-stat-val { font-size:38px }
  .ab-stats { grid-template-columns:1fr 1fr }
}
`;

export default function AboutPage() {
  const { t } = useTranslation();

  useReveal();

  const VALUES = [
    {
      n: "01",
      title: t("about.val1_title"),
      desc:  t("about.val1_desc"),
      icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 4c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4z"/><path d="M14 20l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      n: "02",
      title: t("about.val2_title"),
      desc:  t("about.val2_desc"),
      icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 6c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S27.7 6 20 6z"/><path d="M15 20c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5" strokeLinecap="round"/><path d="M20 10v4M20 26v4M10 20h4M26 20h4" strokeLinecap="round"/></svg>,
    },
    {
      n: "03",
      title: t("about.val3_title"),
      desc:  t("about.val3_desc"),
      icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="20" cy="14" r="6"/><path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" strokeLinecap="round"/></svg>,
    },
    {
      n: "04",
      title: t("about.val4_title"),
      desc:  t("about.val4_desc"),
      icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 4L6 10v12c0 8.3 6.1 16 14 18 7.9-2 14-9.7 14-18V10L20 4z" strokeLinejoin="round"/><path d="M14 20l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ab">
        <Navbar />

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="ab-hero">
          <div className="ab-hero-left">
            <p className="ab-eyebrow">{t("about.eyebrow")}</p>
            <h1 className="ab-hero-h1">
              {t("about.hero_h1_pre")}<br />
              <em>{t("about.hero_h1_em")}</em><br />
              {t("about.hero_h1_post")}
            </h1>
            <p className="ab-hero-sub">{t("about.hero_sub")}</p>
            <div className="ab-hero-cta">
              <Link to="/categories" className="btn-dark">
                {t("about.hero_cta_primary")}
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/contact" className="btn-ghost">{t("about.hero_cta_secondary")}</Link>
            </div>
            <span className="ab-vert-text">AMORE MEBEL · BAKU</span>
          </div>

          <div className="ab-hero-right">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=85"
              alt="Amore Mebel atelier"
              loading="eager"
            />
            <div className="ab-hero-right-ov" />
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="ab-stats">
          {[
            { val: 40000, suffix: "+",  label: t("about.stat_homes") },
            { val: 14,    suffix: " il", label: t("about.stat_years") },
            { val: 98,    suffix: "%",  label: t("about.stat_satisfaction") },
            { val: 12,    suffix: "",   label: t("about.stat_brands") },
          ].map((s, i) => (
            <div key={i} className="ab-stat" data-reveal data-delay={i * 80}>
              <div className="ab-stat-sep" />
              <div className="ab-stat-val">
                <Counter to={s.val} suffix={s.suffix} duration={2000} />
              </div>
              <div className="ab-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Our Story ──────────────────────────────────────────── */}
        <section className="ab-story">
          <div className="ab-story-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=85"
              alt="Workshop"
              className="ab-story-img"
              loading="lazy"
            />
            <div className="ab-story-img-badge">{t("about.story_badge")}</div>
          </div>

          <div className="ab-story-text">
            <p className="ab-eyebrow" data-reveal data-delay="0">{t("about.story_eyebrow")}</p>
            <h2 className="ab-story-h2" data-reveal data-delay="80">
              {t("about.story_h2_pre")} <em>{t("about.story_h2_em")}</em><br />
              {t("about.story_h2_post")}
            </h2>
            <p className="ab-story-p" data-reveal data-delay="160">
              {t("about.story_p1")} <strong>{t("about.story_p1_strong")}</strong>
            </p>
            <blockquote className="ab-story-quote" data-reveal data-delay="220">
              {t("about.story_quote")}
              <footer style={{ marginTop: 12, fontSize: 12, color: "#6B6B6B", fontStyle: "normal", letterSpacing: 1 }}>
                {t("about.story_quote_author")}
              </footer>
            </blockquote>
            <p className="ab-story-p" data-reveal data-delay="280">
              {t("about.story_p2")}
            </p>
          </div>
        </section>

        {/* ── Values ─────────────────────────────────────────────── */}
        <section className="ab-values">
          <div className="ab-values-head" data-reveal>
            <p className="ab-values-ey">{t("about.values_eyebrow")}</p>
            <h2 className="ab-values-h2">
              {t("about.values_h2_pre")} <em>{t("about.values_h2_em")}</em>
            </h2>
          </div>
          <div className="ab-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="ab-val-card" data-reveal data-delay={i * 100}>
                <div className="ab-val-left">
                  <p className="ab-val-num">{v.n}</p>
                  <div className="ab-val-icon">{v.icon}</div>
                </div>
                <div>
                  <h3 className="ab-val-title">{v.title}</h3>
                  <p className="ab-val-desc">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
