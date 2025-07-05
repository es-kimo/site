import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 전역 타입 확장
declare global {
  var validTokens: Set<string> | undefined;
  var activeSessions: Set<string> | undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "유효하지 않은 접근입니다." }, { status: 400 });
  }

  // 토큰 검증
  global.validTokens = global.validTokens || new Set();
  if (!global.validTokens.has(token)) {
    return NextResponse.json({ error: "만료되었거나 유효하지 않은 토큰입니다." }, { status: 401 });
  }

  // 토큰 사용 후 제거 (1회성 접근)
  global.validTokens.delete(token);

  // 세션 ID 생성
  const sessionId = uuidv4();
  global.activeSessions = global.activeSessions || new Set();
  global.activeSessions.add(sessionId);

  // 기념 페이지로 리다이렉트하면서 세션 쿠키 설정
  const response = NextResponse.redirect(new URL("/anniversary", request.url));

  // 세션 쿠키 설정 (브라우저 종료 시 자동 만료)
  response.cookies.set("anniversary-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // maxAge를 설정하지 않으면 브라우저 종료 시 자동 만료
  });

  return response;
}
