import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForPageLoad, expectCartCount } from './utils/test-helpers';

test.describe.skip('장바구니 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage 초기화
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('제품 목록에서 바로 장바구니에 추가할 수 있다', async ({ page }) => {
    // 제품 목록으로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    // Alert 핸들러 먼저 등록
    page.on('dialog', dialog => dialog.accept());

    // 첫 번째 제품의 "담기" 버튼 클릭
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProductCard.getByRole('button', { name: /담기/ });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Header의 장바구니 배지가 1로 업데이트되어야 함
    await expect(page.locator('header').getByText('1')).toBeVisible({ timeout: 5000 });
  });

  test('제품 상세 페이지에서 장바구니에 추가할 수 있다', async ({ page }) => {
    // 제품 목록으로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    // 첫 번째 제품의 이미지 클릭하여 상세 페이지로 이동
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const productLink = firstProductCard.locator('a').first(); // 이미지 링크
    await productLink.click();
    await waitForPageLoad(page);

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 장바구니에 담기 버튼 클릭
    const addToCartButton = page.getByRole('button', { name: /장바구니에 담기/ });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Header의 장바구니 배지가 1로 업데이트되어야 함
    await expect(page.locator('header').getByText('1')).toBeVisible({ timeout: 5000 });
  });

  test('제품 상세에서 수량을 조절할 수 있다', async ({ page }) => {
    // 제품 목록으로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    // 첫 번째 제품의 이미지 클릭하여 상세 페이지로 이동
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const productLink = firstProductCard.locator('a').first();
    await productLink.click();
    await waitForPageLoad(page);

    // 수량 증가 버튼 찾기 (AddToCartButton의 + 버튼)
    const increaseButton = page.getByRole('button', { name: '+' });
    await expect(increaseButton).toBeVisible();

    // 수량 증가
    await increaseButton.click();

    // 수량 input에 2가 표시되는지 확인
    const quantityInput = page.locator('input[type="number"]');
    await expect(quantityInput).toHaveValue('2');

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 장바구니에 담기
    const addToCartButton = page.getByRole('button', { name: /장바구니에 담기/ });
    await addToCartButton.click();

    // Header 배지가 2여야 함 (수량 2개)
    await expect(page.locator('header').getByText('2')).toBeVisible({ timeout: 5000 });
  });

  test('장바구니 페이지에서 제품 목록을 확인할 수 있다', async ({ page }) => {
    // 제품 목록에서 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 첫 번째 제품의 "담기" 버튼 클릭
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProductCard.getByRole('button', { name: /담기/ });
    await addButton.click();

    // 장바구니 페이지로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 제품명이 표시되어야 함
    await expect(page.getByText(/프로페셔널|임팩트|그라인더|드릴|측정기|렌치|캘리퍼스|용접기|안전화/)).toBeVisible();

    // 가격이 표시되어야 함
    await expect(page.getByText(/원/)).toBeVisible();
  });

  test('장바구니에서 수량을 조절할 수 있다', async ({ page }) => {
    // 제품 목록에서 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 첫 번째 제품의 "담기" 버튼 클릭
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProductCard.getByRole('button', { name: /담기/ });
    await addButton.click();

    // 장바구니로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 수량 증가 버튼 클릭
    const increaseButton = page.getByRole('button', { name: '+' }).first();
    await expect(increaseButton).toBeVisible();
    await increaseButton.click();

    // 상태 업데이트 대기
    await page.waitForTimeout(500);

    // Header 배지가 2로 증가해야 함
    await expect(page.locator('header').getByText('2')).toBeVisible({ timeout: 5000 });
  });

  test('장바구니에서 제품을 삭제할 수 있다', async ({ page }) => {
    // 제품 목록에서 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 첫 번째 제품의 "담기" 버튼 클릭
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProductCard.getByRole('button', { name: /담기/ });
    await addButton.click();

    // 장바구니로 이동
    await page.goto('/cart');
    await waitForPageLoad(page);

    // 삭제 버튼 클릭 (✕ 또는 "삭제")
    const deleteButton = page.getByRole('button', { name: /삭제|✕/ }).first();
    await expect(deleteButton).toBeVisible();
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
    // 제품 목록에서 장바구니에 추가
    await page.goto('/products');
    await waitForPageLoad(page);

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 첫 번째 제품의 "담기" 버튼 클릭
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProductCard.getByRole('button', { name: /담기/ });
    await addButton.click();

    // 상태 업데이트 대기
    await page.waitForTimeout(500);

    // localStorage 확인
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('sojangnim-cart');
    });

    expect(cartData).toBeTruthy();

    // JSON 파싱 가능한지 확인
    const parsedData = JSON.parse(cartData!);
    expect(parsedData).toBeTruthy();
    expect(parsedData.state.items.length).toBeGreaterThan(0);
  });
});

test.describe.skip('장바구니 가격 계산 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('수량에 따라 가격이 정확히 계산된다', async ({ page }) => {
    // 제품 목록으로 이동
    await page.goto('/products');
    await waitForPageLoad(page);

    // 첫 번째 제품의 이미지 클릭하여 상세 페이지로 이동
    const firstProductCard = page.locator('[data-testid="product-card"]').first();
    const productLink = firstProductCard.locator('a').first();
    await productLink.click();
    await waitForPageLoad(page);

    // 제품 상세 페이지에서 가격 저장
    const priceText = await page.locator('text=/\\d+,\\d+원/').first().textContent();
    const price = parseInt(priceText!.replace(/[^0-9]/g, ''));

    // 수량 2개로 설정 (+버튼 클릭)
    const increaseButton = page.getByRole('button', { name: '+' });
    await expect(increaseButton).toBeVisible();
    await increaseButton.click();

    // Alert 핸들러 등록
    page.on('dialog', dialog => dialog.accept());

    // 장바구니에 담기
    const addToCartButton = page.getByRole('button', { name: /장바구니에 담기/ });
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
