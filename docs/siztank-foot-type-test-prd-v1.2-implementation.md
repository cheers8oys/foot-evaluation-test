# 시즈탱크 발 유형 테스트 구현용 PRD

**Product Requirements Document - v1.2 Implementation Brief**

| 항목 | 내용 |
|---|---|
| 작성일 | 2026.04.30 |
| 문서 버전 | v1.2 |
| 서비스명 | 시즈탱크 발 유형 테스트 |
| 문서 목적 | Codex 또는 Claude Code 기반 MVP 개발 입력물 |
| 예상 런칭 | 2026.05 베타 |
| MVP 원칙 | 최소 입력, 단일 체크박스, 서버 검증, 깨끗한 CRM 시트 |

---

## 1. 구현 요약

시즈탱크 발 유형 테스트는 모바일 중심의 8문항 A/B 테스트 서비스다. 사용자는 문항에 답한 뒤 휴대폰 번호를 입력하고 단일 동의 체크박스를 선택한다. 서버는 제출 시간이 너무 빠른 요청과 중복 전화번호를 차단하고, 신규 사용자만 Google Sheets에 저장한 뒤 알림톡 또는 SMS로 결과지 링크를 발송한다.

이 문서는 MVP 개발에 필요한 화면, 상태, API, 데이터, 예외 처리만 정의한다. 매출 목표, 캠페인 전략, 향후 확장 계획은 구현 범위에 포함하지 않는다.

---

## 2. MVP 구현 범위

### 2.1 포함

- 인트로 페이지
- 8문항 A/B 테스트
- 이전/다음 이동
- 클라이언트 sessionStorage 상태 저장
- 서버 서명 토큰 발급 및 검증
- 분석 중 화면
- 휴대폰 번호 입력 화면
- 단일 체크박스 동의
- 결과 계산
- Google Sheets 저장
- 동일 전화번호 중복 저장 및 중복 발송 방지
- 알림톡 또는 SMS 결과 발송
- 결과지 페이지
- 개인정보 처리방침 페이지
- 404 페이지

### 2.2 제외

- 이름 입력
- 전화번호 암복호화 저장
- IP 기반 rate limit
- CAPTCHA
- 관리자 대시보드
- 후속 메시지 자동 시퀀스
- AI 발 사진 분석
- PDF 결과지 다운로드
- 구매 데이터 기반 완전 개인화
- A/B 테스트 인프라

---

## 3. 사용자 흐름

1. 사용자가 유튜브 고정댓글 또는 설명란의 테스트 링크를 클릭한다.
2. `/` 인트로 페이지에 진입한다.
3. `테스트 시작` 버튼 클릭 시 서버에서 테스트 시작 토큰을 발급받는다.
4. `/quiz/1`부터 `/quiz/8`까지 A/B 선택을 진행한다.
5. 8번 문항 완료 후 `/quiz/analyzing` 화면을 1.2~2.0초 노출한다.
6. `/quiz/contact`에서 휴대폰 번호를 입력한다.
7. 단일 동의 체크박스를 선택한다.
8. `결과지 받기`를 누르면 서버에 제출한다.
9. 신규 번호라면 Google Sheets 저장 후 알림톡 또는 SMS로 결과 링크를 발송한다.
10. 사용자는 발송 완료 화면 또는 결과지 링크를 통해 결과를 확인한다.
11. 기존 번호라면 저장/발송하지 않고 기존 결과 안내 화면으로 이동한다.

---

## 4. 라우트

| ID | 경로 | 유형 | 설명 |
|---|---|---|---|
| P-01 | `/` | page | 인트로 화면 |
| P-02 | `/quiz/[step]` | page | 1~8번 문항 화면 |
| P-03 | `/quiz/analyzing` | page | 분석 중 화면 |
| P-04 | `/quiz/contact` | page | 휴대폰 번호 입력 및 동의 화면 |
| P-05 | `/quiz/submitted` | page | 발송 완료 또는 기존 번호 안내 화면 |
| P-06 | `/result` | page | 결과지 페이지 |
| P-07 | `/privacy` | page | 개인정보 처리방침 |
| P-08 | `/404` | page | 잘못된 접근 처리 |

---

## 5. 결과 URL 정책

MVP에서는 결과지 URL에 대표 결과와 함께 나타난 패턴을 쿼리 파라미터로 전달한다. Google Sheets에는 CRM 목적의 최소 데이터만 저장한다.

### 5.1 URL 형식

```text
/result?primary=case2&cases=case2,case3
```

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `primary` | 필수 | 대표 결과 case ID |
| `cases` | 필수 | 매칭된 전체 case ID 목록. 쉼표로 구분 |

### 5.2 URL 검증

- `primary`는 `case1`, `case2`, `case3`, `case4`, `default` 중 하나여야 한다.
- `cases`의 각 값도 허용된 case ID여야 한다.
- `cases`에 `primary`가 포함되어야 한다.
- `default`는 단독으로만 사용한다.
- 잘못된 파라미터면 `/404`로 이동한다.

### 5.3 중복 번호 처리

기존 번호가 제출되면 시트의 `resultType`을 사용해 다음 URL로 안내한다.

```text
/result?primary={resultType}&cases={resultType}
```

기존 사용자의 함께 나타난 패턴은 MVP에서 복원하지 않는다. 이는 CRM 시트를 깨끗하게 유지하기 위한 의도적 제약이다.

---

## 6. 상태 저장 정책

### 6.1 sessionStorage 키

| 키 | 데이터 | 설명 |
|---|---|---|
| `siztank_test_started_at` | ISO string | 클라이언트 테스트 시작 시각 |
| `siztank_start_token` | string | 서버가 발급한 서명 토큰 |
| `siztank_answers` | JSON string | q1~q8 답변 |
| `siztank_result` | JSON string | 계산된 primaryCase, matchedCases |

### 6.2 만료

- 클라이언트 상태는 시작 후 30분이 지나면 무효 처리한다.
- 만료 시 sessionStorage를 비우고 `/`로 이동한다.
- 서버 토큰도 발급 후 30분이 지나면 무효다.

### 6.3 새로고침 대응

- `/quiz/[step]`에서 이전 답변이 있으면 선택 상태를 복원한다.
- 필요한 이전 답변이 없으면 가장 이른 미응답 문항으로 이동한다.
- `/quiz/contact` 접근 시 8개 답변과 결과 계산값이 없으면 `/`로 이동한다.

---

## 7. 진단 문항

| Q | 영역 | 질문 | 선택 A | 선택 B |
|---|---|---|---|---|
| Q1 | 중심 | 평소 나의 서 있는 모습은? | 양발 균형 / 수직 정렬 | 짝다리 / 한쪽으로 기울어짐 |
| Q2 | 하체 회전 | 걸을 때 나의 발 모양은? | 발이 정면 | 발이 바깥쪽으로 벌어짐 |
| Q3 | 발 기능 | 서 있을 때 발의 느낌은? | 아치 유지 / 3점 지지 | 발 전체가 무너짐 |
| Q4 | 골반 | 나의 옆모습은? | 골반 중립 | 허리 꺾임 / 배 나옴 |
| Q5 | 호흡 | 평소 내 몸통은? | 갈비뼈 닫힘 | 갈비뼈 벌어짐 |
| Q6 | 상체 보상 | 내 어깨는 편안한가요? | 어깨가 자연스럽게 내려감 | 어깨 들림 / 목 긴장 |
| Q7 | 움직임 패턴 | 걸을 때 엉덩이가 쓰이나요? | 발로 밀고 나감 | 발을 던지듯 걷기 |
| Q8 | 결과 신호 | 안면 비대칭이 있나요? | 균형 | 한쪽 눈/턱 치우침 |

이미지는 MVP에서 실제 촬영 이미지가 없을 경우 placeholder asset을 사용한다. placeholder에는 `A 이미지 준비 중`, `B 이미지 준비 중` 같은 명확한 대체 문구를 표시한다.

---

## 8. 결과 분기 로직

### 8.1 Case 정의

| Case ID | 결과명 | 조건 |
|---|---|---|
| `case1` | 전방 중심 붕괴형 | `q1 === 'B' && q4 === 'B' && q5 === 'B'` |
| `case2` | 발 기능 붕괴형 | `q2 === 'B' && q3 === 'B' && q7 === 'B'` |
| `case3` | 호흡-코어 붕괴형 | `q5 === 'B' && q6 === 'B'` |
| `case4` | 비대칭 누적형 | `q1 === 'B' && q2 === 'B' && q8 === 'B'` |
| `default` | 기본 균형/초기 보상형 | 위 조건 중 아무것도 해당하지 않음 |

### 8.2 대표 결과 우선순위

1. `case4`
2. `case2`
3. `case1`
4. `case3`
5. `default`

### 8.3 계산 함수

```ts
type Answer = 'A' | 'B';
type CaseId = 'case1' | 'case2' | 'case3' | 'case4' | 'default';

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

const CASE_PRIORITY: CaseId[] = ['case4', 'case2', 'case1', 'case3', 'default'];

function diagnose(answers: Answers): {
  primaryCase: CaseId;
  matchedCases: CaseId[];
} {
  const matchedCases: CaseId[] = [];

  if (answers.q1 === 'B' && answers.q4 === 'B' && answers.q5 === 'B') {
    matchedCases.push('case1');
  }

  if (answers.q2 === 'B' && answers.q3 === 'B' && answers.q7 === 'B') {
    matchedCases.push('case2');
  }

  if (answers.q5 === 'B' && answers.q6 === 'B') {
    matchedCases.push('case3');
  }

  if (answers.q1 === 'B' && answers.q2 === 'B' && answers.q8 === 'B') {
    matchedCases.push('case4');
  }

  if (matchedCases.length === 0) {
    matchedCases.push('default');
  }

  const primaryCase = CASE_PRIORITY.find((caseId) => matchedCases.includes(caseId));

  if (!primaryCase) {
    return {
      primaryCase: 'default',
      matchedCases: ['default'],
    };
  }

  return {
    primaryCase,
    matchedCases,
  };
}
```

---

## 9. 결과 콘텐츠

### 9.1 공통 구조

각 결과는 아래 데이터를 가진다.

```ts
type ResultContent = {
  id: CaseId;
  name: string;
  headline: string;
  summary: string;
  description: string;
  bodySignals: string[];
  exerciseTitle: string;
  exerciseUrl: string | null;
  productName: string;
  productUrl: string | null;
};
```

### 9.2 콘텐츠 매핑

| Case ID | 결과명 | 핵심 메시지 | 운동 영상 | 추천 제품 |
|---|---|---|---|---|
| `case1` | 전방 중심 붕괴형 | 몸의 중심이 발 위에 있지 않고 앞으로 쏠리는 패턴입니다. | 추후 연결 | 추후 연결 |
| `case2` | 발 기능 붕괴형 | 발 아치와 지지 기능이 무너져 걸음에 반영되는 패턴입니다. | 추후 연결 | 추후 연결 |
| `case3` | 호흡-코어 붕괴형 | 갈비뼈와 코어가 안정되지 않아 어깨와 목 보상이 커지는 패턴입니다. | 추후 연결 | 추후 연결 |
| `case4` | 비대칭 누적형 | 한쪽으로 무너지는 패턴이 발, 골반, 척추, 얼굴 신호로 이어지는 유형입니다. | 추후 연결 | 추후 연결 |
| `default` | 기본 균형/초기 보상형 | 강한 붕괴 패턴보다 개별 항목 점검이 필요한 상태입니다. | 추후 연결 | 추후 연결 |

운동 영상과 추천 제품 URL이 없으면 버튼은 비활성화하지 말고 `준비 중` 상태의 보조 텍스트를 표시한다.

---

## 10. 입력 및 동의 정책

### 10.1 입력 항목

| 항목 | 필수 | 저장 | 설명 |
|---|---|---|---|
| 휴대폰 번호 | 예 | 예 | 결과지 발송 및 후속 안내용 |
| 이름 | 아니오 | 아니오 | MVP 제외 |

### 10.2 전화번호 형식

- 입력 UI는 `010-XXXX-XXXX` 형태를 유도한다.
- 서버 저장 시 숫자만 남겨 `01012345678` 형태로 정규화한다.
- 허용 형식은 국내 휴대폰 번호 11자리다.
- 서버는 `^010\d{8}$` 형식을 통과한 번호만 저장한다.

### 10.3 단일 체크박스 문구

```text
시즈탱크 발 유형 결과지와 맞춤 운동 콘텐츠, 혜택 안내를 카카오톡/SMS로 받는 데 동의합니다.
```

체크하지 않으면 제출 버튼은 비활성화한다.

### 10.4 개인정보 고지 문구

```text
입력한 휴대폰 번호는 결과지 발송 및 시즈탱크 콘텐츠·혜택 안내에 사용됩니다. 자세한 내용은 개인정보 처리방침에서 확인할 수 있습니다.
```

개인정보 처리방침 링크는 `/privacy`로 연결한다.

### 10.5 법무 확인 필요

개인정보 수집·이용 고지를 별도 체크박스로 받지 않는 정책과 마케팅 수신 동의 문구는 실제 배포 전 법무 또는 개인정보 담당자의 최종 확인을 받아야 한다. 개발자는 문구를 상수로 분리해 배포 전 교체 가능하게 구현한다.

---

## 11. API 계약

### 11.1 `POST /api/session/start`

테스트 시작 시 서버 서명 토큰을 발급한다.

#### Request

```json
{}
```

#### Response 200

```json
{
  "ok": true,
  "startToken": "signed-token",
  "expiresAt": "2026-04-30T15:00:00+09:00"
}
```

#### 처리 규칙

- 토큰에는 발급 시각과 만료 시각을 포함한다.
- 토큰은 서버 비밀키로 서명한다.
- 토큰은 DB에 저장하지 않는다.

### 11.2 `POST /api/submit`

전화번호, 동의, 결과 정보를 제출한다.

#### Request

```json
{
  "phone": "010-1234-5678",
  "consentChecked": true,
  "consentVersion": "v1",
  "startToken": "signed-token",
  "answers": {
    "q1": "A",
    "q2": "B",
    "q3": "B",
    "q4": "A",
    "q5": "B",
    "q6": "B",
    "q7": "B",
    "q8": "A"
  },
  "primaryCase": "case2",
  "matchedCases": ["case2", "case3"]
}
```

#### Response 200 - 신규 저장 및 발송 성공

```json
{
  "ok": true,
  "status": "created",
  "resultUrl": "/result?primary=case2&cases=case2,case3",
  "messageSent": true
}
```

#### Response 200 - 기존 번호

```json
{
  "ok": true,
  "status": "duplicate",
  "resultUrl": "/result?primary=case2&cases=case2",
  "messageSent": false,
  "message": "이미 결과지가 발송된 번호입니다. 아래 버튼에서 결과지를 다시 확인할 수 있어요."
}
```

#### Response 400 - 검증 실패

```json
{
  "ok": false,
  "errorCode": "INVALID_PHONE",
  "message": "휴대폰 번호를 다시 확인해 주세요."
}
```

#### Response 429 - 너무 빠른 제출

```json
{
  "ok": false,
  "errorCode": "TOO_FAST",
  "message": "테스트 진행 시간이 너무 짧습니다. 처음부터 다시 진행해 주세요."
}
```

#### Response 500 - 저장 또는 발송 실패

```json
{
  "ok": false,
  "errorCode": "SUBMIT_FAILED",
  "message": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
}
```

### 11.3 서버 검증 규칙

서버는 클라이언트가 보낸 `primaryCase`, `matchedCases`를 신뢰하지 않고 `answers`로 다시 계산한다.

| 검증 항목 | 실패 코드 | 처리 |
|---|---|---|
| 전화번호 형식 오류 | `INVALID_PHONE` | 400 |
| 체크박스 미동의 | `CONSENT_REQUIRED` | 400 |
| 답변 누락 또는 잘못된 값 | `INVALID_ANSWERS` | 400 |
| 토큰 없음 | `TOKEN_REQUIRED` | 400 |
| 토큰 서명 불일치 | `INVALID_TOKEN` | 400 |
| 테스트 시작 후 15초 미만 제출 | `TOO_FAST` | 429 |
| 토큰 발급 후 30분 초과 | `TOKEN_EXPIRED` | 400 |
| Google Sheets 저장 실패 | `SHEET_WRITE_FAILED` | 500 |
| 메시지 발송 실패 | `MESSAGE_SEND_FAILED` | 500 |

---

## 12. Google Sheets 저장

### 12.1 메인 시트 컬럼

| 컬럼 | 필드 | 예시 |
|---|---|---|
| A | `createdAt` | `2026-04-30T14:30:00+09:00` |
| B | `phone` | `01012345678` |
| C | `resultType` | `case2` |
| D | `consentVersion` | `v1` |

### 12.2 저장하지 않는 항목

- `name`
- `marketingConsent`
- `phoneHash`
- `phoneLast4`
- `sessionId`
- `ipHash`
- `resendCount`
- `answers`
- `matchedCases`

### 12.3 중복 번호 처리

1. 서버는 정규화된 전화번호로 기존 row를 검색한다.
2. 기존 번호가 없으면 row를 추가하고 메시지를 발송한다.
3. 기존 번호가 있으면 row를 추가하지 않는다.
4. 기존 번호가 있으면 알림톡/SMS를 재발송하지 않는다.
5. 기존 번호가 있으면 기존 row의 `resultType`으로 결과 URL을 만든다.

동시 제출이 발생할 수 있으므로 Google Sheets 쓰기 직전에도 한 번 더 중복 확인한다.

---

## 13. 알림톡/SMS 발송

### 13.1 발송 정책

- 우선순위 1: 알림톡
- 우선순위 2: SMS
- 알림톡 심사 또는 연동이 준비되지 않은 베타 환경에서는 SMS만 사용 가능하다.
- 메시지 발송 실패 시 row 저장을 롤백하지 않는다. 단, API 응답은 실패로 내려 사용자가 재시도할 수 있게 한다.

### 13.2 메시지 템플릿

```text
시즈탱크 발 유형 테스트 결과가 도착했어요.

▶ 발 유형: #{caseName}

상세 결과지와 맞춤 운동 영상은
아래 버튼에서 확인해 주세요.

* 본 메시지는 발 유형 테스트 신청자에게만 발송됩니다.
* 수신 거부: 시즈탱크 채널 차단
```

버튼:

```text
결과지 보러가기 → #{resultUrl}
```

### 13.3 템플릿 변수

| 변수 | 설명 |
|---|---|
| `#{caseName}` | 대표 결과명 |
| `#{resultUrl}` | 절대 URL |

---

## 14. 환경변수

| 이름 | 필수 | 설명 |
|---|---|---|
| `APP_BASE_URL` | 예 | 결과 URL 생성용 서비스 도메인 |
| `SESSION_TOKEN_SECRET` | 예 | 서버 서명 토큰 비밀키 |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | 예 | Google 서비스 계정 이메일 |
| `GOOGLE_SHEETS_PRIVATE_KEY` | 예 | Google 서비스 계정 private key |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | 예 | 저장 대상 스프레드시트 ID |
| `GOOGLE_SHEETS_SHEET_NAME` | 예 | 저장 대상 시트명 |
| `MESSAGE_PROVIDER` | 예 | `alimtalk` 또는 `sms` |
| `MUNJAON_API_KEY` | 조건부 | 문자온 API 키 |
| `MUNJAON_SENDER_KEY` | 조건부 | 알림톡 sender key |
| `MUNJAON_SENDER_PHONE` | 조건부 | SMS 발신 번호 |
| `GA4_MEASUREMENT_ID` | 아니오 | GA4 사용 시 |
| `VERCEL_ANALYTICS_ENABLED` | 아니오 | Vercel Analytics 사용 시 |

---

## 15. 분석 이벤트

| 이벤트명 | 발생 시점 | 속성 |
|---|---|---|
| `test_start` | 인트로에서 테스트 시작 클릭 | 없음 |
| `quiz_answer` | 각 문항 선택 | `step`, `answer` |
| `quiz_complete` | 8번 문항 완료 | `primaryCase`, `matchedCases` |
| `contact_view` | 연락처 화면 진입 | `primaryCase` |
| `submit_success` | 신규 저장 성공 | `primaryCase` |
| `submit_duplicate` | 기존 번호 제출 | `resultType` |
| `submit_error` | 제출 실패 | `errorCode` |
| `result_view` | 결과지 진입 | `primaryCase`, `cases` |

---

## 16. 보안 및 개인정보 원칙

- Google Sheet는 공개 링크를 만들지 않는다.
- Google Sheet 접근 권한은 최소 인원만 부여한다.
- Google 계정은 2단계 인증을 사용한다.
- 서비스 계정 키는 Vercel 환경변수에만 저장한다.
- 전화번호는 MVP에서 정규화된 평문으로 저장한다.
- 서버는 전화번호, 동의 여부, 토큰, 답변, 결과를 모두 검증한다.
- 개인정보 관련 문구는 상수화하고 배포 전 검토 가능하게 둔다.

---

## 17. 에러 메시지

| 상황 | 사용자 메시지 |
|---|---|
| 전화번호 형식 오류 | 휴대폰 번호를 다시 확인해 주세요. |
| 체크박스 미선택 | 결과지를 받으려면 안내 수신 동의가 필요합니다. |
| 답변 누락 | 테스트 답변이 확인되지 않습니다. 처음부터 다시 진행해 주세요. |
| 토큰 없음/오류 | 테스트 정보가 만료되었습니다. 처음부터 다시 진행해 주세요. |
| 15초 미만 제출 | 테스트 진행 시간이 너무 짧습니다. 처음부터 다시 진행해 주세요. |
| 중복 번호 | 이미 결과지가 발송된 번호입니다. 아래 버튼에서 결과지를 다시 확인할 수 있어요. |
| 저장/발송 실패 | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |

---

## 18. 구현 완료 기준

- 모바일 360px 너비에서 모든 화면이 깨지지 않는다.
- 8문항 답변 후 결과 계산이 정확히 동작한다.
- 새로고침 후에도 30분 이내 답변 상태가 복원된다.
- 30분 이후 접근 시 초기화된다.
- 15초 미만 제출이 서버에서 차단된다.
- 서버가 답변 기준으로 결과를 재계산한다.
- 신규 번호는 Google Sheets에 1회 저장된다.
- 기존 번호는 저장 및 발송을 반복하지 않는다.
- 결과 URL의 `primary`, `cases` 검증이 동작한다.
- 결과지에서 대표 결과와 함께 나타난 패턴이 분리 표시된다.
- 개인정보 처리방침 링크가 접근 가능하다.

---

## 19. 남은 의사결정

아래 항목은 개발 중 placeholder로 처리하고, 배포 전 확정한다.

| 항목 | 임시 처리 |
|---|---|
| 알림톡 심사 전 베타 발송 수단 | `MESSAGE_PROVIDER=sms` 사용 가능하게 구현 |
| 실제 운동 영상 URL | 결과별 `exerciseUrl = null` 허용 |
| 실제 추천 제품 URL | 결과별 `productUrl = null` 허용 |
| 개인정보 처리방침 최종 문구 | `/privacy`에 초안 표시 후 배포 전 교체 |

---

**문서 끝**
