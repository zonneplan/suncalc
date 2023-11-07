export interface SolarAngleName {
  angle: number;
  morningName: SunCalcGlobal.MorningName;
  eveningName: SunCalcGlobal.EveningName;
}

export type SolarTimes<TDate = Date> = Record<
  SunCalcGlobal.MorningName | SunCalcGlobal.EveningName,
  TDate
> & {
  solarNoon: TDate;
  nadir: TDate;
};
