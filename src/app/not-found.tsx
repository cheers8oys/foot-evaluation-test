import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell title="페이지를 찾을 수 없어요" description="기본 라우트 골격만 준비된 상태입니다.">
      <div className="placeholder-card">
        <p>
          요청한 경로가 아직 연결되지 않았거나 잘못된 주소입니다. 홈으로 돌아가 기본 화면을 확인할
          수 있습니다.
        </p>
      </div>
      <div className="placeholder-card">
        <Link href="/">홈으로 이동</Link>
      </div>
    </AppShell>
  );
}
