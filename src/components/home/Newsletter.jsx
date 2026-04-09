import { useState } from "react";

export default function NewsletterSection({ t }) {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <div className="hp-nl">
      <div>
        <h3 className="hp-nl-t">{t("newsletter.title")}</h3>
        <p className="hp-nl-s">{t("newsletter.subtitle")}</p>
      </div>

      {sent ? (
        <p style={{ fontSize: 14, color: "#7A9E7E", fontFamily: "'DM Sans', sans-serif" }}>
          ✓ {t("newsletter.success", "Thank you for subscribing!")}
        </p>
      ) : (
        <form className="hp-nl-f" onSubmit={handleSubmit}>
          <input
            className="hp-nl-i"
            type="email"
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="hp-nl-b">{t("newsletter.cta")}</button>
        </form>
      )}
    </div>
  );
}
