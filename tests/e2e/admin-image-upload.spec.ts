import { test, expect } from '@playwright/test'

/**
 * 관리자 이미지 업로드 기능 테스트
 */

test.describe('Admin Image Upload', () => {
  test('새 제품 추가 시 이미지 업로드', async ({ page }) => {
    // 새 제품 추가 페이지로 이동
    await page.goto('http://localhost:3000/admin/products/new')

    // 페이지 로드 확인
    await expect(page.locator('h1')).toContainText('새 제품 추가')

    // ImageUpload 컴포넌트 확인
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()

    // 파일 입력 안내 텍스트 확인
    await expect(page.locator('text=JPG, PNG, WebP, GIF 형식 지원')).toBeVisible()

    // 제품 정보 입력
    await page.fill('input[name="name"]', '테스트 전동 드릴')
    await page.fill('textarea[name="description"]', '테스트용 제품입니다')
    await page.fill('input[name="price"]', '150000')

    // 테스트 이미지 파일 생성 (1x1 PNG)
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    // 파일 업로드 (실제로는 Supabase Storage로 업로드되지 않고, 파일 선택만 시뮬레이션)
    // Note: 실제 Supabase Storage 업로드는 환경 설정이 필요하므로 UI만 테스트
    await fileInput.setInputFiles({
      name: 'test-drill.png',
      mimeType: 'image/png',
      buffer: buffer,
    })

    console.log('✓ 파일 선택 완료')
  })

  test.skip('제품 수정 시 이미지 교체 (관리자 인증 필요)', async ({ page }) => {
    // Note: 이 테스트는 관리자 인증이 구현된 후 활성화해야 합니다.
    // 현재는 /admin 경로에 접근 시 로그인 페이지로 리다이렉트됩니다.

    // 제품 목록 페이지에서 제품 조회
    await page.goto('http://localhost:3000/products')

    // 첫 번째 제품 클릭
    const firstProduct = page.locator('a[href*="/products/"]').first()
    await firstProduct.click()

    // 제품 상세 페이지에서 product ID 추출
    const url = page.url()
    const productId = url.split('/products/')[1]

    // 관리자 수정 페이지로 직접 이동
    await page.goto(`http://localhost:3000/admin/products/${productId}/edit`)

    // 수정 페이지 로드 확인
    await expect(page.locator('h1')).toContainText('제품 수정')

    // ImageUpload 컴포넌트 확인
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()

    console.log('✓ 제품 수정 페이지에서 ImageUpload 컴포넌트 확인 완료')
  })

  test('이미지 업로드 컴포넌트 UI 요소 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products/new')

    // 파일 입력
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()
    await expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif')

    // 안내 문구
    await expect(page.locator('text=JPG, PNG, WebP, GIF 형식 지원')).toBeVisible()
    await expect(page.locator('text=최대 5MB')).toBeVisible()

    // Hidden input (image_url)
    const hiddenInput = page.locator('input[type="hidden"][name="image_url"]')
    await expect(hiddenInput).toBeAttached()

    console.log('✓ ImageUpload 컴포넌트 UI 요소 모두 확인됨')
  })

  test('제품 사양 입력 기능 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products/new')

    // 사양 추가 버튼 확인
    const addSpecButton = page.locator('button:has-text("+ 사양 추가")')
    await expect(addSpecButton).toBeVisible()

    // 사양 추가
    await addSpecButton.click()

    // 사양 입력 필드 2개 확인
    const specKeyInputs = page.locator('input[placeholder*="항목명"]')
    await expect(specKeyInputs).toHaveCount(2)

    // 첫 번째 사양 입력
    await specKeyInputs.nth(0).fill('전압')
    await page.locator('input[placeholder*="값"]').nth(0).fill('18V')

    // 두 번째 사양 입력
    await specKeyInputs.nth(1).fill('무게')
    await page.locator('input[placeholder*="값"]').nth(1).fill('1.5kg')

    console.log('✓ 제품 사양 입력 기능 확인 완료')
  })

  test('제품 추가 폼 전체 입력 및 제출 버튼 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products/new')

    // 모든 필수 정보 입력
    await page.fill('input[name="name"]', '테스트 임팩트 드라이버')
    await page.fill('textarea[name="description"]', '강력한 토크를 제공하는 프로페셔널 임팩트 드라이버')
    await page.fill('input[name="price"]', '298000')

    // 카테고리 선택
    await page.selectOption('select[name="category_id"]', { index: 1 })

    // 뱃지 선택
    await page.selectOption('select[name="badge"]', '신제품')

    // 제출 버튼 확인
    const submitButton = page.locator('button[type="submit"]:has-text("제품 추가")')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // 취소 버튼 확인
    const cancelButton = page.locator('button:has-text("취소")')
    await expect(cancelButton).toBeVisible()

    console.log('✓ 제품 추가 폼 모든 요소 확인 완료')
  })
})
