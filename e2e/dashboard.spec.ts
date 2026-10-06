import { expect, test, type Page } from "@playwright/test";

const titles = (page: Page) => page.getByTestId("content-card").locator("h3").allTextContents();

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("content-card").first()).toBeVisible();
});

test("renders a unified feed with news, movies and posts", async ({ page }) => {
  await expect(page.getByRole("link", { name: /Read More/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Play Now/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /View Post/ }).first()).toBeVisible();
});

test("debounced search filters content and shows an empty state", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => r.url().includes("/api/news") && requests.push(r.url()));
  requests.length = 0;

  await page.getByRole("searchbox").pressSequentially("rust", { delay: 40 });
  await expect(page.getByRole("heading", { name: /Results for “rust”/ })).toBeVisible();
  const cards = await titles(page);
  expect(cards.length).toBeGreaterThan(0);
  // Fast typing of 4 characters must collapse into a single search request.
  expect(requests.filter((u) => u.includes("q=")).length).toBe(1);

  await page.getByRole("searchbox").fill("zzzz-no-match");
  await expect(page.getByText("No results for “zzzz-no-match”")).toBeVisible();

  await page.getByRole("searchbox").fill("");
  await expect(page.getByRole("heading", { name: "Feed" })).toBeVisible();
});

test("drag-and-drop reorders cards", async ({ page }) => {
  const before = await titles(page);
  const handles = page.getByTestId("drag-handle");
  const from = (await handles.nth(0).boundingBox())!;
  const second = (await page.getByTestId("content-card").nth(1).boundingBox())!;

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, from.y + 40, { steps: 5 });
  await page.mouse.move(from.x + from.width / 2, second.y + second.height + 20, { steps: 15 });
  await page.mouse.up();

  await expect.poll(async () => (await titles(page))[0]).not.toBe(before[0]);
  const after = await titles(page);
  expect(after.indexOf(before[0])).toBeGreaterThan(0);
  expect([...after].sort()).toEqual([...before].sort()); // nothing lost or duplicated
});

test("keyboard-accessible reorder buttons move a card", async ({ page }) => {
  const before = await titles(page);
  await page.getByRole("button", { name: `Move ${before[0]} down` }).click();
  await expect.poll(async () => (await titles(page))[1]).toBe(before[0]);
});

test("favorites persist across reload and can be removed", async ({ page }) => {
  const first = (await titles(page))[0];
  await page.getByRole("button", { name: `Add ${first} to favorites` }).click();
  await page.getByRole("link", { name: /Favorites/ }).first().click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { level: 1, name: "Favorites" })).toBeVisible();
  await expect(page.getByRole("heading", { name: first })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { name: first })).toBeVisible();

  await page.getByRole("button", { name: `Remove ${first} from favorites` }).click();
  await expect(page.getByText("No favorites yet")).toBeVisible();
});

test("dark mode toggle persists across reload", async ({ page }) => {
  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).not.toHaveClass(/dark/);
  await page.reload();
  await expect(html).not.toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
});

test("mock profile and language preference persist across reload", async ({ page }) => {
  await page.getByRole("link", { name: "Settings" }).first().click();
  await page.getByLabel("Display name", { exact: true }).first().fill("Avery");
  await page.getByLabel("Email address").fill("avery@example.com");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("avery@example.com")).toBeVisible();
  await expect(page.getByText("Avery").first()).toBeVisible();
  await page.locator("#language").selectOption("es");
  await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
  await page.getByRole("link", { name: "Ajustes" }).click();
  await expect(page.getByText("avery@example.com")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("news Read More asks for a local sign-in before continuing", async ({ page }) => {
  await page.getByRole("link", { name: /Read More/ }).first().click();
  const dialog = page.getByRole("dialog");
await expect(dialog.getByRole("heading", { name: "Sign in to continue" })).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Display name").fill("Avery");
  await dialog.getByLabel("Email address").fill("avery@example.com");
  await dialog.getByRole("button", { name: "Sign in" }).click();
  await expect(dialog.getByRole("heading", { name: "Profile ready" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Continue to article" })).toHaveAttribute("href", /example\.com/);
  await expect(dialog.getByText(/does not create a server account/i)).toBeVisible();
});

test("mobile cards fit the viewport without visible reorder arrows", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const card = page.getByTestId("content-card").first();
  await expect(card).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  const ctaFontSize = await card.getByRole("link", { name: /Read More/ }).evaluate((el) => getComputedStyle(el).fontSize);
  expect(Number.parseFloat(ctaFontSize)).toBeLessThanOrEqual(13);
  const reorder = card.getByRole("button", { name: /Move .* up/ });
  await expect(reorder).toHaveCSS("position", "absolute"); // screen-reader/keyboard fallback, visually clipped until focused
});

test("category preferences change the feed and persist", async ({ page }) => {
  await page.getByRole("link", { name: "Settings" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  const group = page.getByRole("group", { name: "Categories" });
  for (const c of ["technology", "science", "entertainment"]) {
    await group.getByRole("button", { name: new RegExp(c) }).click();
  }
  await page.getByRole("link", { name: "Feed" }).first().click();
  await expect(page.getByText("Pick at least one category")).toBeVisible();

  await page.getByRole("link", { name: "Open settings" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  await page.getByRole("group", { name: "Categories" }).getByRole("button", { name: /sports/ }).click();
  await page.getByRole("link", { name: "Feed" }).first().click();
  await expect(page.getByTestId("content-card").first()).toBeVisible();
  await expect.poll(async () => [...new Set(await page.getByTestId("card-category").allTextContents())]).toEqual(["sports"]);

  await page.reload();
  await expect(page.getByTestId("content-card").first()).toBeVisible();
  await expect.poll(async () => [...new Set(await page.getByTestId("card-category").allTextContents())]).toEqual(["sports"]);
});

test("trending page ranks items by section", async ({ page }) => {
  await page.getByRole("link", { name: "Trending" }).first().click();
  await expect(page.getByRole("heading", { name: "Trending news" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trending movies" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trending posts" })).toBeVisible();
  await expect(page.getByText("01", { exact: true }).first()).toBeVisible();
});

test("infinite scroll loads more content", async ({ page }) => {
  const initial = await page.getByTestId("content-card").count();
  await page.mouse.wheel(0, 20000);
  await expect.poll(() => page.getByTestId("content-card").count()).toBeGreaterThan(initial);
});

test("shows an error state with retry when the API fails", async ({ page }) => {
  await page.route("**/api/**", (r) => r.fulfill({ status: 500, body: "{}" }));
  await page.getByRole("link", { name: "Settings" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  await page.getByRole("group", { name: "Categories" }).getByRole("button", { name: /sports/ }).click(); // forces a fresh fetch on return
  await page.getByRole("link", { name: "Feed" }).first().click();
  await expect(page.getByTestId("error-state")).toBeVisible();

  await page.unroute("**/api/**");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("content-card").first()).toBeVisible();
});

test("legal pages and favicon are in place", async ({ page, request }) => {
  await page.getByRole("link", { name: "Privacy policy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeVisible();

  await page.getByRole("link", { name: "Terms and conditions" }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole("heading", { level: 1, name: "Terms and conditions" })).toBeVisible();

  await expect(page.locator('link[rel~="icon"]').first()).toHaveAttribute("href", /icon|favicon/);
  expect((await request.get("/favicon.ico")).ok()).toBe(true);
  expect((await request.get("/icon.svg")).ok()).toBe(true);
});

test("sample source labels are not shown on cards", async ({ page }) => {
  await expect(page.getByTestId("content-card").first().getByText(/Sample data/i)).toHaveCount(0);
});
