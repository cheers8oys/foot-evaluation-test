import { notFound } from "next/navigation";

import { QuizStep } from "@/components/quiz-step";
import { QUESTIONS, TOTAL_STEPS } from "@/lib/constants/questions";

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
    <QuizStep
      question={QUESTIONS[stepNumber - 1]}
      stepNumber={stepNumber}
      totalSteps={TOTAL_STEPS}
    />
  );
}
