import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";

type QuizStepPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export default async function QuizStepPage({ params }: QuizStepPageProps) {
  const { step } = await params;
  const stepNumber = Number(step);

  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 8) {
    notFound();
  }

  return (
    <AppShell
      title={`문항 ${stepNumber}`}
      description="질문 데이터와 선택 인터랙션은 후속 단계에서 구현합니다."
    >
      <div className="placeholder-card">
        <p>진행 표시, 선택 카드, 이전/다음 버튼은 이 라우트에 연결될 예정입니다.</p>
      </div>
    </AppShell>
  );
}
