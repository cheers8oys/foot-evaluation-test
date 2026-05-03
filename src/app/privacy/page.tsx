import { AppShell } from "@/components/app-shell";
import { PRIVACY_COPY } from "@/lib/constants/copy";

export default function PrivacyPage() {
  return (
    <AppShell title={PRIVACY_COPY.title} description={PRIVACY_COPY.description}>
      {PRIVACY_COPY.sections.map((section) => (
        <section key={section.heading} className="info-card">
          <h2 className="info-card__title">{section.heading}</h2>
          <ul className="info-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      <div className="info-card">
        <p className="info-card__body">{PRIVACY_COPY.reviewNotice}</p>
      </div>
    </AppShell>
  );
}
