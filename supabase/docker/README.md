# Docker Compose로 Supabase 로컬 환경 관리

Supabase CLI 대신 Docker Compose로 직접 관리하는 로컬 개발 환경입니다.

---

## 📁 폴더 구조

```
supabase/
├── docker/                     # Docker Compose 환경
│   ├── docker-compose.yml      # Supabase 스택 정의
│   ├── .env                    # 환경변수 (gitignore)
│   ├── .env.example            # 환경변수 템플릿
│   ├── kong/
│   │   └── kong.yml            # API Gateway 라우팅 설정
│   ├── postgres/
│   │   └── init-scripts/       # DB 초기화 스크립트
│   │       └── 00-init.sql     # 역할, 스키마, 확장 생성
│   ├── volumes/                # 데이터 영구 저장 (gitignore)
│   │   ├── db/                 # PostgreSQL 데이터
│   │   └── storage/            # 파일 저장소
│   └── README.md               # 이 파일
├── migrations/                 # DB 마이그레이션
├── seed.sql                    # 시드 데이터
└── config.toml                 # Supabase CLI 설정 (참고용)
```

---

## 🚀 빠른 시작

### 1. 환경변수 확인

`.env` 파일이 이미 생성되어 있습니다. 필요시 수정:

```bash
vi .env
```

### 2. Supabase 시작

```bash
cd supabase/docker
docker compose up -d
```

### 3. 로그 확인

```bash
# 전체 로그
docker compose logs -f

# 특정 서비스만
docker compose logs -f db
docker compose logs -f kong
```

### 4. 상태 확인

```bash
docker compose ps
```

---

## 🌐 접속 정보

| 서비스 | URL | 설명 |
|--------|-----|------|
| **API Gateway** | http://localhost:54321 | 통합 API 엔드포인트 |
| **PostgreSQL** | postgresql://postgres:postgres@localhost:54322/postgres | DB 직접 접속 |
| **Studio** | http://localhost:54323 | 관리자 UI (ID: supabase / PW: supabase) |
| **Inbucket** | http://localhost:54324 | 이메일 테스트 (SMTP 포트: 2500) |

---

## 📝 주요 명령어

### Supabase CLI vs Docker Compose

| 작업 | Supabase CLI | Docker Compose |
|------|-------------|----------------|
| **환경 시작** | `supabase start` | `docker compose up -d` |
| **환경 중지** | `supabase stop` | `docker compose down` |
| **상태 확인** | `supabase status` | `docker compose ps` |
| **로그 확인** | `supabase logs` | `docker compose logs -f` |
| **DB 접속** | `supabase db shell` | `psql -h localhost -p 54322 -U supabase_admin postgres` |
| **완전 삭제** | `supabase db reset` | `docker compose down -v` |

### 환경 관리

```bash
# 시작 (백그라운드)
docker compose up -d

# 중지 (데이터 유지)
docker compose down

# 완전 삭제 (볼륨 포함)
docker compose down -v

# 특정 서비스 재시작
docker compose restart db
docker compose restart kong

# 이미지 업데이트
docker compose pull
docker compose up -d --force-recreate
```

### 데이터베이스 관리

```bash
# PostgreSQL 접속 (컨테이너 내부)
docker exec -it supabase-db psql -U supabase_admin -d postgres

# 또는 로컬에서
PGPASSWORD=postgres psql -h localhost -p 54322 -U supabase_admin -d postgres

# 마이그레이션 확인
docker exec -it supabase-db psql -U supabase_admin -d postgres -c "\dt"

# 시드 데이터 확인
docker exec -it supabase-db psql -U supabase_admin -d postgres -c "SELECT * FROM categories;"
```

---

## 🗄️ 마이그레이션 및 시드 데이터

### 자동 적용 (컨테이너 최초 시작 시)

Docker Compose는 최초 시작 시 자동으로 다음을 실행합니다:

1. **초기화 스크립트** (`postgres/init-scripts/00-init.sql`)
   - Supabase 역할 생성
   - 필수 스키마 생성
   - 확장 설치

2. **마이그레이션** (`../supabase/migrations/*.sql`)
   - 타임스탬프 순서로 자동 실행

3. **시드 데이터** (`../supabase/seed.sql`)
   - 샘플 데이터 삽입

### 새 마이그레이션 추가

```bash
# 1. 마이그레이션 파일 생성
cd ../migrations
touch 20250116120000_add_new_table.sql

# 2. SQL 작성
echo "CREATE TABLE new_table (id UUID PRIMARY KEY);" > 20250116120000_add_new_table.sql

# 3. 컨테이너 재생성 (마이그레이션 자동 적용)
cd ../../supabase/docker
docker compose down
docker compose up -d
```

**주의**: 기존 데이터베이스에 새 마이그레이션을 적용하려면 수동으로 실행해야 합니다:

```bash
PGPASSWORD=postgres psql -h localhost -p 54322 -U supabase_admin -d postgres \
  -f ../supabase/migrations/20250116120000_add_new_table.sql
```

---

## 🔧 환경변수 설정

### 주요 환경변수 (.env)

```bash
# 시크릿 (로컬 개발용 고정값)
POSTGRES_PASSWORD=postgres
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJ... (고정)
SERVICE_ROLE_KEY=eyJ... (고정)

# 포트 (config.toml 매핑)
KONG_HTTP_PORT=54321        # api.port
KONG_HTTPS_PORT=54320
INBUCKET_PORT=54324         # inbucket.port

# API 설정
PGRST_DB_SCHEMAS=public,graphql_public  # api.schemas

# Auth 설정
SITE_URL=http://localhost:3000          # auth.site_url
JWT_EXPIRY=3600                         # auth.jwt_expiry
DISABLE_SIGNUP=false                    # auth.enable_signup (반대)
ENABLE_EMAIL_AUTOCONFIRM=true           # auth.email.enable_confirmations (반대)

# Storage
STORAGE_FILE_SIZE_LIMIT=52428800        # 50MiB (storage.file_size_limit)
```

### Next.js 연결 (.env.local)

Docker Compose 환경을 사용할 때도 Next.js의 `.env.local`은 동일합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

---

## 🐛 트러블슈팅

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :54321
lsof -i :54322
lsof -i :54323

# 해결: .env에서 포트 변경
KONG_HTTP_PORT=55321
```

### 데이터베이스 초기화 실패

```bash
# 볼륨 삭제 후 재시작
docker compose down -v
docker compose up -d

# 로그 확인
docker compose logs db
```

### Kong 라우팅 오류

```bash
# Kong 설정 확인
docker exec -it supabase-kong cat /home/kong/kong.yml

# Kong 재시작
docker compose restart kong
```

### 마이그레이션 중복 실행 방지

PostgreSQL의 `/docker-entrypoint-initdb.d/`는 **빈 볼륨일 때만** 실행됩니다.
이미 데이터가 있으면 마이그레이션이 자동 실행되지 않으므로, 수동으로 적용하거나 볼륨을 삭제해야 합니다.

```bash
# 데이터 삭제하고 처음부터 (주의!)
docker compose down -v
docker compose up -d
```

---

## 📊 서비스 구성

### 포함된 서비스 (9개)

1. **db** - PostgreSQL 17.6
2. **kong** - API Gateway (포트 54321)
3. **auth** - GoTrue 인증 (내부 포트 9999)
4. **rest** - PostgREST API (내부 포트 3000)
5. **realtime** - 실시간 구독 (내부 포트 4000)
6. **storage** - 파일 저장소 (내부 포트 5000)
7. **meta** - pg_meta (내부 포트 8080)
8. **studio** - Studio UI (포트 54323)
9. **inbucket** - 이메일 테스트 (포트 54324)

### 제외된 서비스

- ❌ `analytics` - Logflare (config.toml: analytics.enabled=false)
- ❌ `vector` - Logs collector
- ❌ `imgproxy` - Image transformation
- ❌ `edge-runtime` - Edge Functions (선택사항)
- ❌ `pooler` - Connection pooler (config.toml: db.pooler.enabled=false)

---

## 🔄 Supabase CLI에서 전환

### 1. 기존 Supabase CLI 중지

```bash
supabase stop
```

### 2. Docker Compose 시작

```bash
cd supabase/docker
docker compose up -d
```

### 3. 확인

```bash
# Studio 접속
open http://localhost:54323

# Next.js 앱 실행
cd ../..
npm run dev
```

---

## 📚 참고

- **공식 Supabase Docker**: https://github.com/supabase/supabase/tree/master/docker
- **프로젝트 config.toml**: `../supabase/config.toml` (참고용)
- **마이그레이션**: `../supabase/migrations/` (자동 적용)
- **시드 데이터**: `../supabase/seed.sql` (자동 적용)

---

## 💡 팁

### 빠른 재시작 (별칭 설정)

`~/.zshrc` 또는 `~/.bashrc`에 추가:

```bash
alias dup='docker compose up -d'
alias ddown='docker compose down'
alias dps='docker compose ps'
alias dlogs='docker compose logs -f'
```

### 개발 워크플로우

```bash
# 1. Docker Compose 시작
cd supabase/docker && docker compose up -d

# 2. Next.js 개발 서버 시작
cd ../.. cd .. &&cd .. && npm run dev

# 3. 작업 완료 후 중지
cd supabase/docker && docker compose down
```

---

**문의사항이나 개선 제안은 팀 채널로 남겨주세요!** 🚀
