-- ============================================
-- 멀티테넌트 아키텍처 마이그레이션
-- ============================================

-- 1. 테넌트 테이블 생성
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,              -- URL 식별자: 'company-a'
    name TEXT NOT NULL,                      -- 표시 이름: '업장 A'
    domain TEXT,                              -- 커스텀 도메인 (선택)

    -- 브랜딩 설정
    theme JSONB DEFAULT '{
        "brandName": "",
        "logoImage": "",
        "sealImage": "",
        "colors": {
            "primary": "#1a1a1a",
            "accent": "#4a4a4a"
        }
    }'::jsonb,

    -- 회사 정보 (견적서용)
    company_info JSONB DEFAULT '{
        "businessNumber": "",
        "representative": "",
        "address": "",
        "businessType": "",
        "businessCategory": "",
        "phone": "",
        "fax": "",
        "email": ""
    }'::jsonb,

    -- 플랜 및 제한
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    limits JSONB DEFAULT '{
        "maxProducts": 50,
        "maxCategories": 10,
        "maxQuotationsPerMonth": 10
    }'::jsonb,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 테넌트 인덱스
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- 테넌트 RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 2. 기존 테이블에 tenant_id 추가

-- categories에 tenant_id 추가
ALTER TABLE categories ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_categories_tenant ON categories(tenant_id);

-- products에 tenant_id 추가
ALTER TABLE products ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_products_tenant ON products(tenant_id);

-- admin_users에 tenant_id 추가
ALTER TABLE admin_users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_admin_users_tenant ON admin_users(tenant_id);

-- 3. 복합 인덱스 (성능 최적화)
CREATE INDEX idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX idx_categories_tenant_slug ON categories(tenant_id, slug);

-- 4. 기존 RLS 정책 삭제 후 재생성

-- categories 정책
DROP POLICY IF EXISTS "누구나 카테고리 조회 가능" ON categories;
DROP POLICY IF EXISTS "관리자 카테고리 관리" ON categories;

-- products 정책
DROP POLICY IF EXISTS "누구나 제품 조회 가능" ON products;
DROP POLICY IF EXISTS "관리자 제품 관리" ON products;

-- admin_users 정책
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "관리자 조회" ON admin_users;

-- 5. 새 RLS 정책 (tenant 기반) - Service Role Key 사용 시 우회됨
-- 공개 조회는 서버에서 tenant_id 필터링하므로 여기서는 기본 허용

CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (true);

CREATE POLICY "categories_all_policy" ON categories
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_all_policy" ON products
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "admin_users_all_policy" ON admin_users
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "tenants_select_policy" ON tenants
    FOR SELECT USING (true);

CREATE POLICY "tenants_all_policy" ON tenants
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- 6. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 7. 사용량 추적 테이블 (선택사항)
CREATE TABLE tenant_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    month TEXT NOT NULL,                     -- '2025-01'
    quotation_count INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, month)
);

CREATE INDEX idx_tenant_usage_tenant_month ON tenant_usage(tenant_id, month);

ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_usage_all_policy" ON tenant_usage
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- 8. 코멘트 추가
COMMENT ON TABLE tenants IS '멀티테넌트: 각 업장/고객 정보';
COMMENT ON COLUMN tenants.slug IS 'URL 식별자 및 환경변수 TENANT_SLUG 값';
COMMENT ON COLUMN tenants.theme IS '브랜딩 설정 (로고, 색상 등)';
COMMENT ON COLUMN tenants.company_info IS '견적서에 표시될 회사 정보';
COMMENT ON COLUMN tenants.limits IS '플랜별 사용량 제한';
COMMENT ON TABLE tenant_usage IS '월별 사용량 추적';
