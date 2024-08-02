import {
  DPointsetDPoint,
  FramesetDpoint,
  GeneratorConfigRule,
  RuleWithOtherDPoint,
} from '../../../../../types';
import {
  FrameEnum,
  StandAloneRuleEnum,
  WithOtherDPointRuleEnum,
} from '../../../../../types/enums';
import { getRandomID } from '../../common/common';
import { getFramesetDPoint, rulePredicate } from '../RulesHandler';

export class DPointsetHandler {
  constructor(private readonly frame: FrameEnum) {}

  /**
   * Handles data point sequencing (preceded by, followed by, set only) rules.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   * @returns an array containing the dpoint and if applicable its other dpoints.
   */
  handle(
    dpoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ): DPointsetDPoint[] {
    let newDPointSet: DPointsetDPoint[] = [];
    const precededByRule = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [
          WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
          WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
        ],
        dpoint.dpointId
      )
    ) as RuleWithOtherDPoint | undefined;

    const followedByRule = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [
          WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
          WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
        ],
        dpoint.dpointId
      )
    ) as RuleWithOtherDPoint | undefined;

    const shouldBeSetOnly = rules.find((rule) =>
      rulePredicate(
        this.frame,
        rule,
        [WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY],
        dpoint.dpointId
      )
    ) as RuleWithOtherDPoint | undefined;

    if (!followedByRule && !precededByRule && !shouldBeSetOnly) {
      const isPartOfDPointSet = rules.some(
        (rule) =>
          rulePredicate(this.frame, rule, [
            WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
            WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
          ]) &&
          (rule as RuleWithOtherDPoint).otherDpoints.some(
            (_) => _.id === dpoint.dpointId
          )
      );
      newDPointSet = isPartOfDPointSet
        ? []
        : [{ ...dpoint, dpointsetId: getRandomID() }];
    } else if (precededByRule && followedByRule) {
      const dpointsetId = getRandomID();
      newDPointSet = [
        ...precededByRule.otherDpoints.map((dpoint) =>
          getFramesetDPoint(dpoint)
        ),
        dpoint,
        ...followedByRule.otherDpoints.map((dpoint) =>
          getFramesetDPoint(dpoint)
        ),
      ].map((dpoint) => ({
        ...dpoint,
        dpointsetId,
      }));
    } else {
      const dpointSet: FramesetDpoint[] = [];
      const dpointsetId = getRandomID();

      if (followedByRule) {
        dpointSet.push(
          dpoint,
          ...followedByRule.otherDpoints
            .filter(
              (dpoint) =>
                !rules.some((rule) =>
                  rulePredicate(
                    this.frame,
                    rule,
                    [
                      WithOtherDPointRuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER,
                      WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
                    ],
                    dpoint.id
                  )
                )
            )
            .map((dpoint) => getFramesetDPoint(dpoint))
        );
      }

      if (precededByRule) {
        dpointSet.push(
          ...precededByRule.otherDpoints
            .filter(
              (dpoint) =>
                !rules.some((rule) =>
                  rulePredicate(
                    this.frame,
                    rule,
                    [
                      WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER,
                      WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
                    ],
                    dpoint.id
                  )
                )
            )
            .map((dpoint) => getFramesetDPoint(dpoint)),
          dpoint
        );
      }

      if (shouldBeSetOnly) {
        const otherDPoints = shouldBeSetOnly.otherDpoints
          .filter(
            (otherDPoint) =>
              !(
                precededByRule?.otherDpoints.some(
                  (_) => _.id === otherDPoint.id
                ) ||
                followedByRule?.otherDpoints.some(
                  (_) => _.id === otherDPoint.id
                )
              )
          )
          .map<FramesetDpoint>((dpoint) => getFramesetDPoint(dpoint));

        newDPointSet = [...dpointSet, ...otherDPoints].map((dpoint) => ({
          ...dpoint,
          dpointsetId,
        }));
      } else
        newDPointSet = dpointSet.map((dpoint) => ({
          ...dpoint,
          dpointsetId,
        }));

      if (!newDPointSet.find((dp) => dp.id === dpoint.id)) {
        newDPointSet.push({ ...dpoint, dpointsetId });
      }
    }

    return newDPointSet.filter(
      (dpoint) =>
        !rules.some((rule) => {
          return rulePredicate(
            this.frame,
            rule,
            [StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT],
            dpoint.dpointId
          );
        })
    );
  }
}
