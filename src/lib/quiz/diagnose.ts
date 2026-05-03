import type { Answers, CaseId, DiagnosisResult } from "@/lib/types";
import { CASE_PRIORITY } from "@/lib/constants/results";

export function diagnose(answers: Answers): DiagnosisResult {
  const matchedCases: CaseId[] = [];

  if (answers.q1 === "B" && answers.q4 === "B" && answers.q5 === "B") matchedCases.push("case1");
  if (answers.q2 === "B" && answers.q3 === "B" && answers.q7 === "B") matchedCases.push("case2");
  if (answers.q5 === "B" && answers.q6 === "B") matchedCases.push("case3");
  if (answers.q1 === "B" && answers.q2 === "B" && answers.q8 === "B") matchedCases.push("case4");

  if (matchedCases.length === 0) return { primaryCase: "default", matchedCases: ["default"] };

  const primaryCase = CASE_PRIORITY.find((id) => matchedCases.includes(id)) ?? "default";
  return { primaryCase, matchedCases };
}

export function buildResultUrl(result: DiagnosisResult): string {
  return `/result?primary=${result.primaryCase}&cases=${result.matchedCases.join(",")}`;
}

const ALLOWED: Set<string> = new Set(["case1", "case2", "case3", "case4", "default"]);
const RESULT_QUERY_KEYS: Set<string> = new Set(["primary", "cases"]);

export function validateResultParams(
  primary: string | null,
  cases: string | null,
): DiagnosisResult | null {
  if (!primary || !cases) return null;
  if (!ALLOWED.has(primary)) return null;

  const caseList = cases.split(",");
  if (caseList.length === 0) return null;
  if (new Set(caseList).size !== caseList.length) return null;
  if (caseList.some((c) => !ALLOWED.has(c))) return null;
  if (!caseList.includes(primary)) return null;
  if (caseList.includes("default") && caseList.length > 1) return null;

  return { primaryCase: primary as CaseId, matchedCases: caseList as CaseId[] };
}

export function validateResultSearchParams(searchParams: URLSearchParams): DiagnosisResult | null {
  const keys = Array.from(searchParams.keys());
  if (keys.length !== RESULT_QUERY_KEYS.size) return null;
  if (keys.some((key) => !RESULT_QUERY_KEYS.has(key))) return null;

  return validateResultParams(searchParams.get("primary"), searchParams.get("cases"));
}

export function validateResultUrl(url: string | null): string | null {
  if (!url) return null;

  const base = new URL("http://local.test");

  let parsed: URL;
  try {
    parsed = new URL(url, base);
  } catch {
    return null;
  }

  if (parsed.origin !== base.origin || parsed.pathname !== "/result" || parsed.hash) return null;

  const validated = validateResultSearchParams(parsed.searchParams);
  if (!validated) return null;

  return buildResultUrl(validated);
}
