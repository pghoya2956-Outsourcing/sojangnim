---
title: "E2E 테스트 가이드"
tags: [testing, e2e, playwright, guide]
---

# E2E 테스트 가이드

## 개요

이 프로젝트는 Playwright를 사용한 E2E 테스트를 제공합니다. 주요 변경사항이 있을 때마다 자동으로 테스트를 실행할 수 있습니다.

## 테스트 실행 방법

### 방법 1: 슬래시 커맨드 (Claude Code)

가장 간단한 방법입니다. Claude Code에서:

```
/e2e-test
```

이 명령은 자동으로:
1. Supabase 로컬 DB 상태 확인
2. Playwright 테스트 실행
3. `E2E_TEST_RESULTS.md` 파일 업데이트
4. 테스트 결과 요약 출력

### 방법 2: npm 스크립트

터미널에서 직접 실행:

```bash
# 전체 테스트 실행 (headless)
npm run test:e2e

# UI 모드로 실행 (디버깅용)
npm run test:e2e:ui

# 브라우저 표시하며 실행
npm run test:e2e:headed

# 디버그 모드로 실행
npm run test:e2e:debug

# 테스트 리포트 확인
npm run test:e2e:report
```

### 방법 3: GitHub Actions (CI/CD)

PR을 생성하거나 main 브랜치에 푸시하면 자동으로 실행됩니다.

```yaml
# .github/workflows/e2e-tests.yml
# PR 이벤트, main 푸시, 수동 트리거에서 실행
```

워크플로우는:
1. Supabase 로컬 환경을 Docker로 시작
2. Playwright 테스트 실행
3. 테스트 리포트를 Artifacts로 업로드
4. PR에 테스트 결과 코멘트 추가

## 사전 요구사항

### 로컬 실행 시

1. **Supabase 로컬 DB 실행**
   ```bash
   supabase start
   ```

2. **Playwright 브라우저 설치** (최초 1회)
   ```bash
   npx playwright install chromium
   ```

3. **환경 변수**
   `.env.local` 파일이 있어야 합니다 (Supabase 시작 시 자동 생성):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

### GitHub Actions 실행 시

별도 설정 불필요. 워크플로우가 자동으로 환경을 구성합니다.

## 테스트 구조

```
tests/e2e/
├── home.spec.ts           # 홈페이지 테스트
├── products.spec.ts       # 제품 목록, 필터링, 상세 페이지
├── cart.spec.ts           # 장바구니 기능
└── utils/
    └── test-helpers.ts    # 공통 헬퍼 함수
```

## 테스트 커버리지

### 홈페이지 (7개 테스트)
- 페이지 로딩
- Hero 섹션 표시
- 추천 제품 섹션 (Supabase 연동)
- 최신 제품 섹션
- Header/Footer 렌더링
- 네비게이션 동작

### 제품 목록 (9개 테스트)
- 페이지 로딩
- 카테고리 사이드바 (5개 카테고리)
- 전체 제품 표시 (8개)
- 제품 카드 정보
- 카테고리 필터링
- URL 파라미터 변경
- Breadcrumb 네비게이션

### 제품 상세 (4개 테스트)
- 제품 카드 클릭 이동
- 제품 정보 표시
- 사양 표시 (JSONB)
- 장바구니 담기 버튼

### 장바구니 (10개 테스트)
- 제품 추가
- 수량 조절
- localStorage 저장
- 장바구니 페이지 표시
- 제품 삭제
- 빈 장바구니 상태
- 가격 계산 검증

## 테스트 설정

### playwright.config.ts

주요 설정:
- **baseURL**: http://localhost:3000
- **브라우저**: Chromium
- **타임아웃**: 기본 30초
- **재시도**: CI 환경에서 2회
- **개발 서버**: 자동 시작 (webServer)

### 개발 서버 자동 시작

테스트 실행 시 Next.js 개발 서버가 자동으로 시작됩니다:

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

## 테스트 결과 확인

### 로컬

1. **콘솔 출력**
   - 테스트 실행 중 실시간 로그 표시
   - 통과/실패 결과 즉시 확인

2. **HTML 리포트**
   ```bash
   npm run test:e2e:report
   ```
   - 브라우저에서 상세 리포트 확인
   - 스크린샷, 비디오, 트레이스 포함

3. **문서 업데이트**
   - `/e2e-test` 명령 사용 시 `E2E_TEST_RESULTS.md` 자동 업데이트

### GitHub Actions

1. **Actions 탭**
   - 워크플로우 실행 상태 확인
   - 로그 확인

2. **Artifacts**
   - `playwright-report`: HTML 테스트 리포트
   - `test-screenshots`: 실패한 테스트 스크린샷

3. **PR 코멘트**
   - PR에 테스트 결과 자동 코멘트

## 테스트 작성 가이드

### 새 테스트 추가

1. `tests/e2e/` 폴더에 `*.spec.ts` 파일 생성
2. Playwright 테스트 작성:

```typescript
import { test, expect } from '@playwright/test';

test.describe('새로운 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('기능이 정상 작동한다', async ({ page }) => {
    // 테스트 코드
    await expect(page.getByText('예상 텍스트')).toBeVisible();
  });
});
```

### 헬퍼 함수 활용

`tests/e2e/utils/test-helpers.ts`에 공통 함수 추가:

```typescript
export async function customHelper(page: Page) {
  // 재사용 가능한 로직
}
```

## 트러블슈팅

### Supabase 연결 실패

```bash
# Supabase 상태 확인
supabase status

# Supabase 재시작
supabase stop
supabase start
```

### 테스트 타임아웃

`playwright.config.ts`에서 타임아웃 조정:

```typescript
use: {
  timeout: 60000, // 60초
}
```

### 개발 서버 충돌

이미 실행 중인 서버가 있다면:

```bash
# 기존 서버 종료 후 테스트
npm run test:e2e
```

또는 설정에서 `reuseExistingServer: true`로 변경

### 브라우저 미설치

```bash
npx playwright install chromium
```

## 베스트 프랙티스

1. **테스트 격리**: 각 테스트는 독립적으로 실행 가능해야 함
2. **beforeEach 활용**: 공통 설정은 beforeEach에서 처리
3. **명확한 selector**: data-testid 또는 명확한 텍스트 사용
4. **비동기 대기**: waitForLoadState, waitForTimeout 적절히 사용
5. **에러 메시지**: expect에 명확한 에러 메시지 포함

## 참고 문서

- [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) - 테스트 계획
- [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) - 최신 테스트 결과
- [Playwright 공식 문서](https://playwright.dev/docs/intro)

## 주요 명령어 요약

```bash
# 테스트 실행
npm run test:e2e              # 전체 테스트 (headless)
npm run test:e2e:ui           # UI 모드
npm run test:e2e:headed       # 브라우저 표시
npm run test:e2e:debug        # 디버그 모드
npm run test:e2e:report       # 리포트 확인

# 환경 준비
supabase start                # Supabase 시작
supabase status               # Supabase 상태 확인
npx playwright install        # 브라우저 설치

# Claude Code
/e2e-test                     # 자동 테스트 실행 및 문서 업데이트
```
