import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

// 전역 타입 확장
declare global {
  var validTokens: Set<string> | undefined;
}

export async function GET() {
  try {
    // 고유 토큰 생성
    const token = uuidv4();

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

    // 메모리에 토큰 저장 (실제 환경에서는 Redis나 DB 사용 권장)
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
