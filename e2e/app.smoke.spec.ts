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

test('should show core actions on the start page', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  // then
  await expect(page.getByTestId('page-start-root')).toBeVisible();
  await expect(page.getByTestId('page-start-logo')).toBeVisible();
  await expect(page.getByTestId('action-start-play')).toBeVisible();
  await expect(page.getByTestId('action-start-plan')).toBeVisible();
  await expect(page.getByTestId('action-start-open-howto')).toBeVisible();
});

test('should navigate to how-to from start page', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  await page.getByTestId('action-start-open-howto').click();

  // then
  await expect(page).toHaveURL('/how-it-works');
  await expect(page.getByTestId('page-howto-title')).toBeVisible();
});

test('should navigate to the current quarter view when starting play', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  await page.getByTestId('action-start-play').click();

  // then
  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();
});

test('should navigate to the planning view when starting planning', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  await page.getByTestId('action-start-plan').click();

  // then
  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();
});

test('should redirect to archive when opening a past quarter', async ({ page }) => {
  // given
  const current = currentQuarterId();
  const pastQuarter = previousQuarterId(current);

  // when
  await page.goto(`/quarterly?quarter=${pastQuarter}`);

  // then
  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByTestId('page-archive-title')).toBeVisible();
});

test('should switch between play and plan views when navigating quarters', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  await page.getByTestId('action-start-play').click();
  // then
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();

  await page.getByTestId('action-toolbar-quarter-next').click();
  await expect(page).toHaveURL(/\/quarterly\?quarter=\d{4}-Q[1-4]/);
  await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();

  await page.getByTestId('action-toolbar-quarter-prev').click();
  await expect(page.getByTestId('page-bingo-title')).toBeVisible();
});

test('should open help and return home when using toolbar actions', async ({ page }) => {
  // given
  // when
  await page.goto('/');

  await page.getByTestId('action-start-play').click();
  await page.getByTestId('action-toolbar-help').click();
  // then
  await expect(page.getByTestId('page-howto-title')).toBeVisible();

  await page.getByTestId('action-toolbar-home').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('page-start-root')).toBeVisible();
});

test('should allow switching to kompakt mode in play view', async ({ page }) => {
  // given
  await page.goto('/');
  await page.getByTestId('action-start-play').click();

  // when
  const compactButton = page.getByRole('button', { name: 'Kompaktansicht' });
  await compactButton.click();

  // then
  await expect(compactButton).toHaveClass(/active/);
});

test('should open print view popup with quarter and mode query params', async ({ page }) => {
  // given
  await page.goto('/');
  await page.getByTestId('action-start-play').click();

  // when
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Board drucken' }).click();
  const popup = await popupPromise;

  // then
  await popup.waitForURL(/\/quarterly-print\?quarter=\d{4}-Q[1-4]&mode=polaroid/);
  await expect(popup).toHaveURL(/\/quarterly-print\?quarter=\d{4}-Q[1-4]&mode=polaroid/);
  await popup.close();
});

test.describe('plan → bingo → print (desktop, polaroid)', () => {
  test('should reflect edited challenge names in bingo and print view', async ({ page }) => {
    const newNames = ['E2E-Karte-1', 'E2E-Karte-2', 'E2E-Karte-3'];

    // Navigate to planning view
    await page.goto('/');
    await page.getByTestId('action-start-plan').click();
    await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();

    // Edit the first 3 challenge cards
    const editButtons = page.getByRole('button', { name: 'Projekt bearbeiten' });
    for (let i = 0; i < 3; i++) {
      await editButtons.nth(i).click();
      const input = page.locator('.title-input');
      await input.clear();
      await input.fill(newNames[i]);
      await input.press('Enter');
    }

    // Start bingo (accept confirm dialog)
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Neues Bingo mit diesem Plan starten' }).click();
    await expect(page.getByTestId('page-bingo-title')).toBeVisible();

    // Verify edited card names appear in bingo view
    const cardTitles = page.locator('[data-testid="card-title"]');
    for (const name of newNames) {
      await expect(cardTitles.filter({ hasText: name }).first()).toBeVisible();
    }

    // Open print popup and verify card names are identical
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Board drucken' }).click();
    const popup = await popupPromise;
    await popup.waitForURL(/\/quarterly-print\?/);

    const printCardTitles = popup.locator('[data-testid="card-title"]');
    for (const name of newNames) {
      await expect(printCardTitles.filter({ hasText: name }).first()).toBeVisible();
    }

    await popup.close();
  });
});

test.describe('plan → bingo → print (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should reflect edited challenge names in bingo and print view', async ({ page }) => {
    const newNames = ['Mobile-Karte-1', 'Mobile-Karte-2', 'Mobile-Karte-3'];

    // Navigate to planning view
    await page.goto('/');
    await page.getByTestId('action-start-plan').click();
    await expect(page.getByTestId('page-quarterly-plan-title')).toBeVisible();

    // Open FAB and switch to edit mode
    await page.getByRole('button', { name: 'Aktionen anzeigen' }).click();
    await page.getByRole('button', { name: 'Bearbeiten' }).click();

    // Edit the first 3 challenge cards in the edit list
    const editToggles = page.getByRole('button', { name: 'Projekt umbenennen' });
    for (let i = 0; i < 3; i++) {
      await editToggles.nth(i).click();
      const input = page.locator('.edit-card__input');
      await input.clear();
      await input.fill(newNames[i]);
      await input.press('Enter');
    }

    // Exit edit mode via the X close button
    await page.getByRole('button', { name: 'Bearbeitungsmodus beenden' }).click();

    // Start bingo (accept confirm dialog)
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Aktionen anzeigen' }).click();
    await page.getByRole('button', { name: 'Bingo starten' }).click();
    await expect(page.getByTestId('page-bingo-title')).toBeVisible();

    // Verify edited card names appear in mobile bingo grid
    const cardTitles = page.locator('[data-testid="card-title"]');
    for (const name of newNames) {
      await expect(cardTitles.filter({ hasText: name }).first()).toBeVisible();
    }

    // Open print popup via FAB and verify card names are identical
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Aktionen anzeigen' }).click();
    await page.getByRole('button', { name: 'Drucken' }).click();
    const popup = await popupPromise;
    await popup.waitForURL(/\/quarterly-print\?/);

    const printCardTitles = popup.locator('[data-testid="card-title"]');
    for (const name of newNames) {
      await expect(printCardTitles.filter({ hasText: name }).first()).toBeVisible();
    }

    await popup.close();
  });
});
