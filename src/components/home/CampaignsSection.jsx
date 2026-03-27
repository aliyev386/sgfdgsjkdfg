import { Link } from "react-router-dom";

const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString("az-AZ", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function CampaignsSection({ campaigns = [], t }) {
  return (
    <section className="hp-sec hp-cream" id="campaigns">
      <div className="hp-sec-head">
        <div>
          <div className="hp-ey">{t("campaigns.subtitle")}</div>
          <h2 className="hp-h2">{t("campaigns.title")}</h2>
        </div>
      </div>

      <div className="hp-camp-grid">
        {campaigns.map((camp, i) => (
          <Link
            key={camp.id}
            to={`/campaigns/${camp.slug}`}
            className="hp-camp-card"
            style={{ animationDelay: `${i * 0.1}s`, textDecoration: "none" }}
          >
            {/* DB-dən gəlir — TƏRCÜMƏ OLUNMUR */}
            <img className="hp-camp-img" src={camp.image} alt={camp.title} loading="lazy" />
            <div className="hp-camp-ov" />
            <div className="hp-camp-inf">
              {camp.discount_label && (
                <span className="hp-camp-badge" style={{ background: camp.color }}>
                  {camp.discount_label}
                </span>
              )}
              <h3 className="hp-camp-name">{camp.title}</h3>
              <p className="hp-camp-desc">{camp.description}</p>
              {camp.end_date && (
                <p className="hp-camp-until">
                  {t("campaigns.until")} {formatDate(camp.end_date)}
                </p>
              )}
              {/* CTA — i18n */}
              <span className="hp-camp-cta">{t("campaigns.cta")} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
