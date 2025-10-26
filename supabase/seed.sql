-- Admin 사용자 데이터
INSERT INTO admin_users (email) VALUES
    ('admin@example.com')
ON CONFLICT (email) DO NOTHING;

-- 카테고리 데이터
INSERT INTO categories (name, slug) VALUES
    ('전동공구', 'power-tools'),
    ('에어공구', 'air-tools'),
    ('측정기', 'measuring-tools'),
    ('용접장비', 'welding'),
    ('안전용품', 'safety');

-- 제품 데이터
INSERT INTO products (name, description, price, image_url, category_id, badge, specs) VALUES
    (
        '프로페셔널 임팩트 드라이버',
        '강력한 20V 브러시리스 모터 탑재로 최대 180Nm의 토크를 제공합니다. 경량 설계와 인체공학적 그립으로 장시간 작업시에도 편안합니다.',
        298000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '신제품',
        '{"전압": "20V", "토크": "180Nm", "배터리": "5.0Ah", "무게": "1.2kg"}'::jsonb
    ),
    (
        '산업용 앵글 그라인더',
        '2200W 고출력 모터와 안전 장치가 완비된 프로페셔널 앵글 그라인더. 다양한 작업에 활용 가능한 125mm 디스크 호환.',
        185000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '베스트',
        '{"소비전력": "2200W", "디스크": "125mm", "회전수": "11,000rpm", "무게": "2.3kg"}'::jsonb
    ),
    (
        '레이저 거리 측정기',
        '최대 100m 측정 거리, ±1.5mm 정밀도를 자랑하는 프로페셔널 레이저 측정기. IP54 등급 방진방수 기능으로 현장에서 안심하고 사용 가능.',
        165000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        '프리미엄',
        '{"측정범위": "0.05-100m", "정밀도": "±1.5mm", "방수등급": "IP54", "배터리": "1500mAh"}'::jsonb
    ),
    (
        '에어 임팩트 렌치 세트',
        '최대 1600Nm의 강력한 토크를 제공하는 에어 임팩트 렌치. 트윈 해머 방식으로 내구성이 우수하며 소켓 세트 포함.',
        355000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'air-tools'),
        '할인',
        '{"공기압": "6.2bar", "최대토크": "1600Nm", "드라이브": "1/2\"", "무게": "2.8kg"}'::jsonb
    ),
    (
        '디지털 버니어 캘리퍼스',
        '0.01mm 정밀도의 디지털 캘리퍼스. 대형 LCD 디스플레이와 mm/inch 단위 변환 기능.',
        45000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        NULL,
        '{"측정범위": "0-150mm", "정밀도": "0.01mm", "디스플레이": "LCD", "배터리": "CR2032"}'::jsonb
    ),
    (
        '인버터 용접기',
        '경량 인버터 방식으로 이동이 편리한 전문가용 용접기. 안정적인 아크 성능과 낮은 전력 소비.',
        520000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'welding'),
        '신제품',
        '{"출력": "200A", "입력전압": "220V", "무게": "5.2kg", "방식": "인버터"}'::jsonb
    ),
    (
        '안전화 (고급형)',
        '강철 토캡과 Kevlar 중창으로 최상의 안전성 제공. 통기성이 우수하고 장시간 착용해도 편안합니다.',
        89000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'safety'),
        '베스트',
        '{"사이즈": "250-280mm", "소재": "가죽+메쉬", "중창": "Kevlar", "인증": "KCS"}'::jsonb
    ),
    (
        '무선 전동 드릴',
        '18V 리튬이온 배터리 탑재. 13mm 척 사이즈로 다양한 작업에 활용 가능.',
        125000,
        NULL,
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        NULL,
        '{"전압": "18V", "척크기": "13mm", "배터리": "2.0Ah", "무게": "1.5kg"}'::jsonb
    );
