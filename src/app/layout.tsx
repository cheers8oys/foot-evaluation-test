import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "시즈탱크 발 유형 테스트",
  description: "시즈탱크 발 유형 테스트 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
