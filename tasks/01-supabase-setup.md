---
title: "Phase 1: Supabase 로컬 개발 환경 구성"
tags: [supabase, database, docker, local-development]
---

# Phase 1: Supabase 로컬 개발 환경 구성 (Docker)

## 목표
Docker를 사용하여 로컬에서 Supabase 개발 환경 구축

---

## 1. 사전 준비

### 1.1 Docker 설치 확인
```bash
# Docker 버전 확인
docker --version
docker-compose --version

# Docker가 없으면 설치
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Windows: https://docs.docker.com/desktop/install/windows-install/
```

### 1.2 Supabase CLI 설치
```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# 기타 OS (npm)
npm install -g supabase

# 설치 확인
supabase --version
```

---

## 2. Supabase 로컬 프로젝트 초기화

### 2.1 프로젝트에서 Supabase 초기화
```bash
# 현재 위치: /Users/infograb/Workspace/Personal/pghoya2956/sojangnim

# Supabase 초기화
supabase init

# supabase 폴더가 생성됨
```

생성되는 폴더 구조:
```
sojangnim/
├── supabase/
│   ├── config.toml          # Supabase 설정
│   ├── seed.sql             # 초기 데이터
│   └── migrations/          # DB 마이그레이션
```

### 2.2 Supabase 로컬 실행
```bash
# Docker로 Supabase 시작 (최초 실행 시 이미지 다운로드로 시간 소요)
supabase start

# 실행 완료 시 출력되는 정보:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# anon key: eyJhbGci...
# service_role key: eyJhbGci...
```

⚠️ **중요**: 출력된 정보를 메모장에 저장하세요!

---

## 3. 데이터베이스 마이그레이션 파일 생성

### 3.1 마이그레이션 파일 생성
```bash
# 새 마이그레이션 생성
supabase migration new initial_schema
```

생성된 파일: `supabase/migrations/[timestamp]_initial_schema.sql`

### 3.2 마이그레이션 파일 작성
**파일**: `supabase/migrations/[timestamp]_initial_schema.sql`

```sql
-- badge 타입 정의
CREATE TYPE product_badge AS ENUM ('신제품', '베스트', '프리미엄', '할인');

-- categories 테이블 생성
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- products 테이블 생성
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    badge product_badge,
    specs JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "누구나 카테고리 조회 가능"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "누구나 제품 조회 가능"
    ON products FOR SELECT
    USING (true);
```

### 3.3 마이그레이션 적용
```bash
# 마이그레이션 적용
supabase db reset

# 또는 (처음 적용 시)
supabase migration up
```

---

## 4. 초기 데이터 입력 (Seed)

### 4.1 Seed 파일 작성
**파일**: `supabase/seed.sql`

```sql
-- 카테고리 데이터
INSERT INTO categories (name, slug) VALUES
    ('전동공구', 'power-tools'),
    ('에어공구', 'air-tools'),
    ('측정기', 'measuring-tools'),
    ('용접장비', 'welding'),
    ('안전용품', 'safety');

-- 제품 데이터
INSERT INTO products (name, description, price, image_url, category_id, badge, specs) VALUES
    (
        '프로페셔널 임팩트 드라이버',
        '강력한 20V 브러시리스 모터 탑재로 최대 180Nm의 토크를 제공합니다. 경량 설계와 인체공학적 그립으로 장시간 작업시에도 편안합니다.',
        298000,
        '/images/products/impact-driver.jpg',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '신제품',
        '{"전압": "20V", "토크": "180Nm", "배터리": "5.0Ah", "무게": "1.2kg"}'::jsonb
    ),
    (
        '산업용 앵글 그라인더',
        '2200W 고출력 모터와 안전 장치가 완비된 프로페셔널 앵글 그라인더. 다양한 작업에 활용 가능한 125mm 디스크 호환.',
        185000,
        '/images/products/angle-grinder.jpg',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '베스트',
        '{"소비전력": "2200W", "디스크": "125mm", "회전수": "11,000rpm", "무게": "2.3kg"}'::jsonb
    ),
    (
        '레이저 거리 측정기',
        '최대 100m 측정 거리, ±1.5mm 정밀도를 자랑하는 프로페셔널 레이저 측정기. IP54 등급 방진방수 기능으로 현장에서 안심하고 사용 가능.',
        165000,
        '/images/products/laser-measure.jpg',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        '프리미엄',
        '{"측정범위": "0.05-100m", "정밀도": "±1.5mm", "방수등급": "IP54", "배터리": "1500mAh"}'::jsonb
    ),
    (
        '에어 임팩트 렌치 세트',
        '최대 1600Nm의 강력한 토크를 제공하는 에어 임팩트 렌치. 트윈 해머 방식으로 내구성이 우수하며 소켓 세트 포함.',
        355000,
        '/images/products/air-wrench.jpg',
        (SELECT id FROM categories WHERE slug = 'air-tools'),
        '할인',
        '{"공기압": "6.2bar", "최대토크": "1600Nm", "드라이브": "1/2\"", "무게": "2.8kg"}'::jsonb
    ),
    (
        '디지털 버니어 캘리퍼스',
        '0.01mm 정밀도의 디지털 캘리퍼스. 대형 LCD 디스플레이와 mm/inch 단위 변환 기능.',
        45000,
        '/images/products/caliper.jpg',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        NULL,
        '{"측정범위": "0-150mm", "정밀도": "0.01mm", "디스플레이": "LCD", "배터리": "CR2032"}'::jsonb
    ),
    (
        '인버터 용접기',
        '경량 인버터 방식으로 이동이 편리한 전문가용 용접기. 안정적인 아크 성능과 낮은 전력 소비.',
        520000,
        '/images/products/welder.jpg',
        (SELECT id FROM categories WHERE slug = 'welding'),
        '신제품',
        '{"출력": "200A", "입력전압": "220V", "무게": "5.2kg", "방식": "인버터"}'::jsonb
    ),
    (
        '안전화 (고급형)',
        '강철 토캡과 Kevlar 중창으로 최상의 안전성 제공. 통기성이 우수하고 장시간 착용해도 편안합니다.',
        89000,
        '/images/products/safety-shoes.jpg',
        (SELECT id FROM categories WHERE slug = 'safety'),
        '베스트',
        '{"사이즈": "250-280mm", "소재": "가죽+메쉬", "중창": "Kevlar", "인증": "KCS"}'::jsonb
    ),
    (
        '무선 전동 드릴',
        '18V 리튬이온 배터리 탑재. 13mm 척 사이즈로 다양한 작업에 활용 가능.',
        125000,
        '/images/products/drill.jpg',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        NULL,
        '{"전압": "18V", "척크기": "13mm", "배터리": "2.0Ah", "무게": "1.5kg"}'::jsonb
    );
```

### 4.2 Seed 데이터 적용
```bash
# DB 리셋 (마이그레이션 + Seed 모두 적용)
supabase db reset

# 완료 메시지 확인
```

---

## 5. Supabase Studio 접속

### 5.1 웹 브라우저에서 Studio 접속
```
http://localhost:54323
```

- **Table Editor**: 테이블 데이터 확인 및 수정
- **SQL Editor**: SQL 쿼리 실행
- **Database**: 스키마 확인

---

## 6. 로컬 환경 변수 설정

### 6.1 .env.local 파일 생성
**파일**: `.env.local`

```env
# Supabase Local 연결 정보
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

⚠️ **참고**:
- `supabase start` 실행 시 출력된 값 사용 가능
- 로컬에서는 anon key가 기본적으로 위 값으로 고정됩니다

---

## 7. 데이터베이스 스키마 확인

### 7.1 ER 다이어그램
```mermaid
erDiagram
    categories ||--o{ products : has

    categories {
        uuid id PK
        text name
        text slug
        timestamptz created_at
    }

    products {
        uuid id PK
        text name
        text description
        integer price
        text image_url
        uuid category_id FK
        product_badge badge
        jsonb specs
        timestamptz created_at
    }
```

---

## 8. 유용한 명령어

```bash
# Supabase 상태 확인
supabase status

# Supabase 중지
supabase stop

# Supabase 재시작
supabase stop && supabase start

# DB 리셋 (마이그레이션 + Seed 재적용)
supabase db reset

# 마이그레이션 히스토리 확인
supabase migration list

# 새 마이그레이션 생성
supabase migration new <name>

# 현재 DB 스키마를 마이그레이션으로 저장
supabase db diff -f <migration_name>
```

---

## 9. Badge 관리 방법

로컬 개발 환경에서는 Supabase Studio나 Seed 파일에서 Badge를 관리합니다.

### 9.1 Studio에서 Badge 변경
1. http://localhost:54323 접속
2. **Table Editor** → **products** 테이블 선택
3. 원하는 행의 `badge` 컬럼 클릭하여 수정

### 9.2 SQL Editor에서 Badge 변경
```sql
-- 특정 제품의 Badge 변경
UPDATE products
SET badge = '베스트'
WHERE name = '무선 전동 드릴';

-- Badge 제거
UPDATE products
SET badge = NULL
WHERE name = '디지털 버니어 캘리퍼스';

-- 여러 제품에 한번에 Badge 추가
UPDATE products
SET badge = '할인'
WHERE price < 100000;
```

---

## 10. 완료 체크리스트

- [ ] Docker 설치 확인
- [ ] Supabase CLI 설치
- [ ] `supabase init` 실행
- [ ] 마이그레이션 파일 작성
- [ ] Seed 파일 작성
- [ ] `supabase start` 실행 성공
- [ ] `supabase db reset` 실행
- [ ] http://localhost:54323 에서 데이터 확인
- [ ] `.env.local`에 로컬 URL 설정

---

## 트러블슈팅

### 문제 1: "Docker is not running"
**해결**: Docker Desktop 실행

### 문제 2: 포트 충돌 (54321, 54322 등)
**해결**:
```bash
supabase stop
# 충돌하는 다른 서비스 중지
supabase start
```

### 문제 3: Migration 적용 안 됨
**해결**:
```bash
supabase db reset --debug
```

### 문제 4: Seed 데이터가 안 보임
**해결**:
```bash
# seed.sql 파일 확인 후
supabase db reset
```

### 문제 5: "type product_badge already exists"
**해결**:
```bash
# 완전히 리셋
supabase db reset
```

### 문제 6: 한글이 깨져서 보임
**해결**:
- 파일이 UTF-8로 저장되었는지 확인
- VSCode 우측 하단에서 인코딩 확인

---

## 다음 단계
✅ Phase 1 완료 후 → 📄 `02-nextjs-setup.md`로 이동

⚠️ **참고**: 운영 배포는 Phase 5 (`05-deployment.md`)에서 다룹니다.
