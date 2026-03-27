
export default function WhyUsSection({ t }) {
  const items = t("why_us.items", { returnObjects: true });

  return (
    <section className="hp-sec" id="why-us">
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <div className="hp-ey center">{t("why_us.eyebrow")}</div>
        <h2 className="hp-h2">
          {t("why_us.title")} <em>{t("why_us.title_em")}</em>
        </h2>
      </div>

      <div className="hp-why-grid">
        {Array.isArray(items) && items.map((item, i) => (
          <div key={i} className="hp-why-card">
            <div className="hp-why-ic"><img src={item.icon} alt="" /></div>
            <h3 className="hp-why-t">{item.title}</h3>
            <p className="hp-why-d">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
