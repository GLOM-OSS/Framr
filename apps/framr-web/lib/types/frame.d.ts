import { DPoint } from './dpoint';
import { FrameEnum } from './enums';

export interface FramesetDpoint extends DPoint {
  isBaseInstance: boolean;
  error?: string;
}

interface Frameset {
  dpoints: FramesetDpoint[];
}

export type FSLFrameEnum = Extract<
  FrameEnum,
  FrameEnum.GTF | FrameEnum.MTF | FrameEnum.ROT
>;

export interface FSLFrameset extends Frameset {
  frame: FSLFrameEnum;
}

export interface UtilityFrameset extends Frameset {
  frame: FrameEnum.UTIL;
}
