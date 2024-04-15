import { DPoint } from './dpoint';
import { FrameEnum } from './enums';

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
