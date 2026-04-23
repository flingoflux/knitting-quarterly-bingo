import { expect, test } from '@playwright/test';

const STORAGE_PREFIX = 'kq-bingo-';
const IMAGE_DB_NAME = 'kq-bingo-images';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ storagePrefix, imageDbName }) => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(storagePrefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
    indexedDB.deleteDatabase(imageDbName);
  }, { storagePrefix: STORAGE_PREFIX, imageDbName: IMAGE_DB_NAME });
});

function currentQuarterId(now = new Date()): string {
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

function previousQuarterId(quarterId: string): string {
  const match = quarterId.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    throw new Error(`Invalid quarter id: ${quarterId}`);
  }

  const year = Number.parseInt(match[1], 10);
  const quarter = Number.parseInt(match[2], 10);

  if (quarter === 1) {
    return `${year - 1}-Q4`;
  }

  return `${year}-Q${quarter - 1}`;
}

test('Startseite zeigt Kernaktionen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('page-start-root')).toBeVisible();
  await expect(page.getByTestId('page-start-logo')).toBeVisible();
  await expect(page.getByTestId('action-start-play')).toBeVisible();
  await expect(page.getByTestId('action-start-plan')).toBeVisible();
  await expect(page.getByTestId('action-start-open-archive')).toBeVisible();
});

test('Spielen fuehrt in die aktuelle Quartalsansicht', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('action-start-play').click();

  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();
});

test('Planen fuehrt in die Edit-Ansicht', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('action-start-plan').click();

  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();
});

test('Vergangenes Quartal leitet ins Archiv um', async ({ page }) => {
  const current = currentQuarterId();
  const pastQuarter = previousQuarterId(current);

  await page.goto(`/quarterly?quarter=${pastQuarter}`);

  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByTestId('page-archive-title')).toBeVisible();
});

test('Quarter-Navigation wechselt zwischen Play und Plan', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('action-start-play').click();
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();

  await page.getByTestId('action-toolbar-quarter-next').click();
  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();

  await page.getByTestId('action-toolbar-quarter-prev').click();
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();
});

test('Help und Home funktionieren ueber die Toolbar', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('action-start-play').click();
  await page.getByTestId('action-toolbar-help').click();
  await expect(page.getByTestId('page-howto-title')).toBeVisible();

  await page.getByTestId('action-toolbar-home').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('page-start-root')).toBeVisible();
});
