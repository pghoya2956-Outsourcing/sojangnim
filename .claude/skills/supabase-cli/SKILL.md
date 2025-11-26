---
title: "Supabase CLI 레퍼런스"
tags: [supabase, cli, database, migration]
---

# Supabase CLI 레퍼런스

## 사용 시점

Supabase 로컬 개발 환경 관리, 데이터베이스 마이그레이션, 타입 생성, Edge Functions 배포 등 CLI 명령어가 필요할 때 사용합니다.

---

## 로컬 개발 환경

### 프로젝트 초기화 및 시작

```bash
# 프로젝트 초기화 (supabase/ 디렉토리 생성)
supabase init

# 로컬 개발 스택 시작 (Docker 필수)
supabase start

# 로컬 스택 중지
supabase stop

# 백업 없이 중지 (빠름)
supabase stop --no-backup

# 컨테이너 상태 확인
supabase status
```

### 원격 프로젝트 연결

```bash
# Supabase 계정 로그인
supabase login

# 원격 프로젝트 연결
supabase link --project-ref <project-id>

# 연결된 프로젝트 확인
supabase projects list
```

---

## 데이터베이스 관리

### 마이그레이션 워크플로우

```bash
# 새 마이그레이션 파일 생성
supabase migration new <migration_name>
# → supabase/migrations/<timestamp>_<migration_name>.sql 생성

# 로컬 DB 초기화 (마이그레이션 + 시드 재적용)
supabase db reset

# 마이그레이션 목록 확인
supabase migration list
```

### 원격 DB 동기화

```bash
# 원격 스키마 변경사항 로컬로 가져오기
supabase db pull

# 로컬 마이그레이션을 원격에 적용
supabase db push

# 원격 DB 전체 덤프
supabase db dump -f backup.sql

# 데이터만 덤프
supabase db dump -f data.sql --data-only
```

### 스키마 비교 및 검사

```bash
# 로컬과 원격 스키마 차이점 비교
supabase db diff

# 새 마이그레이션으로 diff 저장
supabase db diff -f <migration_name>

# 스키마 린트 (오류 검사)
supabase db lint
```

### 마이그레이션 관리

```bash
# 마이그레이션 이력 복구 (불일치 해결)
supabase migration repair --status applied <version>
supabase migration repair --status reverted <version>

# 여러 마이그레이션 통합
supabase migration squash
```

---

## TypeScript 타입 생성

```bash
# 로컬 DB에서 타입 생성
supabase gen types typescript --local > src/types/database.ts

# 원격 DB에서 타입 생성
supabase gen types typescript --linked > src/types/database.ts

# 특정 스키마만
supabase gen types typescript --local --schema public > src/types/database.ts
```

---

## Edge Functions

```bash
# 새 함수 생성
supabase functions new <function_name>
# → supabase/functions/<function_name>/index.ts 생성

# 로컬에서 함수 실행 (핫 리로드)
supabase functions serve

# 특정 함수만 실행
supabase functions serve <function_name>

# 함수 배포
supabase functions deploy <function_name>

# 모든 함수 배포
supabase functions deploy

# 함수 목록 확인
supabase functions list

# 함수 삭제
supabase functions delete <function_name>
```

---

## 시크릿 관리

```bash
# 시크릿 설정
supabase secrets set MY_SECRET=value

# 파일에서 시크릿 로드
supabase secrets set --env-file .env.production

# 시크릿 목록 확인
supabase secrets list

# 시크릿 삭제
supabase secrets unset MY_SECRET
```

---

## 스토리지 관리

```bash
# 버킷 내 객체 목록
supabase storage ls ss:///bucket-name

# 파일 업로드
supabase storage cp local-file.png ss:///bucket-name/path/

# 파일 다운로드
supabase storage cp ss:///bucket-name/file.png ./local-path/

# 객체 이동/이름변경
supabase storage mv ss:///bucket/old.png ss:///bucket/new.png

# 객체 삭제
supabase storage rm ss:///bucket-name/file.png

# 폴더 재귀 삭제
supabase storage rm -r ss:///bucket-name/folder/
```

---

## 자주 사용하는 워크플로우

### 1. 새 테이블 추가

```bash
# 1. 마이그레이션 파일 생성
supabase migration new create_users_table

# 2. 파일 편집 후 로컬 적용
supabase db reset

# 3. 타입 재생성
supabase gen types typescript --local > src/types/database.ts

# 4. 원격에 배포 (프로덕션)
supabase db push
```

### 2. 원격 변경사항 동기화

```bash
# 1. 원격 스키마 가져오기
supabase db pull

# 2. 로컬 DB에 적용
supabase db reset

# 3. 타입 재생성
supabase gen types typescript --local > src/types/database.ts
```

### 3. 스키마 변경 비교 후 마이그레이션

```bash
# 1. 현재 차이점 확인
supabase db diff

# 2. 마이그레이션으로 저장
supabase db diff -f add_new_column

# 3. 원격 적용
supabase db push
```

### 4. 프로덕션 배포 전 체크리스트

```bash
# 마이그레이션 상태 확인
supabase migration list

# 스키마 린트
supabase db lint

# 원격 적용 (dry-run 먼저)
supabase db push --dry-run

# 실제 적용
supabase db push
```

---

## 유용한 플래그

| 플래그 | 설명 |
|--------|------|
| `--debug` | 디버그 로그 출력 |
| `--workdir` | 작업 디렉토리 지정 |
| `--project-ref` | 프로젝트 ID 지정 |
| `--db-url` | 직접 DB URL 지정 |
| `--linked` | 연결된 원격 프로젝트 사용 |
| `--local` | 로컬 DB 사용 |

---

## 로컬 서비스 URL (supabase start 후)

| 서비스 | URL |
|--------|-----|
| API | http://127.0.0.1:54321 |
| GraphQL | http://127.0.0.1:54321/graphql/v1 |
| Studio | http://127.0.0.1:54323 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Mailpit | http://127.0.0.1:54324 |

---

## 트러블슈팅

### 컨테이너 시작 실패

```bash
# 기존 컨테이너 정리 후 재시작
supabase stop --no-backup
supabase start
```

### 마이그레이션 충돌

```bash
# 원격 마이그레이션 상태 확인
supabase migration list

# 특정 마이그레이션 상태 수정
supabase migration repair --status applied 20231024000000
```

### Docker 이미지 업데이트

```bash
# CLI 업데이트 후 재시작
brew upgrade supabase
supabase stop --no-backup
supabase start
```
