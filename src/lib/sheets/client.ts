import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

export type SheetsClientConfig = {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

export class SheetsConfigError extends Error {
  constructor(missingVar: string) {
    super(`Missing required environment variable: ${missingVar}`);
    this.name = "SheetsConfigError";
  }
}

export function getSheetsConfig(): SheetsClientConfig {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;

  if (!clientEmail) throw new SheetsConfigError("GOOGLE_SHEETS_CLIENT_EMAIL");
  if (!privateKeyRaw) throw new SheetsConfigError("GOOGLE_SHEETS_PRIVATE_KEY");
  if (!spreadsheetId) throw new SheetsConfigError("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!sheetName) throw new SheetsConfigError("GOOGLE_SHEETS_SHEET_NAME");

  return {
    clientEmail,
    privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    spreadsheetId,
    sheetName,
  };
}

export function createSheetsClient(config: SheetsClientConfig): sheets_v4.Sheets {
  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}
