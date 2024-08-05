import { DPointsetDPoint, GeneratorConfigRule } from '../../../../../types';
import { FrameEnum, StandAloneRuleEnum } from '../../../../../types/enums';
import { rulePredicate } from '../RulesHandler';

export class FirstDPointHandler {
  constructor(private readonly frame: FrameEnum) {}

  /**
   * Handles the ordering of data points intended to be first, considering conflicts and applying rules.
   * @param firstDPointsets Array of data point sets intended to be first dpoint set.
   * @param rules Generator config rules.
   */
  handle(
    firstDPointsets: DPointsetDPoint[][],
    rules: GeneratorConfigRule[]
  ): DPointsetDPoint[] {
    const [firstDPointset] = firstDPointsets;
    let orderedFirstDPoints: DPointsetDPoint[] = [];

    const conflictingRule = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST],
        firstDPointset[0]?.dpointId
      )
    );
    const isShouldBeFirstSet = rules.find((rule) =>
      firstDPointset.some((dpoint) =>
        rulePredicate(
          this.frame,
          rule,
          [StandAloneRuleEnum.SHOULD_BE_THE_FIRST],
          dpoint.dpointId
        )
      )
    );

    if (conflictingRule) {
      const alternativeSet = firstDPointsets.find(
        (dp) =>
          !rules.some((rule) =>
            rulePredicate(
              this.frame,
              rule,
              [StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST],
              dp[0].dpointId
            )
          )
      );
      if (alternativeSet) {
        orderedFirstDPoints.push(
          ...alternativeSet,
          ...firstDPointsets
            .filter(
              (dpoint) =>
                !dpoint.some((dp) =>
                  alternativeSet.some((altDP) => (dp.id = altDP.id))
                )
            )
            .flat()
        );
      } else {
        orderedFirstDPoints = firstDPointsets.flat().map((dpoint) => ({
          ...dpoint,
          error: isShouldBeFirstSet
            ? `No eligible data point found for the first position`
            : dpoint.error,
        }));
      }
    } else {
      orderedFirstDPoints = firstDPointsets.flat().map((dpoint) => ({
        ...dpoint,
        error:
          isShouldBeFirstSet && firstDPointsets.length > 1
            ? `There should not be more than one first DPoint`
            : dpoint.error,
      }));
    }

    return orderedFirstDPoints;
  }
}
