import { createContext } from "react";

export const DynamicIslandContext = createContext<{
  islandWidth: number;
  setIslandWidth: (width: number) => void;
  islandHeight: number;
  setIslandHeight: (height: number) => void;
}>({
  islandWidth: 0,
  setIslandWidth: () => {},
  islandHeight: 0,
  setIslandHeight: () => {},
});
