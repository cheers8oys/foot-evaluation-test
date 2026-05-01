import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell
      title="발 유형 테스트"
      description="앱 기본 골격 단계입니다. 제품 플로우와 데이터 연결은 다음 단계에서 구현합니다."
    >
      <div className="placeholder-card">
        <p>현재 단계에서는 인트로, 퀴즈, 결과, 개인정보 처리방침, 오류 화면 라우트만 준비합니다.</p>
      </div>
      <ul className="placeholder-list">
        <li>Quiz routes scaffolded</li>
        <li>Privacy and result routes scaffolded</li>
        <li>Shared mobile app shell applied</li>
      </ul>
    </AppShell>
  );
}
