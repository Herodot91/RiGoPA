import React from "react";

const cssContent = `
/* Page layout */
.df-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 40px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background: #0f172a; /* dark navy background for contrast */
  color: #e5e7eb;
  min-height: 100%;
}

/* Generic card */
.df-card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
}

/* Header */
.df-header {
  margin-bottom: 24px;
}

.df-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #f9fafb;
}

.df-subtitle {
  font-size: 0.95rem;
  color: #cbd5f5;
  max-width: 700px;
}

/* Formula bar */
.df-formula-bar {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.df-formula-pill {
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(45, 212, 191, 0.15)
  );
  border: 1px solid rgba(96, 165, 250, 0.6);
}

.df-formula-pill-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e5f2ff;
}

.df-formula-operator {
  font-size: 1.2rem;
  font-weight: 700;
  color: #9ca3af;
}

.df-result-pill {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ecfdf5;
}

.df-result-main {
  font-size: 0.92rem;
  font-weight: 700;
}

.df-result-sub {
  font-size: 0.78rem;
  opacity: 0.9;
}

/* Pillars grid */
.df-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.df-pillar-card {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Pillar header */
.df-pillar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.df-pillar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
}

.df-pill-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(30, 64, 175, 0.85);
  color: #e0f2fe;
  white-space: nowrap;
}

/* Text */
.df-pillar-text {
  font-size: 0.88rem;
  color: #cbd5f5;
  line-height: 1.45;
  margin-bottom: 10px;
}

/* Implementation Box */
.df-impl {
  margin-top: auto;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.5); /* darker background */
  border-left: 3px solid #6366f1; /* Indigo accent */
  border-radius: 4px;
}

.df-impl-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #818cf8; /* Light indigo */
  margin-bottom: 4px;
}

.df-impl-text {
  font-size: 0.8rem;
  color: #cbd5e1; /* slate-300 */
  line-height: 1.4;
}

/* Levels badges */
.df-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.df-level-badge {
  font-size: 0.72rem;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.25);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #bbf7d0;
}

/* Footer */
.df-pillar-footer {
  border-top: 1px dashed rgba(148, 163, 184, 0.6);
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.df-footer-label {
  font-size: 0.72rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.df-footer-value {
  font-size: 0.82rem;
  color: #e5e7eb;
}

/* Mobile tweaks */
@media (max-width: 640px) {
  .df-page {
    padding: 16px 12px 28px;
  }

  .df-formula-bar {
    gap: 6px;
  }

  .df-result-pill {
    width: 100%;
    align-items: flex-start;
  }
}
`;

const pillars = [
  {
    id: "good-data",
    title: "Good Data",
    formulaLabel: "Good Data",
    description:
      "Data isn’t locked at the center; it’s shared with local and regional units so everyone works from the same truth.",
    implementation:
      "Local offices access central datasets (procurement, budgets, history) via standardized pipelines.",
    levels: ["Local", "Regional", "Central"],
  },
  {
    id: "early-warnings",
    title: "Early Warnings",
    formulaLabel: "Early Warnings",
    description:
      "Risks are flagged at the ground level and sent upward, so issues are caught faster and not hidden in the hierarchy.",
    implementation:
      "Local actors flag risks. Distributed signals reach the center instantly for rapid response.",
    levels: ["Local → Regional → Central"],
  },
  {
    id: "portable-clarity",
    title: "Portable Clarity",
    formulaLabel: "Portable Clarity",
    description:
      "Standardized templates and plain-language documents are used across all levels, so clarity travels with the contract.",
    implementation:
      "Standard templates and rules used by HQ and municipalities alike to ensure no ambiguity.",
    levels: ["Local", "Regional", "Central"],
  },
  {
    id: "decentralized-checks",
    title: "Decentralized Checks",
    formulaLabel: "Decentralized Checks",
    description:
      "Local, regional, and central actors apply the same milestone checks, ensuring consistency without over-centralization.",
    implementation:
      "Layered local checks at milestones using standard checklists. Rolled up for central oversight.",
    levels: ["Local", "Regional", "Central"],
  },
];

const DecentralizationFormula = () => {
  return (
    <>
      <style>{cssContent}</style>
      <div className="df-page">
        <section className="df-card df-header">
          <h1 className="df-title">Decentralization Formula for Contract Success</h1>
          <p className="df-subtitle">
            A simple decentralization logic: each level sees the same data, uses the
            same documents, and applies the same checks — but risks are detected early,
            from the ground up.
          </p>

          {/* Formula Bar */}
          <div className="df-formula-bar">
            {pillars.map((pillar, index) => (
              <React.Fragment key={pillar.id}>
                <div className="df-formula-pill">
                  <span className="df-formula-pill-label">{pillar.formulaLabel}</span>
                </div>
                {index < pillars.length - 1 && (
                  <span className="df-formula-operator">+</span>
                )}
              </React.Fragment>
            ))}
            <span className="df-formula-operator">=</span>
            <div className="df-result-pill">
              <span className="df-result-main">
                Contracts Done Right &amp; On Time
              </span>
              <span className="df-result-sub">
                Decentralized execution, shared standards.
              </span>
            </div>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="df-grid">
          {pillars.map((pillar) => (
            <article className="df-card df-pillar-card" key={pillar.id}>
              <header className="df-pillar-header">
                <h2 className="df-pillar-title">{pillar.title}</h2>
                <span className="df-pill-tag">{pillar.formulaLabel}</span>
              </header>

              <p className="df-pillar-text">{pillar.description}</p>

              <div className="df-levels">
                {pillar.levels.map((level, idx) => (
                  <span className="df-level-badge" key={idx}>
                    {level}
                  </span>
                ))}
              </div>

              {/* Implementation line */}
              <div className="df-impl">
                <span className="df-impl-label">In the app:</span>
                <p className="df-impl-text">{pillar.implementation}</p>
              </div>

              <footer className="df-pillar-footer">
                <span className="df-footer-label">Governance pattern:</span>
                <span className="df-footer-value">
                  Same rules, different layers — no blind spots.
                </span>
              </footer>
            </article>
          ))}
        </section>
      </div>
    </>
  );
};

export default DecentralizationFormula;
