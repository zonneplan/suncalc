import { beforeEach, it, expect, jest } from '@jest/globals';
import { SunCalc } from './SunCalc';
import { SolarTimes } from './types/SolarTimes';

beforeEach(() => {
  jest.resetModules();
});

const date = new Date('2013-03-05UTC');
const lat = 50.5;
const lng = 30.5;
const height = 2000;

it('getPosition returns azimuth and altitude for the given time and location', function () {
  const sunPos = new SunCalc(date, lat, lng).getSolarPosition();

  expect(sunPos.azimuth).toBeCloseTo(-2.5003175907168385);
  expect(sunPos.altitude).toBeCloseTo(-0.7000406838781611);
});

it('getTimes returns sun phases for the given date and location', function () {
  const testTimes: SolarTimes<string> = {
    solarNoon: '2013-03-05T10:10:57Z',
    nadir: '2013-03-04T22:10:57Z',
    sunrise: '2013-03-05T04:34:56Z',
    sunset: '2013-03-05T15:46:57Z',
    sunriseEnd: '2013-03-05T04:38:19Z',
    sunsetStart: '2013-03-05T15:43:34Z',
    dawn: '2013-03-05T04:02:17Z',
    dusk: '2013-03-05T16:19:36Z',
    nauticalDawn: '2013-03-05T03:24:31Z',
    nauticalDusk: '2013-03-05T16:57:22Z',
    nightEnd: '2013-03-05T02:46:17Z',
    night: '2013-03-05T17:35:36Z',
    goldenHourEnd: '2013-03-05T05:19:01Z',
    goldenHour: '2013-03-05T15:02:52Z',
  };

  const times = new SunCalc(date, lat, lng).getSolarTimes();

  for (const key in testTimes) {
    const timeName = key as keyof typeof testTimes;
    expect(new Date(testTimes[timeName]).toUTCString()).toBe(times[timeName].toUTCString());
  }
});

it('getTimes adjusts sun phases when additionally given the observer height', function () {
  const heightTestTimes = {
    solarNoon: '2013-03-05T10:10:57Z',
    nadir: '2013-03-04T22:10:57Z',
    sunrise: '2013-03-05T04:25:07Z',
    sunset: '2013-03-05T15:56:46Z',
  };

  const times = new SunCalc(date, lat, lng).getSolarTimes(height);

  for (const key in heightTestTimes) {
    const timeName = key as keyof typeof heightTestTimes;
    expect(new Date(heightTestTimes[timeName]).toUTCString()).toBe(times[timeName].toUTCString());
  }
});

it('getMoonPosition returns moon position data given time and location', function () {
  var moonPos = new SunCalc(date, lat, lng).getMoonPosition();

  expect(moonPos.azimuth).toBeCloseTo(-0.9783999522438226);
  expect(moonPos.altitude).toBeCloseTo(0.014551482243892251);
  expect(moonPos.distance).toBeCloseTo(364121.37256256194);
});

it("getMoonIllumination returns fraction and angle of moon's illuminated limb and phase", function () {
  const moonIllum = new SunCalc(date, lat, lng).getMoonIllumination();

  expect(moonIllum.fraction).toBeCloseTo(0.4848068202456373);
  expect(moonIllum.phase).toBeCloseTo(0.7548368838538762);
  expect(moonIllum.angle).toBeCloseTo(1.6732942678578346);
});

it('getMoonTimes returns moon rise and set times', function () {
  const moonTimes = new SunCalc(new Date('2013-03-04UTC'), lat, lng).getMoonTimes(true);

  expect(moonTimes.rise?.toUTCString()).toBe('Mon, 04 Mar 2013 23:54:29 GMT');
  expect(moonTimes.set?.toUTCString()).toBe('Mon, 04 Mar 2013 07:47:58 GMT');
});
