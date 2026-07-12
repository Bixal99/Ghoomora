import { afterEach, describe, expect, it } from "vitest";
import { getDefaultMaxAgeSeconds, getRememberMeMaxAgeSeconds } from "../lib/auth-session";

const DAY = 24 * 60 * 60;

describe("auth session max ages", () => {
  const originalRemember = process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS;
  const originalDefault = process.env.AUTH_DEFAULT_MAX_AGE_DAYS;

  afterEach(() => {
    if (originalRemember === undefined) delete process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS;
    else process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS = originalRemember;
    if (originalDefault === undefined) delete process.env.AUTH_DEFAULT_MAX_AGE_DAYS;
    else process.env.AUTH_DEFAULT_MAX_AGE_DAYS = originalDefault;
  });

  it("defaults to 30 days and 1 day", () => {
    delete process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS;
    delete process.env.AUTH_DEFAULT_MAX_AGE_DAYS;
    expect(getRememberMeMaxAgeSeconds()).toBe(30 * DAY);
    expect(getDefaultMaxAgeSeconds()).toBe(1 * DAY);
  });

  it("reads env overrides", () => {
    process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS = "14";
    process.env.AUTH_DEFAULT_MAX_AGE_DAYS = "2";
    expect(getRememberMeMaxAgeSeconds()).toBe(14 * DAY);
    expect(getDefaultMaxAgeSeconds()).toBe(2 * DAY);
  });

  it("falls back on invalid env values", () => {
    process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS = "nope";
    process.env.AUTH_DEFAULT_MAX_AGE_DAYS = "-3";
    expect(getRememberMeMaxAgeSeconds()).toBe(30 * DAY);
    expect(getDefaultMaxAgeSeconds()).toBe(1 * DAY);
  });
});
