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
          const p = Math.min((now - start) / duration, 1);
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

const TIMELINE = [
  { year: "2011", title: "Əsas qoyuldu", desc: "Bakıda kiçik emalatxanada ilk əl işi mebel parçaları yaradıldı." },
  { year: "2014", title: "İlk mağaza", desc: "Nərimanov rayonunda ilk showroom açıldı. 200-dən çox müştəri." },
  { year: "2017", title: "Beynəlxalq materiallar", desc: "İtaliya, İspaniya və Türkiyədən premium material təchizatı başladı." },
  { year: "2020", title: "Online platform", desc: "Pandemiya dövründə rəqəmsal transformasiya — 10,000+ onlayn müştəri." },
  { year: "2023", title: "Amore Mebel 2.0", desc: "Yeni brendinq, yeni kolleksiyalar, yeni dizayn filosofiyası." },
  { year: "2025", title: "14 il, 40,000+ ev", desc: "Azərbaycanda ən çox seçilən mebel brendlərindən birinə çevrildik." },
];

const TEAM = [
  { name: "Əli Həsənov",   role: "Baş Dizayner",        img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", quote: "Hər parça bir hekayə anladır." },
  { name: "Gülnar Rəhimli", role: "Kreativ Direktor",    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80", quote: "Dizayn həyatı gözəlləşdirir." },
  { name: "Murad Əliyev",   role: "Baş Sənətkar",        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", quote: "14 illik əl işçiliyi." },
  { name: "Leyla Quliyeva", role: "Müştəri Təcrübəsi",   img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", quote: "Hər müştəri bir ailə üzvüdür." },
];

const VALUES = [
  { n: "01", title: "Sənətkarlıq",   desc: "Hər parçaya onlarca saat zəhmət və diqqət ayrılır. Maşın sürəti deyil, insan əli.",  icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 4c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4z"/><path d="M14 20l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { n: "02", title: "Davamlılıq",    desc: "FSC sertifikatlı materiallar, az israf, uzun ömür. Gələcəyə cavabdehliyimiz.",        icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 6c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14S27.7 6 20 6z"/><path d="M15 20c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5" strokeLinecap="round"/><path d="M20 10v4M20 26v4M10 20h4M26 20h4" strokeLinecap="round"/></svg> },
  { n: "03", title: "Fərdilik",      desc: "Standart ölçülər deyil. Sizi dinləyir, sizin üçün dizayn edirik.",                    icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="20" cy="14" r="6"/><path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" strokeLinecap="round"/></svg> },
  { n: "04", title: "Zəmanət",       desc: "10 illik konstruktiv zəmanət. Əgər problem varsa — biz həll edirik.",                 icon: <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M20 4L6 10v12c0 8.3 6.1 16 14 18 7.9-2 14-9.7 14-18V10L20 4z" strokeLinejoin="round"/><path d="M14 20l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

[data-reveal] { opacity:0; transform:translateY(32px); transition:opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1) }
[data-reveal="left"]  { transform:translateX(-32px) }
[data-reveal="right"] { transform:translateX(32px) }
[data-reveal="scale"] { transform:scale(.92) }
.ab-visible { opacity:1 !important; transform:none !important }

.ab { font-family:'DM Sans',sans-serif; color:#1C1C1C; background:#fff; overflow-x:hidden }

.ab-hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}
.ab-hero-left {
  background: #F7F3EE;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 80px 100px 80px;
  position: relative;
  z-index: 2;
}
.ab-hero-right {
  position: relative;
  overflow: hidden;
}
.ab-hero-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.05);
  animation: abHeroZoom 1.4s cubic-bezier(.25,.46,.45,.94) forwards;
}
@keyframes abHeroZoom { to { transform:scale(1) } }
.ab-hero-right-ov {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(247,243,238,.3) 0%, transparent 40%);
  z-index: 1;
}

.ab-hero-card {
  position: absolute;
  bottom: 60px;
  left: -40px;
  background: #1C1C1C;
  color: #fff;
  padding: 28px 32px;
  z-index: 3;
  animation: abCardIn 1s cubic-bezier(.22,1,.36,1) .6s both;
  min-width: 260px;
}
@keyframes abCardIn { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
.ab-hero-card-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 4px;
}
.ab-hero-card-lbl {
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
}

.ab-eyebrow {
  font-size: 11px;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: #7A9E7E;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  animation: abFadeUp .8s ease .2s both;
}
.ab-eyebrow::before { content:''; display:block; width:28px; height:1px; background:#7A9E7E }
.ab-hero-h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(44px, 5vw, 72px);
  font-weight: 300;
  line-height: 1.08;
  margin: 0 0 24px;
  animation: abFadeUp .8s ease .35s both;
}
.ab-hero-h1 em { font-style: italic; color: #7A9E7E }
.ab-hero-sub {
  font-size: 15px;
  color: #6B6B6B;
  line-height: 1.9;
  max-width: 400px;
  margin-bottom: 44px;
  font-weight: 300;
  animation: abFadeUp .8s ease .5s both;
}
.ab-hero-cta {
  display: flex;
  align-items: center;
  gap: 24px;
  animation: abFadeUp .8s ease .65s both;
}

.ab-vert-text {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #C0B5AA;
  white-space: nowrap;
  transform-origin: center center;
  animation: abFadeIn 1s ease 1s both;
}
@keyframes abFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes abFadeIn { from{opacity:0} to{opacity:1} }

.ab-stats {
  background: #1C1C1C;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.ab-stat {
  padding: 48px 40px;
  border-right: 1px solid rgba(255,255,255,.07);
  transition: background .3s;
}
.ab-stat:hover { background: rgba(122,158,126,.12) }
.ab-stat:last-child { border-right: none }
.ab-stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 52px;
  font-weight: 300;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
}
.ab-stat-lbl {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,.35);
}
.ab-stat-sep {
  width: 24px;
  height: 1px;
  background: #7A9E7E;
  margin-bottom: 12px;
}

.ab-story {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 700px;
  overflow: hidden;
}
.ab-story-img-wrap {
  position: relative;
  overflow: hidden;
}
.ab-story-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .8s cubic-bezier(.25,.46,.45,.94);
}
.ab-story-img-wrap:hover .ab-story-img { transform: scale(1.04) }
.ab-story-img-badge {
  position: absolute;
  top: 40px;
  right: 40px;
  background: #7A9E7E;
  color: #fff;
  padding: 16px 22px;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  line-height: 1.6;
  font-family: 'DM Sans', sans-serif;
}
.ab-story-text {
  background: #F7F3EE;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 80px;
}
.ab-story-h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4vw, 54px);
  font-weight: 300;
  line-height: 1.12;
  margin: 0 0 28px;
}
.ab-story-h2 em { font-style: italic; color: #7A9E7E }
.ab-story-p {
  font-size: 15px;
  color: #6B6B6B;
  line-height: 1.9;
  margin-bottom: 18px;
  font-weight: 300;
}
.ab-story-quote {
  border-left: 3px solid #7A9E7E;
  padding: 16px 24px;
  margin: 28px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 300;
  font-style: italic;
  color: #1C1C1C;
  line-height: 1.5;
  background: rgba(122,158,126,.06);
}

.ab-values {
  background: #1A2420;
  padding: 120px 80px;
  position: relative;
  overflow: hidden;
}
.ab-values::before {
  content: 'AMORE';
  position: absolute;
  font-family: 'Cormorant Garamond', serif;
  font-size: 260px;
  font-weight: 600;
  color: rgba(255,255,255,.025);
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  letter-spacing: 20px;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.ab-values-head {
  text-align: center;
  margin-bottom: 72px;
}
.ab-values-ey {
  font-size: 11px;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: #7A9E7E;
  font-weight: 500;
  margin-bottom: 16px;
}
.ab-values-h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4vw, 54px);
  font-weight: 300;
  color: #fff;
  line-height: 1.1;
}
.ab-values-h2 em { font-style: italic; color: #C8DBC9 }
.ab-values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  max-width: 1040px;
  margin: 0 auto;
}
.ab-val-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  padding: 52px 48px;
  display: flex;
  gap: 28px;
  transition: background .4s, border-color .4s, transform .4s;
  cursor: default;
}
.ab-val-card:hover {
  background: rgba(122,158,126,.1);
  border-color: rgba(122,158,126,.3);
  transform: translateY(-4px);
}
.ab-val-left { flex-shrink: 0 }
.ab-val-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  color: #7A9E7E;
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.ab-val-icon svg { width:40px; height:40px; color:rgba(255,255,255,.4); transition:color .35s }
.ab-val-card:hover .ab-val-icon svg { color:#7A9E7E }
.ab-val-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 300;
  color: #fff;
  margin: 0 0 12px;
}
.ab-val-desc {
  font-size: 13px;
  color: rgba(255,255,255,.45);
  line-height: 1.8;
}

.ab-timeline-sec {
  padding: 120px 80px;
  background: #fff;
}
.ab-timeline-head {
  max-width: 560px;
  margin-bottom: 80px;
}
.ab-timeline {
  position: relative;
  max-width: 900px;
}
.ab-tl-line {
  position: absolute;
  left: 72px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #E5DDD4 10%, #E5DDD4 90%, transparent);
}
.ab-tl-line-fill {
  position: absolute;
  left: 72px;
  top: 0;
  width: 1px;
  background: #7A9E7E;
  transition: height 1.2s cubic-bezier(.22,1,.36,1);
}
.ab-tl-item {
  display: grid;
  grid-template-columns: 144px 1fr;
  gap: 40px;
  margin-bottom: 0;
  padding: 36px 0;
  border-bottom: 1px solid #F0EBE3;
  align-items: start;
  position: relative;
}
.ab-tl-item:last-child { border-bottom: none }
.ab-tl-year-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 4px;
}
.ab-tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E5DDD4;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #E5DDD4;
  flex-shrink: 0;
  transition: background .4s, box-shadow .4s;
  margin-left: -5px;
}
.ab-tl-item.ab-visible .ab-tl-dot {
  background: #7A9E7E;
  box-shadow: 0 0 0 4px rgba(122,158,126,.2);
}
.ab-tl-year {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 300;
  color: #C0B5AA;
  transition: color .4s;
  white-space: nowrap;
}
.ab-tl-item.ab-visible .ab-tl-year { color: #1C1C1C }
.ab-tl-content { padding-top: 4px }
.ab-tl-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 400;
  color: #1C1C1C;
  margin-bottom: 8px;
}
.ab-tl-desc { font-size: 13px; color: #6B6B6B; line-height: 1.8 }

.ab-atelier {
  position: relative;
  height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.ab-atelier-img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 8s ease;
}
.ab-atelier:hover .ab-atelier-img { transform: scale(1.04) }
.ab-atelier-ov {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, rgba(28,28,28,.78) 0%, rgba(28,28,28,.4) 60%, rgba(28,28,28,.1) 100%);
}
.ab-atelier-ct {
  position: relative;
  z-index: 2;
  padding: 0 80px;
  max-width: 680px;
}
.ab-atelier-ey {
  font-size: 11px;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.55);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.ab-atelier-ey::before { content:''; display:block; width:28px; height:1px; background:rgba(255,255,255,.4) }
.ab-atelier-h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4.5vw, 60px);
  font-weight: 300;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 20px;
}
.ab-atelier-h2 em { font-style: italic; color: #C8DBC9 }
.ab-atelier-p { font-size: 15px; color: rgba(255,255,255,.6); line-height: 1.8; margin-bottom: 36px; max-width: 460px }
.ab-atelier-chips { display:flex; gap:12px; flex-wrap:wrap }
.ab-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 8px 16px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: 'DM Sans', sans-serif;
  transition: background .25s, border-color .25s;
}
.ab-chip:hover { background: rgba(122,158,126,.35); border-color: rgba(122,158,126,.6) }
.ab-chip svg { width:12px; height:12px; color:#7A9E7E; flex-shrink:0 }

.ab-team-sec {
  padding: 120px 80px;
  background: #F7F3EE;
}
.ab-team-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 60px;
}
.ab-team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.ab-team-card {
  background: #fff;
  border: 1px solid #E5DDD4;
  overflow: hidden;
  transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s;
}
.ab-team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 56px rgba(28,28,28,.1);
}
.ab-team-img-wrap {
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
  background: #EDE7DC;
}
.ab-team-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .6s cubic-bezier(.25,.46,.45,.94);
  filter: grayscale(20%);
}
.ab-team-card:hover .ab-team-img { transform: scale(1.06); filter: grayscale(0%) }
.ab-team-quote {
  position: absolute;
  inset: 0;
  background: rgba(28,28,28,.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  transition: opacity .4s;
}
.ab-team-card:hover .ab-team-quote { opacity: 1 }
.ab-team-quote p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 300;
  font-style: italic;
  color: #fff;
  text-align: center;
  line-height: 1.6;
}
.ab-team-body { padding: 20px 20px 22px }
.ab-team-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 400;
  color: #1C1C1C;
  margin: 0 0 4px;
}
.ab-team-role {
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #7A9E7E;
}

.ab-process {
  padding: 120px 80px;
  background: #fff;
}
.ab-process-head { text-align:center; margin-bottom:72px }
.ab-process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
}
.ab-process-grid::before {
  content: '';
  position: absolute;
  top: 28px;
  left: calc(50% / 3 + 16.66%);
  right: calc(50% / 3 + 16.66%);
  height: 1px;
  background: linear-gradient(to right, #E5DDD4, #C8DBC9, #E5DDD4);
}
.ab-proc-step { text-align:center; padding: 0 40px }
.ab-proc-num {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F7F3EE;
  border: 1.5px solid #E5DDD4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 300;
  color: #1C1C1C;
  transition: background .35s, border-color .35s, color .35s, transform .35s;
}
.ab-proc-step:hover .ab-proc-num {
  background: #7A9E7E;
  border-color: #7A9E7E;
  color: #fff;
  transform: scale(1.12);
}
.ab-proc-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 12px;
}
.ab-proc-desc { font-size: 13px; color: #6B6B6B; line-height: 1.8; max-width: 260px; margin: 0 auto }

.ab-cta {
  background: linear-gradient(135deg, #1C1C1C 0%, #2D3A2E 100%);
  padding: 100px 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  position: relative;
  overflow: hidden;
}
.ab-cta::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(122,158,126,.15) 0%, transparent 70%);
  pointer-events: none;
}
.ab-cta-text { flex: 1 }
.ab-cta-ey {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(122,158,126,.8);
  margin-bottom: 16px;
}
.ab-cta-h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 300;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 12px;
}
.ab-cta-h2 em { font-style:italic; color:#C8DBC9 }
.ab-cta-sub { font-size: 14px; color: rgba(255,255,255,.45); max-width: 360px; line-height: 1.7 }
.ab-cta-btns { display:flex; gap:16px; align-items:center; flex-shrink:0 }

@media(max-width:1100px){
  .ab-team-grid { grid-template-columns: repeat(2,1fr) }
  .ab-values-grid { grid-template-columns: 1fr }
}
@media(max-width:900px){
  .ab-hero { grid-template-columns:1fr; min-height:auto }
  .ab-hero-right { height: 55vw; min-height:320px }
  .ab-hero-left { padding:60px 28px 48px }
  .ab-hero-card { left:20px; bottom:24px }
  .ab-story { grid-template-columns:1fr }
  .ab-story-text { padding:60px 28px }
  .ab-stats { grid-template-columns: repeat(2,1fr) }
  .ab-timeline-sec, .ab-team-sec, .ab-process, .ab-values, .ab-atelier-ct { padding-left:28px; padding-right:28px }
  .ab-cta { flex-direction:column; gap:36px; padding:72px 28px }
  .ab-process-grid { grid-template-columns:1fr; gap:40px }
  .ab-process-grid::before { display:none }
  .ab-team-grid { grid-template-columns: repeat(2,1fr) }
  .ab-tl-item { grid-template-columns: 100px 1fr; gap:20px }
  .ab-tl-line, .ab-tl-line-fill { left:48px }
  .ab-tl-dot { margin-left:-5px }
}
@media(max-width:560px){
  .ab-hero-h1 { font-size:38px }
  .ab-team-grid { grid-template-columns:1fr }
  .ab-stat-val { font-size:38px }
  .ab-stats { grid-template-columns: 1fr 1fr }
}
`;

export default function AboutPage() {
  const { t } = useTranslation();
  const tlRef = useRef();
  const [tlProgress, setTlProgress] = useState(0);

  useEffect(() => {
    const el = tlRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vis = window.innerHeight - rect.top;
      const pct = Math.max(0, Math.min(1, vis / rect.height));
      setTlProgress(pct * 100);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  useReveal();

  return (
    <>
      <style>{STYLES}</style>

      <div className="ab">
        <Navbar />

        <section className="ab-hero">
          <div className="ab-hero-left">
            <p className="ab-eyebrow">{t("nav.story")}</p>
            <h1 className="ab-hero-h1">
              Mebeldə<br /><em>14 il</em><br />sənətkarlıq
            </h1>
            <p className="ab-hero-sub">
              Biz sadəcə mebel satmırıq. Hər parçaya bir hekayə, hər dizayna bir məna qatırıq. 
              2011-dən bəri Azərbaycanda 40,000-dən çox evi gözəlləşdirdik.
            </p>
            <div className="ab-hero-cta">
              <Link to="/categories" className="btn-dark">
                Kolleksiyaya bax
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/contact" className="btn-ghost">Əlaqə saxla</Link>
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

        <div className="ab-stats">
          {[
            { val: 40000, suffix: "+", label: "Xoşbəxt Ev" },
            { val: 14,    suffix: " il",label: "Sənətkarlıq" },
            { val: 98,    suffix: "%",  label: "Müştəri Məmnuniyyəti" },
            { val: 12,    suffix: "",   label: "Beynəlxalq Marka" },
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

        <section className="ab-story">
          <div className="ab-story-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=85"
              alt="Emalatxana"
              className="ab-story-img"
              loading="lazy"
            />
            <div className="ab-story-img-badge">
              Əl işi<br />sənətkarlıq
            </div>
          </div>
          <div className="ab-story-text">
            <p className="ab-eyebrow" data-reveal data-delay="0">{t("nav.story")}</p>
            <h2 className="ab-story-h2" data-reveal data-delay="80">
              Sadə bir <em>emalatxanadan</em><br />milli brende
            </h2>
            <p className="ab-story-p" data-reveal data-delay="160">
              2011-ci ildə Bakının bir küncündə kiçik emalatxanamız açıldı. 
              İlk parçamız sadə bir kitab rəfi idi — amma hər detal diqqətlə düşünülmüşdü. 
              O gündən bu günə qədər filosofiyamız dəyişmədi: <strong>keyfiyyətsiz heç nə çıxmır.</strong>
            </p>
            <blockquote className="ab-story-quote" data-reveal data-delay="220">
              "Mebel sadəcə ağac və parça deyil — o, ailənizin hər günkü həyatının fondudur."
              <footer style={{ marginTop:12, fontSize:12, color:"#6B6B6B", fontStyle:"normal", letterSpacing:1 }}>
                — Əli Həsənov, Baş Dizayner
              </footer>
            </blockquote>
            <p className="ab-story-p" data-reveal data-delay="280">
              Bu gün İtaliya meşəsindən gətirilən FSC sertifikatlı ağaclarla, 
              Türkiyə toxuculuğunun ən yaxşı parçaları ilə işləyirik. 
              Hər sifarişi ayrıca bir layihə kimi qarşılayırıq.
            </p>
          </div>
        </section>

        <section className="ab-values">
          <div className="ab-values-head" data-reveal>
            <p className="ab-values-ey">Nə üçün biz</p>
            <h2 className="ab-values-h2">Bizim <em>dəyərlərimiz</em></h2>
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