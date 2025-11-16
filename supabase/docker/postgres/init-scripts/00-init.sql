-- Supabase 초기화 스크립트
-- Docker Compose를 통한 로컬 개발 환경 구성

\echo '======================================'
\echo 'Supabase Database Initialization'
\echo '======================================'

-- 비밀번호 변수 설정
\set pgpass `echo "$POSTGRES_PASSWORD"`

-- Supabase 역할 생성 (이미 있으면 무시)
DO
$$
BEGIN
    -- anon: 익명 사용자 (공개 API 접근)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;

    -- authenticated: 인증된 사용자
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;

    -- service_role: 서비스 역할 (모든 권한, RLS 우회)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;

    -- authenticator: PostgREST가 사용하는 역할
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD :'pgpass';
        GRANT anon, authenticated, service_role TO authenticator;
    END IF;

    -- supabase_auth_admin: GoTrue(Auth) 서비스 관리자
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE CREATEDB LOGIN PASSWORD :'pgpass';
    END IF;

    -- supabase_storage_admin: Storage 서비스 관리자
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE CREATEDB LOGIN PASSWORD :'pgpass';
    END IF;

    -- supabase_functions_admin: Edge Functions 관리자 (선택사항)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_functions_admin') THEN
        CREATE ROLE supabase_functions_admin NOINHERIT CREATEROLE CREATEDB LOGIN PASSWORD :'pgpass';
    END IF;

    -- pgbouncer: Connection pooler (선택사항)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pgbouncer') THEN
        CREATE ROLE pgbouncer LOGIN PASSWORD :'pgpass';
    END IF;
END
$$;

-- 필수 스키마 생성
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS extensions;

-- 스키마 권한 설정
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, supabase_auth_admin;
GRANT USAGE ON SCHEMA storage TO postgres, supabase_storage_admin;
GRANT USAGE ON SCHEMA _realtime TO postgres;
GRANT USAGE ON SCHEMA graphql_public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- public 스키마 권한 설정 (기본 테이블 접근)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 향후 생성될 객체에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 필수 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA graphql_public;

\echo '✅ Database initialization completed'
