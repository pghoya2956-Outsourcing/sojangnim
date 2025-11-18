import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './utils/test-helpers';

test.describe.skip('제품 목록 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await waitForPageLoad(page);
  });

  test('제품 목록 페이지가 로딩된다', async ({ page }) => {
    await expect(page).toHaveURL(/\/products/);
  });

  test('카테고리 사이드바가 표시된다', async ({ page }) => {
    // 5개 카테고리가 표시되어야 함
    const categories = ['전체 제품', '안전용품', '에어공구', '용접장비', '전동공구', '측정기'];

    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible();
    }
  });

  test('전체 제품 목록이 표시된다', async ({ page }) => {
    // 최소 8개의 제품이 표시되어야 함 (시드 데이터 기준)
    const productCards = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('제품 카드에 필수 정보가 표시된다', async ({ page }) => {
    // 첫 번째 제품 카드 확인
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();

    // 제품명이 있어야 함
    await expect(firstProduct).toBeVisible();

    // 가격이 표시되어야 함 (원 단위)
    await expect(firstProduct.getByText(/원/)).toBeVisible();
  });

  test('제품 수 카운트가 표시된다', async ({ page }) => {
    // "제품" 또는 "개" 텍스트로 카운트 확인
    const productCount = page.getByText(/\d+개|총 \d+ 제품/);
    await expect(productCount).toBeVisible();
  });
});

test.describe.skip('카테고리 필터링 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await waitForPageLoad(page);
  });

  test('카테고리 클릭 시 URL이 변경된다', async ({ page }) => {
    // "전동공구" 카테고리 클릭
    await page.click('a:has-text("전동공구")');
    await waitForPageLoad(page);

    // URL에 category 파라미터가 추가되어야 함
    expect(page.url()).toContain('category=power-tools');
  });

  test('카테고리 필터링 시 해당 제품만 표시된다', async ({ page }) => {
    // "전동공구" 카테고리 클릭
    await page.click('a:has-text("전동공구")');
    await waitForPageLoad(page);

    // 제품이 필터링되어 표시되어야 함
    const productCards = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await productCards.count();

    // 전동공구는 3개 (시드 데이터 기준)
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(8); // 전체보다는 적어야 함
  });

  test('"전체 제품" 버튼이 동작한다', async ({ page }) => {
    // 먼저 특정 카테고리로 필터링
    await page.click('a:has-text("전동공구")');
    await waitForPageLoad(page);

    // "전체 제품" 클릭
    await page.click('a:has-text("전체 제품")');
    await waitForPageLoad(page);

    // URL에서 category 파라미터가 제거되어야 함
    expect(page.url()).not.toContain('category=');

    // 전체 제품이 다시 표시되어야 함
    const productCards = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });
});

test.describe.skip('제품 상세 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await waitForPageLoad(page);
  });

  test('제품 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    // 첫 번째 제품 클릭
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // URL이 /products/[id] 형태로 변경되어야 함
    expect(page.url()).toMatch(/\/products\/[a-z0-9-]+/);
  });

  test('제품 상세 정보가 표시된다', async ({ page }) => {
    // 첫 번째 제품 클릭
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // 제품명이 표시되어야 함
    const productTitle = page.locator('h1, h2').first();
    await expect(productTitle).toBeVisible();

    // 가격이 표시되어야 함
    await expect(page.getByText(/원/)).toBeVisible();

    // 설명이 표시되어야 함
    const description = page.locator('p, .description');
    await expect(description.first()).toBeVisible();
  });

  test('Breadcrumb 네비게이션이 표시된다', async ({ page }) => {
    // 첫 번째 제품 클릭
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // Breadcrumb에 "홈" 또는 "/" 링크가 있어야 함
    const breadcrumb = page.locator('nav, .breadcrumb');
    await expect(breadcrumb).toBeVisible();
  });

  test('장바구니 담기 버튼이 표시된다', async ({ page }) => {
    // 첫 번째 제품 클릭
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // 장바구니 버튼 확인
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await expect(addToCartButton).toBeVisible();
  });
});
