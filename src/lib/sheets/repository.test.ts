// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import type { sheets_v4 } from "googleapis";
import { createSheetsRepository } from "./repository";
import type { SheetsClientConfig } from "./client";

const fakeConfig: SheetsClientConfig = {
  clientEmail: "test@project.iam.gserviceaccount.com",
  privateKey: "FAKE_KEY",
  spreadsheetId: "SPREADSHEET_ID",
  sheetName: "테스트",
};

function makeFakeSheets(rows: string[][] = [], appendOk = true): sheets_v4.Sheets {
  return {
    spreadsheets: {
      values: {
        get: vi.fn().mockResolvedValue({ data: { values: rows } }),
        append: appendOk
          ? vi.fn().mockResolvedValue({})
          : vi.fn().mockRejectedValue(new Error("Sheets API error")),
      },
    },
  } as unknown as sheets_v4.Sheets;
}

describe("SheetsRepository.findByPhone()", () => {
  it("시트가 비어 있으면 null을 반환한다", async () => {
    const repo = createSheetsRepository(makeFakeSheets([]), fakeConfig);
    expect(await repo.findByPhone("01012345678")).toBeNull();
  });

  it("C컬럼에 해당 번호가 없으면 null을 반환한다", async () => {
    const rows = [
      ["2026-05-01", "김철수", "01099998888", "case1", "v1"],
      ["2026-05-01", "이영희", "01077776666", "case2", "v1"],
    ];
    const repo = createSheetsRepository(makeFakeSheets(rows), fakeConfig);
    expect(await repo.findByPhone("01012345678")).toBeNull();
  });

  it("C컬럼에 일치하는 번호가 있으면 해당 SheetRow를 반환한다", async () => {
    const rows = [
      ["2026-05-01T10:00:00+09:00", "홍길동", "01012345678", "case2", "v1"],
      ["2026-05-01T11:00:00+09:00", "김철수", "01099998888", "case1", "v1"],
    ];
    const repo = createSheetsRepository(makeFakeSheets(rows), fakeConfig);
    const result = await repo.findByPhone("01012345678");

    expect(result).not.toBeNull();
    expect(result?.phone).toBe("01012345678");
    expect(result?.name).toBe("홍길동");
    expect(result?.resultType).toBe("case2");
    expect(result?.consentVersion).toBe("v1");
  });

  it("spreadsheets.values.get을 올바른 범위로 호출한다", async () => {
    const fakeSheets = makeFakeSheets([]);
    const repo = createSheetsRepository(fakeSheets, fakeConfig);
    await repo.findByPhone("01012345678");

    expect(fakeSheets.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: fakeConfig.spreadsheetId,
      range: `${fakeConfig.sheetName}!A:E`,
    });
  });
});

describe("SheetsRepository.appendRow()", () => {
  it("A~E 순서로 올바른 값을 전달한다", async () => {
    const fakeSheets = makeFakeSheets();
    const repo = createSheetsRepository(fakeSheets, fakeConfig);

    await repo.appendRow({
      createdAt: "2026-05-01T14:30:00+09:00",
      name: "홍길동",
      phone: "01012345678",
      resultType: "case2",
      consentVersion: "v1",
    });

    expect(fakeSheets.spreadsheets.values.append).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          values: [["2026-05-01T14:30:00+09:00", "홍길동", "01012345678", "case2", "v1"]],
        },
      }),
    );
  });

  it("valueInputOption: RAW, insertDataOption: INSERT_ROWS로 호출한다", async () => {
    const fakeSheets = makeFakeSheets();
    const repo = createSheetsRepository(fakeSheets, fakeConfig);

    await repo.appendRow({
      createdAt: "2026-05-01T14:30:00+09:00",
      name: "홍길동",
      phone: "01012345678",
      resultType: "case1",
      consentVersion: "v1",
    });

    expect(fakeSheets.spreadsheets.values.append).toHaveBeenCalledWith(
      expect.objectContaining({
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
      }),
    );
  });

  it("API 오류 발생 시 에러를 그대로 던진다", async () => {
    const fakeSheets = makeFakeSheets([], false);
    const repo = createSheetsRepository(fakeSheets, fakeConfig);

    await expect(
      repo.appendRow({
        createdAt: "2026-05-01T14:30:00+09:00",
        name: "홍길동",
        phone: "01012345678",
        resultType: "case1",
        consentVersion: "v1",
      }),
    ).rejects.toThrow("Sheets API error");
  });
});
