# 시즈탱크 발 유형 테스트 구현 계획

기준 문서:

- `siztank-foot-type-test-prd-v1.2-implementation.md`
- `siztank-foot-type-test-screen-spec-v1.0.md`
- `munjaon-alimtalk-integration-guide.md`

## 1. 구현 목표

모바일 우선 웹 MVP로 8문항 A/B 발 유형 테스트를 구현한다. 사용자는 테스트를 완료한 뒤 휴대폰 번호와 단일 동의를 제출하고, 신규 번호인 경우 Google Sheets 저장 후 알림톡 또는 SMS로 결과지 링크를 받는다. 기존 번호는 중복 저장 및 중복 발송하지 않고 기존 결과지로 안내한다.

## 2. 핵심 범위

### 포함

- Next.js App Router, TypeScript, Tailwind CSS 기반 웹 앱
- 인트로, 8문항 테스트, 분석 중, 연락처 입력, 제출 완료, 결과지, 개인정보 처리방침, 404 화면
- `sessionStorage` 기반 클라이언트 진행 상태 저장 및 복원
- 서버 서명 토큰 발급 및 검증
- 서버 기준 결과 재계산
- 15초 미만 제출 차단, 30분 만료 처리
- Google Sheets 저장 및 중복 전화번호 차단
- 문자온 알림톡 또는 SMS 결과 링크 발송
- 결과 URL 파라미터 검증
- 모바일 360px~430px 중심 QA

### 제외

- 이름 입력
- 관리자 대시보드
- CAPTCHA, IP 기반 rate limit
- 전화번호 암복호화 저장
- AI 발 사진 분석
- PDF 다운로드
- 후속 메시지 자동 시퀀스
- 구매 데이터 기반 개인화
- A/B 테스트 인프라

## 3. 기술 구조

```text
src/
  app/
    page.tsx
    privacy/page.tsx
    result/page.tsx
    not-found.tsx
    quiz/
      [step]/page.tsx
      analyzing/page.tsx
      contact/page.tsx
      submitted/page.tsx
    api/
      session/start/route.ts
      submit/route.ts
  components/
    app-shell.tsx
    primary-button.tsx
    secondary-button.tsx
    progress-indicator.tsx
    choice-card.tsx
    inline-error.tsx
  lib/
    constants/
      copy.ts
      consent.ts
      questions.ts
      results.ts
    quiz/
      diagnose.ts
      storage.ts
      validation.ts
    server/
      env.ts
      token.ts
      submit.ts
    sheets/
      client.ts
      leads.ts
    munjaon/
      client.ts
      message.ts
      types.ts
```

## 4. 데이터 모델

### 답변

```ts
type Answer = 'A' | 'B';

type Answers = {
  q1: Answer;
  q2: Answer;
  q3: Answer;
  q4: Answer;
  q5: Answer;
  q6: Answer;
  q7: Answer;
  q8: Answer;
};
```

### 결과

```ts
type CaseId = 'case1' | 'case2' | 'case3' | 'case4' | 'default';

type DiagnosisResult = {
  primaryCase: CaseId;
  matchedCases: CaseId[];
};
```

### Google Sheets 컬럼

| 컬럼 | 필드 | 설명 |
|---|---|---|
| A | `createdAt` | ISO timestamp |
| B | `phone` | 숫자만 남긴 `01012345678` 형식 |
| C | `resultType` | 대표 결과 case ID |
| D | `consentVersion` | 예: `v1` |

## 5. 라우트 구현 계획

### `/`

- 브랜드명, 테스트 제목, 보조 문구, 예상 소요 시간, 시작 CTA, 개인정보 처리방침 링크를 표시한다.
- `테스트 시작하기` 클릭 시 `POST /api/session/start`를 호출한다.
- 성공 시 기존 `sessionStorage` 답변/결과를 초기화하고 `siztank_start_token`, `siztank_test_started_at`을 저장한 뒤 `/quiz/1`로 이동한다.
- 실패 시 inline error를 표시한다.

### `/quiz/[step]`

- `step`은 1~8만 허용한다.
- 토큰이 없거나 30분이 지나면 상태를 초기화하고 `/`로 이동한다.
- 진행 표시 `step / 8`과 진행 바를 표시한다.
- A/B 선택 카드는 이미지 placeholder와 라벨을 포함한다.
- 선택 즉시 `siztank_answers`를 업데이트한다.
- 이전 버튼은 1번에서 `/`, 2~8번에서 이전 문항으로 이동한다.
- 다음 버튼은 선택된 경우에만 활성화한다.
- 8번 완료 시 `diagnose()`로 결과를 계산해 `siztank_result`에 저장하고 `/quiz/analyzing`으로 이동한다.

### `/quiz/analyzing`

- spinner 또는 간단한 진행 애니메이션을 표시한다.
- `siztank_result`가 없고 답변이 완전하면 결과를 계산해 저장한다.
- 답변이 부족하면 `/`로 이동한다.
- 1.2~2.0초 후 `/quiz/contact`로 이동한다.

### `/quiz/contact`

- 전화번호 입력, 단일 동의 체크박스, 개인정보 고지, `/privacy` 링크, 제출 CTA를 표시한다.
- 전화번호는 입력 중 하이픈을 허용하되 서버에는 원본을 전달하고 서버에서 정규화한다.
- CTA 활성 조건:
  - 국내 휴대폰 번호 기본 형식 충족
  - 단일 체크박스 선택
  - 답변, 결과값, startToken 존재
  - 제출 중이 아님
- 제출 시 `POST /api/submit`을 호출한다.
- `created` 응답은 `/quiz/submitted?status=created&url={encodedResultUrl}`로 이동한다.
- `duplicate` 응답은 `/quiz/submitted?status=duplicate&url={encodedResultUrl}`로 이동한다.
- 400/429는 서버 메시지를 inline으로 표시하고, 토큰 오류는 `처음부터 다시 진행하기` 버튼을 함께 표시한다.

### `/quiz/submitted`

- `status`는 `created` 또는 `duplicate`만 허용한다.
- `url`은 내부 `/result?primary=...&cases=...` 형식만 허용한다.
- 신규 제출은 `결과지를 보내드렸어요` 상태를 표시한다.
- 중복 제출은 `이미 결과지가 발송된 번호예요` 상태를 표시한다.
- 결과지 CTA는 `url` 파라미터로 이동한다.
- 처음으로/처음부터 다시 하기 버튼은 `sessionStorage`를 초기화하고 `/`로 이동한다.

### `/result`

- `primary`, `cases` 쿼리 파라미터를 검증한다.
- 허용 case ID: `case1`, `case2`, `case3`, `case4`, `default`
- `cases`에는 `primary`가 포함되어야 한다.
- `default`는 단독으로만 허용한다.
- 검증 실패 시 404로 보낸다.
- 대표 결과, 요약, 설명, 함께 나타난 패턴, 신체 신호, 운동 영상 준비 상태, 추천 제품 준비 상태를 표시한다.
- 의료 진단처럼 보이지 않도록 `패턴`, `신호`, `점검`, `가능성` 표현을 사용한다.

### `/privacy`

- 개인정보 처리방침 초안을 표시한다.
- 수집 항목, 이용 목적, 보유 기간, 수신 거부 방법, 문의처를 포함한다.
- 문구는 배포 전 법무/개인정보 담당자 검토가 필요하므로 상수로 분리한다.

### `/404` 또는 `not-found`

- 잘못된 접근 안내와 `테스트 처음부터 하기` CTA를 표시한다.
- CTA 클릭 시 상태를 초기화하고 `/`로 이동한다.

## 6. API 구현 계획

### `POST /api/session/start`

- 요청 body는 비어 있다.
- 서버에서 발급 시각과 만료 시각을 담은 서명 토큰을 생성한다.
- 토큰은 DB에 저장하지 않는다.
- 응답:

```json
{
  "ok": true,
  "startToken": "signed-token",
  "expiresAt": "2026-04-30T15:00:00+09:00"
}
```

### `POST /api/submit`

처리 순서:

1. request body schema 검증
2. 전화번호를 숫자만 남겨 정규화
3. `^010\\d{8}$` 검증
4. 단일 동의 여부 검증
5. startToken 존재, 서명, 만료 검증
6. 토큰 발급 후 15초 미만 제출 차단
7. 답변 8개와 값 범위 검증
8. 서버에서 `answers` 기준 결과 재계산
9. 클라이언트가 보낸 `primaryCase`, `matchedCases`와 불일치하면 서버 계산값을 우선 사용
10. Google Sheets에서 정규화 전화번호 중복 확인
11. 중복이면 기존 row의 `resultType`으로 결과 URL을 만들고 `duplicate` 응답
12. 신규이면 쓰기 직전 한 번 더 중복 확인
13. 신규 row 저장
14. 문자온 알림톡 또는 SMS 발송
15. 발송 성공 시 `created` 응답
16. 발송 실패 시 `MESSAGE_SEND_FAILED` 500 응답

중복 응답:

```json
{
  "ok": true,
  "status": "duplicate",
  "resultUrl": "/result?primary=case2&cases=case2",
  "messageSent": false
}
```

신규 응답:

```json
{
  "ok": true,
  "status": "created",
  "resultUrl": "/result?primary=case2&cases=case2,case3",
  "messageSent": true
}
```

## 7. 결과 계산

조건:

| Case ID | 결과명 | 조건 |
|---|---|---|
| `case1` | 전방 중심 붕괴형 | `q1 === 'B' && q4 === 'B' && q5 === 'B'` |
| `case2` | 발 기능 붕괴형 | `q2 === 'B' && q3 === 'B' && q7 === 'B'` |
| `case3` | 호흡-코어 붕괴형 | `q5 === 'B' && q6 === 'B'` |
| `case4` | 비대칭 누적형 | `q1 === 'B' && q2 === 'B' && q8 === 'B'` |
| `default` | 기본 균형/초기 보상형 | 위 조건 중 없음 |

대표 결과 우선순위:

```ts
const CASE_PRIORITY = ['case4', 'case2', 'case1', 'case3', 'default'] as const;
```

동일한 `diagnose()` 함수를 클라이언트 결과 계산과 서버 제출 검증에서 공유한다.

## 8. 상태 저장 계획

`sessionStorage` 키:

| 키 | 내용 |
|---|---|
| `siztank_test_started_at` | 테스트 시작 시각 ISO string |
| `siztank_start_token` | 서버 서명 토큰 |
| `siztank_answers` | `Answers` JSON |
| `siztank_result` | `DiagnosisResult` JSON |

공통 유틸:

- `getSessionState()`
- `setAnswer(step, answer)`
- `getEarliestUnansweredStep()`
- `clearTestSession()`
- `isClientSessionExpired(startedAt)`

만료 기준:

- 클라이언트 상태: 시작 후 30분
- 서버 토큰: 발급 후 30분

## 9. 외부 연동 계획

### Google Sheets

- 서비스 계정 기반으로 접근한다.
- 시트는 공개 링크를 만들지 않는다.
- 저장 전후로 중복 번호를 확인한다.
- 저장 실패는 `SHEET_WRITE_FAILED`로 처리한다.
- MVP에서는 전화번호를 정규화된 평문으로 저장한다.

### 문자온 알림톡/SMS

- `MESSAGE_PROVIDER=alimtalk` 또는 `sms`로 분기한다.
- 알림톡은 `/api/kakao/at/sendMsg`를 사용한다.
- 알림톡 발송 요청에는 `subMsgSendYn: 'Y'`를 포함해 대체문자 발송을 허용한다.
- 성공 판정:

```ts
response.resultCode === '0' &&
response.data?.resultCode === '0' &&
Number(response.data?.successCnt ?? 0) > 0
```

- 기존 번호에는 발송 API를 호출하지 않는다.
- 메시지 발송 실패 시 Google Sheets row는 롤백하지 않는다.

## 10. 환경변수

필수:

- `APP_BASE_URL`
- `SESSION_TOKEN_SECRET`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_SHEET_NAME`
- `MESSAGE_PROVIDER`

문자온 연동 시:

- `MUNJAON_MBER_ID`
- `MUNJAON_ACCESS_KEY`
- `MUNJAON_SENDER_KEY`
- `MUNJAON_TEMPLATE_CODE`
- `MUNJAON_CALL_FROM`
- `MUNJAON_TEST_YN`

주의:

- 서버 전용 환경변수에는 `NEXT_PUBLIC_` prefix를 붙이지 않는다.
- PRD의 기존 `MUNJAON_API_KEY`, `MUNJAON_SENDER_PHONE` 명칭은 문자온 가이드 기준 변수명과 맞춰 정리한다.

## 11. 구현 순서

### Phase 1. 프로젝트 초기화

- Next.js App Router, TypeScript, Tailwind CSS 프로젝트를 생성한다.
- ESLint, Prettier 또는 프로젝트 기본 포맷팅을 설정한다.
- 모바일 앱형 중앙 레이아웃과 기본 디자인 토큰을 만든다.
- 공통 버튼, 오류, 진행 바 컴포넌트를 만든다.

### Phase 2. 도메인 로직

- 질문 상수와 결과 콘텐츠 상수를 작성한다.
- `diagnose()`와 결과 URL 생성/검증 유틸을 구현한다.
- 전화번호 정규화와 검증 유틸을 구현한다.
- `sessionStorage` 유틸을 구현한다.
- 진단 로직과 URL 검증 단위 테스트를 작성한다.

### Phase 3. 프론트엔드 화면

- 인트로 화면을 구현한다.
- 문항 화면과 이전/다음 이동을 구현한다.
- 분석 중 화면과 자동 이동을 구현한다.
- 연락처 입력 화면과 클라이언트 유효성 검사를 구현한다.
- 제출 완료 화면을 구현한다.
- 결과지 화면과 404 화면을 구현한다.
- 개인정보 처리방침 화면을 구현한다.

### Phase 4. 서버 API

- 환경변수 검증 모듈을 만든다.
- 서명 토큰 발급/검증을 구현한다.
- `POST /api/session/start`를 구현한다.
- `POST /api/submit`의 request 검증, 토큰 검증, 서버 재계산, 에러 응답을 구현한다.
- 15초 미만 제출 차단과 30분 만료 처리를 구현한다.

### Phase 5. Google Sheets 연동

- Google Sheets client를 구현한다.
- 전화번호 검색, row 추가, 기존 resultType 조회 함수를 구현한다.
- 중복 번호 저장/발송 방지 흐름을 `/api/submit`에 연결한다.
- 저장 실패와 동시 제출 가능성을 고려해 쓰기 직전 중복 확인을 추가한다.

### Phase 6. 문자온 발송 연동

- 알림톡 메시지와 대체 SMS 문구 builder를 구현한다.
- 문자온 client를 구현한다.
- `MESSAGE_PROVIDER` 분기를 구현한다.
- 신규 번호에만 발송하도록 `/api/submit`에 연결한다.
- 발송 실패 응답을 `MESSAGE_SEND_FAILED`로 변환한다.

### Phase 7. 분석 이벤트

- 이벤트 호출 wrapper를 만든다.
- PRD 기준 이벤트를 각 화면과 액션에 연결한다.
- GA4 또는 Vercel Analytics가 비활성인 경우에도 앱 동작에 영향 없게 처리한다.

### Phase 8. QA 및 배포 준비

- 360px, 390px, 430px, 데스크톱 중앙 480px 레이아웃을 확인한다.
- 정상 신규 사용자 플로우를 테스트한다.
- 중복 번호 플로우를 테스트한다.
- 토큰 없음, 토큰 만료, 15초 미만 제출을 테스트한다.
- 결과 URL 검증 실패 케이스를 테스트한다.
- Google Sheets 권한과 환경변수를 점검한다.
- 문자온 테스트 발송 모드와 실발송 모드를 분리 확인한다.

## 12. 테스트 체크리스트

- 8개 문항 모두 A/B 선택 가능
- 미선택 상태에서 다음 버튼 비활성화
- 이전 버튼 이동 후 선택 상태 유지
- 새로고침 후 30분 이내 상태 복원
- 30분 이후 접근 시 초기화
- `/quiz/contact` 직접 접근 시 답변/결과 없으면 홈 이동
- 국내 휴대폰 번호 형식 오류 표시
- 동의 체크 전 제출 불가
- 서버에서 15초 미만 제출 차단
- 서버에서 답변 기준 결과 재계산
- 신규 번호는 Google Sheets에 1회 저장
- 기존 번호는 저장 및 발송 반복 없음
- 발송 실패 시 재시도 가능한 오류 표시
- `primary`, `cases` URL 검증 동작
- `default`는 단독 결과로만 표시
- 개인정보 처리방침 링크 접근 가능
- 모바일 360px에서 버튼과 카드 텍스트가 깨지지 않음

## 13. 배포 전 확인 필요

- 개인정보 처리방침과 단일 체크박스 문구 법무 검토
- 알림톡 템플릿 심사 완료 여부
- 문자온 템플릿 코드와 sender key 확정
- 실제 운동 영상 URL 확정 여부
- 실제 추천 제품 URL 확정 여부
- Google Sheets 접근 권한 최소화
- `APP_BASE_URL` 운영 도메인 확정

## 14. 주요 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 단일 체크박스 문구의 법적 적합성 불확실 | 문구를 상수화하고 배포 전 교체 가능하게 구현 |
| Google Sheets 동시 제출 중복 가능성 | 검색 후 쓰기 직전 재검색 수행 |
| 메시지 발송 실패 후 row는 저장된 상태가 됨 | PRD 정책대로 롤백하지 않고 사용자에게 재시도 오류 표시 |
| 알림톡 심사 지연 | `MESSAGE_PROVIDER=sms`로 베타 발송 가능하게 구현 |
| 결과 URL 조작 | `/result`와 `/quiz/submitted`에서 내부 URL 및 case 파라미터 검증 |
| 클라이언트 결과 조작 | `/api/submit`에서 answers 기준으로 항상 서버 재계산 |

## 15. 완료 기준

- PRD의 구현 완료 기준 11개 항목을 모두 통과한다.
- 화면설계서의 QA 체크리스트를 모두 통과한다.
- 서버 API가 정의된 에러 코드와 사용자 메시지를 반환한다.
- 개인정보와 메시지 발송 관련 문구가 상수로 분리되어 있다.
- 배포 환경변수 누락 시 서버가 명확한 오류를 남긴다.
