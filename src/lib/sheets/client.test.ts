// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { getSheetsConfig } from "./client";

describe("getSheetsConfig()", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function stubValidEnvs() {
    vi.stubEnv("GOOGLE_SHEETS_CLIENT_EMAIL", "test@project.iam.gserviceaccount.com");
    vi.stubEnv(
      "GOOGLE_SHEETS_PRIVATE_KEY",
      "-----BEGIN RSA PRIVATE KEY-----\\nFAKEKEY\\n-----END RSA PRIVATE KEY-----",
    );
    vi.stubEnv("GOOGLE_SHEETS_SPREADSHEET_ID", "1aBcDeFgHiJkLmNoPqRsTuVwXyZ");
    vi.stubEnv("GOOGLE_SHEETS_SHEET_NAME", "테스트");
  }

  it("환경변수가 모두 있으면 config 객체를 반환한다", () => {
    stubValidEnvs();

    const config = getSheetsConfig();

    expect(config.clientEmail).toBe("test@project.iam.gserviceaccount.com");
    expect(config.spreadsheetId).toBe("1aBcDeFgHiJkLmNoPqRsTuVwXyZ");
    expect(config.sheetName).toBe("테스트");
  });

  it("private key의 \\n 이스케이프를 실제 줄바꿈으로 변환한다", () => {
    stubValidEnvs();

    const config = getSheetsConfig();

    expect(config.privateKey).toContain("\n");
    expect(config.privateKey).not.toContain("\\n");
  });

  it("GOOGLE_SHEETS_CLIENT_EMAIL 누락 시 오류를 던진다", () => {
    vi.stubEnv("GOOGLE_SHEETS_PRIVATE_KEY", "key");
    vi.stubEnv("GOOGLE_SHEETS_SPREADSHEET_ID", "id");
    vi.stubEnv("GOOGLE_SHEETS_SHEET_NAME", "sheet");

    expect(() => getSheetsConfig()).toThrow("GOOGLE_SHEETS_CLIENT_EMAIL");
  });

  it("GOOGLE_SHEETS_PRIVATE_KEY 누락 시 오류를 던진다", () => {
    vi.stubEnv("GOOGLE_SHEETS_CLIENT_EMAIL", "email");
    vi.stubEnv("GOOGLE_SHEETS_SPREADSHEET_ID", "id");
    vi.stubEnv("GOOGLE_SHEETS_SHEET_NAME", "sheet");

    expect(() => getSheetsConfig()).toThrow("GOOGLE_SHEETS_PRIVATE_KEY");
  });

  it("GOOGLE_SHEETS_SPREADSHEET_ID 누락 시 오류를 던진다", () => {
    vi.stubEnv("GOOGLE_SHEETS_CLIENT_EMAIL", "email");
    vi.stubEnv("GOOGLE_SHEETS_PRIVATE_KEY", "key");
    vi.stubEnv("GOOGLE_SHEETS_SHEET_NAME", "sheet");

    expect(() => getSheetsConfig()).toThrow("GOOGLE_SHEETS_SPREADSHEET_ID");
  });

  it("GOOGLE_SHEETS_SHEET_NAME 누락 시 오류를 던진다", () => {
    vi.stubEnv("GOOGLE_SHEETS_CLIENT_EMAIL", "email");
    vi.stubEnv("GOOGLE_SHEETS_PRIVATE_KEY", "key");
    vi.stubEnv("GOOGLE_SHEETS_SPREADSHEET_ID", "id");

    expect(() => getSheetsConfig()).toThrow("GOOGLE_SHEETS_SHEET_NAME");
  });
});
