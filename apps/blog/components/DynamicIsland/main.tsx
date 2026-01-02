import { type Language } from "@/lib/language";
import { IdleIsland } from "./idle";

export const MainIsland = ({ language }: { language: Language }) => {
  return <IdleIsland language={language} showLogo={false} />;
};
