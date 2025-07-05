import { cookies } from "next/headers";

// 전역 타입 확장
declare global {
  var activeSessions: Set<string> | undefined;
}

export async function validateAnniversarySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("anniversary-session")?.value;

    if (!sessionId) {
      return false;
    }

    // 활성 세션 확인
    global.activeSessions = global.activeSessions || new Set();
    return global.activeSessions.has(sessionId);
  } catch (error) {
    console.error("세션 검증 실패:", error);
    return false;
  }
}

export async function removeAnniversarySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("anniversary-session")?.value;

    if (sessionId) {
      global.activeSessions = global.activeSessions || new Set();
      global.activeSessions.delete(sessionId);
    }
  } catch (error) {
    console.error("세션 제거 실패:", error);
  }
}
