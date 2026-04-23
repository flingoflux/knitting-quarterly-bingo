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

  await expect(page.getByRole('img', { name: 'Logo von Knitting Quarterly Bingo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Spielen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Planen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Archiv anzeigen' })).toBeVisible();
});

test('Spielen fuehrt in die aktuelle Quartalsansicht', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Spielen' }).click();

  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByRole('heading', { name: 'Happy crafting' })).toBeVisible();
});

test('Planen fuehrt in die Edit-Ansicht', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Planen' }).click();

  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByRole('heading', { name: 'Challenges und Projekte planen' })).toBeVisible();
});

test('Vergangenes Quartal leitet ins Archiv um', async ({ page }) => {
  const current = currentQuarterId();
  const pastQuarter = previousQuarterId(current);

  await page.goto(`/quarterly?quarter=${pastQuarter}`);

  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByRole('heading', { name: 'Bisher erledigte Runden' })).toBeVisible();
});
