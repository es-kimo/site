"use client";

import { useState } from "react";
import { Download, RefreshCw, Heart, QrCode, Copy, Check, Sparkles } from "lucide-react";

export default function QRGeneratorPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-qr");
      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setToken(data.token);
      } else {
        setError(data.error || "QR 코드 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `anniversary-qr-${new Date().toISOString().split("T")[0]}.png`;
    link.href = qrCode;
    link.click();
  };

  const copyToken = async () => {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden pb-24">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gray-200/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gray-300/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gray-400/20 rounded-full"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-thin text-gray-900">2주년 기념</h1>
            </div>
            <p className="text-2xl sm:text-3xl font-thin text-gray-600 mb-2">QR 코드 생성기</p>
            <p className="text-lg sm:text-xl text-gray-500 font-light">특별한 순간을 위한 1회성 접근 코드를 만들어보세요</p>
          </div>

          {/* 메인 카드 */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl mb-8">
            <div className="text-center mb-8">
              <button
                onClick={generateQRCode}
                disabled={isLoading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-light text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    생성 중
                  </span>
                ) : (
                  "QR 코드 생성"
                )}
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* QR 코드 결과 */}
            {qrCode && (
              <div className="text-center animate-fade-in">
                <div className="inline-block bg-white/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/30 mb-8">
                  <div className="bg-white rounded-2xl p-4 mb-6 inline-block shadow-lg">
                    <img src={qrCode} alt="Anniversary QR Code" className="w-64 h-64 sm:w-80 sm:h-80 mx-auto" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-800 text-lg font-medium">성공적으로 생성되었습니다</p>
                    <p className="text-gray-600 text-sm font-light">이 QR 코드는 단 한 번만 사용할 수 있습니다</p>
                    <button
                      onClick={downloadQRCode}
                      className="group bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      QR 코드 다운로드
                    </button>
                  </div>
                </div>

                {/* 토큰 정보 (개발용) */}
                {token && (
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">개발 정보</h3>
                      <button
                        onClick={copyToken}
                        className="flex items-center gap-2 bg-white/40 hover:bg-white/60 text-gray-800 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            복사
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-sm text-gray-700 bg-gray-900/10 px-4 py-3 rounded-lg block break-all font-mono">{token}</code>
                    <p className="text-xs text-gray-500 mt-3">개발용 토큰 정보입니다. 실제 사용자에게는 노출되지 않습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 사용 방법 */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-thin text-gray-900 mb-8 text-center">사용 방법</h2>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "QR 코드 생성",
                  description: "위 버튼을 클릭하여 새로운 QR 코드를 생성합니다.",
                  icon: QrCode,
                },
                {
                  step: "2",
                  title: "QR 코드 다운로드",
                  description: "생성된 QR 코드를 다운로드하여 저장합니다.",
                  icon: Download,
                },
                {
                  step: "3",
                  title: "특별한 순간 공유",
                  description: "QR 코드를 연인에게 전달하고 함께 스캔해보세요.",
                  icon: Heart,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 sm:gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-full flex items-center justify-center font-medium text-white text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      <h3 className="text-lg sm:text-xl font-medium text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 추가 정보 */}
            <div className="mt-10 p-6 bg-white/40 rounded-2xl border border-white/20 backdrop-blur-xl">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gray-600" />
                특별한 기능들
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base font-light">
                    <strong className="font-medium">1회성 접근:</strong> QR 코드 스캔 후 토큰이 자동으로 무효화됩니다
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base font-light">
                    <strong className="font-medium">세션 관리:</strong> 브라우저 종료 시 자동으로 접근 권한이 만료됩니다
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base font-light">
                    <strong className="font-medium">기념 페이지:</strong> 아름다운 2주년 기념 콘텐츠가 기다리고 있습니다
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
