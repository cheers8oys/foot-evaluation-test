import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { RESULTS } from "@/lib/constants/results";
import { PLACEHOLDER_COPY } from "@/lib/constants/copy";
import { validateResultSearchParams } from "@/lib/quiz/diagnose";

type ResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toUrlSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams | null {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "string") return null;
    search.append(key, value);
  }

  return search;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const normalized = toUrlSearchParams(params);
  const result = normalized ? validateResultSearchParams(normalized) : null;

  if (!result) {
    notFound();
  }

  const content = RESULTS[result.primaryCase];
  const additionalCases = result.matchedCases.filter((caseId) => caseId !== result.primaryCase);

  return (
    <AppShell
      title="내 발 사용 패턴 결과"
      description="대표 유형과 함께 나타난 패턴을 이해하기 쉽게 정리했어요."
    >
      <section className="result-card result-card--hero">
        <p className="result-card__eyebrow">대표 발 유형</p>
        <h2 className="result-card__title">{content.name}</h2>
        <p className="result-card__headline">{content.headline}</p>
        <p className="result-card__summary">{content.summary}</p>
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">대표 유형 설명</h2>
        <p className="result-card__body">{content.description}</p>
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">함께 나타난 패턴</h2>
        {additionalCases.length === 0 ? (
          <p className="result-card__body">함께 강하게 나타난 추가 패턴은 없습니다.</p>
        ) : (
          <ul className="result-list">
            {additionalCases.map((caseId) => (
              <li key={caseId} className="result-list__item">
                <strong>{RESULTS[caseId].name}</strong>
                <span>{RESULTS[caseId].summary}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">주의해야 할 신체 신호</h2>
        <ul className="result-list">
          {content.bodySignals.map((signal) => (
            <li key={signal} className="result-list__item">
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">맞춤 운동 영상</h2>
        <p className="result-card__body result-card__body--label">{content.exerciseTitle}</p>
        {content.exerciseUrl ? (
          <a href={content.exerciseUrl} className="text-link">
            운동 영상 보기
          </a>
        ) : (
          <p className="result-card__body">{PLACEHOLDER_COPY.exerciseReady}</p>
        )}
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">추천 시즈탱크 모델</h2>
        <p className="result-card__body result-card__body--label">{content.productName}</p>
        {content.productUrl ? (
          <a href={content.productUrl} className="text-link">
            제품 보기
          </a>
        ) : (
          <p className="result-card__body">{PLACEHOLDER_COPY.productReady}</p>
        )}
      </section>

      <section className="result-card">
        <h2 className="result-card__section-title">다음 안내</h2>
        <p className="result-card__body">
          카카오톡 또는 문자로 받은 결과 링크로 언제든 다시 확인할 수 있습니다.
        </p>
      </section>
    </AppShell>
  );
}
