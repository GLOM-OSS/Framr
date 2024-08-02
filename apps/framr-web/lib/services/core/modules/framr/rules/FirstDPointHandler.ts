import { DPointsetDPoint, GeneratorConfigRule } from '../../../../../types';
import { FrameEnum, StandAloneRuleEnum } from '../../../../../types/enums';
import { rulePredicate } from '../RulesHandler';

export class FirstDPointHandler {
  constructor(private readonly frame: FrameEnum) {}

  /**
   * Handles the ordering of data points intended to be first, considering conflicts and applying rules.
   * @param firstDPoints Array of data points intended to be first.
   * @param rules Generator config rules.
   */
  handle(
    firstDPoints: DPointsetDPoint[],
    rules: GeneratorConfigRule[]
  ): DPointsetDPoint[] {
    const [firstDPoint] = firstDPoints;
    let orderedFirstDPoints: DPointsetDPoint[] = [];

    const conflictingRule = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST],
        firstDPoint?.dpointId
      )
    );
    const shouldBeFirst = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [StandAloneRuleEnum.SHOULD_BE_THE_FIRST],
        firstDPoint?.dpointId
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
              dp.dpointId
            )
          )
      );
      if (alternativeDPoint) {
        orderedFirstDPoints.push(
          alternativeDPoint,
          ...firstDPoints.filter((dpoint) => dpoint.id !== alternativeDPoint.id)
        );
      } else {
        orderedFirstDPoints = firstDPoints.map((dpoint) => ({
          ...dpoint,
          error: shouldBeFirst
            ? `No eligible data point found for the first position`
            : dpoint.error,
        }));
      }
    } else {
      orderedFirstDPoints = firstDPoints.map((dpoint) => ({
        ...dpoint,
        error:
          shouldBeFirst && firstDPoints.length > 1
            ? `There should not be more than one first DPoint`
            : dpoint.error,
      }));
    }

    return orderedFirstDPoints;
  }
}
