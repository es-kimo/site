import { defineExperiment } from "../../types";

export default defineExperiment({
  id: "strict-mode-double-invoke",
  title: "StrictMode는 무엇을 두 번 부르고 무엇을 두 번 부르지 않는가",
  question:
    "StrictMode를 켜면 렌더가 두 번 돈다고들 하는데, 커밋도 두 번인가? effect는 정확히 어떤 순서로 도는가?",
  hypothesis:
    "렌더 함수는 두 번 호출되지만 커밋은 한 번이다. effect는 mount → cleanup → mount 순서로 돌아서, cleanup을 빼먹은 effect를 드러낸다.",
  finding: "",
  tags: ["strict-mode", "effects", "commit"],
  run: { strictMode: true },
  // kit(useLifecycleTrace)을 쓰므로 Sandpack에는 그대로 넣을 수 없다
  embeddable: false,
});
