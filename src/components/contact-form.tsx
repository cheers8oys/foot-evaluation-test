"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  CONSENT_CHECKBOX_TEXT,
  PRIVACY_NOTICE_TEXT,
  CONSENT_VERSION,
} from "@/lib/constants/consent";
import { CONTACT_COPY, ERROR_MESSAGES } from "@/lib/constants/copy";
import {
  clearTestSession,
  getEarliestUnansweredStep,
  getSessionState,
  isClientSessionExpired,
} from "@/lib/quiz/storage";
import { normalizePhone, validateName, validatePhone } from "@/lib/quiz/validation";
import type { SubmitErrorResponse, SubmitSuccessResponse } from "@/lib/quiz/submit";

type FormState = {
  name: string;
  phone: string;
  consentChecked: boolean;
  error: string | null;
  submitting: boolean;
  showResetAction: boolean;
};

function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function ContactForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    name: "",
    phone: "",
    consentChecked: false,
    error: null,
    submitting: false,
    showResetAction: false,
  });

  useEffect(() => {
    const { startToken, startedAt, answers, result } = getSessionState();

    if (!startToken) {
      router.replace("/");
      return;
    }

    if (startedAt && isClientSessionExpired(startedAt)) {
      clearTestSession();
      router.replace("/");
      return;
    }

    if (getEarliestUnansweredStep(answers) !== 9 || !result) {
      router.replace("/");
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    const { startToken, answers, result } = getSessionState();

    return (
      validateName(state.name.trim()) &&
      validatePhone(normalizePhone(state.phone)) &&
      state.consentChecked &&
      Boolean(startToken) &&
      Boolean(result) &&
      getEarliestUnansweredStep(answers) === 9 &&
      !state.submitting
    );
  }, [state.consentChecked, state.name, state.phone, state.submitting]);

  function updateState(partial: Partial<FormState>) {
    setState((current) => ({ ...current, ...partial }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    const { startToken, answers, result } = getSessionState();
    if (!startToken || !answers || !result || getEarliestUnansweredStep(answers) !== 9) {
      updateState({ error: ERROR_MESSAGES.INVALID_ANSWERS });
      return;
    }

    updateState({ submitting: true, error: null, showResetAction: false });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: state.name,
          phone: state.phone,
          consentChecked: state.consentChecked,
          consentVersion: CONSENT_VERSION,
          startToken,
          answers,
          primaryCase: result.primaryCase,
          matchedCases: result.matchedCases,
        }),
      });

      const payload = (await response.json()) as SubmitSuccessResponse | SubmitErrorResponse;

      if (!response.ok || !payload.ok) {
        const errorPayload = payload as SubmitErrorResponse;

        updateState({
          error: errorPayload.message,
          submitting: false,
          showResetAction:
            errorPayload.errorCode === "INVALID_TOKEN" ||
            errorPayload.errorCode === "TOKEN_EXPIRED",
        });
        return;
      }

      const successPayload = payload as SubmitSuccessResponse;
      router.push(
        `/quiz/submitted?status=${successPayload.status}&url=${encodeURIComponent(successPayload.resultUrl)}`,
      );
    } catch {
      updateState({
        error: ERROR_MESSAGES.SUBMIT_FAILED,
        submitting: false,
      });
    }
  }

  function handleReset() {
    clearTestSession();
    router.push("/");
  }

  return (
    <AppShell title={CONTACT_COPY.title} description={CONTACT_COPY.description}>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-field__label">이름</span>
          <input
            type="text"
            className="form-field__input"
            placeholder="이름"
            value={state.name}
            onChange={(event) => updateState({ name: event.target.value, error: null })}
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">휴대폰 번호</span>
          <input
            type="tel"
            inputMode="numeric"
            className="form-field__input"
            placeholder="010-XXXX-XXXX"
            value={state.phone}
            onChange={(event) =>
              updateState({
                phone: formatPhoneInput(event.target.value),
                error: null,
              })
            }
          />
        </label>

        <label className="consent-checkbox">
          <input
            type="checkbox"
            checked={state.consentChecked}
            onChange={(event) =>
              updateState({
                consentChecked: event.target.checked,
                error: null,
              })
            }
          />
          <span>{CONSENT_CHECKBOX_TEXT}</span>
        </label>

        <p className="contact-form__notice">
          {PRIVACY_NOTICE_TEXT}{" "}
          <Link href="/privacy" className="contact-form__link">
            개인정보 처리방침
          </Link>
        </p>

        {state.error ? <p className="contact-form__error">{state.error}</p> : null}

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {state.submitting ? "제출 중…" : CONTACT_COPY.submitLabel}
        </button>

        {state.showResetAction ? (
          <button type="button" className="btn btn--secondary" onClick={handleReset}>
            {CONTACT_COPY.resetLabel}
          </button>
        ) : null}
      </form>
    </AppShell>
  );
}
