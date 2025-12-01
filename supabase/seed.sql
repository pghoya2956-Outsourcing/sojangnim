-- ============================================
-- 멀티테넌트 시드 데이터
-- ============================================

-- 테넌트 변수 (CTE로 관리)
-- 마이그레이션에서 생성된 'default' 테넌트 사용

-- ============================================
-- Auth 사용자는 Supabase Studio에서 수동 생성
-- http://localhost:54323 → Authentication → Users → Add User
-- admin@example.com / admin1234
-- demo@example.com / demo1234
-- ============================================

-- Admin 사용자 데이터
INSERT INTO admin_users (email, tenant_id)
SELECT 'admin@example.com', id FROM tenants WHERE slug = 'default'
ON CONFLICT (email) DO NOTHING;

-- 카테고리 데이터 (default 테넌트)
INSERT INTO categories (name, slug, tenant_id)
SELECT name, slug, (SELECT id FROM tenants WHERE slug = 'default')
FROM (VALUES
    ('전동공구', 'power-tools'),
    ('에어공구', 'air-tools'),
    ('측정기', 'measuring-tools'),
    ('용접장비', 'welding'),
    ('안전용품', 'safety'),
    ('수공구', 'hand-tools'),
    ('절삭공구', 'cutting-tools')
) AS t(name, slug)
ON CONFLICT DO NOTHING;

-- 제품 데이터 (default 테넌트)
INSERT INTO products (name, description, price, image_url, category_id, badge, specs, tenant_id)
SELECT
    p.name,
    p.description,
    p.price,
    p.image_url,
    (SELECT c.id FROM categories c WHERE c.slug = p.category_slug AND c.tenant_id = (SELECT id FROM tenants WHERE slug = 'default')),
    p.badge::product_badge,
    p.specs::jsonb,
    (SELECT id FROM tenants WHERE slug = 'default')
FROM (VALUES
    -- 전동공구
    (
        '프로페셔널 임팩트 드라이버',
        '강력한 20V 브러시리스 모터 탑재로 최대 180Nm의 토크를 제공합니다.',
        298000,
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
        'power-tools',
        '신제품',
        '{"전압": "20V", "토크": "180Nm", "배터리": "5.0Ah", "무게": "1.2kg"}'
    ),
    (
        '산업용 앵글 그라인더',
        '2200W 고출력 모터와 안전 장치가 완비된 프로페셔널 앵글 그라인더.',
        185000,
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
        'power-tools',
        '베스트',
        '{"소비전력": "2200W", "디스크": "125mm", "회전수": "11,000rpm", "무게": "2.3kg"}'
    ),
    (
        '무선 전동 드릴',
        '18V 리튬이온 배터리 탑재. 13mm 척 사이즈로 다양한 작업에 활용 가능.',
        125000,
        'https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=800&q=80',
        'power-tools',
        NULL,
        '{"전압": "18V", "척크기": "13mm", "배터리": "2.0Ah", "무게": "1.5kg"}'
    ),
    (
        '충전식 원형톱',
        '36V 고출력 충전식 원형톱. 165mm 블레이드로 깊은 절단 가능.',
        389000,
        'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=80',
        'power-tools',
        '프리미엄',
        '{"전압": "36V", "블레이드": "165mm", "절단깊이": "57mm", "무게": "3.1kg"}'
    ),
    -- 에어공구
    (
        '에어 임팩트 렌치 세트',
        '최대 1600Nm의 강력한 토크를 제공하는 에어 임팩트 렌치.',
        355000,
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
        'air-tools',
        '할인',
        '{"공기압": "6.2bar", "최대토크": "1600Nm", "드라이브": "1/2\"", "무게": "2.8kg"}'
    ),
    (
        '에어 다이 그라인더',
        '정밀 작업에 최적화된 에어 다이 그라인더.',
        78000,
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
        'air-tools',
        NULL,
        '{"공기압": "6.3bar", "회전수": "25,000rpm", "콜렛": "6mm", "무게": "0.45kg"}'
    ),
    -- 측정기
    (
        '레이저 거리 측정기',
        '최대 100m 측정 거리, ±1.5mm 정밀도를 자랑하는 프로페셔널 레이저 측정기.',
        165000,
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
        'measuring-tools',
        '프리미엄',
        '{"측정범위": "0.05-100m", "정밀도": "±1.5mm", "방수등급": "IP54"}'
    ),
    (
        '디지털 버니어 캘리퍼스',
        '0.01mm 정밀도의 디지털 캘리퍼스.',
        45000,
        'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80',
        'measuring-tools',
        NULL,
        '{"측정범위": "0-150mm", "정밀도": "0.01mm", "디스플레이": "LCD"}'
    ),
    -- 용접장비
    (
        '인버터 용접기',
        '경량 인버터 방식으로 이동이 편리한 전문가용 용접기.',
        520000,
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
        'welding',
        '신제품',
        '{"출력": "200A", "입력전압": "220V", "무게": "5.2kg"}'
    ),
    (
        '용접 마스크 자동 차광',
        '자동 차광 기능의 프리미엄 용접 마스크.',
        125000,
        'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80',
        'welding',
        '베스트',
        '{"차광도": "DIN 4/5-9/9-13", "시야각": "100×93mm"}'
    ),
    -- 안전용품
    (
        '안전화 (고급형)',
        '강철 토캡과 Kevlar 중창으로 최상의 안전성 제공.',
        89000,
        'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
        'safety',
        '베스트',
        '{"사이즈": "250-280mm", "소재": "가죽+메쉬", "인증": "KCS"}'
    ),
    (
        '작업용 안전 고글',
        '김서림 방지 코팅과 UV 차단 기능.',
        25000,
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
        'safety',
        NULL,
        '{"렌즈": "폴리카보네이트", "UV차단": "99.9%"}'
    ),
    -- 수공구
    (
        '프로 드라이버 세트 32종',
        '다양한 규격의 드라이버가 포함된 전문가용 세트.',
        68000,
        'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&q=80',
        'hand-tools',
        '베스트',
        '{"구성": "32종", "재질": "크롬바나듐"}'
    ),
    (
        '래칫 렌치 세트',
        '72기어 래칫 메커니즘으로 좁은 공간에서도 원활한 작업.',
        125000,
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
        'hand-tools',
        '프리미엄',
        '{"구성": "12종 (8-19mm)", "기어": "72T"}'
    ),
    -- 절삭공구
    (
        '초경 드릴비트 세트',
        '금속, 스테인리스 가공용 초경 드릴비트 25종 세트.',
        156000,
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
        'cutting-tools',
        '프리미엄',
        '{"구성": "25종 (1-13mm)", "재질": "초경합금"}'
    ),
    (
        '다이아몬드 절단석',
        '콘크리트, 벽돌, 석재 절단용 다이아몬드 블레이드.',
        35000,
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'cutting-tools',
        '베스트',
        '{"직경": "125mm", "용도": "콘크리트/석재"}'
    )
) AS p(name, description, price, image_url, category_slug, badge, specs)
ON CONFLICT DO NOTHING;

-- ============================================
-- 데모 테넌트 샘플 데이터 (demo-tools)
-- ============================================

-- 데모 테넌트 관리자
INSERT INTO admin_users (email, tenant_id)
SELECT 'demo@example.com', id FROM tenants WHERE slug = 'demo-tools'
ON CONFLICT (email) DO NOTHING;

-- 데모 테넌트 카테고리
INSERT INTO categories (name, slug, tenant_id)
SELECT name, slug, (SELECT id FROM tenants WHERE slug = 'demo-tools')
FROM (VALUES
    ('전동공구', 'power-tools'),
    ('수공구', 'hand-tools')
) AS t(name, slug)
ON CONFLICT DO NOTHING;

-- 데모 테넌트 제품
INSERT INTO products (name, description, price, image_url, category_id, badge, specs, tenant_id)
SELECT
    p.name,
    p.description,
    p.price,
    p.image_url,
    (SELECT c.id FROM categories c WHERE c.slug = p.category_slug AND c.tenant_id = (SELECT id FROM tenants WHERE slug = 'demo-tools')),
    p.badge::product_badge,
    p.specs::jsonb,
    (SELECT id FROM tenants WHERE slug = 'demo-tools')
FROM (VALUES
    (
        '데모 전동 드릴',
        '데모용 전동 드릴입니다.',
        99000,
        'https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=800&q=80',
        'power-tools',
        '신제품',
        '{"전압": "18V", "무게": "1.5kg"}'
    ),
    (
        '데모 드라이버 세트',
        '데모용 드라이버 세트입니다.',
        35000,
        'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&q=80',
        'hand-tools',
        NULL,
        '{"구성": "10종"}'
    )
) AS p(name, description, price, image_url, category_slug, badge, specs)
ON CONFLICT DO NOTHING;
