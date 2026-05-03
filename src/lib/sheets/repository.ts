import type { sheets_v4 } from "googleapis";
import type { SheetsClientConfig } from "./client";

export type SheetRow = {
  createdAt: string;
  name: string;
  phone: string;
  resultType: string;
  consentVersion: string;
};

export type SheetsRepository = {
  findByPhone(phone: string): Promise<SheetRow | null>;
  appendRow(row: SheetRow): Promise<void>;
};

export function createSheetsRepository(
  sheets: sheets_v4.Sheets,
  config: SheetsClientConfig,
): SheetsRepository {
  const range = `${config.sheetName}!A:E`;

  return {
    async findByPhone(phone: string): Promise<SheetRow | null> {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range,
      });

      const rows = response.data.values ?? [];

      for (const row of rows) {
        if (row[2] === phone) {
          return {
            createdAt: row[0] ?? "",
            name: row[1] ?? "",
            phone: row[2] ?? "",
            resultType: row[3] ?? "",
            consentVersion: row[4] ?? "",
          };
        }
      }

      return null;
    },

    async appendRow(row: SheetRow): Promise<void> {
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[row.createdAt, row.name, row.phone, row.resultType, row.consentVersion]],
        },
      });
    },
  };
}
