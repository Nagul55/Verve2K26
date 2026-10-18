import test from "node:test";
import assert from "node:assert/strict";

// Helper logic mirrored from auth components
function validateEmail(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleanEmail);
}

function parseOtpPaste(pasteData: string, len: number = 6): string[] {
  const cleaned = pasteData.replace(/\D/g, "").slice(0, len);
  const otp = Array(len).fill("");
  for (let i = 0; i < cleaned.length; i++) {
    otp[i] = cleaned[i];
  }
  return otp;
}

function evaluatePassword(password: string, confirmPassword: string) {
  const hasMinLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const strengthScore = [hasMinLength, hasNumberOrSpecial, password.length >= 10].filter(Boolean).length;
  return { hasMinLength, hasNumberOrSpecial, passwordsMatch, strengthScore };
}

function checkAttemptLimit(failedAttempts: number, maxAttempts: number = 5): { isLocked: boolean; remaining: number } {
  const remaining = Math.max(0, maxAttempts - failedAttempts);
  return {
    isLocked: failedAttempts >= maxAttempts,
    remaining,
  };
}

function formatMaskedEmail(email: string): string {
  if (!email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

test("auth: email validation for password recovery", () => {
  assert.equal(validateEmail("user@example.com"), true);
  assert.equal(validateEmail("admin@eventrix.com"), true);
  assert.equal(validateEmail("student.21ad01@sonatech.ac.in"), true);

  assert.equal(validateEmail("invalid-email"), false);
  assert.equal(validateEmail("user@"), false);
  assert.equal(validateEmail("@example.com"), false);
  assert.equal(validateEmail(""), false);
  assert.equal(validateEmail("   "), false);
});

test("auth: OTP parsing and 6-digit & 8-digit slicing on paste", () => {
  const fullPaste = parseOtpPaste("839201");
  assert.deepEqual(fullPaste, ["8", "3", "9", "2", "0", "1"]);

  const pasteWithLetters = parseOtpPaste("Code: 839-201");
  assert.deepEqual(pasteWithLetters, ["8", "3", "9", "2", "0", "1"]);

  const partialPaste = parseOtpPaste("123");
  assert.deepEqual(partialPaste, ["1", "2", "3", "", "", ""]);

  const extraLongPaste = parseOtpPaste("1234567899");
  assert.deepEqual(extraLongPaste, ["1", "2", "3", "4", "5", "6"]);

  const eightDigitPaste = parseOtpPaste("96887183", 8);
  assert.deepEqual(eightDigitPaste, ["9", "6", "8", "8", "7", "1", "8", "3"]);
});

test("auth: password strength and match evaluation", () => {
  // Short password
  const shortRes = evaluatePassword("short1", "short1");
  assert.equal(shortRes.hasMinLength, false);
  assert.equal(shortRes.hasNumberOrSpecial, true);
  assert.equal(shortRes.passwordsMatch, true);
  assert.equal(shortRes.strengthScore, 1);

  // Mismatch
  const mismatchRes = evaluatePassword("SecurePass123!", "DifferentPass123!");
  assert.equal(mismatchRes.hasMinLength, true);
  assert.equal(mismatchRes.hasNumberOrSpecial, true);
  assert.equal(mismatchRes.passwordsMatch, false);

  // Strong password
  const strongRes = evaluatePassword("SuperStrongPass99#", "SuperStrongPass99#");
  assert.equal(strongRes.hasMinLength, true);
  assert.equal(strongRes.hasNumberOrSpecial, true);
  assert.equal(strongRes.passwordsMatch, true);
  assert.equal(strongRes.strengthScore, 3);
});

test("auth: verification attempt limiting and security lockout", () => {
  assert.deepEqual(checkAttemptLimit(0), { isLocked: false, remaining: 5 });
  assert.deepEqual(checkAttemptLimit(4), { isLocked: false, remaining: 1 });
  assert.deepEqual(checkAttemptLimit(5), { isLocked: true, remaining: 0 });
  assert.deepEqual(checkAttemptLimit(6), { isLocked: true, remaining: 0 });
});

test("auth: masked email display helper", () => {
  assert.equal(formatMaskedEmail("john.doe@example.com"), "j****e@example.com");
  assert.equal(formatMaskedEmail("ab@sonatech.ac.in"), "a*@sonatech.ac.in");
});
