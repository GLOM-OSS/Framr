import { FSLFrameEnum, FSLFrameset } from './frame';

export interface FSL {
  number: number;
  framesets: Record<FSLFrameEnum, FSLFrameset>;
}
