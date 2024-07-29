import { DPoint, DPointsetDPoint } from '../../../../../types';
import { ToolEnum } from '../../../../../types/enums';
import { getRandomID } from '../../common/common';
import { getFramesetDPoint, SeparatorOptions } from '../RulesHandler';

export class EightyBitsRuleHandler {
  /**
   * Handles rules related to 80 bits constraints for MWD data points.
   * @param mwdSeparator Array of MWD data points.
   * @param cursors Spreading cursors containing bit count, last index, and data point index.
   * @param generatorConfig Generator configuration.
   * @returns Object containing updated cursors and MWD data points.
   */
  handle(
    cursors: SeparatorOptions & { separator: DPoint },
    [currentDPointset, nextDPointset]: [
      currentSet: DPointsetDPoint[],
      nextSet: DPointsetDPoint[]
    ],
    orderedDPoints: DPointsetDPoint[]
  ) {
    const BITS_LIMIT = 80;

    const currentDPointsetBitCount = currentDPointset.reduce(
      (count, dpoint) => count + dpoint.bits,
      0
    );
    const currentDPointsetLastDPointIndex = currentDPointset.length - 1;
    const dpointsetLastDPointIndex = orderedDPoints.findIndex(
      (dpoint) =>
        dpoint.id === currentDPointset[currentDPointsetLastDPointIndex]?.id
    );
    // checks that there's no mwd dpoint in the current 80 bit block
    const orderedMWDDPointIndex = orderedDPoints.findIndex(
      (_, index) =>
        _.tool.id === cursors.separator.tool.id &&
        index > cursors.lastIndex &&
        index <= dpointsetLastDPointIndex
    );
    if (orderedMWDDPointIndex === -1) {
      // get next dpoint set bit count
      const nextDPointsetBitCount = nextDPointset.reduce(
        (count, dpoint) => dpoint.bits + count,
        0
      );
      if (cursors.bitsCount + nextDPointsetBitCount >= BITS_LIMIT) {
        // get bit count to next mwd dpoint
        let bitCountToNextMWDPoint = 0;
        let nextDPointsetHasMWDDPoint = false;
        for (const dpoint of nextDPointset) {
          bitCountToNextMWDPoint += dpoint.bits;
          if (dpoint.tool.type === ToolEnum.MWD) {
            nextDPointsetHasMWDDPoint = true;
            break;
          }
        }

        if (
          !nextDPointsetHasMWDDPoint ||
          cursors.bitsCount + bitCountToNextMWDPoint > BITS_LIMIT
        ) {
          const nextDPointsetFirstDPointPosition = orderedDPoints.findIndex(
            (dpoint) => nextDPointset[0]?.id === dpoint.id
          );
          orderedDPoints.splice(nextDPointsetFirstDPointPosition - 1, 0, {
            ...getFramesetDPoint(cursors.separator),
            dpointsetId: getRandomID(),
          });
          cursors.bitsCount = 0;
          cursors.lastIndex = nextDPointsetFirstDPointPosition - 1;
        }
      }
    }
    const newBitsCount = cursors.bitsCount + currentDPointsetBitCount;
    if (newBitsCount >= BITS_LIMIT) {
      if (newBitsCount === BITS_LIMIT) {
        cursors.lastIndex = dpointsetLastDPointIndex;
      } else {
        let currentsetLastValidDPointData: {
          dpoint: DPointsetDPoint | undefined;
          count: number;
        } = {
          dpoint: undefined,
          count: cursors.bitsCount,
        };
        for (const dpoint of currentDPointset) {
          const ttt = currentsetLastValidDPointData.count + dpoint.bits;
          if (ttt > BITS_LIMIT) {
            break;
          } else if (ttt === BITS_LIMIT) {
            currentsetLastValidDPointData = { dpoint, count: ttt };
            break;
          } else {
            currentsetLastValidDPointData = { dpoint, count: ttt };
          }
        }

        cursors.lastIndex = orderedDPoints.findIndex(
          (dpoint) => dpoint.id === currentsetLastValidDPointData.dpoint?.id
        );
      }
      cursors.bitsCount = 0;
    } else cursors.bitsCount = newBitsCount;
  }
}
