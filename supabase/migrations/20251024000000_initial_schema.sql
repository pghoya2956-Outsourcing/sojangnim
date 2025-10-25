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
