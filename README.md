# SunCalc

[![Build Status](https://travis-ci.org/mourner/suncalc.svg?branch=master)](https://travis-ci.org/mourner/suncalc)

SunCalc is a tiny BSD-licensed JavaScript library for calculating sun position,
sunlight phases (times for sunrise, sunset, dusk, etc.),
moon position and lunar phase for the given location and time,
created by [Vladimir Agafonkin](http://agafonkin.com/en) ([@mourner](https://github.com/mourner))
as a part of the [SunCalc.net project](http://suncalc.net).

Most calculations are based on the formulas given in the excellent Astronomy Answers articles
about [position of the sun](http://aa.quae.nl/en/reken/zonpositie.html)
and [the planets](http://aa.quae.nl/en/reken/hemelpositie.html).
You can read about different twilight phases calculated by SunCalc
in the [Twilight article on Wikipedia](http://en.wikipedia.org/wiki/Twilight).

## Usage example

```typescript
// get today's sunlight times for London
const times = new SunCalc(new Date()).getTimes(51.5, -0.1);

// format sunrise time from the Date object
const sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();

// get position of the sun (azimuth and altitude) at today's sunrise
const sunrisePos = new SunCalc(times.sunrise).getPosition(51.5, -0.1);

// get sunrise azimuth in degrees
const sunriseAzimuth = (sunrisePos.azimuth * 180) / Math.PI;
```

SunCalc is also available as an NPM package:

```bash
npm install @zonneplan/suncalc
```

```bash
yarn add @zonneplan/suncalc
```

```bash
bun install @zonneplan/suncalc
```

```typescript
import { SunCalc } from '@zonneplan/suncalc';
```

## Reference

### Sunlight times

```typescript
new SunCalc(date: Date).getSolarTimes(latitude: number, longitude: number, height = 0): SolarTimes;
```

Returns a `SolarTimes` object with the following properties (each is a `Date` object):

| Property        | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `sunrise`       | sunrise (top edge of the sun appears on the horizon)                     |
| `sunriseEnd`    | sunrise ends (bottom edge of the sun touches the horizon)                |
| `goldenHourEnd` | morning golden hour (soft light, best time for photography) ends         |
| `solarNoon`     | solar noon (sun is in the highest position)                              |
| `goldenHour`    | evening golden hour starts                                               |
| `sunsetStart`   | sunset starts (bottom edge of the sun touches the horizon)               |
| `sunset`        | sunset (sun disappears below the horizon, evening civil twilight starts) |
| `dusk`          | dusk (evening nautical twilight starts)                                  |
| `nauticalDusk`  | nautical dusk (evening astronomical twilight starts)                     |
| `night`         | night starts (dark enough for astronomical observations)                 |
| `nadir`         | nadir (darkest moment of the night, sun is in the lowest position)       |
| `nightEnd`      | night ends (morning astronomical twilight starts)                        |
| `nauticalDawn`  | nautical dawn (morning nautical twilight starts)                         |
| `dawn`          | dawn (morning nautical twilight ends, morning civil twilight starts)     |

```typescript
SunCalc.addTime(angleInDegrees: number, morningName: SunCalcGlobal.MorningName, eveningName: SunCalcGlobal.EveningName): void;
```

### Sun position

```typescript
new SunCalc(date: Date).getSolarPosition(latitude: number, longitude: number): SunPosition;
```

Returns a `SunPosition` object with the following properties:

- `altitude`: sun altitude above the horizon in radians,
  e.g. `0` at the horizon and `PI/2` at the zenith (straight over your head)
- `azimuth`: sun azimuth in radians (direction along the horizon, measured from south to west),
  e.g. `0` is south and `Math.PI * 3/4` is northwest

### Moon position

```typescript
new SunCalc(date: Date).getMoonPosition(latitude: number, longitude: number): MoonPosition;
```

Returns a `MoonPosition` object with the following properties:

- `altitude`: moon altitude above the horizon in radians
- `azimuth`: moon azimuth in radians
- `distance`: distance to moon in kilometers
- `parallacticAngle`: parallactic angle of the moon in radians

### Moon illumination

```typescript
new SunCalc(date: Date).getMoonIllumination(): MoonIllumination;
```

Returns a `MoonIllumination` object with the following properties:

- `fraction`: illuminated fraction of the moon; varies from `0.0` (new moon) to `1.0` (full moon)
- `phase`: moon phase; varies from `0.0` to `1.0`, described below
- `angle`: midpoint angle in radians of the illuminated limb of the moon reckoned eastward from the north point of the disk;
  the moon is waxing if the angle is negative, and waning if positive

Moon phase value should be interpreted like this:

| Phase | Name            |
| ----: | --------------- |
|     0 | New Moon        |
|       | Waxing Crescent |
|  0.25 | First Quarter   |
|       | Waxing Gibbous  |
|   0.5 | Full Moon       |
|       | Waning Gibbous  |
|  0.75 | Last Quarter    |
|       | Waning Crescent |

By subtracting the `parallacticAngle` from the `angle` one can get the zenith angle of the moons bright limb (anticlockwise).
The zenith angle can be used do draw the moon shape from the observers perspective (e.g. moon lying on its back).

### Moon rise and set times

```typescript
new SunCalc(date: Date).getMoonTimes(latitude: number, longitude: number, inUTC = false): MoonTimes;
```

Returns a `MoonTimes` object with the following properties:

- `rise`: moonrise time as `Date`
- `set`: moonset time as `Date`
- `alwaysUp`: `true` if the moon never rises/sets and is always _above_ the horizon during the day
- `alwaysDown`: `true` if the moon is always _below_ the horizon

By default, it will search for moon rise and set during local user's day (frou 0 to 24 hours).
If `inUTC` is set to true, it will instead search the specified date from 0 to 24 UTC hours.

## Changelog

#### 2.0.0 &mdash; Nov 7, 2023

- Use TypeScript with modern syntax.

#### 1.8.0 &mdash; Dec 22, 2016

- Improved precision of moonrise/moonset calculations.
- Added `parallacticAngle` calculation to `getMoonPosition`.
- Default to today's date in `getMoonIllumination`.
- Fixed incompatibility when using Browserify/Webpack together with a global AMD loader.

#### 1.7.0 &mdash; Nov 11, 2015

- Added `inUTC` argument to `getMoonTimes`.

#### 1.6.0 &mdash; Oct 27, 2014

- Added `SunCalc.getMoonTimes` for calculating moon rise and set times.

#### 1.5.1 &mdash; May 16, 2014

- Exposed `SunCalc.times` property with defined daylight times.
- Slightly improved `SunCalc.getTimes` performance.

#### 1.4.0 &mdash; Apr 10, 2014

- Added `phase` to `SunCalc.getMoonIllumination` results (moon phase).
- Switched from mocha to tape for tests.

#### 1.3.0 &mdash; Feb 21, 2014

- Added `SunCalc.getMoonIllumination` (in place of `getMoonFraction`) that returns an object with `fraction` and `angle`
  (angle of illuminated limb of the moon).

#### 1.2.0 &mdash; Mar 07, 2013

- Added `SunCalc.getMoonFraction` function that returns illuminated fraction of the moon.

#### 1.1.0 &mdash; Mar 06, 2013

- Added `SunCalc.getMoonPosition` function.
- Added nadir (darkest time of the day, middle of the night).
- Added tests.

#### 1.0.0 &mdash; Dec 07, 2011

- Published to NPM.
- Added `SunCalc.addTime` function.

#### 0.0.0 &mdash; Aug 25, 2011

- First commit.
