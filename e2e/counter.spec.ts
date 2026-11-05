import { expect, test, type Page } from '@playwright/test';
import { resolveTarget } from './targets';

const target = resolveTarget();

const RED = 'rgb(255, 0, 0)';
const BLUE = 'rgb(0, 0, 255)';
const BLACK = 'rgb(0, 0, 0)';

const button = (page: Page, action: string) => page.locator(`[data-action="${action}"]`);
const click = async (page: Page, action: string, times = 1) => {
  for (let i = 0; i < times; i++) {
    await button(page, action).click();
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto(target.counterUrl);
});

test.describe('initial state and markup', () => {
  test('starts with title "Counter" and value 0', async ({ page }) => {
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await expect(page.locator('#d')).toHaveText('0');
  });

  test('has the five action buttons with their labels inside #counter', async ({ page }) => {
    const expected: Array<[string, string]> = [
      ['INCREMENT', '+'],
      ['DECREMENT', '-'],
      ['RESET', 'reset'],
      ['ADD_FOUR', '+4'],
      ['DOUBLE', 'x2'],
    ];
    await expect(page.locator('#counter [data-action]')).toHaveCount(5);
    for (const [action, label] of expected) {
      await expect(page.locator(`#counter button[data-action="${action}"]`)).toHaveText(label);
    }
    await expect(page.locator('#counter h1#ttl')).toHaveCount(1);
    await expect(page.locator('#counter p#d')).toHaveCount(1);
  });
});

test.describe('actions', () => {
  test('INCREMENT adds 1', async ({ page }) => {
    await click(page, 'INCREMENT');
    await expect(page.locator('#d')).toHaveText('1');
    await click(page, 'INCREMENT');
    await expect(page.locator('#d')).toHaveText('2');
  });

  test('DECREMENT subtracts 1 and has no lower bound', async ({ page }) => {
    await click(page, 'DECREMENT');
    await expect(page.locator('#d')).toHaveText('-1');
    await click(page, 'DECREMENT', 2);
    await expect(page.locator('#d')).toHaveText('-3');
  });

  test('RESET sets the value to 0', async ({ page }) => {
    await click(page, 'INCREMENT', 3);
    await expect(page.locator('#d')).toHaveText('3');
    await click(page, 'RESET');
    await expect(page.locator('#d')).toHaveText('0');
  });

  test('ADD_FOUR adds 4', async ({ page }) => {
    await click(page, 'ADD_FOUR');
    await expect(page.locator('#d')).toHaveText('4');
    await click(page, 'ADD_FOUR');
    await expect(page.locator('#d')).toHaveText('8');
  });

  test('DOUBLE multiplies by 2', async ({ page }) => {
    await click(page, 'INCREMENT', 3);
    await click(page, 'DOUBLE');
    await expect(page.locator('#d')).toHaveText('6');
    await click(page, 'DECREMENT', 8);
    await expect(page.locator('#d')).toHaveText('-2');
    await click(page, 'DOUBLE');
    await expect(page.locator('#d')).toHaveText('-4');
  });

  test('DOUBLE of 0 stays 0 and is still tallied', async ({ page }) => {
    await click(page, 'DOUBLE');
    await expect(page.locator('#d')).toHaveText('0');
    await expect(page.locator('#ttl')).toHaveText('Counter (1 clicks)');
  });

  test('value has no upper bound', async ({ page }) => {
    await click(page, 'ADD_FOUR');
    for (let i = 0; i < 10; i++) {
      await click(page, 'DOUBLE');
    }
    await expect(page.locator('#d')).toHaveText(String(4 * 2 ** 10));
  });

  test('actions compose in order', async ({ page }) => {
    await click(page, 'INCREMENT'); // 1
    await click(page, 'ADD_FOUR'); // 5
    await click(page, 'DOUBLE'); // 10
    await click(page, 'DECREMENT'); // 9
    await expect(page.locator('#d')).toHaveText('9');
  });
});

test.describe('click tally in the heading', () => {
  test('heading shows "Counter (N clicks)" after each recognized action', async ({ page }) => {
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await click(page, 'INCREMENT');
    await expect(page.locator('#ttl')).toHaveText('Counter (1 clicks)');
    await click(page, 'DECREMENT');
    await expect(page.locator('#ttl')).toHaveText('Counter (2 clicks)');
    await click(page, 'ADD_FOUR');
    await expect(page.locator('#ttl')).toHaveText('Counter (3 clicks)');
    await click(page, 'DOUBLE');
    await expect(page.locator('#ttl')).toHaveText('Counter (4 clicks)');
  });

  test('RESET is tallied and does not reset the tally', async ({ page }) => {
    await click(page, 'INCREMENT', 2);
    await click(page, 'RESET');
    await expect(page.locator('#d')).toHaveText('0');
    await expect(page.locator('#ttl')).toHaveText('Counter (3 clicks)');
    await click(page, 'INCREMENT');
    await expect(page.locator('#ttl')).toHaveText('Counter (4 clicks)');
  });

  test('RESET as first action shows "Counter (1 clicks)"', async ({ page }) => {
    await click(page, 'RESET');
    await expect(page.locator('#d')).toHaveText('0');
    await expect(page.locator('#ttl')).toHaveText('Counter (1 clicks)');
  });
});

test.describe('value color', () => {
  test('is black at 0 after returning from a non-zero value', async ({ page }) => {
    await click(page, 'INCREMENT');
    await click(page, 'DECREMENT');
    await expect(page.locator('#d')).toHaveText('0');
    await expect(page.locator('#d')).toHaveCSS('color', BLACK);
  });

  test('is blue at -1', async ({ page }) => {
    await click(page, 'DECREMENT');
    await expect(page.locator('#d')).toHaveText('-1');
    await expect(page.locator('#d')).toHaveCSS('color', BLUE);
  });

  test('is black at 10 and red at 11', async ({ page }) => {
    await click(page, 'ADD_FOUR', 2); // 8
    await click(page, 'INCREMENT', 2); // 10
    await expect(page.locator('#d')).toHaveText('10');
    await expect(page.locator('#d')).toHaveCSS('color', BLACK);
    await click(page, 'INCREMENT'); // 11
    await expect(page.locator('#d')).toHaveText('11');
    await expect(page.locator('#d')).toHaveCSS('color', RED);
  });

  test('returns to black on RESET from red and from blue', async ({ page }) => {
    await click(page, 'ADD_FOUR', 3);
    await expect(page.locator('#d')).toHaveCSS('color', RED);
    await click(page, 'RESET');
    await expect(page.locator('#d')).toHaveCSS('color', BLACK);
    await click(page, 'DECREMENT');
    await expect(page.locator('#d')).toHaveCSS('color', BLUE);
    await click(page, 'RESET');
    await expect(page.locator('#d')).toHaveCSS('color', BLACK);
  });

  test('turns blue when doubling a negative value and red when doubling past 10', async ({ page }) => {
    await click(page, 'DECREMENT');
    await click(page, 'DOUBLE');
    await expect(page.locator('#d')).toHaveText('-2');
    await expect(page.locator('#d')).toHaveCSS('color', BLUE);
    await click(page, 'RESET');
    await click(page, 'ADD_FOUR');
    await click(page, 'INCREMENT', 2); // 6
    await click(page, 'DOUBLE'); // 12
    await expect(page.locator('#d')).toHaveText('12');
    await expect(page.locator('#d')).toHaveCSS('color', RED);
  });
});

test.describe('ignored and unrecognized clicks', () => {
  test('clicking #ttl and #d changes nothing', async ({ page }) => {
    await page.locator('#ttl').click();
    await page.locator('#d').click();
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await expect(page.locator('#d')).toHaveText('0');

    await click(page, 'INCREMENT', 2);
    await page.locator('#ttl').click();
    await page.locator('#d').click();
    await expect(page.locator('#ttl')).toHaveText('Counter (2 clicks)');
    await expect(page.locator('#d')).toHaveText('2');
  });

  test('clicking #counter itself outside any button changes nothing', async ({ page }) => {
    await page.locator('#counter').click({ position: { x: 1, y: 1 } });
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await expect(page.locator('#d')).toHaveText('0');
  });

  test('unknown data-action warns and is not tallied', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await click(page, 'INCREMENT');
    await page.evaluate(() => {
      const bogus = document.createElement('button');
      bogus.id = 'bogus';
      bogus.dataset['action'] = 'BOGUS';
      bogus.textContent = 'bogus';
      document.getElementById('counter')!.appendChild(bogus);
    });
    await page.locator('#bogus').click();

    await expect.poll(() => warnings.length).toBe(1);
    expect(warnings[0]).toContain('dispatch: unrecognized action');
    await expect(page.locator('#d')).toHaveText('1');
    await expect(page.locator('#ttl')).toHaveText('Counter (1 clicks)');

    // the tally continues from where it was
    await click(page, 'INCREMENT');
    await expect(page.locator('#ttl')).toHaveText('Counter (2 clicks)');
    await expect(page.locator('#d')).toHaveText('2');
  });
});

test.describe('page lifecycle', () => {
  test('state resets on reload', async ({ page }) => {
    await click(page, 'ADD_FOUR', 3);
    await expect(page.locator('#d')).toHaveText('12');
    await expect(page.locator('#ttl')).toHaveText('Counter (3 clicks)');
    await page.reload();
    await expect(page.locator('#d')).toHaveText('0');
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await expect(page.locator('#d')).toHaveCSS('color', BLACK);
  });

  test('entry URL redirects to the counter page', async ({ page }) => {
    await page.goto(target.entryUrl);
    await page.waitForURL(target.redirectPattern);
    await expect(page.locator('#ttl')).toHaveText('Counter');
    await expect(page.locator('#d')).toHaveText('0');
  });
});
