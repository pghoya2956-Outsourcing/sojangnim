---
title: "Vercel 설정 가이드"
tags: [vercel, deployment, hosting, nextjs]
---

# ⚡ Vercel 설정 가이드

Vercel에서 Next.js 프로젝트를 호스팅하고 자동 배포를 설정하는 방법을 배웁니다.

## 📌 Vercel이란?

**Vercel**은 Next.js를 만든 회사가 제공하는 서버리스 호스팅 플랫폼입니다.

### 주요 특징

- ⚡ **초고속 배포**: Git Push → 자동 배포 (1-2분)
- 🌍 **글로벌 CDN**: 전세계 70+ Edge 서버
- 🔄 **자동 Preview**: PR마다 미리보기 URL
- 🔒 **무료 SSL**: HTTPS 자동 적용
- 📊 **Analytics**: 성능 모니터링 내장

### 무료 티어

**Hobby 플랜** (개인 프로젝트):
- 대역폭: 100GB/월
- 빌드: 6,000분/월
- 함수 실행: 1,000,000회/월
- **비용: $0**

## 🚀 1단계: Vercel 계정 생성

### 계정 가입

1. **Vercel 웹사이트 접속**
   - https://vercel.com

2. **Sign Up 클릭**

3. **GitHub로 로그인** (강력 권장)
   - GitHub 계정 연동
   - 자동 배포에 필요

4. **이름 및 정보 입력**
   - Display Name: 본인 이름
   - Use Case: Personal / Hobby

**✅ 로그인 완료**

## 📦 2단계: GitHub 저장소 준비

### GitHub 저장소 확인

Vercel은 Git 연동으로 작동하므로 코드가 GitHub에 있어야 합니다.

```bash
# 현재 remote 확인
git remote -v

# 출력 예시:
# origin  https://github.com/username/sojangnim.git (fetch)
# origin  https://github.com/username/sojangnim.git (push)
```

**저장소가 없다면**:

1. GitHub에서 **New Repository** 생성
2. Repository name: `sojangnim`
3. Public 또는 Private 선택
4. **Create repository**

```bash
# 로컬 프로젝트와 연결
git remote add origin https://github.com/username/sojangnim.git
git branch -M main
git push -u origin main
```

## 🎯 3단계: Vercel 프로젝트 생성

### Import 방법 1: Vercel Dashboard

1. **Vercel Dashboard** 접속
   - https://vercel.com/dashboard

2. **Add New... → Project** 클릭

3. **Import Git Repository**
   - GitHub 저장소 목록 표시
   - `sojangnim` 저장소 찾기
   - **Import** 클릭

### Import 방법 2: Vercel CLI (선택사항)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel
```

## ⚙️ 4단계: 프로젝트 설정

### Configure Project 화면

**Project Name**:
- Name: `sojangnim` (자동 입력됨)
- 수정 가능 (배포 URL에 사용됨)

**Framework Preset**:
- 자동 감지: `Next.js`
- 수정 불필요

**Root Directory**:
- 기본값: `./` (프로젝트 루트)
- 모노레포가 아니면 수정 불필요

**Build and Output Settings**:
- Build Command: `next build` (자동)
- Output Directory: `.next` (자동)
- Install Command: `npm install` (자동)

**✅ 기본값 그대로 사용**

### Environment Variables 설정

**⚠️ 중요**: 배포 전에 환경 변수를 설정해야 합니다!

**Add Environment Variables** 클릭

**변수 추가**:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxx.supabase.co` (Supabase Dashboard에서 복사)
   - Environment: `Production`, `Preview` 체크

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Environment: `Production`, `Preview` 체크

> 💡 Supabase 키는 **Settings → API**에서 확인할 수 있습니다.

### Deploy 클릭

**빌드 시작**:
- 빌드 로그가 실시간으로 표시됨
- 1-2분 소요

**빌드 성공**:
```
✓ Building
✓ Uploading
✓ Deploying
✓ Ready
```

**축하합니다!** 🎉 첫 배포 완료!

## 🌐 5단계: 배포 확인

### 배포된 사이트 접속

**Production URL**:
```
https://sojangnim.vercel.app
```

또는 Dashboard에서 **Visit** 버튼 클릭

### 테스트 항목

- [ ] 홈페이지 로드
- [ ] 제품 목록 표시 (Supabase 연결 확인)
- [ ] 제품 상세 페이지
- [ ] 장바구니 기능
- [ ] Admin 로그인 (`/admin/login`)

**문제 발생 시**: [트러블슈팅](#-문제-해결) 참고

## 🔄 6단계: 자동 배포 설정

### GitHub Integration 확인

**Vercel은 자동으로 GitHub 연동**:
- `main` 브랜치 push → Production 배포
- PR 생성 → Preview 배포

### 테스트: Preview 배포

```bash
# 새 브랜치 생성
git checkout -b feature/test-deployment

# 간단한 변경
echo "// test" >> src/app/page.tsx

# 커밋 및 푸시
git add .
git commit -m "test: Vercel Preview 테스트"
git push origin feature/test-deployment
```

**GitHub에서 PR 생성**:
1. GitHub 저장소 → **Pull requests** 탭
2. **New pull request**
3. base: `main` ← compare: `feature/test-deployment`
4. **Create pull request**

**Vercel 자동 배포**:
- PR에 Vercel 봇이 코멘트 추가
- Preview URL: `https://sojangnim-git-feature-test-deployment.vercel.app`
- **Visit Preview** 클릭하여 확인

**✅ 자동 배포 작동 확인!**

## 🎨 7단계: 도메인 설정 (선택사항)

### 커스텀 도메인 연결

**시나리오**: `sojangnim.com` 도메인 연결

#### 1. 도메인 구매

- [GoDaddy](https://www.godaddy.com/)
- [Namecheap](https://www.namecheap.com/)
- [가비아](https://www.gabia.com/) (한국)

#### 2. Vercel에서 도메인 추가

**Vercel Dashboard**:
1. 프로젝트 선택
2. **Settings** → **Domains**
3. **Add** 클릭
4. 도메인 입력: `sojangnim.com`
5. **Add** 클릭

#### 3. DNS 설정

**Vercel이 제공하는 DNS 레코드**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**도메인 관리 페이지에서 설정**:
- DNS 레코드 추가
- 전파 대기 (최대 48시간, 보통 1-2시간)

**✅ 도메인 연결 완료**: `https://sojangnim.com`

## 📊 8단계: Vercel Dashboard 둘러보기

### Overview

- **Deployment 상태**: 최신 배포 현황
- **Production URL**: 현재 운영 중인 URL
- **Git Branch**: 연결된 브랜치

### Deployments

**배포 이력**:
- 모든 배포 목록 (Production + Preview)
- 각 배포의 상태, 커밋 메시지, 시간
- 특정 배포로 롤백 가능

**Deployment 클릭**:
- **Visit**: 배포된 사이트 보기
- **Logs**: 빌드 로그 확인
- **Functions**: 서버리스 함수 로그
- **Redeploy**: 같은 코드로 재배포

### Analytics (Pro 플랜)

**무료 티어는 제한적**:
- 방문자 수
- 페이지뷰
- Top Pages

**Pro 플랜** ($20/월):
- 실시간 분석
- 성능 지표
- Web Vitals

### Settings

#### General
- Project Name
- Root Directory
- Framework 설정

#### Environment Variables
- 환경 변수 관리
- Production / Preview / Development 분리

#### Git
- GitHub 저장소 연결
- Production Branch 설정 (기본: `main`)

#### Domains
- 커스텀 도메인 관리
- DNS 설정

## 🛠️ Vercel CLI 사용하기

### CLI 설치

```bash
npm i -g vercel
```

### 로그인

```bash
vercel login
```

### 프로젝트 배포

```bash
# Preview 배포 (현재 브랜치)
vercel

# Production 배포 (main 브랜치와 동일)
vercel --prod
```

### 환경 변수 관리

```bash
# 환경 변수 목록
vercel env ls

# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL

# 환경 변수 제거
vercel env rm NEXT_PUBLIC_SUPABASE_URL
```

### 로그 확인

```bash
# 최신 배포 로그
vercel logs

# Production 로그
vercel logs --prod
```

## 🚨 문제 해결

### "Build failed"

**증상**: 빌드가 실패하고 에러 메시지 표시

**원인**: TypeScript 에러, 린트 에러, 환경 변수 누락

**해결**:

**1단계: 로컬에서 빌드 테스트**
```bash
npm run build
```

로컬에서 빌드가 성공하는지 확인

**2단계: 빌드 로그 확인**
- Vercel Dashboard → Deployments → 실패한 배포 클릭
- **Build Logs** 확인
- 에러 메시지 확인

**3단계: 흔한 에러**

**TypeScript 에러**:
```
Type error: Property 'xxx' does not exist
```
→ 타입 정의 수정

**환경 변수 누락**:
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
→ Vercel Settings → Environment Variables 확인

**의존성 에러**:
```
Module not found: Can't resolve 'xxx'
```
→ `package.json` 확인, `npm install` 재실행

### "Page not found" (404)

**증상**: 배포는 성공했지만 페이지가 404

**원인**: 라우팅 오류 또는 파일 경로 문제

**해결**:

```bash
# 파일 구조 확인
ls -la src/app/

# 기대하는 파일:
# page.tsx        → / (홈)
# products/page.tsx → /products
# cart/page.tsx   → /cart
```

### "Environment variable not working"

**증상**: 환경 변수가 `undefined`

**원인**: 환경 변수 설정 후 재배포 안 함

**해결**:

```bash
# 재배포 트리거
git commit --allow-empty -m "chore: 환경 변수 업데이트 후 재배포"
git push origin main
```

또는 Vercel Dashboard에서 **Redeploy**

### Supabase 연결 실패

**증상**: 제품 목록이 표시되지 않음

**원인**: Supabase 환경 변수 오류

**확인 사항**:
1. Vercel Environment Variables 확인
2. Supabase URL이 정확한가?
3. Anon Key가 완전히 복사되었는가?
4. Supabase RLS 정책 확인

## 📋 배포 체크리스트

### 첫 배포 전

- [ ] GitHub에 코드 푸시
- [ ] 로컬에서 `npm run build` 성공
- [ ] Supabase Cloud 프로젝트 생성
- [ ] Supabase 마이그레이션 푸시
- [ ] 환경 변수 값 준비 (URL, Key)

### Vercel 설정

- [ ] Vercel 계정 생성
- [ ] GitHub 저장소 Import
- [ ] 환경 변수 추가 (Production, Preview)
- [ ] 첫 배포 성공 확인
- [ ] 배포된 사이트 테스트

### 배포 후

- [ ] Production URL 접속 확인
- [ ] 제품 목록 로드 확인 (Supabase 연결)
- [ ] Admin 로그인 확인
- [ ] Preview 배포 테스트 (PR 생성)
- [ ] 도메인 연결 (선택사항)

## 🎓 실전 팁

### 팁 1: Preview 배포 적극 활용

- PR마다 자동으로 Preview URL 생성
- 운영 환경에 영향 없이 테스트 가능
- 팀원과 Preview URL 공유하여 리뷰

### 팁 2: 환경 변수는 Vercel에서만 관리

- `.env.production` 파일은 사용하지 않음
- Vercel Dashboard에서 중앙 관리
- 코드에 환경 변수 하드코딩 금지

### 팁 3: Deployment Comments 활용

**GitHub PR에 Vercel 봇 코멘트**:
- Preview URL 자동 제공
- 빌드 상태 실시간 업데이트
- 배포 완료 시 알림

### 팁 4: Redeploy로 빠른 수정

- 코드 변경 없이 환경 변수만 수정했다면
- Vercel Dashboard에서 **Redeploy** 클릭
- Git Push 없이 즉시 재배포

## 🔄 지속적 배포 흐름

### 일반적인 워크플로우

```
1. 로컬 개발
   ↓
2. feature 브랜치 생성
   ↓
3. 코드 작성 및 커밋
   ↓
4. GitHub에 푸시
   ↓
5. PR 생성 → Vercel Preview 자동 배포
   ↓
6. Preview URL에서 테스트
   ↓
7. 문제 없으면 main 병합
   ↓
8. Vercel Production 자동 배포
   ↓
9. https://sojangnim.com 업데이트
```

### 배포 자동화

**Vercel + GitHub 연동으로**:
- 수동 배포 불필요
- 모든 커밋 자동 추적
- 배포 이력 완벽 보존

## 📚 다음 단계

- [첫 배포 가이드](./first-deployment.md) - 실제 배포 단계별 진행
- [환경 변수 관리](./environment-variables.md) - 변수 안전하게 관리
- [지속적 배포](./continuous-deployment.md) - CI/CD 파이프라인

---

**다음 읽을 문서**: [첫 배포 가이드](./first-deployment.md)
