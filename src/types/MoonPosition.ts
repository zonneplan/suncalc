import { SunPosition } from './SunPosition';

export interface MoonPosition extends SunPosition {
  distance: number;
  parallacticAngle: number;
}
