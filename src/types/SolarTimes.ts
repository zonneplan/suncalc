export type SolarMorningName = 'sunrise' | 'sunriseEnd' | 'dawn' | 'nauticalDawn' | 'nightEnd' | 'goldenHourEnd';
export type SolarEveningName = 'sunset' | 'sunsetStart' | 'dusk' | 'nauticalDusk' | 'night' | 'goldenHour';

export interface SolarAngleName {
  angle: number;
  morningName: SolarMorningName | SunCalcGlobal.MorningName;
  eveningName: SolarEveningName | SunCalcGlobal.EveningName;
}

export type SolarTimes<TDate = Date> = Record<SolarMorningName | SolarEveningName, TDate> &
  Record<SunCalcGlobal.MorningName | SunCalcGlobal.EveningName, TDate> & {
    solarNoon: TDate;
    nadir: TDate;
  };
