/** /preview를 iframe으로 띄워 원문을 보낼 수 있는 에디터 origin. 쉼표로 여러 개를 적는다. */
export const editorOrigins = (process.env.NEXT_PUBLIC_EDITOR_ORIGINS ?? "https://editor.khryu.dev")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
