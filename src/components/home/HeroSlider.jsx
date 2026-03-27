import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const SLIDE_DURATION = 6000;

export default function HeroSlider({ slides = [], t }) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [paused, slides.length]);

  if (!slides.length) return <div style={{ height: "100vh", background: "#F7F3EE" }} />;

  return (
    <section
      className="hp-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            zIndex:  i === current ? 2 : 1,
            transition: "opacity .9s ease",
          }}
          aria-hidden={i !== current}
        >
          <div className="hp-slide-bg" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className="hp-slide-ov" />
        </div>
      ))}

      {/* Content — heading/subheading DB-dən gəlir, TƏRCÜMƏ OLUNMUR */}
      <div className="hp-hero-ct" style={{ position: "relative", zIndex: 10 }}>
        <div className="hp-badge">{t("hero.badge")}</div>
        <h1 className="hp-h1">{slides[current]?.heading}</h1>
        <p className="hp-sub">{slides[current]?.subheading}</p>
        <div className="hp-cta-row">
          <Link to="/shop"  className="btn-dark">{t("hero.cta_primary")} →</Link>
          <Link to="/about" className="btn-ghost">{t("hero.cta_secondary")}</Link>
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button className="hp-arrow prev" onClick={() => goTo(current - 1)} aria-label="Previous">←</button>
          <button className="hp-arrow next" onClick={() => goTo(current + 1)} aria-label="Next">→</button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="hp-dots" role="tablist">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hp-dot${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              role="tab"
              aria-selected={i === current}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div className="hp-scroll">
        <span>Scroll</span>
        <div className="hp-scroll-line" />
      </div>
    </section>
  );
}
