import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForPageLoad, expectCartCount } from './utils/test-helpers';

test.describe('장바구니 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage 초기화
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('제품 상세에서 장바구니에 추가할 수 있다', async ({ page }) => {
    // 제품 목록으로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    // 첫 번째 제품 클릭
    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // 장바구니에 담기 버튼 클릭
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // Alert 또는 성공 메시지 확인 (alert는 자동으로 수락됨)
    page.on('dialog', dialog => dialog.accept());

    // Header의 장바구니 배지가 1로 업데이트되어야 함
    await expect(page.locator('header').getByText('1')).toBeVisible({ timeout: 5000 });
  });

  test('수량을 조절할 수 있다', async ({ page }) => {
    // 제품 상세로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // 수량 증가 버튼 찾기
    const increaseButton = page.getByRole('button', { name: '+' });
    await expect(increaseButton).toBeVisible();

    // 수량 증가
    await increaseButton.click();

    // 수량이 2로 증가했는지 확인
    await expect(page.getByText('2')).toBeVisible();

    // 장바구니에 담기
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    page.on('dialog', dialog => dialog.accept());
    await addToCartButton.click();

    // Header 배지가 2여야 함
    await expect(page.locator('header').getByText('2')).toBeVisible({ timeout: 5000 });
  });

  test('장바구니 페이지에서 제품 목록을 확인할 수 있다', async ({ page }) => {
    // 먼저 제품을 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    page.on('dialog', dialog => dialog.accept());
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // 장바구니 페이지로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 제품이 표시되어야 함
    const cartItems = page.locator('article, .cart-item, [data-testid="cart-item"]');
    const count = await cartItems.count();
    expect(count).toBeGreaterThan(0);

    // 가격이 표시되어야 함
    await expect(page.getByText(/원/)).toBeVisible();
  });

  test('장바구니에서 수량을 조절할 수 있다', async ({ page }) => {
    // 제품을 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    page.on('dialog', dialog => dialog.accept());
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // 장바구니로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 수량 증가 버튼 클릭
    const increaseButton = page.getByRole('button', { name: '+' }).first();
    await increaseButton.click();

    // 가격이 업데이트되어야 함
    await page.waitForTimeout(500); // 상태 업데이트 대기

    // Header 배지가 증가해야 함
    await expect(page.locator('header').getByText('2')).toBeVisible({ timeout: 5000 });
  });

  test('장바구니에서 제품을 삭제할 수 있다', async ({ page }) => {
    // 제품을 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    page.on('dialog', dialog => dialog.accept());
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // 장바구니로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 삭제 버튼 클릭 (✕ 또는 "삭제")
    const deleteButton = page.getByRole('button', { name: /삭제|✕/ }).first();
    await deleteButton.click();

    // 빈 장바구니 메시지가 표시되어야 함
    await expect(page.getByText(/장바구니가 비어있습니다|비어있습니다/)).toBeVisible({ timeout: 5000 });
  });

  test('빈 장바구니 상태를 표시한다', async ({ page }) => {
    // 빈 장바구니로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 빈 장바구니 메시지 확인
    await expect(page.getByText(/장바구니가 비어있습니다|비어있습니다/)).toBeVisible();

    // "제품 둘러보기" 버튼 확인
    const shopButton = page.getByRole('link', { name: /제품 둘러보기|쇼핑 계속하기/ });
    await expect(shopButton).toBeVisible();
  });

  test('localStorage에 장바구니 데이터가 저장된다', async ({ page }) => {
    // 제품을 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    page.on('dialog', dialog => dialog.accept());
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // localStorage 확인
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('sojangnim-cart');
    });

    expect(cartData).toBeTruthy();

    // JSON 파싱 가능한지 확인
    const parsedData = JSON.parse(cartData!);
    expect(parsedData).toBeTruthy();
  });
});

test.describe('장바구니 가격 계산 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('수량에 따라 가격이 정확히 계산된다', async ({ page }) => {
    // 제품 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    const firstProduct = page.locator('article, .product-card, [data-testid="product-card"]').first();
    await firstProduct.click();
    await waitForPageLoad(page);

    // 제품 상세 페이지에서 가격 저장
    const priceText = await page.locator('text=/\\d+,\\d+원/').first().textContent();
    const price = parseInt(priceText!.replace(/[^0-9]/g, ''));

    // 수량 2개로 설정
    const increaseButton = page.getByRole('button', { name: '+' });
    await increaseButton.click();

    // 장바구니에 담기
    page.on('dialog', dialog => dialog.accept());
    const addToCartButton = page.getByRole('button', { name: /장바구니/ });
    await addToCartButton.click();

    // 장바구니 페이지로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 총 가격 확인 (price * 2)
    const expectedTotal = price * 2;
    const formattedTotal = expectedTotal.toLocaleString('ko-KR');

    // 소계에 올바른 가격이 표시되는지 확인
    await expect(page.getByText(new RegExp(formattedTotal))).toBeVisible();
  });
});
