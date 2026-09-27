import { expect, test } from "@playwright/test";

// Uses the superuser the backend entrypoint creates from DJANGO_SUPERUSER_* (admin / admin in dev).
const USERNAME = process.env.E2E_USERNAME ?? "admin";
const PASSWORD = process.env.E2E_PASSWORD ?? "admin";

test("dashboard redirects to login when signed out", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(USERNAME);
  await page.getByLabel("Password").fill("definitely-wrong");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Invalid username or password.")).toBeVisible();
});

test("dev credentials panel fills the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Default development login")).toBeVisible();
  await page.getByRole("button", { name: "Fill in these credentials" }).click();
  await expect(page.getByLabel("Username")).toHaveValue(USERNAME);
  await expect(page.getByLabel("Password")).toHaveValue(PASSWORD);
});

test("user can log in and out", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(USERNAME);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(`Signed in as ${USERNAME}`)).toBeVisible();

  await page.goto("/");
  await expect(page.getByText(`Signed in as ${USERNAME}.`)).toBeVisible();

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Not signed in.")).toBeVisible();
});
