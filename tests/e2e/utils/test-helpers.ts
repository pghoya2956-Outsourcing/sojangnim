import { Page, expect } from '@playwright/test';

/**
 * 공통 테스트 헬퍼 함수
 */

/**
 * Supabase 로컬 DB가 정상 작동하는지 확인
 */
export async function checkSupabaseConnection(page: Page) {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  // 페이지가 정상 로딩되었는지 확인
  await expect(page.locator('body')).toBeVisible();
}

/**
 * 특정 제품이 화면에 표시되는지 확인
 */
export async function expectProductVisible(page: Page, productName: string) {
  await expect(page.getByText(productName)).toBeVisible();
}

/**
 * 장바구니 아이템 수 확인
 */
export async function expectCartCount(page: Page, count: number) {
  if (count === 0) {
    // 배지가 없어야 함
    await expect(page.locator('header').getByText(count.toString())).not.toBeVisible();
  } else {
    await expect(page.locator('header').getByText(count.toString())).toBeVisible();
  }
}

/**
 * 가격 포맷 확인 (예: "298,000원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * localStorage 초기화 (테스트 격리)
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * 페이지 로딩 완료 대기
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}
