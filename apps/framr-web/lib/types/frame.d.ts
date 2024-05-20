import { DPoint } from './dpoint';
import { FrameEnum } from './enums';

export interface FramesetDpoint extends DPoint {
  dpointId: string;
  isBaseInstance: boolean;
  error?: string;
}

export interface DPointsetDPoint extends FramesetDpoint {
  dpointsetId: string;
}

interface Frameset {
  dpoints: FramesetDpoint[];
}

export type FSLFrameType = Extract<
  FrameEnum,
  FrameEnum.GTF | FrameEnum.MTF | FrameEnum.ROT
>;

export interface FSLFrameset extends Frameset {
  frame: FSLFrameType;
}

export interface UtilityFrameset extends Frameset {
  frame: FrameEnum.UTIL;
}
