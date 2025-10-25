---
title: "데이터베이스 유지보수 가이드"
tags: [operations, database, backup, maintenance, optimization]
---

# 🗄️ 데이터베이스 유지보수 가이드

Supabase PostgreSQL 데이터베이스의 백업, 복구, 최적화 및 유지보수 작업을 안내합니다.

## 📌 유지보수가 필요한 이유

### 데이터베이스 유지보수의 중요성

```mermaid
graph TD
    A[DB 유지보수] --> B[데이터 보호]
    A --> C[성능 유지]
    A --> D[안정성 확보]

    B --> E[정기 백업]
    C --> F[쿼리 최적화]
    D --> G[모니터링]

    E --> H[재해 복구]
    F --> I[빠른 응답]
    G --> J[문제 조기 발견]
```

### 유지보수 주기

| 작업 | 주기 | 소요 시간 |
|------|------|----------|
| 백업 확인 | 매일 | 5분 |
| 쿼리 성능 점검 | 주간 | 15분 |
| 인덱스 최적화 | 월간 | 30분 |
| 전체 백업 테스트 | 분기 | 1시간 |
| 마이그레이션 정리 | 분기 | 30분 |

## 💾 백업 전략

### Supabase 자동 백업

**Free Tier**:
- **백업 없음** (⚠️ 중요!)
- 데이터 손실 시 복구 불가

**Pro Tier ($25/월)**:
- **일일 자동 백업**
- 7일간 보관
- Point-in-Time Recovery (PITR)

### 수동 백업 (필수)

**Free Tier 사용 시 반드시 수동 백업**을 설정해야 합니다.

#### 백업 스크립트 작성

**`backup.sh` 생성**:
```bash
#!/bin/bash

# 설정
PROJECT_REF="your-project-ref"
DB_PASSWORD="your-db-password"
BACKUP_DIR="$HOME/backups/sojangnim"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 백업 실행
pg_dump "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# 백업 성공 확인
if [ $? -eq 0 ]; then
  echo "✅ Backup completed: backup_$DATE.sql.gz"

  # 30일 이상 된 백업 삭제
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
else
  echo "❌ Backup failed"
  exit 1
fi
```

**실행 권한 부여**:
```bash
chmod +x backup.sh
```

**수동 실행**:
```bash
./backup.sh
```

#### 자동 백업 (cron)

**macOS/Linux**:
```bash
# crontab 편집
crontab -e

# 매일 새벽 2시에 백업
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

**Windows (Task Scheduler)**:
1. 작업 스케줄러 열기
2. "기본 작업 만들기"
3. 트리거: 매일 새벽 2시
4. 작업: `backup.sh` 실행

### 백업 확인

**백업 파일 목록**:
```bash
ls -lh ~/backups/sojangnim/

# 출력 예시:
# backup_20250125_020000.sql.gz  12MB
# backup_20250124_020000.sql.gz  11MB
# backup_20250123_020000.sql.gz  11MB
```

**백업 무결성 테스트**:
```bash
# 압축 해제 테스트
gunzip -t backup_20250125_020000.sql.gz

# 성공: (아무 출력 없음)
# 실패: gzip: backup_xxx.sql.gz: invalid compressed data
```

## 🔄 복구 (Restore)

### 전체 복구

**⚠️ 주의**: 복구는 기존 데이터를 **완전히 덮어씁니다**!

#### 1단계: 백업 파일 준비

```bash
# 최신 백업 확인
ls -t ~/backups/sojangnim/backup_*.sql.gz | head -1

# 압축 해제
gunzip backup_20250125_020000.sql.gz
# → backup_20250125_020000.sql 생성
```

#### 2단계: 복구 실행

**로컬 환경 (Docker Supabase)**:
```bash
# Supabase 초기화
supabase db reset

# 백업 복원
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < backup_20250125_020000.sql
```

**클라우드 환경**:
```bash
# ⚠️ 운영 DB 복구는 매우 신중하게!

# 1. 현재 DB 백업 (안전장치)
./backup.sh

# 2. 복구 실행
psql "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" \
  < backup_20250125_020000.sql
```

#### 3단계: 복구 확인

```sql
-- 데이터 개수 확인
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM admin_users;

-- 최신 데이터 확인
SELECT * FROM products ORDER BY created_at DESC LIMIT 5;
```

### 부분 복구 (특정 테이블만)

**시나리오**: `products` 테이블만 복구

#### 1단계: 테이블별 백업 추출

```bash
# 백업 파일에서 products 테이블만 추출
pg_restore -t products backup_20250125_020000.sql > products_only.sql

# 또는 grep 사용
grep -A 10000 "CREATE TABLE products" backup_20250125_020000.sql > products_only.sql
```

#### 2단계: 기존 테이블 비우기

```sql
-- products 테이블만 비우기
TRUNCATE products CASCADE;
```

#### 3단계: 복구

```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < products_only.sql
```

### Point-in-Time Recovery (Pro 플랜)

**Supabase Dashboard** → **Database** → **Backups**

**특정 시점으로 복구**:
1. 복구할 시점 선택 (예: 1시간 전)
2. **Restore** 클릭
3. 확인 대기 (5-10분)

**효과**:
- 실수로 삭제한 데이터 복구
- 특정 시점의 DB 상태로 롤백

## 🚀 성능 최적화

### 쿼리 성능 분석

#### 느린 쿼리 식별

**Supabase Dashboard** → **Logs** → **Database**

**느린 쿼리 필터링**:
- Duration > 500ms

**예시 느린 쿼리**:
```sql
SELECT * FROM products
WHERE description ILIKE '%드릴%'
ORDER BY created_at DESC;

-- Duration: 1,245ms
```

#### EXPLAIN ANALYZE

**SQL Editor**에서 실행:
```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE description ILIKE '%드릴%'
ORDER BY created_at DESC;
```

**결과 해석**:
```
Seq Scan on products  (cost=0.00..234.56 rows=100 width=512) (actual time=0.123..45.678 rows=12 loops=1)
  Filter: (description ~~* '%드릴%'::text)
Planning Time: 0.234 ms
Execution Time: 1245.678 ms
```

**문제**: `Seq Scan` (전체 테이블 스캔) → 느림

### 인덱스 추가

#### 인덱스가 필요한 경우

1. **WHERE 절에 자주 사용되는 컬럼**
2. **ORDER BY에 사용되는 컬럼**
3. **JOIN에 사용되는 외래키**

#### 인덱스 생성 예시

**카테고리별 필터링 최적화**:
```sql
-- category_id에 인덱스 (이미 외래키로 존재할 수 있음)
CREATE INDEX IF NOT EXISTS idx_products_category_id
ON products(category_id);
```

**전문 검색 최적화**:
```sql
-- description 검색을 위한 GIN 인덱스
CREATE INDEX idx_products_description_gin
ON products USING gin(to_tsvector('english', description));

-- 사용 예시
SELECT * FROM products
WHERE to_tsvector('english', description) @@ to_tsquery('drill');
```

**배지 필터링 최적화**:
```sql
CREATE INDEX idx_products_badge
ON products(badge)
WHERE badge IS NOT NULL;
```

#### 인덱스 확인

```sql
-- products 테이블의 모든 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'products';
```

**출력 예시**:
```
indexname                     | indexdef
------------------------------+----------------------------------
products_pkey                 | CREATE UNIQUE INDEX products_pkey ON products USING btree (id)
idx_products_category_id      | CREATE INDEX idx_products_category_id ON products USING btree (category_id)
```

### VACUUM 및 ANALYZE

**PostgreSQL 유지보수 명령**:

```sql
-- VACUUM: 삭제된 행 공간 회수
VACUUM products;

-- ANALYZE: 통계 정보 업데이트 (쿼리 플래너 최적화)
ANALYZE products;

-- VACUUM ANALYZE: 둘 다
VACUUM ANALYZE products;

-- 전체 테이블
VACUUM ANALYZE;
```

**자동 VACUUM**:
- Supabase는 자동으로 autovacuum 실행
- 수동 실행은 대량 삭제/업데이트 후 권장

### 쿼리 최적화 팁

#### 필요한 컬럼만 SELECT

```typescript
// ❌ 모든 컬럼
const { data } = await supabase
  .from('products')
  .select('*')

// ✅ 필요한 컬럼만
const { data } = await supabase
  .from('products')
  .select('id, name, price, image_url')
```

#### LIMIT 사용

```typescript
// ❌ 전체 제품
const { data } = await supabase
  .from('products')
  .select('*')

// ✅ 페이지네이션
const { data } = await supabase
  .from('products')
  .select('*')
  .range(0, 19) // 처음 20개
```

#### JOIN 최적화

```typescript
// ✅ 카테고리 정보 포함
const { data } = await supabase
  .from('products')
  .select(`
    id,
    name,
    price,
    category:categories(name, slug)
  `)
```

## 🧹 데이터 정리

### 오래된 데이터 삭제

**예시: 90일 이상 된 삭제 마크 제품 제거**

```sql
-- 삭제 전 확인
SELECT COUNT(*) FROM products
WHERE deleted_at < NOW() - INTERVAL '90 days';

-- 삭제
DELETE FROM products
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

**⚠️ 운영 DB에서는 신중하게!**

### 중복 데이터 제거

**중복 제품 확인**:
```sql
-- 동일한 이름의 제품
SELECT name, COUNT(*)
FROM products
GROUP BY name
HAVING COUNT(*) > 1;
```

**중복 제거** (최신 것만 남김):
```sql
-- 중복 중 오래된 것 삭제
DELETE FROM products p1
USING products p2
WHERE p1.name = p2.name
  AND p1.created_at < p2.created_at;
```

### 테이블 크기 확인

```sql
-- 테이블별 크기
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;
```

**출력 예시**:
```
tablename    | size    | bytes
-------------+---------+----------
products     | 8192 kB | 8388608
categories   | 64 kB   | 65536
admin_users  | 16 kB   | 16384
```

## 🔍 데이터 무결성 검증

### 외래키 제약 확인

```sql
-- 존재하지 않는 category_id를 가진 제품
SELECT p.id, p.name, p.category_id
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL;
```

**결과가 있으면**: 데이터 오류, 수정 필요

### NULL 값 검증

```sql
-- 필수 필드에 NULL이 있는가?
SELECT COUNT(*) FROM products WHERE name IS NULL;
SELECT COUNT(*) FROM products WHERE price IS NULL;
```

**COUNT > 0이면**: 데이터 정리 필요

### 데이터 타입 검증

```sql
-- 음수 가격 확인
SELECT id, name, price
FROM products
WHERE price < 0;

-- 비정상적으로 긴 이름
SELECT id, name, LENGTH(name) AS name_length
FROM products
WHERE LENGTH(name) > 200;
```

## 📊 마이그레이션 관리

### 마이그레이션 히스토리 확인

```sql
-- 적용된 마이그레이션 목록 (Supabase)
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

**출력 예시**:
```
version               | name
----------------------+-----------------------------------
20251024000001        | add_admin_rls_policies
20250125000000        | create_admin_users
20251024000000        | initial_schema
```

### 마이그레이션 롤백

**⚠️ 주의**: Supabase CLI는 자동 롤백을 지원하지 않습니다.

**수동 롤백**:
1. 롤백 마이그레이션 파일 생성
2. 변경 사항 되돌리는 SQL 작성

**예시: `add_stock_field` 롤백**

`supabase/migrations/20250126000001_rollback_stock.sql`:
```sql
-- 20250126000000_add_stock_field.sql 롤백

ALTER TABLE products
DROP COLUMN IF EXISTS stock;

DROP INDEX IF EXISTS idx_products_stock;
```

**적용**:
```bash
supabase db push
```

## 🔐 보안 점검

### RLS 정책 감사

```sql
-- 모든 RLS 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**확인 사항**:
- 공개 읽기 정책이 의도대로 설정되었는가?
- Admin 쓰기 권한이 올바른가?
- 불필요한 권한은 없는가?

### 민감한 데이터 확인

```sql
-- 이메일 주소 노출 확인
SELECT email FROM admin_users;

-- ⚠️ 민감 정보가 products 테이블에 있는가?
SELECT * FROM products WHERE description LIKE '%비밀번호%';
```

## 📋 유지보수 체크리스트

### 일일 점검

- [ ] 백업 파일 생성 확인 (크기, 날짜)
- [ ] Supabase Dashboard → Usage 확인 (DB 크기, 대역폭)
- [ ] 에러 로그 확인 (Logs → Database)

### 주간 점검

- [ ] 느린 쿼리 확인 (Duration > 500ms)
- [ ] 테이블 크기 증가 추이 확인
- [ ] 인덱스 사용률 확인
- [ ] 백업 복구 테스트 (개발 환경)

### 월간 점검

- [ ] VACUUM ANALYZE 실행
- [ ] 중복 데이터 제거
- [ ] 마이그레이션 정리 (불필요한 파일 삭제)
- [ ] RLS 정책 감사
- [ ] 데이터 무결성 검증

### 분기 점검

- [ ] 전체 백업 복구 테스트 (운영 → 개발)
- [ ] 인덱스 재구성 (`REINDEX`)
- [ ] 용량 계획 검토 (Free → Pro 전환 필요?)
- [ ] 보안 감사

## 🚨 긴급 상황 대응

### 데이터 손실

**시나리오**: 실수로 제품 테이블 전체 삭제

**대응**:
1. **즉시 운영 중단** (추가 손상 방지)
2. 최신 백업 파일 확인
3. 백업 복구 실행
4. 데이터 검증
5. 서비스 재개

**복구 시간**:
- 백업 확인: 2분
- 복구 실행: 5-10분
- 검증: 5분
- **총 소요: 15-20분**

### 데이터베이스 오염

**시나리오**: 잘못된 마이그레이션 적용

**대응**:
1. 문제 마이그레이션 식별
2. 롤백 마이그레이션 작성
3. 개발 환경에서 테스트
4. 운영 환경에 적용

### 용량 초과

**시나리오**: Database Size > 500MB (Free tier)

**대응**:
1. 불필요한 데이터 삭제
2. 이미지 외부 스토리지 이전
3. 테이블 VACUUM
4. 플랜 업그레이드 고려

## 🛠️ 유용한 SQL 쿼리

### 데이터베이스 전체 통계

```sql
SELECT
  (SELECT COUNT(*) FROM categories) AS categories_count,
  (SELECT COUNT(*) FROM products) AS products_count,
  (SELECT COUNT(*) FROM admin_users) AS admin_users_count,
  pg_size_pretty(pg_database_size(current_database())) AS db_size;
```

### 최근 생성/수정된 데이터

```sql
-- 최근 7일간 추가된 제품
SELECT name, created_at
FROM products
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 인덱스 사용률

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**해석**:
- `idx_scan = 0`: 사용되지 않는 인덱스 (삭제 고려)
- `idx_scan > 1000`: 자주 사용되는 인덱스 (유지)

## 📚 다음 단계

- [모니터링 가이드](./monitoring.md) - 성능 및 에러 추적
- [Admin 운영 가이드](./admin-operations.md) - 일상적인 관리
- [데이터 동기화](../supabase/data-sync.md) - 환경 간 데이터 이동

---

**데이터베이스 유지보수 관련 질문**이 있으시면 [트러블슈팅 문서](../development/troubleshooting.md)를 참고하세요!
