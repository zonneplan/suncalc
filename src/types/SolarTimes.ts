export type SolarMorningName = 'sunrise' | 'sunriseEnd' | 'dawn' | 'nauticalDawn' | 'nightEnd' | 'goldenHourEnd';
export type SolarEveningName = 'sunset' | 'sunsetStart' | 'dusk' | 'nauticalDusk' | 'night' | 'goldenHour';

export interface SolarAngleName {
  angle: number;
  morningName: SolarMorningName;
  eveningName: SolarEveningName;
}

export interface CustomSolarAngleName {
  angle: number;
  morningName: string;
  eveningName: string;
}

export type SolarTimes<TDate = Date> = Record<SolarMorningName | SolarEveningName, TDate> & {
  solarNoon: TDate;
  nadir: TDate;
};
