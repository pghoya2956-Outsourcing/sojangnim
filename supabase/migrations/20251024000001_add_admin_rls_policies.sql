-- Admin 사용자를 위한 RLS 정책 추가

-- 인증된 사용자가 admin_users 테이블에 있으면 제품 추가 가능
CREATE POLICY "Admin은 제품 추가 가능"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );

-- 인증된 사용자가 admin_users 테이블에 있으면 제품 수정 가능
CREATE POLICY "Admin은 제품 수정 가능"
    ON products FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );

-- 인증된 사용자가 admin_users 테이블에 있으면 제품 삭제 가능
CREATE POLICY "Admin은 제품 삭제 가능"
    ON products FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );

-- 카테고리에 대한 Admin 권한 추가
CREATE POLICY "Admin은 카테고리 추가 가능"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );

CREATE POLICY "Admin은 카테고리 수정 가능"
    ON categories FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );

CREATE POLICY "Admin은 카테고리 삭제 가능"
    ON categories FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = (SELECT auth.jwt()->>'email')
        )
    );
