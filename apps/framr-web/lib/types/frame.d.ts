import { DPoint } from './dpoint';

export enum FrameEnum {
  UTIL = 'Utility',
  RPT = 'Repeating',
  SLD = 'Sliding',
  ROT = 'Rotatory',
  MTF = 'Magnetic Tool Phase',
  GTF = 'Gravitational Tool Phase',
}

export interface FramesetDpoint extends DPoint {
  isBaseInstance: boolean;
  error?: string;
}

interface Frameset {
  dpoints: FramesetDpoint[];
}

export interface FSLFrameset extends Frameset {
  frame: FrameEnum.GTF | FrameEnum.MTF | FrameEnum.ROT;
}

export interface UtilityFrameset extends Frameset {
  frame: FrameEnum.UTIL;
}
