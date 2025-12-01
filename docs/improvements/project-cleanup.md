---
title: "프로젝트 정리 계획"
tags: [maintenance, cleanup, refactoring]
---

# 프로젝트 정리 계획

## 개요

프로젝트의 유지보수성을 높이기 위해 불필요한 파일, 코드, 의존성을 정리합니다.

---

## 1. E2E 테스트 관련 파일 제거

E2E 테스트 워크플로우가 제거되었으므로 관련 파일들도 정리합니다.

### 삭제 대상

| 경로 | 설명 |
|------|------|
| `tests/` | E2E 테스트 디렉토리 전체 |
| `test-results/` | 테스트 결과 캐시 |
| `playwright.config.ts` | Playwright 설정 |
| `E2E_TESTING.md` | E2E 테스트 가이드 문서 |
| `.claude/commands/e2e-test.md` | 슬래시 커맨드 |

### package.json 수정

```json
// 제거할 scripts
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:debug": "playwright test --debug",
"test:e2e:report": "playwright show-report"

// 제거할 devDependencies
"@playwright/test": "^1.56.1"
```

---

## 2. 개발 완료 문서 정리

### 삭제 대상

| 경로 | 이유 |
|------|------|
| `tasks/` | 개발 완료된 작업 문서 (6개 파일) |
| `design-mockups/` | 디자인 참고용 (개발 완료) |
| `scripts/ci-*.sh` | CI 스크립트 (E2E 제거로 불필요) |
| `scripts/README.md` | 스크립트 설명 문서 |

### 보존할 파일

| 경로 | 이유 |
|------|------|
| `scripts/add-admin-user.sql` | 관리자 추가 시 필요 |
| `scripts/reset-admin-password.sh` | 비밀번호 초기화 시 필요 |

---

## 3. 문서 구조 정리

### 현재 문서 구조

```
docs/
├── 00-README.md
├── 01-시작하기.md
├── 02-관리자-계정-설정.md
├── 99-사용자-가이드.md
├── architecture/
├── business/          # 사업화 관련 (7개 파일)
├── deployment/        # 배포 관련 (6개 파일)
├── development/
├── extensions/
├── improvements/
├── operations/
└── supabase/
```

### 정리 방안

1. **business/** - 현재 미사용, 향후 필요 시 복원 가능하도록 별도 보관 검토
2. **improvements/** - 완료된 계획은 삭제, 진행 중인 것만 보존

---

## 4. 코드 정리

### 4.1 사용하지 않는 export 확인

```bash
# 확인 명령어
grep -r "from '@/types'" src/ --include="*.ts" --include="*.tsx"
grep -r "from '@/utils'" src/ --include="*.ts" --include="*.tsx"
```

### 4.2 console.log 제거

```bash
# 확인 명령어
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx"
```

### 4.3 주석 정리

- TODO 주석 확인 및 처리
- 불필요한 주석 제거

---

## 5. 설정 파일 정리

### .gitignore 확인

```bash
# 추가 필요 항목 확인
test-results/
playwright-report/
```

### docker-compose 파일

| 파일 | 상태 |
|------|------|
| `docker-compose.yml` | Supabase 로컬용 - 유지 |
| `docker-compose.prod.yml` | 운영용 - 확인 필요 |

---

## 실행 계획

### Phase 1: E2E 관련 정리 (즉시)

```bash
# 1. 파일 삭제
rm -rf tests/
rm -rf test-results/
rm playwright.config.ts
rm E2E_TESTING.md
rm .claude/commands/e2e-test.md

# 2. package.json 수정 (scripts, devDependencies)

# 3. npm install로 lock 파일 갱신
npm install
```

### Phase 2: 문서 정리 (즉시)

```bash
# 1. tasks 디렉토리 삭제
rm -rf tasks/

# 2. design-mockups 삭제 (필요시 백업 후)
rm -rf design-mockups/

# 3. CI 스크립트 삭제
rm scripts/ci-*.sh
rm scripts/README.md
```

### Phase 3: 코드 정리 (검토 후)

1. console.log 제거
2. 사용하지 않는 import 정리
3. TODO 주석 처리

### Phase 4: 커밋

```bash
git add -A
git commit -m "chore: 프로젝트 정리 - E2E 테스트 및 불필요한 파일 제거"
```

---

## 정리 후 예상 구조

```
sojangnim/
├── .claude/
│   └── skills/              # 유지
├── .github/
│   └── workflows/
│       ├── claude.yml       # Claude 워크플로우
│       └── deploy-production.yml  # 배포 워크플로우
├── docs/                    # 정리된 문서
├── scripts/
│   ├── add-admin-user.sql   # 유지
│   └── reset-admin-password.sh  # 유지
├── src/                     # 소스 코드
├── supabase/                # 마이그레이션
├── public/                  # 정적 파일
├── CLAUDE.md
├── README.md
├── package.json
└── ...config files
```

---

## 예상 효과

| 항목 | Before | After |
|------|--------|-------|
| 파일 수 | ~100+ | ~70 |
| devDependencies | 10개 | 9개 |
| 문서 파일 | 30+ | ~20 |
| 유지보수 복잡도 | 높음 | 낮음 |

---

## 주의사항

1. **백업**: design-mockups는 필요 시 git history에서 복원 가능
2. **문서**: business/ 문서는 향후 사업화 시 필요할 수 있음
3. **테스트**: E2E 테스트가 필요해지면 다시 구성 필요
