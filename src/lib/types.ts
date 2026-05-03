export type Answer = "A" | "B";

export type Answers = {
  q1: Answer;
  q2: Answer;
  q3: Answer;
  q4: Answer;
  q5: Answer;
  q6: Answer;
  q7: Answer;
  q8: Answer;
};

export type CaseId = "case1" | "case2" | "case3" | "case4" | "default";

export type DiagnosisResult = {
  primaryCase: CaseId;
  matchedCases: CaseId[];
};

export type ResultContent = {
  id: CaseId;
  name: string;
  headline: string;
  summary: string;
  description: string;
  bodySignals: string[];
  exerciseTitle: string;
  exerciseUrl: string | null;
  productName: string;
  productUrl: string | null;
};

export type Question = {
  step: number;
  area: string;
  text: string;
  optionA: string;
  optionB: string;
};

export type SubmitStatus = "created" | "duplicate";
