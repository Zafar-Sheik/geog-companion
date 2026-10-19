/**
 * Map calculations exactly as set out in NSC Geography memos: formula,
 * substitution, answer with units. Pure functions – unit-tested.
 */

export interface Worked {
  answer: number;
  unit: string;
  display: string;
  steps: string[];
}

/** Number with up to `dp` decimals, a decimal point and a space as thousands separator (e.g. 1 750). */
const fmt = (n: number, dp = 2) => {
  const [int, dec] = String(Number(n.toFixed(dp))).split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (dec ? `.${dec}` : "");
};

/** How many metres 1 cm on the map represents. 1:50 000 → 500 m. */
export const metresPerCm = (scale: number) => scale / 100;

export function distance(mapCm: number, scale: number): Worked {
  const km = (mapCm * metresPerCm(scale)) / 1000;
  return {
    answer: km,
    unit: "km",
    display: `${fmt(km)} km`,
    steps: [
      "Actual distance = map distance × map scale",
      `= ${fmt(mapCm, 1)} cm × ${fmt(metresPerCm(scale) / 1000, 3)} km`,
      `= ${fmt(km)} km  (${fmt(km * 1000, 0)} m)`,
    ],
  };
}

export function area(lengthCm: number, breadthCm: number, scale: number): Worked {
  const k = metresPerCm(scale) / 1000;
  const l = lengthCm * k;
  const b = breadthCm * k;
  const a = l * b;
  return {
    answer: a,
    unit: "km²",
    display: `${fmt(a, 3)} km²`,
    steps: [
      "Area = length × breadth",
      `= (${fmt(lengthCm, 1)} cm × ${fmt(k, 3)} km) × (${fmt(breadthCm, 1)} cm × ${fmt(k, 3)} km)`,
      `= ${fmt(l, 3)} km × ${fmt(b, 3)} km`,
      `= ${fmt(a, 3)} km²`,
    ],
  };
}

export function gradient(highM: number, lowM: number, mapCm: number, scale: number): Worked {
  const vi = highM - lowM;
  const he = mapCm * metresPerCm(scale);
  const x = he / vi;
  return {
    answer: x,
    unit: "",
    display: `1 : ${fmt(x, 1)}`,
    steps: [
      "Gradient = vertical interval (VI) ÷ horizontal equivalent (HE)",
      `VI = ${fmt(highM, 0)} m − ${fmt(lowM, 0)} m = ${fmt(vi, 0)} m`,
      `HE = ${fmt(mapCm, 1)} cm × ${fmt(metresPerCm(scale), 0)} m = ${fmt(he, 0)} m`,
      `Gradient = ${fmt(vi, 0)} m ÷ ${fmt(he, 0)} m`,
      `= 1 : ${fmt(x, 1)}  (for every 1 m up, you travel ${fmt(x, 1)} m horizontally)`,
    ],
  };
}

const dm = (totalMin: number) => {
  const d = Math.floor(totalMin / 60);
  const m = Math.round(totalMin - d * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
};

/**
 * Magnetic declination for the current year. SA declinations are west of true
 * north; a westward annual change increases it, an eastward change decreases it.
 */
export function magneticDeclination(baseDeg: number, baseMin: number, baseYear: number, annualMin: number, change: "W" | "E", year: number): Worked {
  const years = year - baseYear;
  const total = years * annualMin;
  const base = baseDeg * 60 + baseMin;
  const result = change === "W" ? base + total : base - total;
  return {
    answer: result / 60,
    unit: "°",
    display: `${dm(result)} west of true north`,
    steps: [
      `Difference in years = ${year} − ${baseYear} = ${years} years`,
      `Total change = ${years} × ${annualMin}' ${change === "W" ? "W" : "E"} = ${total}' = ${dm(total)} ${change === "W" ? "westwards" : "eastwards"}`,
      `Magnetic declination ${year} = ${dm(base)} ${change === "W" ? "+" : "−"} ${dm(total)}`,
      `= ${dm(result)} W of true north`,
    ],
  };
}

export function magneticBearing(trueBearing: number, declinationDeg: number): Worked {
  const mb = (trueBearing + declinationDeg) % 360;
  return {
    answer: mb,
    unit: "°",
    display: `${fmt(mb, 1)}°`,
    steps: [
      "Magnetic bearing = true bearing + magnetic declination (west)",
      `= ${fmt(trueBearing, 1)}° + ${fmt(declinationDeg, 2)}°`,
      `= ${fmt(mb, 1)}°`,
    ],
  };
}

export function verticalExaggeration(vsDenominator: number, hsDenominator: number): Worked {
  const ve = hsDenominator / vsDenominator;
  return {
    answer: ve,
    unit: "times",
    display: `${fmt(ve, 1)} times`,
    steps: [
      "VE = vertical scale ÷ horizontal scale",
      `= 1/${fmt(vsDenominator, 0)} ÷ 1/${fmt(hsDenominator, 0)}`,
      `= ${fmt(hsDenominator, 0)} ÷ ${fmt(vsDenominator, 0)}`,
      `= ${fmt(ve, 1)} times`,
    ],
  };
}

export function speedTime(distanceKm: number, speedKmh: number): Worked {
  const h = distanceKm / speedKmh;
  return {
    answer: h * 60,
    unit: "min",
    display: `${fmt(h * 60, 1)} minutes`,
    steps: ["Time = distance ÷ speed", `= ${fmt(distanceKm, 2)} km ÷ ${fmt(speedKmh, 0)} km/h`, `= ${fmt(h, 3)} h × 60`, `= ${fmt(h * 60, 1)} minutes`],
  };
}

/** True bearing from A to B on a map where y grows downwards (screen coordinates). */
export function bearingBetween(ax: number, ay: number, bx: number, by: number) {
  const deg = (Math.atan2(bx - ax, ay - by) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export const COMPASS16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const compassPoint = (b: number) => COMPASS16[Math.round(b / 22.5) % 16];

/** An answer is accepted if it is within `tolerance` (fraction) of the true value – memos allow a range. */
export function withinTolerance(given: number, expected: number, tolerance = 0.03) {
  if (!Number.isFinite(given)) return false;
  return Math.abs(given - expected) <= Math.max(Math.abs(expected) * tolerance, 0.011);
}
