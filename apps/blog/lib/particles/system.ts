import type { ParticleConfig } from "./config";
import { Particle } from "./particle";

/**
 * 텍스트의 파티클 시스템을 관리하는 클래스
 */
export class ParticleSystem {
  public readonly text: string;
  public readonly particles: Particle[];
  private readonly charWidths: number[];
  private readonly config: ParticleConfig;

  constructor(text: string, config: Partial<ParticleConfig> = {}) {
    this.text = text;
    this.charWidths = this.calculateCharWidths(text);

    this.config = {
      radius: 30,
      delayPerChar: 0,
      animationDuration: 0.5,
      saturation: 50, // 뮤트 톤의 절제된 채도
      lightness: 72, // 파스텔 느낌의 밝기
      saturationVariance: 3, // 미니멀한 변화
      lightnessVariance: 3, // 미니멀한 변화
      opacity: 0.88, // 약간 투명하게
      ...config,
    };

    this.particles = text.split("").map((_, i) => new Particle(i, this.config));
  }

  /**
   * 각 글자의 실제 너비 계산
   * Inter 폰트 18px, fontWeight 500, letterSpacing 0.02em 기준
   */
  private calculateCharWidths(text: string): number[] {
    // 실제 측정된 Inter 폰트의 글자 너비 (letterSpacing 포함)
    const widthMap: Record<string, number> = {
      k: 8.5, // k의 실제 너비
      h: 9.2, // h의 실제 너비
      r: 6.3, // r의 실제 너비 (좁은 글자)
      y: 8.5, // y의 실제 너비
      u: 9.2, // u의 실제 너비
      ".": 4.0, // .의 실제 너비
      d: 9.2, // d의 실제 너비
      e: 8.7, // e의 실제 너비
      v: 8.3, // v의 실제 너비
    };
    return text.split("").map((char) => widthMap[char] ?? 8.5);
  }

  /**
   * 특정 인덱스 글자의 x 위치 반환 (누적)
   */
  public getCharX(index: number): number {
    let x = 0;
    for (let i = 0; i < index; i++) {
      x += this.charWidths[i] ?? 0;
    }
    return x;
  }

  /**
   * 모든 글자의 x 좌표 배열 반환
   */
  public getAllCharX(): number[] {
    const positions: number[] = [];
    let x = 0;
    for (let i = 0; i < this.text.length; i++) {
      positions.push(x);
      x += this.charWidths[i] ?? 0;
    }
    return positions;
  }

  /**
   * 특정 인덱스의 파티클 반환
   */
  public getParticle(index: number): Particle | undefined {
    return this.particles[index];
  }

  /**
   * 전체 애니메이션이 완료되는 총 시간 계산 (ms)
   * = 마지막 글자의 delay + 애니메이션 duration
   */
  public getTotalAnimationTime(): number {
    const lastCharDelay = (this.text.length - 1) * this.config.delayPerChar;
    const totalSeconds = lastCharDelay + this.config.animationDuration;
    return Math.ceil(totalSeconds * 1000); // 밀리초로 변환, 올림
  }

  /**
   * 애니메이션 duration 반환 (CSS와 동기화용)
   */
  public getAnimationDuration(): number {
    return this.config.animationDuration;
  }
}
