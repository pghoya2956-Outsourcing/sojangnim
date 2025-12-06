-- ============================================
-- 문의하기 기능 테이블
-- ============================================

-- inquiries 테이블 생성
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- 고객 정보
    customer_name TEXT NOT NULL,           -- 이름/회사명
    customer_contact TEXT NOT NULL,        -- 연락처 (전화 또는 이메일)
    message TEXT,                          -- 문의 내용

    -- 장바구니 스냅샷
    items JSONB NOT NULL,                  -- 문의 시점의 장바구니 품목
    total_amount INTEGER NOT NULL,         -- 총 금액

    -- 상태 관리
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
    admin_note TEXT,                       -- 관리자 메모 (내부용)

    -- 추적
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_inquiries_tenant ON inquiries(tenant_id);
CREATE INDEX idx_inquiries_status ON inquiries(tenant_id, status);
CREATE INDEX idx_inquiries_created ON inquiries(tenant_id, created_at DESC);

-- RLS 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 INSERT 가능 (고객 문의)
CREATE POLICY "inquiries_insert_policy" ON inquiries
    FOR INSERT WITH CHECK (true);

-- RLS 정책: 인증된 사용자만 SELECT/UPDATE 가능 (관리자)
CREATE POLICY "inquiries_select_policy" ON inquiries
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "inquiries_update_policy" ON inquiries
    FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 코멘트
COMMENT ON TABLE inquiries IS '고객 문의 테이블';
COMMENT ON COLUMN inquiries.customer_name IS '고객 이름 또는 회사명';
COMMENT ON COLUMN inquiries.customer_contact IS '연락처 (전화번호 또는 이메일)';
COMMENT ON COLUMN inquiries.items IS '문의 시점의 장바구니 품목 스냅샷 (JSON)';
COMMENT ON COLUMN inquiries.status IS '처리 상태: pending(대기), contacted(연락완료), completed(처리완료), cancelled(취소)';
