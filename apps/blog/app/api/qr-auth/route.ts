import { NextRequest, NextResponse } from "next/server";
import { createAnniversarySession } from "@/lib/auth";
import { jwtVerify } from "jose";

// JWT 시크릿 키 (QR 토큰 검증용)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "anniversary-secret-key-2024");

// 전역 타입 확장 (일회성 토큰 검증용)
declare global {
  var validTokens: Set<string> | undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "유효하지 않은 접근입니다." }, { status: 400 });
  }

  // JWT 토큰 검증
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== "qr-access") {
      return NextResponse.json({ error: "유효하지 않은 토큰 용도입니다." }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "만료되었거나 유효하지 않은 토큰입니다." }, { status: 401 });
  }

  // 일회성 접근 검증 (global 변수 사용)
  global.validTokens = global.validTokens || new Set();
  if (!global.validTokens.has(token)) {
    return NextResponse.json({ error: "이미 사용된 토큰입니다." }, { status: 401 });
  }

  // 토큰 사용 후 제거 (1회성 접근)
  global.validTokens.delete(token);

  // JWT 세션 토큰 생성
  const sessionToken = await createAnniversarySession();

  // 기념 페이지로 리다이렉트하면서 세션 쿠키 설정
  const response = NextResponse.redirect(new URL("/anniversary", request.url));

  // JWT 세션 쿠키 설정 (브라우저 종료 시 자동 만료)
  response.cookies.set("anniversary-session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // maxAge를 설정하지 않으면 브라우저 종료 시 자동 만료
  });

  return response;
}
