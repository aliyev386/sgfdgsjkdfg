import { useEffect } from "react";

export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const query = () => {
      const els = document.querySelectorAll(".rv:not(.visible), .rv-l:not(.visible)");
      if (!els.length) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach(el => obs.observe(el));
      return obs;
    };

    const obs1 = query();
    const t = setTimeout(() => { query(); }, 300);

    return () => {
      obs1?.disconnect();
      clearTimeout(t);
    };
  }, deps);
}
