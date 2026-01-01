/**
 * 파티클 시스템 설정
 */
export interface ParticleConfig {
  radius: number;
  delayPerChar: number;
  animationDuration: number; // 각 파티클의 애니메이션 지속 시간 (초)
  saturation: number;
  lightness: number;
  saturationVariance?: number; // 채도 랜덤 범위 (기본값: 5)
  lightnessVariance?: number; // 밝기 랜덤 범위 (기본값: 3)
  opacity?: number; // 파티클 투명도 (기본값: 0.9)
}
