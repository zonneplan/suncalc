export interface SolarAngleName {
  angle: number;
  morningName: SunCalcGlobal.MorningName;
  eveningName: SunCalcGlobal.EveningName;
}

export type SolarTimes = Record<
  SunCalcGlobal.MorningName | SunCalcGlobal.EveningName,
  Date
> & {
  solarNoon: Date;
  nadir: Date;
};
