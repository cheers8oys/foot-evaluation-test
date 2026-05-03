export const ERROR_MESSAGES = {
  INVALID_NAME: "이름을 입력해 주세요.",
  INVALID_PHONE: "휴대폰 번호를 다시 확인해 주세요.",
  CONSENT_REQUIRED: "결과지를 받으려면 안내 수신 동의가 필요합니다.",
  INVALID_ANSWERS: "테스트 답변이 확인되지 않습니다. 처음부터 다시 진행해 주세요.",
  TOKEN_REQUIRED: "테스트 정보가 만료되었습니다. 처음부터 다시 진행해 주세요.",
  INVALID_TOKEN: "테스트 정보가 만료되었습니다. 처음부터 다시 진행해 주세요.",
  TOKEN_EXPIRED: "테스트 정보가 만료되었습니다. 처음부터 다시 진행해 주세요.",
  TOO_FAST: "테스트 진행 시간이 너무 짧습니다. 처음부터 다시 진행해 주세요.",
  SUBMIT_FAILED: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  SHEET_WRITE_FAILED: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  MESSAGE_SEND_FAILED: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

export const INTRO_COPY = {
  brandName: "시즈탱크",
  title: "내 발 유형은 어떤 패턴일까요?",
  subtitle: "8개의 간단한 선택으로 발과 몸의 사용 패턴을 확인해 보세요.",
  estimatedTime: "약 1분",
  ctaLabel: "테스트 시작하기",
  genericError: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

export const ANALYZING_COPY = {
  title: "발 사용 패턴을 확인하고 있어요",
  description: "답변을 바탕으로 대표 유형과 함께 나타난 패턴을 정리 중입니다.",
} as const;

export const CONTACT_COPY = {
  title: "결과지를 받을 이름과 휴대폰 번호를 입력해 주세요",
  description: "결과 링크를 카카오톡 또는 문자로 보내드립니다.",
  submitLabel: "결과지 받기",
  resetLabel: "처음부터 다시 진행하기",
} as const;

export const SUBMITTED_COPY = {
  created: {
    title: "결과지를 보내드렸어요",
    description: "카카오톡 또는 문자로 받은 링크와 아래 버튼에서 결과지를 확인할 수 있어요.",
    ctaLabel: "결과지 보러 가기",
  },
  duplicate: {
    title: "이미 결과지가 발송된 번호예요",
    description: "아래 버튼에서 기존 결과지를 다시 확인할 수 있어요.",
    ctaLabel: "기존 결과지 보기",
  },
  resetLabel: "처음부터 다시 하기",
} as const;

export const PRIVACY_COPY = {
  title: "개인정보 처리방침",
  description: "결과지 발송과 테스트 운영을 위해 아래 기준으로 개인정보를 처리합니다.",
  sections: [
    {
      heading: "수집 항목",
      items: ["이름", "휴대폰 번호", "테스트 답변 및 계산된 결과"],
    },
    {
      heading: "이용 목적",
      items: ["테스트 결과 링크 발송", "중복 제출 확인", "고객 문의 대응과 서비스 운영 기록 관리"],
    },
    {
      heading: "보유 기간",
      items: ["결과 발송과 운영 확인을 위해 필요한 기간 동안 보관 후 파기합니다."],
    },
    {
      heading: "수신 거부 방법",
      items: [
        "안내 메시지 수신을 원하지 않으면 발송 연락처 또는 상담 채널로 거부를 요청할 수 있습니다.",
      ],
    },
    {
      heading: "문의처",
      items: ["시즈탱크 고객 문의 채널을 통해 개인정보 처리 관련 문의를 접수할 수 있습니다."],
    },
  ],
  reviewNotice: "배포 전 최종 문구는 법무 또는 개인정보 담당 검토본으로 교체합니다.",
} as const;

export const NOT_FOUND_COPY = {
  title: "페이지를 찾을 수 없어요",
  description: "입력한 주소가 잘못되었거나 접근할 수 없는 경로입니다.",
  body: "테스트를 처음부터 다시 시작하거나 홈 화면에서 올바른 경로로 이동해 주세요.",
  ctaLabel: "홈으로 이동",
} as const;

export const PLACEHOLDER_COPY = {
  exerciseReady: "맞춤 운동 영상은 준비 중입니다.",
  productReady: "추천 제품 정보는 준비 중입니다.",
  imageA: "A 이미지 준비 중",
  imageB: "B 이미지 준비 중",
} as const;
