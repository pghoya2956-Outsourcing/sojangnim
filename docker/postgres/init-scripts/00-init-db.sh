#!/bin/bash
set -e

echo "=========================================="
echo "Supabase Database Initialization"
echo "=========================================="

# Supabase 필수 스키마 생성
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Auth 스키마 (GoTrue)
    CREATE SCHEMA IF NOT EXISTS auth;
    GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

    -- Storage 스키마
    CREATE SCHEMA IF NOT EXISTS storage;
    GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;

    -- Realtime 스키마
    CREATE SCHEMA IF NOT EXISTS _realtime;
    GRANT USAGE ON SCHEMA _realtime TO postgres;

    -- GraphQL 스키마
    CREATE SCHEMA IF NOT EXISTS graphql_public;
    GRANT USAGE ON SCHEMA graphql_public TO postgres, anon, authenticated, service_role;

    -- Extensions 스키마
    CREATE SCHEMA IF NOT EXISTS extensions;
    GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

    -- 필수 확장 설치
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;

    -- Supabase 역할 생성
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
            CREATE ROLE anon NOLOGIN NOINHERIT;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
            CREATE ROLE authenticated NOLOGIN NOINHERIT;
        END IF;

        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
            CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
        END IF;
    END
    \$\$;

    -- Public 스키마 권한 설정
    GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
EOSQL

echo "✅ Database initialization completed"
