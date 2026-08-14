import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  readUntastedFilterPreference,
  writeUntastedFilterPreference,
  UNTASTED_FILTER_STORAGE_KEY,
} from "./cache";

describe("readUntastedFilterPreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false by default when there is no stored entry", () => {
    expect(readUntastedFilterPreference()).toBe(false);
  });

  it("returns the stored value when a valid entry exists", () => {
    localStorage.setItem(UNTASTED_FILTER_STORAGE_KEY, JSON.stringify(true));

    expect(readUntastedFilterPreference()).toBe(true);
  });

  it("returns false (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(UNTASTED_FILTER_STORAGE_KEY, "{ not valid json");

    expect(() => readUntastedFilterPreference()).not.toThrow();
    expect(readUntastedFilterPreference()).toBe(false);
  });

  it("returns false (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(UNTASTED_FILTER_STORAGE_KEY, JSON.stringify("yes"));

    expect(readUntastedFilterPreference()).toBe(false);
  });

  it("returns false (never throws) when localStorage.getItem itself throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readUntastedFilterPreference()).not.toThrow();
    expect(readUntastedFilterPreference()).toBe(false);

    spy.mockRestore();
  });
});

describe("writeUntastedFilterPreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the chosen value under the namespaced key", () => {
    writeUntastedFilterPreference(true);

    expect(JSON.parse(localStorage.getItem(UNTASTED_FILTER_STORAGE_KEY) as string)).toBe(true);
  });

  it("never throws when localStorage.setItem fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeUntastedFilterPreference(true)).not.toThrow();

    spy.mockRestore();
  });
});
