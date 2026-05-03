import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ResetSessionButton } from "@/components/reset-session-button";
import { SUBMITTED_COPY } from "@/lib/constants/copy";
import { validateResultUrl } from "@/lib/quiz/diagnose";

type QuizSubmittedPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    url?: string | string[];
  }>;
};

function readSingleParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export default async function QuizSubmittedPage({ searchParams }: QuizSubmittedPageProps) {
  const params = await searchParams;
  const status = readSingleParam(params.status);
  const resultUrl = validateResultUrl(readSingleParam(params.url));

  if ((status !== "created" && status !== "duplicate") || !resultUrl) {
    notFound();
  }

  const copy = status === "created" ? SUBMITTED_COPY.created : SUBMITTED_COPY.duplicate;

  return (
    <AppShell title={copy.title} description={copy.description}>
      <div className="info-card">
        <p className="info-card__body">
          결과 링크는 카카오톡 또는 문자 메시지에서도 다시 확인할 수 있습니다.
        </p>
      </div>
      <div className="action-stack">
        <Link href={resultUrl} className="btn btn--primary">
          {copy.ctaLabel}
        </Link>
        <ResetSessionButton label={SUBMITTED_COPY.resetLabel} />
      </div>
    </AppShell>
  );
}
