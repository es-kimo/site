import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// 셸은 StrictMode로 감싸지 않는다.
// StrictMode를 켜고 끄는 것 자체가 관찰 대상이라, 실험에만 골라서 씌운다. (App.tsx의 DemoHost)
createRoot(document.getElementById("root")!).render(<App />);
