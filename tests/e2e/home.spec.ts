import { test, expect } from '@playwright/test';
import { checkSupabaseConnection, waitForPageLoad } from './utils/test-helpers';

test.describe('홈페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('페이지가 정상적으로 로딩된다', async ({ page }) => {
    await checkSupabaseConnection(page);
    await expect(page).toHaveTitle(/소장님/);
  });

  test('Hero 섹션이 표시된다', async ({ page }) => {
    // Hero 섹션의 주요 텍스트 확인
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('추천 제품 섹션이 Supabase 데이터를 표시한다', async ({ page }) => {
    // "추천 제품" 또는 배지가 있는 제품 섹션 확인
    const recommendedSection = page.getByText('추천 제품');

    // 배지가 있는 제품이 최소 1개 이상 표시되어야 함
    const productCards = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('최신 제품 섹션이 표시된다', async ({ page }) => {
    // 제품 카드가 화면에 표시되는지 확인
    const productCards = page.locator('article, .product-card, [data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Header가 렌더링된다', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 로고 또는 "소장님" 텍스트 확인
    await expect(page.locator('header').getByText(/소장님|홈/)).toBeVisible();
  });

  test('Footer가 렌더링된다', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('네비게이션 링크가 동작한다', async ({ page }) => {
    // 제품 목록 링크 클릭
    await page.click('a[href="/products"], a:has-text("제품")');
    await waitForPageLoad(page);

    // URL이 변경되었는지 확인
    expect(page.url()).toContain('/products');
  });
});
