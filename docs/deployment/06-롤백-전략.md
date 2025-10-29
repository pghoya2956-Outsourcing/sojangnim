---
title: "롤백 전략 가이드"
tags: [deployment, rollback, disaster-recovery, vercel, supabase]
---

# ⏮️ 롤백 전략 가이드

배포 실패나 심각한 버그 발생 시 이전 안정 버전으로 신속하게 복구하는 방법을 안내합니다.

## 📌 롤백이란?

### 롤백의 정의

**롤백(Rollback)**: 문제가 발생한 배포를 취소하고 이전의 안정적인 버전으로 되돌리는 작업

```mermaid
graph LR
    A[v1.0 정상] --> B[v1.1 배포]
    B --> C{문제 발생?}
    C -->|Yes| D[롤백]
    D --> A
    C -->|No| E[v1.1 운영]
```

### 롤백이 필요한 경우

1. **치명적인 버그**: 서비스 중단, 데이터 손실
2. **성능 저하**: 페이지 로딩 > 10초
3. **보안 문제**: 취약점 발견
4. **데이터베이스 오류**: 마이그레이션 실패
5. **환경 변수 오류**: 잘못된 API 키 사용

## 🔄 Vercel 애플리케이션 롤백

### 방법 1: Vercel Dashboard (가장 빠름)

#### 1단계: 이전 배포 찾기

**Vercel Dashboard** → 프로젝트 선택 → **Deployments** 탭

**배포 목록 확인**:
```
✅ abc123 - v1.1 - feat: 새 기능 추가 (현재 Production)
✅ def456 - v1.0 - fix: 버그 수정 (이전 안정 버전)
✅ ghi789 - v0.9 - feat: 제품 필터
```

#### 2단계: 롤백 실행

**이전 안정 버전 (def456) 클릭** → **⋯ (More)** → **Promote to Production**

**확인 대화상자**:
```
Promote to Production?
This will make this deployment the current production version.

[Cancel]  [Promote]
```

**Promote 클릭**

#### 3단계: 롤백 확인

- **Deployments** 탭에서 상태 확인
- Production 배포가 변경됨: `def456 (v1.0)`
- **Visit** 버튼으로 사이트 확인

**롤백 소요 시간**: **1-2분**

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 로그인
vercel login

# 배포 목록 확인
vercel list

# 특정 배포로 롤백 (URL 사용)
vercel alias set <deployment-url> <production-domain>

# 예시
vercel alias set sojangnim-def456.vercel.app sojangnim.com
```

### 방법 3: Git 롤백 + 재배포

**시나리오**: 최근 3개 커밋을 되돌리고 싶음

#### 1단계: Git 히스토리 확인

```bash
git log --oneline -5

# 출력:
# abc123 feat: 새 기능 (문제 있음)
# def456 fix: 버그 수정 (안정 버전)
# ghi789 feat: 제품 필터
```

#### 2단계: Git Revert

```bash
# abc123 커밋 되돌리기 (새 커밋 생성)
git revert abc123

# 또는 특정 커밋으로 리셋 (주의!)
git reset --hard def456
```

**⚠️ `git reset --hard`는 커밋 히스토리를 삭제합니다!**

**안전한 방법**:
```bash
# Revert 사용 (히스토리 유지)
git revert abc123
git push origin main
```

#### 3단계: Vercel 자동 배포

- Git Push → Vercel이 자동 감지 → 재배포
- 2-3분 소요

## 🗄️ 데이터베이스 롤백

### Supabase Pro: Point-in-Time Recovery

**Supabase Dashboard** → **Database** → **Backups**

#### PITR 사용

**시나리오**: 1시간 전 상태로 DB 복구

1. **Restore to a point in time** 클릭
2. 복구할 시점 선택 (슬라이더 또는 시간 입력)
3. **Restore** 클릭
4. 확인 대기 (5-10분)

**장점**:
- 정확한 시점으로 복구 가능
- 자동 백업 활용

**단점**:
- Pro 플랜 전용 ($25/월)

### Supabase Free: 수동 백업 복원

**시나리오**: 마이그레이션 실패 후 복구

#### 1단계: 백업 파일 확인

```bash
# 최신 백업 찾기
ls -t ~/backups/sojangnim/backup_*.sql.gz | head -1

# 출력:
# backup_20250125_020000.sql.gz
```

#### 2단계: 백업 복원

```bash
# 압축 해제
gunzip backup_20250125_020000.sql.gz

# 복원 (⚠️ 기존 데이터 덮어씀!)
psql "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" \
  < backup_20250125_020000.sql
```

#### 3단계: 데이터 검증

```sql
-- 데이터 개수 확인
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;

-- 최신 데이터 확인
SELECT * FROM products ORDER BY created_at DESC LIMIT 5;
```

### 마이그레이션 롤백

**시나리오**: 잘못된 마이그레이션 적용

#### 수동 롤백 마이그레이션 작성

**예시**: `20250126000000_add_stock_field.sql` 롤백

**롤백 마이그레이션 생성** (`20250126000001_rollback_stock.sql`):
```sql
-- 20250126000000_add_stock_field.sql 되돌리기

ALTER TABLE products
DROP COLUMN IF EXISTS stock;

DROP INDEX IF EXISTS idx_products_stock;
```

#### 적용

```bash
# 로컬 테스트
supabase db reset
# → 모든 마이그레이션 재적용 (롤백 포함)

# 문제 없으면 클라우드 적용
supabase link --project-ref <your-project-ref>
supabase db push
```

## 🚨 긴급 롤백 시나리오

### 시나리오 1: 치명적인 버그 (서비스 중단)

**증상**:
- 홈페이지 500 에러
- 모든 사용자 영향
- Vercel에서 에러 급증 알림

**대응 (5분 내)**:

**1분**: Vercel Dashboard → Deployments → 이전 안정 버전 Promote

**2분**: Production URL 접속 확인

**3분**: Vercel Logs 확인 (에러 원인 파악)

**4분**: 팀에 상황 공유 (Slack, Email)

**5분**: GitHub Issue 생성 (버그 추적)

**복구 후**:
- 로컬에서 버그 재현 및 수정
- PR 생성 → 테스트 → 재배포

### 시나리오 2: 데이터베이스 마이그레이션 실패

**증상**:
- Supabase Logs에 SQL 에러
- 제품 목록 로드 실패
- Admin 로그인 불가

**대응 (10분 내)**:

**1분**: Supabase Dashboard → Logs → Database 에러 확인

**2분**: 에러 메시지 복사 (예: `column "stock" does not exist`)

**3-5분**: 백업에서 DB 복원
```bash
psql "postgresql://..." < backup_20250125_020000.sql
```

**6-8분**: 데이터 검증
```sql
SELECT COUNT(*) FROM products;
SELECT * FROM products LIMIT 5;
```

**9분**: Vercel 재배포 트리거 (환경 변수 더미 업데이트)

**10분**: 전체 기능 테스트

**복구 후**:
- 롤백 마이그레이션 작성
- 로컬에서 마이그레이션 테스트
- 재배포

### 시나리오 3: 환경 변수 오류

**증상**:
- "NEXT_PUBLIC_SUPABASE_URL is not defined"
- 모든 API 호출 실패

**대응 (3분 내)**:

**1분**: Vercel Dashboard → Settings → Environment Variables 확인

**2분**: 잘못된 값 수정 또는 추가

**3분**: Redeploy 버튼 클릭

**복구 완료**

### 시나리오 4: 성능 저하

**증상**:
- 페이지 로딩 > 10초
- Vercel Analytics에서 성능 급락

**대응 (5분 내)**:

**1-2분**: Vercel Dashboard → 이전 배포로 롤백

**3-4분**: Supabase Logs → 느린 쿼리 확인

**5분**: 팀에 상황 공유

**복구 후**:
- 쿼리 최적화 (인덱스 추가)
- Lighthouse로 성능 측정
- 개선 후 재배포

## 📋 롤백 체크리스트

### 롤백 전

- [ ] 문제 심각도 평가 (즉시 롤백 필요한가?)
- [ ] 영향 받는 사용자 범위 확인
- [ ] 팀에 상황 공유 (Slack, Email)
- [ ] 현재 상태 백업 (추가 백업)

### 롤백 실행

- [ ] Vercel 애플리케이션 롤백 (1-2분)
- [ ] Production URL 접속 확인
- [ ] 주요 기능 테스트 (홈, 제품 목록, 장바구니)
- [ ] 에러 로그 확인 (더 이상 에러 없는가?)

### 롤백 후

- [ ] 사용자에게 공지 (서비스 복구 알림)
- [ ] 롤백 이유 문서화 (GitHub Issue)
- [ ] 근본 원인 분석 (Post-mortem)
- [ ] 재발 방지 대책 수립

## 🛡️ 롤백 방지 전략

### 1. 충분한 테스트

**로컬 테스트**:
```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

**Preview 배포 테스트**:
- PR 생성 → Preview URL 확인
- 모든 기능 수동 테스트
- 팀원 리뷰

### 2. 점진적 배포

**Feature Flag 사용**:
```typescript
// 환경 변수로 기능 토글
if (process.env.NEXT_PUBLIC_ENABLE_NEW_FEATURE === 'true') {
  return <NewFeature />
}
return <OldFeature />
```

**효과**:
- 코드는 배포하지만 기능은 비활성
- 문제 시 환경 변수만 수정 (재배포 불필요)

### 3. 모니터링

**배포 후 10분간 모니터링**:
- Vercel Analytics (에러율)
- Supabase Logs (DB 에러)
- 실제 사용자 피드백

**이상 징후 시 즉시 롤백**

### 4. 카나리 배포 (Vercel Pro)

**트래픽의 10%만 새 버전으로**:
- 문제 시 90% 사용자는 영향 없음
- 점진적으로 100%까지 증가

### 5. Blue-Green 배포

**2개의 환경 유지**:
- Blue: 현재 운영
- Green: 새 버전

**전환**:
- Green 완전 테스트 후 전환
- 문제 시 즉시 Blue로 복구

## 🔍 롤백 후 분석

### Post-mortem 작성

**GitHub Issue 템플릿**:
```markdown
# 롤백 Post-mortem

## 사건 개요
- 발생 시간: 2025-01-25 15:30 KST
- 영향 범위: 모든 사용자
- 롤백 시간: 2025-01-25 15:35 KST (5분 소요)

## 타임라인
- 15:30: 배포 완료
- 15:31: Vercel 에러 알림 수신
- 15:32: 500 에러 확인
- 15:33: 이전 버전으로 롤백 결정
- 15:35: 롤백 완료, 서비스 복구

## 근본 원인
- TypeScript 타입 에러 (빌드는 성공했으나 런타임 에러)
- CI에서 감지 못함 (type check 누락)

## 해결 방법
- CI workflow에 `npx tsc --noEmit` 추가
- E2E 테스트 강화

## 재발 방지
- [ ] CI type check 추가
- [ ] E2E 테스트 커버리지 증가
- [ ] Preview 배포에서 충분한 테스트
```

### 학습 사항

1. **무엇이 잘못되었는가?**
   - 예) CI에서 타입 체크 누락

2. **왜 발견하지 못했는가?**
   - 예) 로컬 테스트 불충분

3. **어떻게 개선할 것인가?**
   - 예) CI workflow 강화

## 📊 롤백 통계 추적

### 롤백 로그 유지

**`rollback-log.md`**:
```markdown
# 롤백 이력

| 날짜 | 버전 | 원인 | 소요 시간 | 담당자 |
|------|------|------|-----------|--------|
| 2025-01-25 | v1.1 → v1.0 | TypeScript 에러 | 5분 | @developer |
| 2025-01-20 | v1.0 → v0.9 | DB 마이그레이션 실패 | 10분 | @developer |
```

### 목표 설정

**목표**:
- 롤백 빈도: **월 1회 이하**
- 롤백 소요 시간: **5분 이내**
- 서비스 복구 시간: **10분 이내**

## 🚀 빠른 참조 가이드

### Vercel 애플리케이션 롤백 (1분)

```
1. Vercel Dashboard → Deployments
2. 이전 안정 버전 클릭
3. ⋯ → Promote to Production
4. Promote 클릭
```

### 데이터베이스 롤백 (5분)

```bash
# 백업 찾기
ls -t ~/backups/sojangnim/*.sql.gz | head -1

# 압축 해제
gunzip backup_xxx.sql.gz

# 복원
psql "postgresql://..." < backup_xxx.sql
```

### 긴급 연락처

**팀 연락처**:
- 개발팀장: @developer-lead
- 인프라 담당: @devops
- Slack 채널: `#incidents`

**외부 연락처**:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/dashboard/support

## 📚 다음 단계

- [모니터링 가이드](../operations/monitoring.md) - 문제 조기 발견
- [CI/CD 가이드](./continuous-deployment.md) - 배포 자동화
- [데이터베이스 유지보수](../operations/database-maintenance.md) - 백업 전략

---

**롤백 관련 질문**이 있으시면 [트러블슈팅 문서](../development/troubleshooting.md)를 참고하세요!
