import type { ParticleConfig } from "./config";

/**
 * 색상 Hue 값 순서
 * khryu.dev 각 글자를 위한 hue 값 (k,h,r,y,u,.,d,e,v)
 */
const COLOR_HUES = [
  210, // 1. 연한 파랑 (k)
  270, // 2. 연한 보라 (h)
  30, // 3. 연한 주황 (r)
  120, // 4. 연한 초록 (y)
  340, // 5. 연한 핑크 (u)
  240, // 6. 연한 남색 (.)
  190, // 7. 연한 하늘색 (d)
  350, // 8. 연한 핑크 (e)
  20, // 9. 연한 주황 다르게 (v)
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
    const { radius, delayPerChar, saturation, lightness, saturationVariance = 5, lightnessVariance = 3 } = config;

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

    this.color = `hsl(${hue}, ${Math.max(0, Math.min(100, sat))}%, ${Math.max(0, Math.min(100, light))}%)`;
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
