export const joinPath = (...segments: string[]) => {
  return segments.map((s) => s.replace(/^\/|\/$/g, "")).join("/");
};
