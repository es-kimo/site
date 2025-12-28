import type { ParticleConfig } from "./config";

/**
 * 색상 Hue 값 순서 - 미니멀하고 오묘한 파스텔 팔레트
 * khryu.dev 각 글자를 위한 hue 값 (k,h,r,y,u,.,d,e,v)
 * 절제되었지만 컬러풀한 뮤트 톤의 조화
 */
const COLOR_HUES = [
  170, // 1. 민트 (k) - Soft Mint
  200, // 2. 스카이 (h) - Soft Sky
  230, // 3. 퍼플블루 (r) - Periwinkle
  260, // 4. 라벤더 (y) - Lavender
  290, // 5. 라일락 (u) - Lilac
  320, // 6. 로즈 (.) - Dusty Rose
  350, // 7. 피치 (d) - Peach
  30, // 8. 샌드 (e) - Sand
  60, // 9. 세이지 (v) - Sage
];

/**
 * 단일 파티클을 표현하는 클래스
 */
export class Particle {
  public readonly x: number;
  public readonly y: number;
  public readonly rotation: number;
  public readonly delay: number;
  public readonly color: string;

  constructor(charIndex: number, config: ParticleConfig) {
    const { radius, delayPerChar, saturation, lightness, saturationVariance = 5, lightnessVariance = 3, opacity = 0.9 } = config;

    // 시드 기반 pseudo-random (매번 같은 위치)
    const seed = charIndex * 12345;
    const random = this.pseudoRandom(seed);

    // 극좌표로 위치 계산
    const angle = random(0) * Math.PI * 2;
    const distance = radius * (0.6 + random(1) * 0.4); // 60-100% 거리

    this.x = Math.cos(angle) * distance;
    this.y = Math.sin(angle) * distance;
    this.rotation = random(2) * 360 - 180; // -180 ~ 180도
    this.delay = charIndex * delayPerChar;

    // 색상 계산: 정해진 hue + 랜덤 saturation/lightness 변화
    const hue = COLOR_HUES[charIndex % COLOR_HUES.length]!;
    const sat = saturation + (random(3) - 0.5) * 2 * saturationVariance;
    const light = lightness + (random(4) - 0.5) * 2 * lightnessVariance;

    this.color = `hsla(${hue}, ${Math.max(0, Math.min(100, sat))}%, ${Math.max(0, Math.min(100, light))}%, ${opacity})`;
  }

  /**
   * 시드 기반 pseudo-random 생성기
   */
  private pseudoRandom(baseSeed: number) {
    return (offset: number) => {
      const seed = baseSeed + offset;
      return ((seed * 9301 + 49297) % 233280) / 233280;
    };
  }
}
