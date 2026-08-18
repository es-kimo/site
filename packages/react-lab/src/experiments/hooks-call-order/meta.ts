import { defineExperiment } from "../../types";

export default defineExperiment({
  id: "hooks-call-order",
  title: "훅은 이름이 아니라 호출 순서로 슬롯에 매핑된다",
  question: "조건부로 훅을 하나 더 호출하면 정확히 무엇이 깨지는가?",
  hypothesis:
    "훅 슬롯이 한 칸씩 밀려서 이전 렌더의 다른 슬롯을 읽게 되고, 읽을 슬롯이 모자라는 순간 React가 렌더를 중단한다. 반대로 순서가 렌더마다 '일관'하기만 하면 훅이 몇 개든 문제가 없다.",
  finding: "",
  tags: ["hooks", "fiber", "rules-of-hooks"],
  run: { strictMode: false },
  post: "Frontend/react-hooks-조건부-호출",
  embeddable: true,
});
