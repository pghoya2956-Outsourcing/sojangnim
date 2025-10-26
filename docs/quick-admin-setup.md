---
title: "Admin 계정 빠른 설정 가이드"
tags: [admin, setup, authentication]
---

# 🔐 Admin 계정 빠른 설정 가이드

## 현재 상태

✅ `admin_users` 테이블에 `admin@example.com` 추가됨
❌ Supabase Auth에 사용자 생성 필요

## 🚀 비밀번호 설정 방법

### 1단계: Supabase Studio 접속

브라우저에서 다음 URL 열기:
```
http://127.0.0.1:54323
```

### 2단계: Authentication 페이지 이동

좌측 메뉴:
1. **Authentication** 클릭
2. **Users** 탭 클릭

### 3단계: 사용자 생성

**"Add user"** 버튼 클릭 후:

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Auto Confirm User**: ✅ **반드시 체크**

**"Create user"** 버튼 클릭

### 4단계: 로그인 테스트

```
http://localhost:3000/admin/login
```

**로그인 정보**:
- Email: `admin@example.com`
- Password: `admin123`

## ✅ 완료 확인

로그인 성공 → `/admin/products` 페이지로 리다이렉트

## 🔧 문제 해결

### "Invalid login credentials" 에러

**원인**: Auto Confirm User를 체크하지 않음

**해결**:
1. Supabase Studio → Authentication → Users
2. `admin@example.com` 찾기
3. 우측 **...** 메뉴 → **Confirm email**

### "Unauthorized" 에러

**원인**: `admin_users` 테이블에 이메일 없음

**해결**:
```bash
supabase db reset
```

## 📋 계정 정보 요약

| 항목 | 값 |
|------|-----|
| Email | `admin@example.com` |
| Password | `admin123` |
| 로그인 URL | `http://localhost:3000/admin/login` |
| Admin 대시보드 | `http://localhost:3000/admin/products` |

---

**다음 문서**: [Admin 운영 가이드](./operations/admin-operations.md)
