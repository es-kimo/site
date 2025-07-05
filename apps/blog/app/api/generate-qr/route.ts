import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { SignJWT } from "jose";

// JWT 시크릿 키 (QR 토큰용)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "anniversary-secret-key-2024");

// 전역 타입 확장 (일회성 토큰 저장용)
declare global {
  var validTokens: Set<string> | undefined;
}

export async function GET() {
  try {
    // JWT 토큰 생성 (QR 코드용)
    const token = await new SignJWT({
      purpose: "qr-access",
      created: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // 24시간 후 만료
      .sign(JWT_SECRET);

    // QR 코드로 접근할 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/api/qr-auth?token=${token}`;

    // QR 코드 생성
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // 메모리에 토큰 저장 (일회성 접근 제어용)
    global.validTokens = global.validTokens || new Set();
    global.validTokens.add(token);

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      token: token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
    });
  } catch (error) {
    console.error("QR 코드 생성 실패:", error);
    return NextResponse.json({ error: "QR 코드 생성에 실패했습니다." }, { status: 500 });
  }
}
