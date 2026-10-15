import { test, expect, type Page } from '@playwright/test';

async function click(page: Page, ...names: string[]) {
  for (const name of names) await page.getByRole('button', { name, exact: true }).click();
}

test('计算、反向、性别、编辑和重置完整流程，无浏览器错误', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '老公', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '老婆', exact: true })).toBeEnabled();
  await click(page, '爸爸', '哥哥');
  await expect(page.getByRole('status')).toBeEmpty();
  await click(page, '计算');
  await expect(page.getByRole('status')).toHaveText('伯父');
  await click(page, '切换');
  await expect(page.getByRole('status')).toHaveText('侄子');
  await click(page, '女生');
  await expect(page.getByRole('status')).toHaveText('侄女');
  await expect(page.getByLabel('关系链')).toHaveText('爸爸的哥哥');
  await expect(page.getByRole('button', { name: '老婆', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '老公', exact: true })).toBeEnabled();
  await click(page, '切换');
  await expect(page.getByRole('status')).toHaveText('伯父');
  await page.screenshot({ path: 'artifacts/mobile-calculated.png', fullPage: true });
  await click(page, '回退');
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.getByLabel('关系链')).toHaveText('爸爸');
  await click(page, '计算', '女儿');
  await expect(page.getByRole('status')).toBeEmpty();
  await click(page, '切换', '重置');
  await expect(page.getByRole('button', { name: '女生', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('我称呼对方', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '回退', exact: true })).toBeDisabled();
  await page.screenshot({ path: 'artifacts/mobile-female.png', fullPage: true });
  await click(page, '计算');
  await expect(page.getByRole('status')).toHaveText('自己');
  expect(errors).toEqual([]);
});

test('长幼不明保留候选，无效关系有提示', async ({ page }) => {
  await page.goto('/');
  await click(page, '妈妈', '姐姐', '女儿', '计算');
  await expect(page.getByRole('status')).toHaveText('表姐 / 表妹');
  await click(page, '重置', '女生', '爸爸', '老公', '计算');
  await expect(page.getByRole('status')).toHaveText('暂未找到对应称呼，请检查关系');
});

test('每个亲属按键可输入，性别禁用独立于链末端', async ({ page }) => {
  await page.goto('/');
  for (const label of ['爸爸', '妈妈', '老婆', '哥哥', '弟弟', '姐姐', '妹妹', '儿子', '女儿']) {
    await click(page, '重置', label);
    await expect(page.getByLabel('关系链')).toHaveText(label);
  }
  await click(page, '重置', '妈妈');
  await expect(page.getByRole('button', { name: '老公', exact: true })).toBeDisabled();
  await click(page, '女生', '老公');
  await expect(page.getByLabel('关系链')).toHaveText('妈妈的老公');
});

test('键盘可以选择性别、输入并计算，禁用键不会聚焦', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '女生', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '爸爸', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '老公', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '哥哥', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '计算', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('爸爸');
});

for (const viewport of [
  { width: 320, height: 568 }, { width: 390, height: 844 },
  { width: 390, height: 480 }, { width: 1440, height: 900 },
]) {
  test(`${viewport.width}×${viewport.height} 无横向溢出，按键满足触控尺寸`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole('button').all()) {
      const bounds = await button.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(48);
      expect(bounds!.height).toBeGreaterThanOrEqual(48);
    }
    await page.getByRole('button', { name: '计算', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: '计算', exact: true })).toBeInViewport();
    if (viewport.height === 844 || viewport.width === 1440) {
      await page.screenshot({ path: `artifacts/${viewport.width === 1440 ? 'desktop' : 'mobile-male'}.png`, fullPage: true });
    }
    await click(page, ...Array<string>(30).fill('爸爸'), '计算');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await click(page, '回退', '重置');
    await expect(page.getByLabel('关系链')).toBeEmpty();
  });
}
