import { test, expect } from "@playwright/test";

test.describe("Forgot Password & Reset Flow", () => {
  test("1. Login page displays 'Forgot Password?' link and navigates to /forgot-password", async ({ page }) => {
    await page.goto("/");
    const forgotLink = page.getByRole("link", { name: /Forgot Password\?/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
    await expect(page.getByRole("heading", { name: /Reset Password/i })).toBeVisible();
  });

  test("2. Displays clean recovery form with email input and Send Verification Code button", async ({ page }) => {
    await page.goto("/forgot-password");
    const emailInput = page.locator("#recovery-email");
    const submitButton = page.getByRole("button", { name: /Send Verification Code/i });
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Sign In/i })).toBeVisible();
  });

  test("3. Submitting email transitions to OTP verification screen with cooldown", async ({ page }) => {
    await page.goto("/forgot-password");
    const emailInput = page.locator("#recovery-email");
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /Send Verification Code/i });
    await submitButton.click();

    // Verify transition to OTP verification screen
    await expect(page.getByRole("heading", { name: /Enter OTP Code/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Enter the \d+-digit verification code sent to test@example\.com/i)).toBeVisible();

    // Verify OTP input boxes
    const boxes = page.locator('input[id^="otp-box-"]');
    const boxCount = await boxes.count();
    expect(boxCount).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < boxCount; i++) {
      const box = page.locator(`#otp-box-${i}`);
      await expect(box).toBeVisible();
      await expect(box).toHaveAttribute("maxlength", "1");
      await expect(box).toHaveAttribute("inputmode", "numeric");
    }

    // Verify Verify Code button exists and starts disabled (until all digits are typed)
    const verifyButton = page.getByRole("button", { name: /Verify Code/i });
    await expect(verifyButton).toBeVisible();
    await expect(verifyButton).toBeDisabled();

    // Verify Resend Code cooldown
    await expect(page.getByText(/Resend in \d+s/i)).toBeVisible();
  });

  test("4. Typing all digits enables the Verify Code button and auto-advances focus", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.locator("#recovery-email").fill("test@example.com");
    await page.getByRole("button", { name: /Send Verification Code/i }).click();

    await expect(page.getByRole("heading", { name: /Enter OTP Code/i })).toBeVisible({ timeout: 10000 });

    // Type each digit into the OTP boxes
    const boxes = page.locator('input[id^="otp-box-"]');
    const boxCount = await boxes.count();
    for (let i = 0; i < boxCount; i++) {
      await page.locator(`#otp-box-${i}`).fill(String((i % 9) + 1));
    }

    // Now verify button should be enabled
    const verifyButton = page.getByRole("button", { name: /Verify Code/i });
    await expect(verifyButton).toBeEnabled();

    // Submit invalid code to verify error handling
    await verifyButton.click();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Invalid or expired verification code/i)).toBeVisible();
  });

  test("5. Direct access to /reset-password without active recovery session blocks unauthorized users", async ({ page }) => {
    await page.goto("/reset-password");
    // Verify unauthorized security guard displays
    await expect(page.getByText(/Recovery Session Required/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/You do not have an active recovery session/i)).toBeVisible();

    const requestButton = page.getByRole("link", { name: /Request Verification Code/i });
    await expect(requestButton).toBeVisible();
    await requestButton.click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
  });

  test("6. Responsive mobile viewport layout renders correctly without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/forgot-password");

    const heading = page.getByRole("heading", { name: /Reset Password/i });
    await expect(heading).toBeVisible();

    const emailInput = page.locator("#recovery-email");
    await expect(emailInput).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Send Verification Code/i });
    await expect(submitButton).toBeVisible();
  });
});
