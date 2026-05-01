# 문자온 알림톡 REST API 연동 가이드

> 프로젝트 공통 보안, TDD, 검증, Git 작업 제약은 루트 `AGENTS.md`를 우선한다.

**Integration Guide for Siztank Foot Type Test MVP**

| 항목           | 내용                                                |
| -------------- | --------------------------------------------------- |
| 작성일         | 2026.04.30                                          |
| 기준 서비스    | 시즈탱크 발 유형 테스트 MVP                         |
| 기준 PRD       | `siztank-foot-type-test-prd-v1.2-implementation.md` |
| 대상 기술 스택 | Next.js App Router, TypeScript, Vercel Server Route |
| API 제공사     | 문자온                                              |
| API Base URL   | `https://api.munjaon.co.kr`                         |

---

## 1. 우리 서비스에서의 사용 목적

시즈탱크 발 유형 테스트 MVP에서는 사용자가 8문항 테스트를 완료하고 이름과 휴대폰 번호를 제출하면, 신규 번호에 한해 문자온 알림톡 API로 결과지 링크를 발송한다.

알림톡 발송은 `/api/submit` 서버 처리 흐름 안에서 실행한다. 기존 번호가 제출된 경우에는 Google Sheets에 추가 저장하지 않고, 알림톡도 재발송하지 않는다.

---

## 2. MVP 연동 범위

### 2.1 필수 구현

- 채널 ID 조회
- 템플릿 목록 조회
- 알림톡 발송
- 알림톡 실패 응답 처리
- 알림톡 대체문자 발송 옵션 사용
- 환경변수 기반 인증 정보 관리

### 2.2 선택 구현

- 템플릿 상세조회
- 발송 가능 건수 조회
- 전송 내역 조회
- 전송 내역 상세조회

### 2.3 MVP에서 직접 구현하지 않는 것

- 관리자 화면에서 채널/템플릿 목록 관리
- 발송 결과 주기적 polling
- 발송 실패 재시도 큐
- 다건 발송 UI
- 친구톡 발송

---

## 3. 권장 환경변수

기존 PRD의 `MUNJAON_API_KEY`, `MUNJAON_SENDER_KEY`, `MUNJAON_SENDER_PHONE`를 실제 문자온 API 필드명에 맞춰 아래처럼 구체화한다.

| 환경변수                | 필수   | 문자온 API 필드 | 설명                                                                 |
| ----------------------- | ------ | --------------- | -------------------------------------------------------------------- |
| `MESSAGE_PROVIDER`      | 예     | -               | `alimtalk` 또는 `sms`                                                |
| `MUNJAON_MBER_ID`       | 예     | `mberId`        | 문자온 사용자 ID                                                     |
| `MUNJAON_ACCESS_KEY`    | 예     | `accessKey`     | 문자온 인증용 API Key                                                |
| `MUNJAON_SENDER_KEY`    | 예     | `senderKey`     | 카카오 채널 발신 프로필 SenderKey                                    |
| `MUNJAON_TEMPLATE_CODE` | 예     | `templateCode`  | 결과지 발송용 알림톡 템플릿 코드                                     |
| `MUNJAON_CALL_FROM`     | 예     | `callFrom`      | 문자온에 등록된 발신자 번호                                          |
| `MUNJAON_TEST_YN`       | 아니오 | `test_yn`       | 테스트 데이터 여부. 성공 테스트 `YS`, 실패 테스트 `YF`, 실발송 빈 값 |
| `APP_BASE_URL`          | 예     | -               | 절대 결과 URL 생성용                                                 |

Vercel 환경변수에 저장하고 클라이언트로 노출하지 않는다. `NEXT_PUBLIC_` prefix를 사용하지 않는다.

---

## 4. 전체 발송 흐름

```text
사용자 /quiz/contact 제출
-> POST /api/submit
-> 서버에서 startToken 검증
-> 서버에서 answers 기준 결과 재계산
-> 이름 trim 및 형식 검증
-> 전화번호 정규화
-> Google Sheets 중복 번호 확인
-> 신규 번호면 Google Sheets 저장
-> 문자온 알림톡 발송
-> 성공 시 /quiz/submitted?status=created 반환
-> 기존 번호면 저장/발송 없이 duplicate 반환
```

---

## 5. 문자온 공통 규칙

| 항목         | 값                          |
| ------------ | --------------------------- |
| 프로토콜     | `HTTPS/1.1`                 |
| Host         | `api.munjaon.co.kr`         |
| Port         | `443`                       |
| Method       | `POST`                      |
| Content-Type | `application/json`          |
| 성공 판단    | 최상위 `resultCode === "0"` |

알림톡 발송 API는 최상위 `resultCode`와 `data.resultCode`가 모두 `"0"`인지 확인한다.

---

## 6. API 요약

| 용도                | Endpoint                          | MVP 사용           |
| ------------------- | --------------------------------- | ------------------ |
| 채널 ID 조회        | `/api/kakao/inqry/chnlId`         | 초기 설정 확인용   |
| 템플릿 목록 조회    | `/api/kakao/inqry/templates/list` | 템플릿 코드 확인용 |
| 템플릿 상세조회     | 문서상 endpoint 확인 필요         | 선택               |
| 알림톡 보내기       | `/api/kakao/at/sendMsg`           | 필수               |
| 전송 내역 조회      | `/api/inqry/hstry`                | 선택               |
| 전송 내역 상세조회  | `/api/inqry/hstryDetail`          | 선택               |
| 발송 가능 건수 조회 | `/api/inqry/price`                | 운영 점검용        |

템플릿 상세조회는 제공 문서에 endpoint가 명시되어 있지 않다. 구현 전에 문자온 관리자 또는 최신 문서에서 정확한 endpoint를 확인해야 한다.

---

## 7. 채널 ID 조회

### 7.1 목적

문자온 계정에 등록된 카카오 채널과 `senderKey`를 확인한다. 개발 초기 설정 또는 운영 점검용으로 사용한다.

### 7.2 Request

```http
POST https://api.munjaon.co.kr/api/kakao/inqry/chnlId
Content-Type: application/json
```

```json
{
  "mberId": "문자온_사용자_ID",
  "accessKey": "문자온_API_KEY",
  "test_yn": ""
}
```

### 7.3 Response

```json
{
  "resultCode": "0",
  "data": [
    {
      "senderKey": "test_sender_key_001",
      "phoneNumber": "<REGISTERED_CHANNEL_PHONE>",
      "yellowId": "@test_channel_001",
      "frstRegistPnttm": "2025-09-09 12:44:21",
      "frstRegisterId": "test_id_one"
    }
  ],
  "localDateTime": "2025-09-09T12:44:21.624464"
}
```

### 7.4 구현 메모

- 이 API는 사용자 제출 흐름에서 매번 호출하지 않는다.
- 운영자가 `MUNJAON_SENDER_KEY`를 확인할 때만 사용한다.
- 실패 시 `data`는 문자열 오류 메시지다.

---

## 8. 템플릿 목록 조회

### 8.1 목적

알림톡 템플릿 코드인 `templateCode`와 승인 상태를 확인한다.

### 8.2 Request

```http
POST https://api.munjaon.co.kr/api/kakao/inqry/templates/list
Content-Type: application/json
```

```json
{
  "mberId": "문자온_사용자_ID",
  "accessKey": "문자온_API_KEY",
  "senderKey": "발신_프로필_SENDER_KEY",
  "test_yn": ""
}
```

### 8.3 주요 Response 필드

| 필드            | 설명                                        |
| --------------- | ------------------------------------------- |
| `senderKey`     | 발신 프로필 SenderKey                       |
| `templateCode`  | 템플릿 코드. `MUNJAON_TEMPLATE_CODE`에 저장 |
| `templateName`  | 템플릿 이름                                 |
| `serviceStatus` | 서비스 상태. 등록완료 또는 승인대기 등      |

### 8.4 구현 메모

- MVP 배포 전 `serviceStatus`가 발송 가능한 상태인지 확인한다.
- 템플릿 코드가 바뀔 수 있으므로 코드에 하드코딩하지 않고 환경변수로 둔다.

---

## 9. 알림톡 보내기

### 9.1 목적

신규 사용자의 결과지 링크를 카카오 알림톡으로 발송한다.

### 9.2 Request

```http
POST https://api.munjaon.co.kr/api/kakao/at/sendMsg
Content-Type: application/json
```

### 9.3 문자온 필드

| 키                  | 필수   | 설명                  | 우리 서비스 값               |
| ------------------- | ------ | --------------------- | ---------------------------- |
| `mberId`            | 예     | 사용자 ID             | `MUNJAON_MBER_ID`            |
| `accessKey`         | 예     | 인증용 API Key        | `MUNJAON_ACCESS_KEY`         |
| `senderKey`         | 예     | 발신 프로필 SenderKey | `MUNJAON_SENDER_KEY`         |
| `templateCode`      | 예     | 알림톡 템플릿 코드    | `MUNJAON_TEMPLATE_CODE`      |
| `callFrom`          | 예     | 발신자 번호           | `MUNJAON_CALL_FROM`          |
| `callTo_1`          | 예     | 수신자 번호           | 정규화된 사용자 전화번호     |
| `templateTitle_1`   | 아니오 | 치환용 템플릿 타이틀  | 템플릿 강조형일 때만         |
| `templateContent_1` | 예     | 치환용 템플릿 내용    | 완성된 알림톡 본문           |
| `subMsgSendYn`      | 아니오 | 대체문자 발송 여부    | `Y` 권장                     |
| `subMsgTxt_1`       | 아니오 | 대체문자 내용         | 결과 링크 포함 SMS 문구      |
| `test_yn`           | 아니오 | 테스트 여부           | `MUNJAON_TEST_YN` 또는 빈 값 |

### 9.4 우리 서비스 Request 예시

```json
{
  "mberId": "문자온_사용자_ID",
  "accessKey": "문자온_API_KEY",
  "senderKey": "문자온_SENDER_KEY",
  "templateCode": "siztank_foot_type_result_v1",
  "callFrom": "<REGISTERED_SENDER_PHONE>",
  "callTo_1": "<RECIPIENT_PHONE>",
  "templateContent_1": "시즈탱크 발 유형 테스트 결과가 도착했어요.\n\n▶ 발 유형: 발 기능 붕괴형\n\n상세 결과지와 맞춤 운동 영상은\n아래 링크에서 확인해 주세요.\nhttps://example.com/result?primary=case2&cases=case2,case3\n\n* 본 메시지는 발 유형 테스트 신청자에게만 발송됩니다.\n* 수신 거부: 시즈탱크 채널 차단",
  "subMsgSendYn": "Y",
  "subMsgTxt_1": "[시즈탱크] 발 유형 테스트 결과: 발 기능 붕괴형\nhttps://example.com/result?primary=case2&cases=case2,case3",
  "test_yn": ""
}
```

### 9.5 Response 성공 예시

```json
{
  "resultCode": "0",
  "data": {
    "resultCode": "0",
    "msgGroupId": "MSGGID_AT_1757467849001",
    "successCnt": "1",
    "blockCnt": "0",
    "failCnt": "0",
    "msgType": "AT",
    "test_yn": ""
  },
  "localDateTime": "2025-09-10T10:30:49.001636"
}
```

### 9.6 성공 판정

아래 조건을 모두 만족해야 성공으로 본다.

```ts
response.resultCode === "0" &&
  response.data?.resultCode === "0" &&
  Number(response.data?.successCnt ?? 0) > 0;
```

### 9.7 실패 처리

| 실패 상황                   | 처리                         |
| --------------------------- | ---------------------------- |
| 최상위 `resultCode !== "0"` | `MESSAGE_SEND_FAILED`로 처리 |
| `data.resultCode !== "0"`   | `MESSAGE_SEND_FAILED`로 처리 |
| `successCnt === "0"`        | `MESSAGE_SEND_FAILED`로 처리 |
| 네트워크 오류               | `MESSAGE_SEND_FAILED`로 처리 |
| timeout                     | `MESSAGE_SEND_FAILED`로 처리 |

MVP에서는 Google Sheets 저장 후 알림톡 발송에 실패해도 저장 row를 롤백하지 않는다. 대신 `/api/submit` 응답은 실패로 내려 사용자가 다시 시도할 수 있게 한다.

---

## 10. 결과지 알림톡 문구

### 10.1 기본 템플릿

```text
시즈탱크 발 유형 테스트 결과가 도착했어요.

▶ 발 유형: #{caseName}

상세 결과지와 맞춤 운동 영상은
아래 링크에서 확인해 주세요.
#{resultUrl}

* 본 메시지는 발 유형 테스트 신청자에게만 발송됩니다.
* 수신 거부: 시즈탱크 채널 차단
```

### 10.2 변수

| 변수           | 값                               |
| -------------- | -------------------------------- |
| `#{caseName}`  | 대표 결과명                      |
| `#{resultUrl}` | `APP_BASE_URL`을 포함한 절대 URL |

### 10.3 주의사항

- 알림톡 템플릿은 카카오 심사를 통과한 내용과 실제 발송 내용이 일치해야 한다.
- `templateContent_1`은 승인된 템플릿의 치환 가능한 범위 안에서만 변경한다.
- 버튼형 템플릿을 사용하는 경우 문자온 템플릿 설정에 버튼 URL 치환 방식이 있는지 별도 확인한다.
- 현재 제공 API 예시는 `templateContent_1`과 대체문자 중심이므로, 버튼 링크 치환 필드가 필요한 템플릿은 문자온 최신 문서를 확인한다.

---

## 11. TypeScript 타입 제안

```ts
type MunjaonResultCode = string;

type MunjaonBaseResponse<T> = {
  resultCode: MunjaonResultCode;
  data: T | string;
  localDateTime?: string;
};

type MunjaonSendData = {
  resultCode: string;
  msgGroupId: string;
  successCnt: string;
  blockCnt: string;
  failCnt: string;
  msgType: "AT" | string;
  test_yn: string;
};

type SendAlimtalkInput = {
  to: string;
  caseName: string;
  resultUrl: string;
};

type SendAlimtalkResult =
  | {
      ok: true;
      msgGroupId: string;
      successCnt: number;
    }
  | {
      ok: false;
      errorCode: "MESSAGE_SEND_FAILED";
      providerCode?: string;
      providerMessage?: string;
    };
```

---

## 12. Next.js 서버 구현 형태

권장 파일 구조:

```text
src/
  app/
    api/
      submit/
        route.ts
  lib/
    munjaon/
      client.ts
      message.ts
      types.ts
```

### 12.1 `lib/munjaon/message.ts`

```ts
export function buildResultMessage(input: { caseName: string; resultUrl: string }) {
  return [
    "시즈탱크 발 유형 테스트 결과가 도착했어요.",
    "",
    `▶ 발 유형: ${input.caseName}`,
    "",
    "상세 결과지와 맞춤 운동 영상은",
    "아래 링크에서 확인해 주세요.",
    input.resultUrl,
    "",
    "* 본 메시지는 발 유형 테스트 신청자에게만 발송됩니다.",
    "* 수신 거부: 시즈탱크 채널 차단",
  ].join("\n");
}

export function buildFallbackSms(input: { caseName: string; resultUrl: string }) {
  return `[시즈탱크] 발 유형 테스트 결과: ${input.caseName}\n${input.resultUrl}`;
}
```

### 12.2 `lib/munjaon/client.ts`

```ts
const MUNJAON_BASE_URL = "https://api.munjaon.co.kr";

export async function sendAlimtalk(input: SendAlimtalkInput): Promise<SendAlimtalkResult> {
  const templateContent = buildResultMessage(input);
  const fallbackSms = buildFallbackSms(input);

  const response = await fetch(`${MUNJAON_BASE_URL}/api/kakao/at/sendMsg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mberId: process.env.MUNJAON_MBER_ID,
      accessKey: process.env.MUNJAON_ACCESS_KEY,
      senderKey: process.env.MUNJAON_SENDER_KEY,
      templateCode: process.env.MUNJAON_TEMPLATE_CODE,
      callFrom: process.env.MUNJAON_CALL_FROM,
      callTo_1: input.to,
      templateContent_1: templateContent,
      subMsgSendYn: "Y",
      subMsgTxt_1: fallbackSms,
      test_yn: process.env.MUNJAON_TEST_YN ?? "",
    }),
  });

  const json = await response.json();

  if (
    json.resultCode !== "0" ||
    typeof json.data !== "object" ||
    json.data?.resultCode !== "0" ||
    Number(json.data?.successCnt ?? 0) < 1
  ) {
    return {
      ok: false,
      errorCode: "MESSAGE_SEND_FAILED",
      providerCode: json.resultCode,
      providerMessage: typeof json.data === "string" ? json.data : undefined,
    };
  }

  return {
    ok: true,
    msgGroupId: json.data.msgGroupId,
    successCnt: Number(json.data.successCnt),
  };
}
```

실제 구현에서는 `process.env` 누락 검증과 fetch timeout 처리를 추가한다.

---

## 13. `/api/submit` 연동 위치

```text
1. request body 검증
2. startToken 검증
3. answers로 결과 재계산
4. 이름 trim 및 형식 검증
5. 전화번호 정규화
6. Google Sheets에서 중복 번호 확인
7. 기존 번호면 duplicate 응답
8. 신규 번호면 Google Sheets row 추가
9. sendAlimtalk 호출
10. 발송 성공이면 created 응답
11. 발송 실패면 MESSAGE_SEND_FAILED 응답
```

중복 번호에는 `sendAlimtalk`를 호출하지 않는다.

---

## 14. 운영 점검 API

### 14.1 발송 가능 건수 조회

Endpoint:

```text
POST /api/inqry/price
```

용도:

- 배포 전 잔액 확인
- 알림톡 발송 가능 건수 확인
- 운영자가 수동으로 점검

주요 필드:

| 필드                 | 설명                  |
| -------------------- | --------------------- |
| `mberMoney`          | 회원 보유 금액        |
| `kakaoAtSendPsbltEa` | 알림톡 발송 가능 건수 |
| `shortSendPsbltEa`   | SMS 발송 가능 건수    |
| `longSendPsbltEa`    | LMS 발송 가능 건수    |

### 14.2 전송 내역 조회

Endpoint:

```text
POST /api/inqry/hstry
```

용도:

- 운영자가 특정 기간 발송 성공/실패를 확인
- `msgGroupId` 기반 상세 조회 전 목록 확인

### 14.3 전송 내역 상세조회

Endpoint:

```text
POST /api/inqry/hstryDetail
```

용도:

- 특정 `msgGroupId`의 개별 수신자별 성공/실패 확인

MVP 코드에서는 자동 조회하지 않아도 된다. 장애 대응용 내부 스크립트 또는 운영 문서로 충분하다.

---

## 15. 테스트 전략

### 15.1 문자온 테스트 모드

문자온 API는 `test_yn`을 지원한다.

| 값    | 의미        |
| ----- | ----------- |
| `YS`  | 성공 테스트 |
| `YF`  | 실패 테스트 |
| 빈 값 | 실제 요청   |

개발/스테이징에서는 `MUNJAON_TEST_YN=YS`로 성공 응답 흐름을 먼저 검증한다.

### 15.2 필수 테스트 케이스

| 케이스                  | 기대 결과                                                 |
| ----------------------- | --------------------------------------------------------- |
| 신규 번호 + 테스트 성공 | 이름과 전화번호 Google Sheets 저장, 알림톡 성공 응답      |
| 신규 번호 + 문자온 실패 | Google Sheets 저장, `/api/submit`은 `MESSAGE_SEND_FAILED` |
| 기존 번호               | Google Sheets 추가 저장 없음, 알림톡 미발송               |
| 이름 오류               | 문자온 호출 전 `INVALID_NAME`                             |
| 전화번호 오류           | 문자온 호출 전 `INVALID_PHONE`                            |
| 토큰 만료               | 문자온 호출 전 `TOKEN_EXPIRED`                            |
| 15초 미만 제출          | 문자온 호출 전 `TOO_FAST`                                 |

---

## 16. 오류 코드 매핑

| 문자온 응답               | 우리 API 오류 코드    | 사용자 메시지                                             |
| ------------------------- | --------------------- | --------------------------------------------------------- |
| `resultCode !== "0"`      | `MESSAGE_SEND_FAILED` | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |
| `data.resultCode !== "0"` | `MESSAGE_SEND_FAILED` | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |
| 네트워크 오류             | `MESSAGE_SEND_FAILED` | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |
| timeout                   | `MESSAGE_SEND_FAILED` | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |

제공 문서의 실패 예시:

| resultCode | 메시지                         | 메모                                                    |
| ---------- | ------------------------------ | ------------------------------------------------------- |
| `2080`     | 친구톡은 특정 시간대 발송 제한 | 알림톡 발송 API에서 반환될 수 있으므로 일반 실패로 처리 |
| `2099`     | 기타 시스템 오류               | 일반 실패                                               |
| `3099`     | 기타 시스템 오류               | 운영 점검 API 일반 실패                                 |
| `4010`     | 인증 정보 오류                 | 환경변수 확인 필요                                      |
| `4099`     | 기타 시스템 오류               | 일반 실패                                               |

---

## 17. 보안 주의사항

- `mberId`, `accessKey`, `senderKey`, `templateCode`는 서버 환경변수로만 관리한다.
- API 요청/응답 전체를 로그에 남기지 않는다.
- 특히 이름, `callTo_1`, `templateContent_1`, `subMsgTxt_1`에는 개인정보와 결과 URL이 포함될 수 있다.
- 운영 로그에는 `msgGroupId`, provider `resultCode`, 내부 오류 코드 정도만 남긴다.
- 클라이언트에는 문자온 오류 원문을 그대로 노출하지 않는다.

---

## 18. 구현 전 확인사항

- 문자온 계정의 `mberId`와 `accessKey` 확보
- 채널 ID 조회로 `senderKey` 확인
- 알림톡 템플릿 승인 완료 여부 확인
- 결과지 발송용 `templateCode` 확인
- 등록된 발신번호 `callFrom` 확인
- 알림톡 템플릿의 변수/버튼 치환 방식 확인
- `APP_BASE_URL`의 실제 배포 도메인 확정
- 개인정보 처리방침 URL 배포 확인

---

**문서 끝**
