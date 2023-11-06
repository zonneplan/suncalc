import { SunCoordinates } from './SunCoordinates';

export interface MoonCoordinates extends SunCoordinates {
  distance: number;
}
