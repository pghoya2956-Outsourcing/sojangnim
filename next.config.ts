import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  // Docker 프로덕션 빌드 최적화
  // standalone 모드: 최소한의 파일만 포함하여 이미지 크기 감소
  output: 'standalone',
};

export default nextConfig;
