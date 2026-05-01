import { AppShell } from "@/components/app-shell";

export default function PrivacyPage() {
  return (
    <AppShell
      title="개인정보 처리방침"
      description="정식 문구 연결 전 기본 라우트 자리만 준비했습니다."
    >
      <div className="placeholder-card">
        <p>수집 항목, 이용 목적, 보유 기간, 수신 거부 방법은 후속 단계에서 연결합니다.</p>
      </div>
    </AppShell>
  );
}
