-- ============================================
-- 기존 데이터를 default 테넌트로 마이그레이션
-- ============================================

-- 1. 기본 테넌트 생성
INSERT INTO tenants (slug, name, theme, company_info, plan)
VALUES (
    'default',
    '기본 업장',
    '{
        "brandName": "TOOLBOX PRO",
        "logoImage": "/images/company-logo.png",
        "sealImage": "/images/company-seal.png",
        "colors": {
            "primary": "#1a1a1a",
            "accent": "#4a4a4a"
        }
    }'::jsonb,
    '{
        "businessNumber": "123-45-67890",
        "representative": "홍길동",
        "address": "서울특별시 강남구 테헤란로 123",
        "businessType": "도소매",
        "businessCategory": "공구",
        "phone": "",
        "fax": "",
        "email": ""
    }'::jsonb,
    'pro'
) ON CONFLICT (slug) DO NOTHING;

-- 2. 기존 데이터에 tenant_id 할당
UPDATE categories
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

UPDATE products
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

UPDATE admin_users
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

-- 3. NOT NULL 제약조건 추가 (기존 데이터 마이그레이션 후)
ALTER TABLE categories ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE admin_users ALTER COLUMN tenant_id SET NOT NULL;

-- 4. 샘플 테넌트 추가 (데모/테스트용)
INSERT INTO tenants (slug, name, theme, company_info, plan)
VALUES (
    'demo-tools',
    '데모 공구상',
    '{
        "brandName": "데모 공구",
        "logoImage": "",
        "sealImage": "",
        "colors": {
            "primary": "#2563eb",
            "accent": "#1d4ed8"
        }
    }'::jsonb,
    '{
        "businessNumber": "987-65-43210",
        "representative": "김데모",
        "address": "서울특별시 성동구 성수동 456",
        "businessType": "도소매",
        "businessCategory": "공구/산업용품",
        "phone": "02-1234-5678",
        "fax": "",
        "email": "demo@example.com"
    }'::jsonb,
    'free'
) ON CONFLICT (slug) DO NOTHING;
