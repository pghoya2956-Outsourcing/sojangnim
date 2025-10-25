---
title: "Supabase 데이터 동기화 가이드"
tags: [supabase, data-sync, migration, backup]
---

# 🔄 Supabase 데이터 동기화 가이드

로컬 Supabase와 클라우드 Supabase 간 데이터를 동기화하는 방법을 배웁니다.

## 📌 데이터 동기화가 필요한 경우

### 시나리오 1: 클라우드 데이터를 로컬로 복사

**상황**: 운영 DB의 실제 데이터를 로컬에서 디버깅하고 싶음

**사용 예시**:
- 고객이 보고한 버그 재현
- 운영 데이터로 새 기능 테스트
- 데이터 마이그레이션 검증

### 시나리오 2: 로컬 시드 데이터를 클라우드로 업로드

**상황**: 개발용 샘플 데이터를 스테이징 환경에 복사

**사용 예시**:
- 새 Supabase 프로젝트에 샘플 데이터 추가
- 스테이징 환경 초기화
- 데모/프리젠테이션 준비

### 시나리오 3: 백업 및 복구

**상황**: 데이터 손실 방지 또는 복구

**사용 예시**:
- 정기 백업
- 재해 복구
- 데이터 마이그레이션

## 🗄️ 방법 1: Supabase Dashboard 사용 (간단)

### 소량 데이터 직접 입력

**장점**: UI로 쉽게 관리
**단점**: 대량 데이터 비효율적

#### 로컬 → 클라우드

**1단계: 로컬 Supabase Studio에서 데이터 확인**
- http://localhost:54323 → Table Editor
- `categories` 테이블 열기
- 데이터 복사 (Ctrl+C 또는 Cmd+C)

**2단계: 클라우드 Supabase Dashboard에서 붙여넣기**
- https://supabase.com/dashboard → 프로젝트 선택
- Table Editor → `categories`
- **Insert row** 클릭
- 값 입력

**예시: 카테고리 1개 추가**:
- name: `전동공구`
- slug: `power-tools`
- **Save**

**반복**: 모든 카테고리 추가

#### SQL Editor로 일괄 입력

**로컬 시드 데이터 복사**:

```bash
# 로컬 seed.sql 열기
cat supabase/seed.sql
```

**필요한 부분만 복사**:
```sql
INSERT INTO categories (name, slug) VALUES
('전동공구', 'power-tools'),
('수공구', 'hand-tools'),
('측정공구', 'measuring-tools'),
('안전용품', 'safety-equipment'),
('작업대', 'workbenches');
```

**클라우드 SQL Editor에 붙여넣기**:
1. Supabase Dashboard → SQL Editor
2. New query
3. SQL 붙여넣기
4. **Run** 클릭

**✅ 데이터 삽입 완료!**

## 📤 방법 2: CLI를 통한 덤프 & 복원

### 로컬 → 클라우드 (스키마 + 데이터)

#### 준비사항

```bash
# PostgreSQL 클라이언트 도구 설치 (macOS)
brew install postgresql

# 다른 OS: https://www.postgresql.org/download/
```

#### 1단계: 로컬 DB 덤프

```bash
# Supabase 로컬 실행 확인
supabase status

# 로컬 DB URL 확인
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres

# 덤프 생성
pg_dump "postgresql://postgres:postgres@localhost:54322/postgres" \
  --clean \
  --if-exists \
  --schema=public \
  > local_dump.sql
```

**생성된 파일**: `local_dump.sql` (모든 스키마 + 데이터)

#### 2단계: 클라우드 DB에 복원

**클라우드 DB URL 확보**:
- Supabase Dashboard → Settings → Database
- Connection string → URI 복사

**복원 실행**:
```bash
# 클라우드 DB에 덤프 복원
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  < local_dump.sql
```

**⚠️ 주의**: 기존 데이터가 삭제되고 새 데이터로 교체됩니다!

#### 3단계: 확인

- Supabase Dashboard → Table Editor
- categories, products 테이블 확인
- 로컬과 동일한 데이터 확인

### 클라우드 → 로컬 (백업 복원)

**반대 방향도 동일한 방법**:

```bash
# 1. 클라우드 DB 덤프
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  --schema=public \
  > cloud_dump.sql

# 2. 로컬 DB 초기화
supabase db reset

# 3. 덤프 복원
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < cloud_dump.sql
```

## 📊 방법 3: 특정 테이블만 동기화

### 테이블별 덤프

**시나리오**: `products` 테이블만 클라우드에서 로컬로 복사

```bash
# 특정 테이블만 덤프
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  --table=products \
  --data-only \
  > products_data.sql
```

**옵션 설명**:
- `--table=products`: products 테이블만
- `--data-only`: 스키마 제외, 데이터만

**로컬에 복원**:
```bash
# 로컬 products 테이블 비우기
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -c "TRUNCATE products CASCADE;"

# 데이터 복원
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < products_data.sql
```

## 🔐 방법 4: Admin 사용자 동기화

### 로컬에서 클라우드로 Admin 추가

**시나리오**: 로컬에서 테스트한 Admin 계정을 클라우드에 추가

#### 1단계: 로컬 admin_users 확인

```sql
-- 로컬 Supabase Studio → SQL Editor
SELECT * FROM admin_users;

-- 출력:
-- id | email | created_at
-- ----+-------------------+------------
-- ... | admin@example.com | ...
```

#### 2단계: 클라우드에 동일하게 추가

**SQL Editor** (클라우드):
```sql
INSERT INTO admin_users (email) VALUES
('admin@example.com');
```

#### 3단계: Supabase Auth 사용자 생성

**클라우드 Supabase Dashboard**:
1. Authentication → Users
2. **Add user**
3. Email: `admin@example.com`
4. Password: (로컬과 동일하거나 새로 설정)
5. **Auto Confirm User** 체크
6. **Create user**

**✅ Admin 사용자 동기화 완료**

## 🚨 주의사항

### ❌ 하지 말아야 할 것

#### 1. 운영 DB를 함부로 덤프/복원

```bash
# ❌ 매우 위험!
pg_dump "운영DB" > dump.sql
psql "운영DB" < local_dump.sql
# → 운영 데이터가 로컬 테스트 데이터로 교체됨!
```

**올바른 방법**:
- 개발 DB에서만 테스트
- 운영 DB는 백업 후 신중하게 작업

#### 2. 시드 데이터를 운영 DB에 삽입

```sql
-- ❌ 운영 DB에 가짜 데이터 삽입 금지!
INSERT INTO products (name, description, price) VALUES
('테스트 제품', '이것은 테스트입니다', 0);
```

#### 3. `--clean` 옵션을 운영 DB에 사용

**`--clean` 옵션**: 기존 데이터 삭제 후 삽입

```bash
# ❌ 운영 DB에 사용 금지!
pg_dump ... --clean > dump.sql
psql "운영DB" < dump.sql
# → 모든 데이터 삭제됨!
```

### ✅ 안전한 데이터 동기화

#### 백업 먼저

```bash
# 운영 DB 백업 (작업 전)
pg_dump "운영DB" > backup_$(date +%Y%m%d).sql
```

#### 트랜잭션 사용

```sql
-- 트랜잭션 시작
BEGIN;

-- 데이터 삽입/수정
INSERT INTO ...;
UPDATE ...;

-- 확인 후 커밋
COMMIT;  -- 또는 ROLLBACK;
```

#### 단계별 검증

1. 로컬에서 테스트
2. 개발 DB에서 검증
3. 운영 DB에 적용

## 🎯 실전 시나리오

### 시나리오 1: 새 스테이징 환경 구성

**목표**: 새 Supabase Dev 프로젝트에 샘플 데이터 추가

**단계**:

```bash
# 1. 로컬 시드 데이터 확인
cat supabase/seed.sql

# 2. 클라우드 프로젝트 연결
supabase link --project-ref <dev-project-ref>

# 3. 마이그레이션 푸시 (스키마만)
supabase db push

# 4. SQL Editor에서 시드 데이터 삽입
# (seed.sql 내용 복사 & 붙여넣기)
```

### 시나리오 2: 운영 데이터 백업

**목표**: 매주 자동 백업

**백업 스크립트** (`backup.sh`):
```bash
#!/bin/bash

# 날짜
DATE=$(date +%Y%m%d_%H%M%S)

# 운영 DB 덤프
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  --schema=public \
  | gzip > "backups/sojangnim_prod_$DATE.sql.gz"

echo "Backup completed: sojangnim_prod_$DATE.sql.gz"
```

**실행 권한**:
```bash
chmod +x backup.sh
```

**매주 일요일 자동 실행** (cron):
```bash
# crontab -e
0 2 * * 0 /path/to/backup.sh
```

### 시나리오 3: 버그 재현을 위한 운영 데이터 복사

**목표**: 특정 제품 데이터만 로컬로 복사

**SQL로 특정 데이터만 덤프**:
```bash
# 특정 조건의 데이터만
pg_dump "운영DB" \
  --table=products \
  --data-only \
  --inserts \
  | grep "테스트제품" > specific_product.sql

# 로컬에 복원
psql "로컬DB" < specific_product.sql
```

## 📋 데이터 동기화 체크리스트

### 로컬 → 클라우드 (배포 전)

- [ ] 로컬 DB 정상 작동 확인
- [ ] 클라우드 프로젝트 연결 (`supabase link`)
- [ ] 마이그레이션 푸시 (`supabase db push`)
- [ ] 시드 데이터 or 덤프 복원
- [ ] Admin 사용자 추가
- [ ] Table Editor에서 데이터 확인

### 클라우드 → 로컬 (디버깅용)

- [ ] 클라우드 DB 백업 (안전장치)
- [ ] 로컬 DB 초기화 (`supabase db reset`)
- [ ] 클라우드 덤프 생성
- [ ] 로컬 DB에 복원
- [ ] 로컬 Supabase Studio에서 확인

### 운영 DB 백업

- [ ] 백업 스크립트 작성
- [ ] 자동화 설정 (cron)
- [ ] 백업 파일 저장 위치 확인
- [ ] 복원 테스트 (개발 DB에서)

## 🛠️ 유용한 SQL 쿼리

### 전체 데이터 개수 확인

```sql
SELECT
  'categories' AS table_name,
  COUNT(*) AS row_count
FROM categories
UNION ALL
SELECT
  'products',
  COUNT(*)
FROM products
UNION ALL
SELECT
  'admin_users',
  COUNT(*)
FROM admin_users;
```

### 최근 생성된 데이터

```sql
-- 최근 10개 제품
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 10;
```

### 데이터 비교 (로컬 vs 클라우드)

```sql
-- 카테고리 개수
SELECT COUNT(*) FROM categories;

-- 제품 개수
SELECT COUNT(*) FROM products;

-- Admin 사용자 목록
SELECT email FROM admin_users;
```

## 📚 다음 단계

- [RLS 정책](./rls-policies.md) - 데이터 보안 이해
- [첫 배포 가이드](../deployment/first-deployment.md) - 클라우드 DB 활용
- [데이터베이스 유지보수](../operations/database-maintenance.md) - 백업/복구 전략

---

**질문이 있으신가요?** [트러블슈팅 문서](../development/troubleshooting.md)를 확인하세요!
