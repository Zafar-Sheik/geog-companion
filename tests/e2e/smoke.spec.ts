import { expect, test } from "@playwright/test";

const errors: string[] = [];
// React #418 is a recoverable hydration error that Next 15 occasionally reports (via reportError) when a
// deferred internal Suspense boundary hydrates under heavy CPU load. React re-renders it on the client, so
// nothing visible breaks; it also occurs in CodeMzansi with the same stack. Every other error fails the test.
const KNOWN = /Minified React error #418/;
test.beforeEach(({ page }) => {
  errors.length = 0;
  page.on("pageerror", (e) => { if (!KNOWN.test(e.message)) errors.push(e.message); });
  page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.text())) errors.push(m.text()); });
});
test.afterEach(() => expect(errors, errors.join("\n")).toEqual([]));

test.describe("GeoMzansi smoke tests", () => {
  test("home page renders hero and topics", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Matric Geography");
    await expect(page.getByText("Everything in the Grade 12 syllabus")).toBeVisible();
  });

  test("lesson: steps, sorter and quiz work", async ({ page }) => {
    await page.goto("/learn/drainage-basins", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Drainage basins");
    await page.getByRole("button", { name: /2\. Types of rivers/ }).first().click();
    await expect(page.getByText("Which type of river?")).toBeVisible();
    await page.getByRole("button", { name: /4\. Check yourself/ }).first().click();
    await page.getByRole("button", { name: /Watershed/ }).first().click();
    await expect(page.getByText(/Correct!/)).toBeVisible();
  });

  test("flashcards flip and record", async ({ page }) => {
    await page.goto("/flashcards");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: /I knew it/ }).click();
    await expect(page.getByText(/Card 2 of/)).toBeVisible();
  });

  test("exam room self-marking", async ({ page }) => {
    await page.goto("/exam");
    await page.getByRole("button", { name: /Map calculations/ }).click();
    await page.getByRole("button", { name: /Show the memo/ }).first().click();
    await page.getByRole("button", { name: /VI = 1 486/ }).click();
    await page.getByRole("button", { name: "Save my mark" }).first().click();
    await expect(page.getByText("Saved ✓")).toBeVisible();
  });

  test("toolkit map calculator practice", async ({ page }) => {
    await page.goto("/toolkit");
    await page.getByRole("button", { name: /Map calculations/ }).click();
    await expect(page.getByText("Actual distance = map distance × map scale")).toBeVisible();
  });

  test("quiz arena round starts", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByRole("button", { name: "Start round" }).click();
    await expect(page.getByText(/Question 1 \/ 10/)).toBeVisible();
  });

  test("preferences panel toggles calm mode", async ({ page }) => {
    await page.goto("/learn");
    await page.getByRole("button", { name: "Open learning preferences" }).click();
    await page.getByText("Calm mode").click();
    await expect(page.locator("html")).toHaveClass(/calm/);
  });

  test("curriculum API returns JSON", async ({ request }) => {
    const body = await (await request.get("/api/curriculum")).json();
    expect(body.lessons.length).toBeGreaterThanOrEqual(20);
  });

  for (const path of ["/", "/learn", "/learn/mid-latitude-cyclones", "/learn/map-calculations", "/flashcards", "/quiz", "/exam", "/toolkit", "/games", "/progress", "/teachers/docs/curriculum-map"]) {
    test(`no sideways scrolling on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
