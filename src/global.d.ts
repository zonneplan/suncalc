type SolarMorningName =
  | 'sunrise'
  | 'sunriseEnd'
  | 'dawn'
  | 'nauticalDawn'
  | 'nightEnd'
  | 'goldenHourEnd';

type SolarEveningName =
  | 'sunset'
  | 'sunsetStart'
  | 'dusk'
  | 'nauticalDusk'
  | 'night'
  | 'goldenHour';

declare namespace SunCalcGlobal {
  type MorningName = SolarMorningName;
  type EveningName = SolarEveningName;
}
