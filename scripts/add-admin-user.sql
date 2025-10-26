-- admin_users 테이블에 admin@example.com 추가
INSERT INTO admin_users (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;

-- 확인
SELECT * FROM admin_users;
