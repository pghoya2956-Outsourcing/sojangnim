---
title: "소장님 프로젝트 문서"
tags: [documentation, guide, index]
---

# 📚 소장님 프로젝트 문서

이 폴더에는 소장님 프로젝트를 이해하고 개발/운영하는 데 필요한 모든 문서가 있습니다.

## 🚀 빠른 시작

**처음 프로젝트를 시작하시나요?**

1. **[빠른 시작 가이드](./getting-started.md)** ← 여기서 시작하세요!
2. **[Supabase 로컬 환경 설정](./supabase/local-setup.md)** ← 데이터베이스 설정
3. **[트러블슈팅](./development/troubleshooting.md)** ← 문제가 생겼다면

## 📖 문서 카테고리

### 🏗️ 아키텍처

프로젝트의 전체 구조와 설계 철학을 이해합니다.

- **[아키텍처 개요](./architecture/overview.md)** - 전체 시스템 구조
- **[데이터베이스 스키마](./architecture/database-schema.md)** - DB 테이블 및 관계
- **[상태 관리](./architecture/state-management.md)** - Zustand, Server State
- **[환경 구분](./architecture/environments.md)** - 로컬/스테이징/프로덕션

### 🗄️ Supabase

백엔드 데이터베이스 및 인증 시스템을 다룹니다.

- **[로컬 환경 설정](./supabase/local-setup.md)** ⭐ 필수!
- **[클라우드 환경 설정](./supabase/cloud-setup.md)** - 운영 배포 전 필수
- **[마이그레이션 가이드](./supabase/migrations.md)** - DB 변경 관리
- **[RLS 정책](./supabase/rls-policies.md)** - 보안 정책
- **[Admin 시스템](./supabase/admin-system.md)** - 관리자 인증
- **[데이터 동기화](./supabase/data-sync.md)** - 로컬 ↔ 클라우드

### 💻 개발

코드 작성과 기능 추가 방법을 배웁니다.

- **[코딩 컨벤션](./development/coding-conventions.md)** - 코드 스타일
- **[컴포넌트 패턴](./development/component-patterns.md)** - Server/Client Component
- **[새 기능 추가하기](./development/adding-features.md)** - 기능 추가 체크리스트
- **[테스트 가이드](./development/testing.md)** - E2E 테스트
- **[트러블슈팅](./development/troubleshooting.md)** - 자주 발생하는 문제

### 🚀 배포

Vercel과 Supabase Cloud로 운영 환경에 배포합니다.

- **[배포 개요](./deployment/overview.md)** - 배포 전략 전체 그림
- **[Vercel 설정](./deployment/vercel-setup.md)** - Vercel 프로젝트 생성
- **[환경 변수 관리](./deployment/environment-variables.md)** - 민감 정보 관리
- **[첫 배포 가이드](./deployment/first-deployment.md)** - 단계별 배포
- **[지속적 배포](./deployment/continuous-deployment.md)** - CI/CD 파이프라인
- **[롤백 전략](./deployment/rollback.md)** - 문제 발생 시 대응

### 🔧 운영

프로덕션 환경의 모니터링과 유지보수를 합니다.

- **[Admin 운영](./operations/01-관리자-운영.md)** - 제품 추가/수정
- **[데이터베이스 유지보수](./operations/02-데이터베이스-유지보수.md)** - 백업/복구
- **[모니터링](./operations/03-모니터링.md)** - Vercel/Supabase 모니터링

### 🚀 확장 기능

프로젝트를 더 큰 규모나 다양한 요구사항에 맞춰 확장합니다.

- **[확장 기능 개요](./extensions/00-README.md)** - 확장 기능 전체 가이드
- **[멀티 테넌트 아키텍처](./extensions/01-멀티-테넌트.md)** - N개 업장 운영

## 🎯 상황별 가이드

### "지금 막 프로젝트를 받았어요"
1. [빠른 시작 가이드](./getting-started.md)
2. [Supabase 로컬 환경 설정](./supabase/local-setup.md)
3. [아키텍처 개요](./architecture/overview.md)

### "새로운 기능을 추가하고 싶어요"
1. [새 기능 추가하기](./development/adding-features.md)
2. [컴포넌트 패턴](./development/component-patterns.md)
3. [마이그레이션 가이드](./supabase/migrations.md)

### "처음으로 배포하려고 해요"
1. [배포 개요](./deployment/overview.md)
2. [Supabase Cloud 설정](./supabase/cloud-setup.md)
3. [Vercel 설정](./deployment/vercel-setup.md)
4. [첫 배포 가이드](./deployment/first-deployment.md)

### "운영 중인 사이트를 관리해요"
1. [Admin 운영](./operations/admin-operations.md)
2. [모니터링](./operations/monitoring.md)
3. [데이터베이스 유지보수](./operations/database-maintenance.md)

### "문제가 생겼어요!"
1. [트러블슈팅](./development/troubleshooting.md)
2. [롤백 전략](./deployment/rollback.md)

## 📝 문서 작성 원칙

이 문서들은 다음 원칙으로 작성되었습니다:

1. **실용성 우선**: 이론보다 "어떻게 하는지" 중심
2. **초보자 친화적**: 배경 지식 없어도 따라할 수 있게
3. **풍부한 예제**: 모든 설명에 실제 코드 포함
4. **시각적 자료**: 다이어그램과 스크린샷 활용
5. **한글 우선**: 모든 문서는 한글로 작성

## 🔗 외부 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Playwright 공식 문서](https://playwright.dev/docs/intro)

## 💡 도움이 필요하신가요?

- **버그 제보**: GitHub Issues
- **기능 제안**: GitHub Discussions
- **긴급 문제**: [트러블슈팅 문서](./development/troubleshooting.md) 먼저 확인

---

**문서 최종 업데이트**: 2025-01-25
