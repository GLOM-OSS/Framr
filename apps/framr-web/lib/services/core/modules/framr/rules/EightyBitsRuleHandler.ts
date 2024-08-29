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
    //   if (
    //     cursors.bitsCount + currentSetBitCount + nextSetBitCount >=
    //     BITS_LIMIT
    //   ) {
    //     // get bit count to next mwd dpoint
    //     let bitCountToNextMWDDPoint = 0;
    //     let nextSetHasMWDDPoint = false;
    //     for (const dpoint of nextSet) {
    //       bitCountToNextMWDDPoint += dpoint.bits;
    //       if (dpoint.tool.type === ToolEnum.MWD) {
    //         nextSetHasMWDDPoint = true;
    //         break;
    //       }
    //     }

    //     if (
    //       !nextSetHasMWDDPoint ||
    //       cursors.bitsCount + bitCountToNextMWDDPoint > BITS_LIMIT
    //     ) {
    //       const nextDPointsetFirstDPointPosition = orderedDPoints.findIndex(
    //         (dpoint) => nextSet[0]?.id === dpoint.id
    //       );
    //       orderedDPoints.splice(nextDPointsetFirstDPointPosition - 1, 0, {
    //         ...getFramesetDPoint(dpointSeparator),
    //         dpointsetId: getRandomID(),
    //       });
    //       cursors.bitsCount = 0;
    //       cursors.lastIndex = nextDPointsetFirstDPointPosition - 1;
    //     }
    //   }
    // }
    // const newBitsCount = cursors.bitsCount + currentSetBitCount;
    // if (newBitsCount >= BITS_LIMIT) {
    //   if (newBitsCount === BITS_LIMIT) {
    //     cursors.lastIndex = currentSetLastDPointIndex;
    //   } else {
    //     let currentsetLastValidDPointData: {
    //       dpoint: DPointsetDPoint | undefined;
    //       count: number;
    //     } = {
    //       dpoint: undefined,
    //       count: cursors.bitsCount,
    //     };
    //     for (const dpoint of currentSet) {
    //       const ttt = currentsetLastValidDPointData.count + dpoint.bits;
    //       if (ttt > BITS_LIMIT) {
    //         break;
    //       } else if (ttt === BITS_LIMIT) {
    //         currentsetLastValidDPointData = { dpoint, count: ttt };
    //         break;
    //       } else {
    //         currentsetLastValidDPointData = { dpoint, count: ttt };
    //       }
    //     }

    //     cursors.lastIndex = orderedDPoints.findIndex(
    //       (dpoint) => dpoint.id === currentsetLastValidDPointData.dpoint?.id
    //     );
    //   }
    //   cursors.bitsCount = 0;
    // } else cursors.bitsCount = newBitsCount;
  }
}
