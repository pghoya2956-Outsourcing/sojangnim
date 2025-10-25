import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 관리자 전체 플로우 테스트 (로그인 → 이미지 업로드 → 제품 추가/수정)
 */

// 테스트용 이미지 생성 함수
function createTestImage(filename: string): string {
  const testDir = path.join(process.cwd(), 'tests/fixtures')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // 1x1 PNG 이미지 (빨간색)
  const base64Image =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
  const buffer = Buffer.from(base64Image, 'base64')

  const filepath = path.join(testDir, filename)
  fs.writeFileSync(filepath, buffer)

  return filepath
}

test.describe('관리자 전체 플로우 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('http://localhost:3000/admin/login')

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // 로그인 성공 대기
    await page.waitForURL('**/admin/products')
  })

  test('새 제품 추가 with 이미지 업로드', async ({ page }) => {
    console.log('✓ 관리자 로그인 성공')

    // 새 제품 추가 페이지로 이동
    await page.goto('http://localhost:3000/admin/products/new')
    await expect(page.locator('h1')).toContainText('새 제품 추가')
    console.log('✓ 새 제품 추가 페이지 접근')

    // 제품 정보 입력
    await page.fill('input[name="name"]', '테스트 전동 드릴 E2E')
    await page.fill('textarea[name="description"]', 'Playwright E2E 테스트로 생성된 제품입니다')
    await page.fill('input[name="price"]', '199000')

    // 카테고리 선택
    await page.selectOption('select[name="category_id"]', { index: 1 })

    // 뱃지 선택
    await page.selectOption('select[name="badge"]', '신제품')

    console.log('✓ 제품 정보 입력 완료')

    // 제품 사양 추가
    const addSpecButton = page.locator('button:has-text("+ 사양 추가")')
    await addSpecButton.click()

    const specKeys = page.locator('input[placeholder*="항목명"]')
    const specValues = page.locator('input[placeholder*="값"]')

    await specKeys.nth(0).fill('전압')
    await specValues.nth(0).fill('18V')

    await specKeys.nth(1).fill('무게')
    await specValues.nth(1).fill('1.8kg')

    console.log('✓ 제품 사양 입력 완료')

    // 이미지 업로드
    const testImagePath = createTestImage('test-drill.png')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testImagePath)

    // 업로드 완료 대기 (성공 메시지)
    await page.waitForSelector('text=이미지가 업로드되었습니다', { timeout: 10000 })
    console.log('✓ 이미지 업로드 성공')

    // 이미지 미리보기 확인
    const previewImage = page.locator('img[alt*="제품 이미지 미리보기"]')
    await expect(previewImage).toBeVisible()
    console.log('✓ 이미지 미리보기 표시됨')

    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/admin-new-product-with-image.png', fullPage: true })

    // 제출 버튼 클릭
    const submitButton = page.locator('button[type="submit"]:has-text("제품 추가")')
    await submitButton.click()

    // 제품 목록으로 리다이렉트 대기
    await page.waitForURL('**/admin/products', { timeout: 10000 })
    console.log('✓ 제품 추가 성공 - 제품 목록으로 리다이렉트됨')

    // 생성된 제품 확인
    await expect(page.locator('text=테스트 전동 드릴 E2E')).toBeVisible()
    console.log('✓ 제품 목록에서 새 제품 확인됨')
  })

  test('제품 수정 with 이미지 교체', async ({ page }) => {
    console.log('✓ 관리자 로그인 성공')

    // 제품 목록 페이지
    await page.goto('http://localhost:3000/admin/products')

    // 첫 번째 제품의 수정 버튼 클릭
    const firstEditButton = page.locator('a[href*="/admin/products/"][href*="/edit"]').first()
    await firstEditButton.click()

    // 수정 페이지 로드 확인
    await expect(page.locator('h1')).toContainText('제품 수정')
    console.log('✓ 제품 수정 페이지 접근')

    // 기존 제품명 저장
    const productName = await page.locator('input[name="name"]').inputValue()
    console.log(`✓ 수정할 제품: ${productName}`)

    // 제품명 수정
    await page.fill('input[name="name"]', `${productName} (수정됨)`)

    // 이미지 교체
    const testImagePath = createTestImage('test-updated.png')
    const fileInput = page.locator('input[type="file"]')

    // 기존 이미지 삭제 (있는 경우)
    const deleteButton = page.locator('button:has-text("✕")')
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      // 컨펌 다이얼로그 처리
      page.on('dialog', dialog => dialog.accept())
      await page.waitForTimeout(1000)
      console.log('✓ 기존 이미지 삭제됨')
    }

    // 새 이미지 업로드
    await fileInput.setInputFiles(testImagePath)
    await page.waitForSelector('text=이미지가 업로드되었습니다', { timeout: 10000 })
    console.log('✓ 새 이미지 업로드 성공')

    // 스크린샷 촬영
    await page.screenshot({ path: 'test-results/admin-edit-product-with-image.png', fullPage: true })

    // 수정 완료 버튼 클릭
    const submitButton = page.locator('button[type="submit"]:has-text("수정 완료")')
    await submitButton.click()

    // 제품 목록으로 리다이렉트 대기
    await page.waitForURL('**/admin/products', { timeout: 10000 })
    console.log('✓ 제품 수정 성공 - 제품 목록으로 리다이렉트됨')

    // 수정된 제품명 확인
    await expect(page.locator(`text=${productName} (수정됨)`)).toBeVisible()
    console.log('✓ 제품 목록에서 수정된 제품 확인됨')
  })

  test('이미지 삭제 기능', async ({ page }) => {
    console.log('✓ 관리자 로그인 성공')

    // 새 제품 추가 페이지
    await page.goto('http://localhost:3000/admin/products/new')

    // 이미지 업로드
    const testImagePath = createTestImage('test-to-delete.png')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testImagePath)
    await page.waitForSelector('text=이미지가 업로드되었습니다', { timeout: 10000 })
    console.log('✓ 이미지 업로드 성공')

    // 이미지 미리보기 확인
    const previewImage = page.locator('img[alt*="제품 이미지 미리보기"]')
    await expect(previewImage).toBeVisible()

    // 삭제 버튼 클릭
    page.on('dialog', dialog => dialog.accept())
    const deleteButton = page.locator('button:has-text("✕")')
    await deleteButton.click()

    // 이미지가 사라졌는지 확인
    await expect(previewImage).not.toBeVisible()
    console.log('✓ 이미지 삭제 성공')

    // 파일 선택 input이 다시 표시되는지 확인
    await expect(fileInput).toBeVisible()
  })

  test('이미지 파일 검증 - 크기 제한', async ({ page }) => {
    console.log('✓ 관리자 로그인 성공')

    await page.goto('http://localhost:3000/admin/products/new')

    // 6MB 더미 파일 생성 (5MB 초과)
    const testDir = path.join(process.cwd(), 'tests/fixtures')
    const largePath = path.join(testDir, 'large-image.png')

    // 6MB 버퍼 생성
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024)
    fs.writeFileSync(largePath, largeBuffer)

    // 파일 업로드 시도
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(largePath)

    // 에러 메시지 확인
    await expect(page.locator('text=파일 크기는 5MB 이하여야 합니다')).toBeVisible({ timeout: 5000 })
    console.log('✓ 파일 크기 제한 검증 작동')

    // 정리
    fs.unlinkSync(largePath)
  })
})

test.afterAll(() => {
  // 테스트 이미지 정리
  const testDir = path.join(process.cwd(), 'tests/fixtures')
  if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir)
    files.forEach(file => {
      fs.unlinkSync(path.join(testDir, file))
    })
    fs.rmdirSync(testDir)
  }
  console.log('✓ 테스트 파일 정리 완료')
})
