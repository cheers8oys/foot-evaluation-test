import type { CaseId, ResultContent } from "@/lib/types";

export const CASE_PRIORITY: CaseId[] = ["case4", "case2", "case1", "case3", "default"];

export const RESULTS: Record<CaseId, ResultContent> = {
  case1: {
    id: "case1",
    name: "전방 중심 붕괴형",
    headline: "몸의 중심이 발 위에 있지 않고 앞으로 쏠리는 패턴입니다.",
    summary: "골반과 허리 꺾임이 앞쪽 하중을 가중시키는 유형",
    description:
      "허리가 꺾이고 갈비뼈가 벌어지는 자세에서 몸 전체 중심이 발 앞쪽으로 이동합니다. 발과 무릎에 가중 부하가 발생할 수 있습니다.",
    bodySignals: ["발 앞쪽 통증 가능성 점검", "허리 꺾임 신호 확인", "갈비뼈 벌어짐 패턴 점검"],
    exerciseTitle: "전방 중심 재정렬 운동",
    exerciseUrl: null,
    productName: "시즈탱크 추천 제품",
    productUrl: null,
  },
  case2: {
    id: "case2",
    name: "발 기능 붕괴형",
    headline: "발 아치와 지지 기능이 무너져 걸음에 반영되는 패턴입니다.",
    summary: "아치 붕괴와 하지 회전이 동시에 나타나는 유형",
    description:
      "발 전체가 지면에 무너지고 하지가 바깥으로 회전하며 엉덩이 근육 대신 발을 던지듯 걷는 패턴입니다.",
    bodySignals: ["발 아치 붕괴 신호 점검", "하지 외회전 패턴 확인", "엉덩이 활성화 저하 가능성"],
    exerciseTitle: "발 기능 강화 운동",
    exerciseUrl: null,
    productName: "시즈탱크 추천 제품",
    productUrl: null,
  },
  case3: {
    id: "case3",
    name: "호흡-코어 붕괴형",
    headline: "갈비뼈와 코어가 안정되지 않아 어깨와 목 보상이 커지는 패턴입니다.",
    summary: "갈비뼈 벌어짐과 어깨 긴장이 연결되는 유형",
    description:
      "호흡 시 갈비뼈가 벌어지고 코어가 제 역할을 하지 못해 어깨와 목이 보상 역할을 맡게 되는 패턴입니다.",
    bodySignals: [
      "갈비뼈 과도한 벌어짐 신호",
      "어깨 들림·목 긴장 패턴 점검",
      "코어 안정화 저하 가능성",
    ],
    exerciseTitle: "호흡 코어 안정화 운동",
    exerciseUrl: null,
    productName: "시즈탱크 추천 제품",
    productUrl: null,
  },
  case4: {
    id: "case4",
    name: "비대칭 누적형",
    headline: "한쪽으로 무너지는 패턴이 발, 골반, 척추, 얼굴 신호로 이어지는 유형입니다.",
    summary: "짝다리·외반·안면 비대칭이 함께 나타나는 가장 복합적인 패턴",
    description:
      "한쪽으로 체중이 치우치는 습관이 쌓여 발부터 얼굴까지 비대칭 신호가 축적된 상태입니다.",
    bodySignals: [
      "체중 좌우 비대칭 패턴 점검",
      "하지 외반 신호 확인",
      "안면·턱 비대칭 가능성 점검",
    ],
    exerciseTitle: "비대칭 교정 운동",
    exerciseUrl: null,
    productName: "시즈탱크 추천 제품",
    productUrl: null,
  },
  default: {
    id: "default",
    name: "기본 균형/초기 보상형",
    headline: "강한 붕괴 패턴보다 개별 항목 점검이 필요한 상태입니다.",
    summary: "전반적으로 양호하나 일부 항목 모니터링 권장",
    description:
      "뚜렷한 붕괴 패턴이 확인되지 않는 유형입니다. 특정 항목에서 초기 보상이 시작될 수 있으니 정기적인 점검을 권장합니다.",
    bodySignals: ["전반적인 자세 유지 상태 점검", "특정 부위 불편감 모니터링 권장"],
    exerciseTitle: "균형 유지 기초 운동",
    exerciseUrl: null,
    productName: "시즈탱크 추천 제품",
    productUrl: null,
  },
};
