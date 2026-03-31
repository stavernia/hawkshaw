import { describe, expect, it } from "vitest";
import { SITE_ROUTES } from "../src/config/routes";

describe("SITE_ROUTES", () => {
  it("builds join routes", () => {
    expect(SITE_ROUTES.join("mystery-night")).toBe("/join/mystery-night");
  });

  it("builds room routes", () => {
    expect(SITE_ROUTES.room("salon")).toBe("/room/salon");
  });
});
