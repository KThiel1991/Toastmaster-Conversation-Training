import { afterEach, describe, expect, it } from "vitest";
import { authToken, isAuthorized, safeEqual } from "../auth";

describe("auth", () => {
  afterEach(() => {
    delete process.env.APP_PASSWORD;
  });

  it("ist ohne APP_PASSWORD offen", async () => {
    expect(await isAuthorized(undefined)).toBe(true);
  });

  it("akzeptiert nur das Token zum richtigen Passwort", async () => {
    process.env.APP_PASSWORD = "geheim";
    expect(await isAuthorized(undefined)).toBe(false);
    expect(await isAuthorized(await authToken("falsch"))).toBe(false);
    expect(await isAuthorized(await authToken("geheim"))).toBe(true);
  });

  it("vergleicht Zeichenketten korrekt", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "ab")).toBe(false);
  });
});
