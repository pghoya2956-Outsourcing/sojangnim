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
    ('안전용품', 'safety'),
    ('수공구', 'hand-tools'),
    ('절삭공구', 'cutting-tools')
ON CONFLICT DO NOTHING;

-- 제품 데이터 (이미지 포함)
INSERT INTO products (name, description, price, image_url, category_id, badge, specs) VALUES
    -- 전동공구
    (
        '프로페셔널 임팩트 드라이버',
        '강력한 20V 브러시리스 모터 탑재로 최대 180Nm의 토크를 제공합니다. 경량 설계와 인체공학적 그립으로 장시간 작업시에도 편안합니다.',
        298000,
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '신제품',
        '{"전압": "20V", "토크": "180Nm", "배터리": "5.0Ah", "무게": "1.2kg"}'::jsonb
    ),
    (
        '산업용 앵글 그라인더',
        '2200W 고출력 모터와 안전 장치가 완비된 프로페셔널 앵글 그라인더. 다양한 작업에 활용 가능한 125mm 디스크 호환.',
        185000,
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '베스트',
        '{"소비전력": "2200W", "디스크": "125mm", "회전수": "11,000rpm", "무게": "2.3kg"}'::jsonb
    ),
    (
        '무선 전동 드릴',
        '18V 리튬이온 배터리 탑재. 13mm 척 사이즈로 다양한 작업에 활용 가능.',
        125000,
        'https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        NULL,
        '{"전압": "18V", "척크기": "13mm", "배터리": "2.0Ah", "무게": "1.5kg"}'::jsonb
    ),
    (
        '충전식 원형톱',
        '36V 고출력 충전식 원형톱. 165mm 블레이드로 깊은 절단 가능.',
        389000,
        'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'power-tools'),
        '프리미엄',
        '{"전압": "36V", "블레이드": "165mm", "절단깊이": "57mm", "무게": "3.1kg"}'::jsonb
    ),

    -- 에어공구
    (
        '에어 임팩트 렌치 세트',
        '최대 1600Nm의 강력한 토크를 제공하는 에어 임팩트 렌치. 트윈 해머 방식으로 내구성이 우수하며 소켓 세트 포함.',
        355000,
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'air-tools'),
        '할인',
        '{"공기압": "6.2bar", "최대토크": "1600Nm", "드라이브": "1/2\"", "무게": "2.8kg"}'::jsonb
    ),
    (
        '에어 다이 그라인더',
        '정밀 작업에 최적화된 에어 다이 그라인더. 소형 경량 설계로 좁은 공간 작업에 적합.',
        78000,
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'air-tools'),
        NULL,
        '{"공기압": "6.3bar", "회전수": "25,000rpm", "콜렛": "6mm", "무게": "0.45kg"}'::jsonb
    ),
    (
        '에어 브러시 세트',
        '도장 및 도색 작업용 에어 브러시 세트. 0.3mm, 0.5mm 노즐 포함.',
        145000,
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'air-tools'),
        '베스트',
        '{"공기압": "1.5-3.5bar", "노즐": "0.3mm/0.5mm", "컵용량": "7ml/22ml", "무게": "0.2kg"}'::jsonb
    ),

    -- 측정기
    (
        '레이저 거리 측정기',
        '최대 100m 측정 거리, ±1.5mm 정밀도를 자랑하는 프로페셔널 레이저 측정기. IP54 등급 방진방수 기능으로 현장에서 안심하고 사용 가능.',
        165000,
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        '프리미엄',
        '{"측정범위": "0.05-100m", "정밀도": "±1.5mm", "방수등급": "IP54", "배터리": "1500mAh"}'::jsonb
    ),
    (
        '디지털 버니어 캘리퍼스',
        '0.01mm 정밀도의 디지털 캘리퍼스. 대형 LCD 디스플레이와 mm/inch 단위 변환 기능.',
        45000,
        'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        NULL,
        '{"측정범위": "0-150mm", "정밀도": "0.01mm", "디스플레이": "LCD", "배터리": "CR2032"}'::jsonb
    ),
    (
        '레이저 수평기',
        '360도 셀프 레벨링 레이저 수평기. 실내외 겸용으로 밝은 조명에서도 선명한 라인.',
        235000,
        'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        '신제품',
        '{"레이저": "그린", "정밀도": "±1mm/5m", "자동수평": "±4°", "방수등급": "IP54"}'::jsonb
    ),
    (
        '디지털 줄자',
        'LCD 디스플레이가 탑재된 디지털 줄자. 자동 잠금 기능.',
        28000,
        'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'measuring-tools'),
        NULL,
        '{"측정범위": "0-5m", "디스플레이": "LCD", "잠금": "자동", "무게": "0.18kg"}'::jsonb
    ),

    -- 용접장비
    (
        '인버터 용접기',
        '경량 인버터 방식으로 이동이 편리한 전문가용 용접기. 안정적인 아크 성능과 낮은 전력 소비.',
        520000,
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'welding'),
        '신제품',
        '{"출력": "200A", "입력전압": "220V", "무게": "5.2kg", "방식": "인버터"}'::jsonb
    ),
    (
        'TIG 용접기',
        '스테인리스, 알루미늄 용접에 적합한 고급 TIG 용접기. 펄스 모드 지원.',
        890000,
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'welding'),
        '프리미엄',
        '{"출력": "250A", "입력전압": "220V/380V", "무게": "12kg", "방식": "TIG/MMA"}'::jsonb
    ),
    (
        '용접 마스크 자동 차광',
        '자동 차광 기능의 프리미엄 용접 마스크. 넓은 시야각과 편안한 착용감.',
        125000,
        'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'welding'),
        '베스트',
        '{"차광도": "DIN 4/5-9/9-13", "시야각": "100×93mm", "센서": "4개", "무게": "0.5kg"}'::jsonb
    ),

    -- 안전용품
    (
        '안전화 (고급형)',
        '강철 토캡과 Kevlar 중창으로 최상의 안전성 제공. 통기성이 우수하고 장시간 착용해도 편안합니다.',
        89000,
        'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'safety'),
        '베스트',
        '{"사이즈": "250-280mm", "소재": "가죽+메쉬", "중창": "Kevlar", "인증": "KCS"}'::jsonb
    ),
    (
        '작업용 안전 고글',
        '김서림 방지 코팅과 UV 차단 기능. 안경 위에 착용 가능한 오버글라스 타입.',
        25000,
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'safety'),
        NULL,
        '{"렌즈": "폴리카보네이트", "UV차단": "99.9%", "김서림방지": "O", "무게": "45g"}'::jsonb
    ),
    (
        '방진 마스크 세트',
        '분진 작업용 방진 마스크. 교체 필터 20매 포함.',
        48000,
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'safety'),
        '할인',
        '{"등급": "KF94", "필터": "교체형 20매", "밸브": "배기밸브 O", "인증": "KC"}'::jsonb
    ),
    (
        '귀마개 (산업용)',
        '33dB 차음 성능의 산업용 귀마개. 인체공학적 디자인으로 편안한 착용감.',
        15000,
        'https://images.unsplash.com/photo-1590935217281-8f102120d683?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'safety'),
        NULL,
        '{"차음": "33dB", "재질": "실리콘", "세척": "가능", "인증": "CE"}'::jsonb
    ),

    -- 수공구
    (
        '프로 드라이버 세트 32종',
        '다양한 규격의 일자, 십자, 육각, 별형 드라이버가 포함된 전문가용 세트.',
        68000,
        'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'hand-tools'),
        '베스트',
        '{"구성": "32종", "자루": "인체공학", "재질": "크롬바나듐", "케이스": "하드케이스"}'::jsonb
    ),
    (
        '래칫 렌치 세트',
        '72기어 래칫 메커니즘으로 좁은 공간에서도 원활한 작업. 8~19mm 12종.',
        125000,
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'hand-tools'),
        '프리미엄',
        '{"구성": "12종 (8-19mm)", "기어": "72T", "재질": "크롬바나듐", "마감": "크롬도금"}'::jsonb
    ),
    (
        '줄자 5m',
        '스틸 테이프, 자동 잠금, 충격 방지 케이스.',
        12000,
        'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'hand-tools'),
        NULL,
        '{"길이": "5m", "폭": "25mm", "잠금": "자동", "케이스": "고무"}'::jsonb
    ),

    -- 절삭공구
    (
        '초경 드릴비트 세트',
        '금속, 스테인리스 가공용 초경 드릴비트 25종 세트.',
        156000,
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'cutting-tools'),
        '프리미엄',
        '{"구성": "25종 (1-13mm)", "재질": "초경합금", "용도": "금속/스테인리스", "코팅": "TiN"}'::jsonb
    ),
    (
        '목공용 홀쏘 세트',
        '목재, 합판, 석고보드용 홀쏘 세트. 8가지 사이즈.',
        45000,
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'cutting-tools'),
        NULL,
        '{"구성": "8종 (25-65mm)", "재질": "고속도강", "용도": "목재/석고보드", "최대깊이": "25mm"}'::jsonb
    ),
    (
        '다이아몬드 절단석',
        '콘크리트, 벽돌, 석재 절단용 다이아몬드 블레이드.',
        35000,
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        (SELECT id FROM categories WHERE slug = 'cutting-tools'),
        '베스트',
        '{"직경": "125mm", "구멍": "22.23mm", "용도": "콘크리트/석재", "타입": "세그먼트"}'::jsonb
    );
