import type { Question } from "@/lib/types";

export const QUESTIONS: Question[] = [
  {
    step: 1,
    area: "중심",
    text: "평소 나의 서 있는 모습은?",
    optionA: "양발 균형 / 수직 정렬",
    optionB: "짝다리 / 한쪽으로 기울어짐",
  },
  {
    step: 2,
    area: "하체 회전",
    text: "걸을 때 나의 발 모양은?",
    optionA: "발이 정면",
    optionB: "발이 바깥쪽으로 벌어짐",
  },
  {
    step: 3,
    area: "발 기능",
    text: "서 있을 때 발의 느낌은?",
    optionA: "아치 유지 / 3점 지지",
    optionB: "발 전체가 무너짐",
  },
  {
    step: 4,
    area: "골반",
    text: "나의 옆모습은?",
    optionA: "골반 중립",
    optionB: "허리 꺾임 / 배 나옴",
  },
  {
    step: 5,
    area: "호흡",
    text: "평소 내 몸통은?",
    optionA: "갈비뼈 닫힘",
    optionB: "갈비뼈 벌어짐",
  },
  {
    step: 6,
    area: "상체 보상",
    text: "내 어깨는 편안한가요?",
    optionA: "어깨가 자연스럽게 내려감",
    optionB: "어깨 들림 / 목 긴장",
  },
  {
    step: 7,
    area: "움직임 패턴",
    text: "걸을 때 엉덩이가 쓰이나요?",
    optionA: "발로 밀고 나감",
    optionB: "발을 던지듯 걷기",
  },
  {
    step: 8,
    area: "결과 신호",
    text: "안면 비대칭이 있나요?",
    optionA: "균형",
    optionB: "한쪽 눈/턱 치우침",
  },
];

export const TOTAL_STEPS = QUESTIONS.length;
