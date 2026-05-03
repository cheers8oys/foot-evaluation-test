import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { NOT_FOUND_COPY } from "@/lib/constants/copy";

export default function NotFound() {
  return (
    <AppShell title={NOT_FOUND_COPY.title} description={NOT_FOUND_COPY.description}>
      <div className="info-card">
        <p className="info-card__body">{NOT_FOUND_COPY.body}</p>
      </div>
      <div className="action-stack">
        <Link href="/" className="btn btn--secondary">
          {NOT_FOUND_COPY.ctaLabel}
        </Link>
      </div>
    </AppShell>
  );
}
