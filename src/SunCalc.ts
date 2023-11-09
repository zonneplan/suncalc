import type { MoonCoordinates } from './types/MoonCoordinates';
import type { MoonIllumination } from './types/MoonIllustration';
import type { MoonPosition } from './types/MoonPosition';
import type { MoonTimes } from './types/MoonTimes';
import type { CustomSolarAngleName, SolarAngleName, SolarTimes } from './types/SolarTimes';
import type { SunCoordinates } from './types/SunCoordinates';
import type { SunPosition } from './types/SunPosition';

const dayMs = 1000 * 60 * 60 * 24;

const J0 = 0.0009;
const J1970 = 2440588;
const J2000 = 2451545;

const obliquityOfEarth = degToRad(23.4397);
const perihelionOfEarth = degToRad(102.9372);

/**
 * Distance to the sun in km at perihelion.
 */
const distanceToSun = 149598000;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toJulian(date: Date): number {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(julian: number): Date {
  return new Date((julian + 0.5 - J1970) * dayMs);
}

function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

function siderealTime(days: number, lw: number): number {
  return degToRad(280.16 + 360.9856235 * days) - lw;
}

function solarMeanAnomaly(days: number): number {
  return degToRad(357.5291 + 0.98560028 * days);
}

function eclipticLongitude(M: number): number {
  const equationOfCenter = degToRad(1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));

  return M + equationOfCenter + perihelionOfEarth + Math.PI;
}

function calculateAzimuth(hourAngle: number, phi: number, declination: number): number {
  return Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(phi) - Math.tan(declination) * Math.cos(phi));
}

function calculateAltitude(hourAngle: number, phi: number, declination: number): number {
  return Math.asin(Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle));
}

function calculateRightAscension(l: number, b: number): number {
  return Math.atan2(Math.sin(l) * Math.cos(obliquityOfEarth) - Math.tan(b) * Math.sin(obliquityOfEarth), Math.cos(l));
}

function calculateDeclination(l: number, b: number): number {
  return Math.asin(Math.sin(b) * Math.cos(obliquityOfEarth) + Math.cos(b) * Math.sin(obliquityOfEarth) * Math.sin(l));
}

function sunCoords(days: number): SunCoordinates {
  const M = solarMeanAnomaly(days);
  const L = eclipticLongitude(M);

  return {
    declination: calculateDeclination(L, 0),
    rightAscension: calculateRightAscension(L, 0),
  };
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - J0 - lw / (2 * Math.PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return J0 + (Ht + lw) / (2 * Math.PI) + n;
}
function solarTransitJ(ds: number, M: number, L: number): number {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number): number {
  return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
}

function observerAngle(height: number): number {
  return (-2.076 * Math.sqrt(height)) / 60;
}

function getSetJ(h: number, lw: number, phi: number, dec: number, n: number, M: number, L: number): number {
  const w = hourAngle(h, phi, dec);
  const a = approxTransit(w, lw, n);

  return solarTransitJ(a, M, L);
}

function astroRefraction(altitude: number): number {
  if (altitude < 0) {
    // the following formula works for positive altitudes only.
    altitude = 0; // if h = -0.08901179 a div/0 would occur.
  }

  // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
  // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
  return 0.0002967 / Math.tan(altitude + 0.00312536 / (altitude + 0.08901179));
}

function moonCoords(days: number): MoonCoordinates {
  // geocentric ecliptic coordinates of the moon

  const L = degToRad(218.316 + 13.176396 * days); // ecliptic longitude
  const M = degToRad(134.963 + 13.064993 * days); // mean anomaly
  const F = degToRad(93.272 + 13.22935 * days); // mean distance
  const l = L + degToRad(6.289 * Math.sin(M)); // longitude
  const b = degToRad(5.128 * Math.sin(F)); // latitude
  const distance = 385001 - 20905 * Math.cos(M); // distance to the moon in km

  return {
    distance,
    declination: calculateDeclination(l, b),
    rightAscension: calculateRightAscension(l, b),
  };
}

function hoursLater(date: Date, hours = 1): Date {
  return new Date(date.valueOf() + (hours * dayMs) / 24);
}

export class SunCalc {
  private static times: (SolarAngleName | CustomSolarAngleName)[] = [
    { angle: -0.833, morningName: 'sunrise', eveningName: 'sunset' },
    { angle: -0.3, morningName: 'sunriseEnd', eveningName: 'sunsetStart' },
    { angle: -6, morningName: 'dawn', eveningName: 'dusk' },
    { angle: -12, morningName: 'nauticalDawn', eveningName: 'nauticalDusk' },
    { angle: -18, morningName: 'nightEnd', eveningName: 'night' },
    { angle: 6, morningName: 'goldenHourEnd', eveningName: 'goldenHour' },
  ];

  constructor(private readonly date: Date) {}

  public static addTime(angle: number, morningName: string, eveningName: string): void {
    SunCalc.times.push({ angle, morningName, eveningName });
  }

  public getSolarPosition(latitude: number, longitude: number): SunPosition {
    const days = toDays(this.date);
    const longitudeRadians = degToRad(-longitude);
    const latitudeRadians = degToRad(latitude);
    const sunCoordinates = sunCoords(days);
    const hourAngle = siderealTime(days, longitudeRadians) - sunCoordinates.rightAscension;

    return {
      azimuth: calculateAzimuth(hourAngle, latitudeRadians, sunCoordinates.declination),
      altitude: calculateAltitude(hourAngle, latitudeRadians, sunCoordinates.declination),
    };
  }

  public getSolarTimes<TAdditionalKeys extends string | never = never>(
    latitude: number,
    longitude: number,
    height = 0,
  ): SolarTimes & Record<TAdditionalKeys, Date> {
    const lw = degToRad(-longitude);
    const phi = degToRad(latitude);
    const days = toDays(this.date);

    const dh = observerAngle(height);
    const n = julianCycle(days, lw);
    const ds = approxTransit(0, lw, n);
    const M = solarMeanAnomaly(ds);
    const L = eclipticLongitude(M);
    const dec = calculateDeclination(L, 0);
    const Jnoon = solarTransitJ(ds, M, L);

    const result = {
      solarNoon: fromJulian(Jnoon),
      nadir: fromJulian(Jnoon - 0.5),
    } as SolarTimes & Record<TAdditionalKeys, Date>;

    for (const { angle, morningName, eveningName } of SunCalc.times) {
      const h0 = degToRad(angle + dh);

      const Jset = getSetJ(h0, lw, phi, dec, n, M, L);
      const Jrise = Jnoon - (Jset - Jnoon);

      result[morningName as keyof SolarTimes] = fromJulian(Jrise);
      result[eveningName as keyof SolarTimes] = fromJulian(Jset);
    }

    return result;
  }

  public getMoonPosition(latitude: number, longitude: number): MoonPosition {
    const lw = degToRad(-longitude);
    const phi = degToRad(latitude);
    const d = toDays(this.date);
    const { declination, distance, rightAscension } = moonCoords(d);
    const H = siderealTime(d, lw) - rightAscension;
    const azimuth = calculateAzimuth(H, phi, declination);
    let altitude = calculateAltitude(H, phi, declination);

    // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    const parallacticAngle = Math.atan2(
      Math.sin(H),
      Math.tan(phi) * Math.cos(declination) - Math.sin(declination) * Math.cos(H),
    );

    altitude += astroRefraction(altitude); // altitude correction for refraction

    return {
      azimuth,
      altitude,
      distance,
      parallacticAngle,
    };
  }

  /**
   * Calculations for illumination parameters of the moon,
   * based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
   * Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
   */
  public getMoonIllumination(): MoonIllumination {
    const days = toDays(this.date);
    const s = sunCoords(days);
    const m = moonCoords(days);

    const phi = Math.acos(
      Math.sin(s.declination) * Math.sin(m.declination) +
        Math.cos(s.declination) * Math.cos(m.declination) * Math.cos(s.rightAscension - m.rightAscension),
    );

    const inc = Math.atan2(distanceToSun * Math.sin(phi), m.distance - distanceToSun * Math.cos(phi));

    const angle = Math.atan2(
      Math.cos(s.declination) * Math.sin(s.rightAscension - m.rightAscension),
      Math.sin(s.declination) * Math.cos(m.declination) -
        Math.cos(s.declination) * Math.sin(m.declination) * Math.cos(s.rightAscension - m.rightAscension),
    );

    return {
      angle,
      fraction: (1 + Math.cos(inc)) / 2,
      phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI,
    };
  }

  public getMoonTimes(latitude: number, longitude: number, inUTC = false): MoonTimes {
    const t = new Date(this.date);

    if (inUTC) {
      t.setUTCHours(0, 0, 0, 0);
    } else {
      t.setHours(0, 0, 0, 0);
    }

    const hc = degToRad(0.133);
    let h0 = new SunCalc(t).getMoonPosition(latitude, longitude).altitude - hc;
    let rise = 0;
    let set = 0;
    let x1 = 0;
    let x2 = 0;
    let ye = 0;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (let i = 1; i <= 24; i += 2) {
      const h1 = new SunCalc(hoursLater(t, i)).getMoonPosition(latitude, longitude).altitude - hc;

      const h2 = new SunCalc(hoursLater(t, i + 1)).getMoonPosition(latitude, longitude).altitude - hc;

      const a = (h0 + h2) / 2 - h1;
      const b = (h2 - h0) / 2;
      const xe = -b / (2 * a);
      ye = (a * xe + b) * xe + h1;
      const d = b * b - 4 * a * h1;
      let roots = 0;

      if (d >= 0) {
        const dx = Math.sqrt(d) / (Math.abs(a) * 2);
        x1 = xe - dx;
        x2 = xe + dx;

        if (Math.abs(x1) <= 1) {
          roots++;
        }

        if (Math.abs(x2) <= 1) {
          roots++;
        }

        if (x1 < -1) {
          x1 = x2;
        }
      }

      if (roots === 1) {
        if (h0 < 0) {
          rise = i + x1;
        } else {
          set = i + x1;
        }
      } else if (roots === 2) {
        rise = i + (ye < 0 ? x2 : x1);
        set = i + (ye < 0 ? x1 : x2);
      }

      if (rise && set) {
        break;
      }

      h0 = h2;
    }

    const result: MoonTimes = {
      set: null,
      rise: null,
      alwaysUp: false,
      alwaysDown: false,
    };

    if (rise) {
      result.rise = hoursLater(t, rise);
    }

    if (set) {
      result.set = hoursLater(t, set);
    }

    if (!rise && !set) {
      if (ye > 0) {
        result.alwaysUp = true;
      } else {
        result.alwaysDown = true;
      }
    }

    return result;
  }
}
