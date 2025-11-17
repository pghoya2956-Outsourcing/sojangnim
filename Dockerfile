# ============================================
# Multi-stage Dockerfile for Next.js
# ============================================

# --------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------
FROM node:20-alpine AS deps

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# --------------------------------------------
# Stage 2: Builder (프로덕션 빌드)
# --------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies stage에서 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스코드 복사
COPY . .

# Next.js 프로덕션 빌드
# output: 'standalone' 설정 필요 (next.config.js)
RUN npm run build

# --------------------------------------------
# Stage 3: Runner (프로덕션 실행)
# --------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 보안: 비-루트 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Public 폴더 복사
COPY --from=builder /app/public ./public

# Standalone 빌드 결과물 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# Health check
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]

# --------------------------------------------
# Stage 4: Development (개발 환경)
# --------------------------------------------
FROM node:20-alpine AS development

WORKDIR /app

# package.json 복사 및 전체 의존성 설치
COPY package*.json ./
RUN npm install

# 소스코드는 volume으로 마운트됨
# COPY . . (볼륨 마운트 사용)

# 포트 노출
EXPOSE 3000

# 개발 서버 실행 (hot reload)
CMD ["npm", "run", "dev"]
