import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// 셸은 일부러 StrictMode로 감싸지 않는다.
// StrictMode를 켜고 끄는 것 자체가 관찰 대상이고, 셸의 이중 렌더가
// 실험 결과(렌더 횟수, 로그 순서)에 섞이면 안 되기 때문이다.
// 데모는 Runner가 자기 루트에 마운트하면서 필요할 때만 StrictMode를 씌운다.
const container = document.getElementById("root");
if (container === null) throw new Error("#root를 찾을 수 없습니다");

createRoot(container).render(<App />);
