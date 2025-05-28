import { Mail, MapPin, PhoneOutgoing, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Desktop 레이아웃 */}
        <div className="hidden md:grid grid-cols-[1fr_0.5fr_1fr] gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="text-xl font-semibold mb-4">연세정성내과의원</h4>
            <p className="text-sm leading-relaxed">서울시 강서구 화곡동에 위치한 연세정성내과의원</p>
            <p className="text-sm leading-relaxed">정성을 다하겠습니다.</p>
            <div className="flex space-x-4 mt-4">
              <Link href="https://www.youtube.com/@dr6302" aria-label="Youtube" target="_blank" className="flex items-center space-x-2">
                <Youtube size={20} className="hover:text-white transition" />
                <span className="text-sm">유튜브 채널</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/2.연세정성내과 소개/1.의료진 소개" className="hover:underline">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/2.연세정성내과 소개/2.진료 안내" className="hover:underline">
                  진료 과목
                </Link>
              </li>
              <li>
                <Link href="/2.연세정성내과 소개/3.연세정성내과 소개" className="hover:underline">
                  오시는 길
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-4">연락처</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <MapPin size={18} className="mr-2" />
                <a href={`https://map.naver.com/v5/entry/place/${1634387039}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  서울시 강서구 화곡로 301 원풍빌딩 402호
                </a>
              </li>
              <li className="flex items-center">
                <PhoneOutgoing size={18} className="mr-2" />
                <a href="tel:0226922990" className="hover:underline">
                  02-2692-2990
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2" />
                <a href="mailto:yonsei-jshd@naver.com" className="hover:underline">
                  yonsei-jshd@naver.com
                </a>
              </li>
              <li className="text-xs text-gray-400">
                평일 09:00 - 18:00 (점심 13:00-14:30)
                <br />
                목/토 09:00 - 13:00
                <br />
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile 간소화 레이아웃 */}
        <div className="flex flex-col space-y-4 md:hidden mb-8">
          <Link href="tel:0226922990" className="flex items-center justify-center space-x-2">
            <PhoneOutgoing size={20} />
            <span className="text-sm">02-2692-2990</span>
          </Link>
          <Link href={`https://map.naver.com/v5/entry/place/${1634387039}`} target="_blank" className="flex items-center justify-center space-x-2">
            <MapPin size={20} />
            <span className="text-sm">오시는 길</span>
          </Link>
          <Link href="https://www.youtube.com/@dr6302" aria-label="Youtube" target="_blank" className="flex items-center justify-center space-x-2">
            <Youtube size={20} />
            <span className="text-sm">유튜브 채널</span>
          </Link>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} 연세정성내과의원. All rights reserved.</div>
      </div>
    </footer>
  );
}
