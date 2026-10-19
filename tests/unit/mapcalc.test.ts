import { describe, expect, it } from "vitest";
import { area, bearingBetween, compassPoint, distance, gradient, magneticBearing, magneticDeclination, speedTime, verticalExaggeration, withinTolerance } from "@/lib/mapcalc";

describe("map calculation engine", () => {
  it("converts map distance to actual distance", () => {
    expect(distance(4, 50000).answer).toBeCloseTo(2);
    expect(distance(6, 10000).answer).toBeCloseTo(0.6);
  });

  it("calculates area in km²", () => {
    expect(area(4, 2.5, 50000).answer).toBeCloseTo(2.5);
    expect(area(10, 10, 10000).answer).toBeCloseTo(1);
  });

  it("calculates gradient as 1 : x", () => {
    expect(gradient(1486, 1206, 3.5, 50000).answer).toBeCloseTo(6.25);
    expect(gradient(1100, 1000, 4, 50000).answer).toBeCloseTo(20);
  });

  it("calculates magnetic declination for westward and eastward change", () => {
    const w = magneticDeclination(24, 40, 2016, 6, "W", 2026);
    expect(w.answer).toBeCloseTo(25 + 40 / 60);
    expect(w.display).toBe("25°40' west of true north");
    const e = magneticDeclination(24, 40, 2016, 6, "E", 2026);
    expect(e.display).toBe("23°40' west of true north");
    expect(magneticDeclination(22, 50, 2010, 3, "W", 2026).display).toBe("23°38' west of true north");
  });

  it("calculates magnetic bearing", () => {
    expect(magneticBearing(132, 25 + 40 / 60).answer).toBeCloseTo(157.667, 2);
    expect(magneticBearing(350, 25).answer).toBeCloseTo(15);
  });

  it("calculates vertical exaggeration and travel time", () => {
    expect(verticalExaggeration(2000, 50000).answer).toBe(25);
    expect(speedTime(10, 60).answer).toBeCloseTo(10);
  });

  it("measures true bearings clockwise from north (screen coordinates)", () => {
    expect(bearingBetween(0, 0, 0, -10)).toBeCloseTo(0);
    expect(bearingBetween(0, 0, 10, 0)).toBeCloseTo(90);
    expect(bearingBetween(0, 0, 0, 10)).toBeCloseTo(180);
    expect(bearingBetween(0, 0, -10, 0)).toBeCloseTo(270);
    expect(compassPoint(135)).toBe("SE");
    expect(compassPoint(350)).toBe("N");
  });

  it("accepts answers within tolerance", () => {
    expect(withinTolerance(6.3, 6.25, 0.04)).toBe(true);
    expect(withinTolerance(7, 6.25, 0.04)).toBe(false);
    expect(withinTolerance(Number("abc"), 1)).toBe(false);
  });

  it("shows memo-style working ending in the answer", () => {
    const g = gradient(1486, 1206, 3.5, 50000);
    expect(g.steps[0]).toMatch(/VI.*HE/);
    expect(g.steps.at(-1)).toContain("1 : 6.3");
  });
});
