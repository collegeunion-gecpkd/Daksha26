import { Link } from "react-router-dom";
import "./Guidelines.scss";

const DOCS = [
  {
    id: "offstage",
    number: "01",
    title: "Offstage Events Guidelines",
    description: "Rules and regulations governing all offstage cultural events across the three days of Daksha'26.",
    href: "https://drive.google.com/file/d/10P18Hy6rrOZFU1ws_oCSjLG14arOinEH/view?usp=sharing",
  },
  {
    id: "onstage",
    number: "02",
    title: "Onstage Guidelines",
    description: "Comprehensive guidelines for all onstage performances — stage timings, scoring criteria, and technical requirements.",
    href: "https://drive.google.com/file/d/10TqYDZbBjK5qT1vlujcuQY9csJULBRDd/view?usp=sharing",
  },
  {
    id: "rulebook",
    number: "03",
    title: "Daksha'26 Rulebook",
    description: "The official rulebook covering general conduct, scoring, eligibility, and the complete event framework for Daksha'26.",
    href: "https://drive.google.com/file/d/1kzZ_Fs5b_DDwW85-b8l4qlriNQTr4bHH/view?usp=sharing",
  },
];

const ICONS = { offstage: "🎨", onstage: "🎭", rulebook: "📖" };

function Guidelines() {
  return (
    <main className="guidelines-page">
      <div className="guidelines-header">
        <p className="guidelines-header__eyebrow">Official Documents</p>
        <h1 className="guidelines-header__title">Guidelines &amp; Rulebook</h1>
        <p className="guidelines-header__subtitle">
          All three official documents for Daksha&apos;26. Read before participating.
        </p>
      </div>

      <div className="guidelines-grid">
        {DOCS.map((doc) => {
          const isPlaceholder = doc.href.startsWith("PLACEHOLDER");
          return (
            <a
              key={doc.id}
              href={isPlaceholder ? undefined : doc.href}
              target={isPlaceholder ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={"guidelines-card" + (isPlaceholder ? " guidelines-card--soon" : "")}
            >
              <div className="guidelines-card__top">
                <span className="guidelines-card__number">{doc.number}</span>
                <span className="guidelines-card__icon" aria-hidden="true">{ICONS[doc.id]}</span>
              </div>
              <h2 className="guidelines-card__title">{doc.title}</h2>
              <p className="guidelines-card__desc">{doc.description}</p>
              <div className="guidelines-card__footer">
                {isPlaceholder ? (
                  <span className="guidelines-card__tag guidelines-card__tag--soon">Link coming soon</span>
                ) : (
                  <span className="guidelines-card__tag">Open PDF →</span>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div className="guidelines-back">
        <Link to="/" className="guidelines-back__link">← Back to Home</Link>
      </div>
    </main>
  );
}

export default Guidelines;
