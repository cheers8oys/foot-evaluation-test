"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Answer, Answers, Question } from "@/lib/types";
import { diagnose } from "@/lib/quiz/diagnose";
import {
  clearTestSession,
  getSessionState,
  isClientSessionExpired,
  saveResult,
  setAnswer,
} from "@/lib/quiz/storage";

type QuizStepProps = {
  question: Question;
  stepNumber: number;
  totalSteps: number;
};

export function QuizStep({ question, stepNumber, totalSteps }: QuizStepProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Answer | null>(null);

  useEffect(() => {
    const { startToken, startedAt, answers } = getSessionState();
    if (!startToken) {
      router.replace("/");
      return;
    }
    if (startedAt && isClientSessionExpired(startedAt)) {
      clearTestSession();
      router.replace("/");
      return;
    }
    const key = `q${stepNumber}` as keyof Answers;
    setSelected(answers?.[key] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(answer: Answer) {
    setSelected(answer);
    setAnswer(stepNumber, answer);
  }

  function handlePrev() {
    router.push(stepNumber === 1 ? "/" : `/quiz/${stepNumber - 1}`);
  }

  function handleNext() {
    if (!selected) return;
    if (stepNumber < totalSteps) {
      router.push(`/quiz/${stepNumber + 1}`);
      return;
    }
    const { answers: storedAnswers } = getSessionState();
    const fullAnswers = { ...storedAnswers, [`q${stepNumber}`]: selected } as Answers;
    const result = diagnose(fullAnswers);
    saveResult(result);
    router.push("/quiz/analyzing");
  }

  return (
    <main className="quiz-page">
      <div className="quiz-page__header">
        <div className="progress">
          <span className="progress__text">
            {stepNumber} / {totalSteps}
          </span>
          <div className="progress__track">
            <div
              className="progress__fill"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="question">
          <p className="question__area">{question.area}</p>
          <h1 className="question__text">{question.text}</h1>
        </div>
      </div>

      <div className="choice-cards">
        {(["A", "B"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            className={`choice-card${selected === opt ? " choice-card--selected" : ""}`}
            onClick={() => handleSelect(opt)}
          >
            <Image
              src={`/images/quiz/q${stepNumber}-${opt.toLowerCase()}.jpg`}
              alt={opt === "A" ? question.optionA : question.optionB}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 220px, 470px"
              style={{ objectFit: "contain" }}
            />
          </button>
        ))}
      </div>

      <div className="quiz-page__footer">
        <div className="quiz-nav">
          <button type="button" className="quiz-nav__prev" onClick={handlePrev}>
            ←
          </button>
          <button
            type="button"
            className="btn btn--primary quiz-nav__next"
            disabled={!selected}
            onClick={handleNext}
          >
            {stepNumber === totalSteps ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
}
