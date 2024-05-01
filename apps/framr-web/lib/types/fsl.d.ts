import { FSLFrameType, FSLFrameset } from './frame';

export interface FSL {
  number: number;
  framesets: Record<FSLFrameType, FSLFrameset>;
}
