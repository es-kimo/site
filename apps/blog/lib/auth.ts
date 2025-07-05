import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// JWT 시크릿 키
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "anniversary-secret-key-2024");

// JWT 토큰 생성
export async function createAnniversaryToken(): Promise<string> {
  const token = await new SignJWT({
    purpose: "anniversary-access",
    created: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // 24시간 후 만료
    .sign(JWT_SECRET);

  return token;
}

// JWT 토큰 검증
export async function verifyAnniversaryToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.purpose === "anniversary-access";
  } catch (error) {
    return false;
  }
}

// 세션 검증
export async function validateAnniversarySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("anniversary-session")?.value;

    if (!sessionToken) {
      return false;
    }

    // JWT 토큰 검증
    return await verifyAnniversaryToken(sessionToken);
  } catch (error) {
    console.error("세션 검증 실패:", error);
    return false;
  }
}

// 세션 생성 (QR 인증 후 호출)
export async function createAnniversarySession(): Promise<string> {
  return await createAnniversaryToken();
}

// 세션 제거
export async function removeAnniversarySession(): Promise<void> {
  // JWT는 stateless이므로 쿠키만 제거하면 됨
  // 실제 쿠키 제거는 클라이언트 측에서 처리
}
