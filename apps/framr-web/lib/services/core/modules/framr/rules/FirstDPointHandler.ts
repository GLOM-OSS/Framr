import { FramesetDpoint, GeneratorConfigRule } from '../../../../../types';
import { FrameEnum, StandAloneRuleEnum } from '../../../../../types/enums';
import { getRandomID } from '../../common/common';
import { rulePredicate } from '../RulesHandler';

export class FirstDPointHandler {
  constructor(private readonly frame: FrameEnum) {}

  /**
   * Handles the ordering of data points intended to be first, considering conflicts and applying rules.
   * @param firstDPoints Array of data points intended to be first.
   * @param rules Generator config rules.
   */
  handle(firstDPoints: FramesetDpoint[], rules: GeneratorConfigRule[]) {
    const orderedFirstDPoints: FramesetDpoint[] = [];

    firstDPoints.forEach((dpoint) => {
      const conflictingRule = rules.find((rule) =>
        rulePredicate(
          this.frame,
          rule,
          [StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST],
          dpoint.id
        )
      );
      if (conflictingRule) {
        const alternativeDPoint = firstDPoints.find(
          (dp) =>
            !rules.some((rule) =>
              rulePredicate(
                this.frame,
                rule,
                [StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST],
                dp.id
              )
            )
        );
        if (alternativeDPoint) {
          orderedFirstDPoints.push(alternativeDPoint);
        } else {
          orderedFirstDPoints.push({
            ...dpoint,
            error: `No eligible data point found for the first position`,
          });
        }
      }
      orderedFirstDPoints.push({
        ...dpoint,
        error:
          firstDPoints.length > 1
            ? `There should not be more than one first DPoint`
            : undefined,
      });
    });
    const dpointsetId = getRandomID();
    return orderedFirstDPoints.map((dpoint) => ({
      ...dpoint,
      dpointsetId,
    }));
  }
}
