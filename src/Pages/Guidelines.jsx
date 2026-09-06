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

function IconOffstage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
    </svg>
  );
}

function IconOnstage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 18h20" />
      <path d="M4 18v3" />
      <path d="M20 18v3" />
      <path d="M12 2v6" />
      <path d="M9 5l3 3 3-3" />
      <path d="M6 14a6 6 0 0 0 12 0V8H6v6z" />
    </svg>
  );
}

function IconRulebook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
      <path d="M6 14h6" />
    </svg>
  );
}

const ICONS = {
  offstage: <IconOffstage />,
  onstage: <IconOnstage />,
  rulebook: <IconRulebook />,
};

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
