import { useEffect, useState } from "react";

const SLIDE_DURATION = 6000; // ms

function HeroSlider({ slides, t }) {
  const [current,   setCurrent]   = useState(0);
  const [paused,    setPaused]    = useState(false);
  const intervalRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length < 2) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="hp-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — DB'dən gəlir, heading/subheading TƏRCÜMƏ OLUNMUR */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="hp-slide"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex:  i === current ? 2 : 1,
            transition: "opacity .8s ease",
            position: "absolute",
            inset: 0,
          }}
          aria-hidden={i !== current}
        >
          <div className="hp-slide-bg" style={{ backgroundImage:`url(${slide.image})` }} />
          <div className="hp-slide-ov" />
        </div>
      ))}

      {/* Content — badge/CTA i18n, heading DB-dən */}
      <div className="hp-hero-ct" style={{ position:"relative", zIndex:10 }}>
        <div className="hp-badge">{t("hero.badge")}</div>
        {/* DB-dən gəlir — tərcümə edilmir */}
        <h1 className="hp-h1">{slides[current]?.heading}</h1>
        <p className="hp-sub">{slides[current]?.subheading}</p>
        <div className="hp-cta-row">
          <Link to="/shop" className="btn-dark">
            {t("hero.cta_primary")} →
          </Link>
          <Link to="/about" className="btn-ghost">
            {t("hero.cta_secondary")}
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button className="hp-arrow prev" onClick={() => goTo(current - 1)} aria-label="Previous slide">←</button>
          <button className="hp-arrow next" onClick={() => goTo(current + 1)} aria-label="Next slide">→</button>
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

export default HeroSlider