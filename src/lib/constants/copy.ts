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

export const PLACEHOLDER_COPY = {
  exerciseReady: "맞춤 운동 영상은 준비 중입니다.",
  productReady: "추천 제품 정보는 준비 중입니다.",
  imageA: "A 이미지 준비 중",
  imageB: "B 이미지 준비 중",
} as const;
