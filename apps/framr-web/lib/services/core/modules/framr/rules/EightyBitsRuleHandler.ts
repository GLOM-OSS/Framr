import { DPoint, DPointsetDPoint } from '../../../../../types';
import { ToolEnum } from '../../../../../types/enums';
import { getRandomID } from '../../common/common';
import { getFramesetDPoint } from '../RulesHandler';
/**
 * Represents the number of bits, last index, and data point index for spreading cursors.
 */
export type SeparatorOptions = {
  bitsCount: number;
  lastIndex: number;
  separator: DPoint;
  nextSet: DPointsetDPoint[];
  currentSet: DPointsetDPoint[];
};

export class EightyBitsRuleHandler {
  /**
   * Handles rules related to 80 bits constraints for MWD data points.
   * @param mwdSeparator Array of MWD data points.
   * @param cursors Spreading cursors containing bit count, last index, and data point index.
   * @param generatorConfig Generator configuration.
   * @returns Object containing updated cursors and MWD data points.
   */
  handle({
    nextSet,
    currentSet,
    separator: dpointSeparator,
    ...cursors
  }: SeparatorOptions): [typeof cursors, DPointsetDPoint[]] {
    const BITS_LIMIT = 80;

    // get bit count to the first mwd dpoint of the current set
    let currentSetMWDDPointIndex = -1;
    let bitCountToCurrentSetMWDDPoint = 0;
    for (let i = 0; i < currentSet.length; i++) {
      const dpoint = currentSet[i];
      bitCountToCurrentSetMWDDPoint += dpoint.bits;

      if (dpoint.tool.type === ToolEnum.MWD) {
        currentSetMWDDPointIndex = i;
        break;
      }
    }

    // get bit count to the first mwd dpoint of the next set
    let bitCountToNextSetMWDDPoint = 0;
    for (let i = 0; i < nextSet.length; i++) {
      const dpoint = nextSet[i];
      bitCountToNextSetMWDDPoint += dpoint.bits;

      if (dpoint.tool.type === ToolEnum.MWD) {
        break;
      }
    }

    if (currentSetMWDDPointIndex === -1) {
      // If current set has not mwd dpoint,
      // we check that the next set bit count is not be greater than the BIT_LIMIT
      const bitCount =
        cursors.bitsCount +
        bitCountToCurrentSetMWDDPoint +
        bitCountToNextSetMWDDPoint;
      if (bitCount >= BITS_LIMIT) {
        // Insert separator after the current set if bit count
        // added to the next set bit count is greater or equal to bit limit
        return [
          {
            bitsCount: 0,
            lastIndex: currentSet.length,
          },
          [
            ...currentSet,
            {
              dpointsetId: getRandomID(),
              ...getFramesetDPoint(dpointSeparator),
            },
          ],
        ];
      }
      return [
        {
          bitsCount: cursors.bitsCount + bitCountToCurrentSetMWDDPoint,
          lastIndex: cursors.lastIndex,
        },
        currentSet,
      ];
    } else {
      // If the current set has an mwd dpoint, we update the lastIndex and reset the bit count
      return [
        {
          bitsCount: 0,
          lastIndex:
            cursors.lastIndex === -1
              ? currentSetMWDDPointIndex
              : cursors.lastIndex + currentSetMWDDPointIndex,
        },
        currentSet,
      ];
    }
  }
}
