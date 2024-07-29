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
import { getFramesetDPoint, partition, rulePredicate } from '../RulesHandler';
import { getRandomID } from '../../common/common';

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
      const shouldBePartOfSet = rules.some(
        (rule) =>
          [
            WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
            WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
          ].includes(rule.description as WithOtherDPointRuleEnum) &&
          (rule as RuleWithOtherDPoint).otherDpoints.some(
            (_) => _.id === dpoint.dpointId
          )
      );
      newDPointSet = shouldBePartOfSet
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
            .filter((dpoint) =>
              rules.some((rule) =>
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
        const {
          setOnlyRuleOtherDPoints,
          shouldInsertAfter,
          shouldInsertBefore,
        } = this.handleSetOnlyRule(
          shouldBeSetOnly,
          precededByRule,
          followedByRule
        );
        const otherDPoints = setOnlyRuleOtherDPoints.map<FramesetDpoint>(
          (dpoint) => getFramesetDPoint(dpoint)
        );
        if (shouldInsertAfter || shouldInsertBefore) {
          if (shouldInsertAfter) {
            dpointSet.push(...otherDPoints);
          } else {
            dpointSet.unshift(...otherDPoints);
          }
          newDPointSet = dpointSet.map((dpoint) => ({
            ...dpoint,
            dpointsetId,
          }));
        } else {
          newDPointSet = [
            {
              ...dpoint,
              dpointsetId,
              error:
                'DPoints following or preceding DPoint are conflicting with DPoint set',
            },
          ];
        }
      } else
        newDPointSet = dpointSet.map((dpoint) => ({
          ...dpoint,
          dpointsetId,
        }));
    }

    return newDPointSet.filter((dpoint) =>
      rules.some((rule) => {
        return (
          rule.concernedDpoint.id !== dpoint.dpointId ||
          rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT
        );
      })
    );
  }

  /**
   *  Handles rules where a data point should be present in a set only under certain conditions.
   * @param dpointPosition The position where to insert the dpoint
   * @param dpoint data point
   * @param setOnlyRule
   * @param rules generator config rule
   * @param precededByRule
   * @param followedByRule
   * @returns 0 if the dpoint has an error and 1 if everything went well
   */
  private handleSetOnlyRule(
    setOnlyRule: RuleWithOtherDPoint,
    precededByRule?: RuleWithOtherDPoint,
    followedByRule?: RuleWithOtherDPoint
  ) {
    const [precededByRuleCommonDPoints, uncommonOtherDPoints1] = partition(
      setOnlyRule.otherDpoints,
      (otherDPoint) =>
        !!precededByRule?.otherDpoints.some((_) => _.id === otherDPoint.id)
    );
    const [followedByRuleCommonDPoints, setOnlyRuleOtherDPoints] = partition(
      uncommonOtherDPoints1,
      (otherDPoint) =>
        !!followedByRule?.otherDpoints.some((_) => _.id === otherDPoint.id)
    );
    const shouldInsertAfter =
      followedByRuleCommonDPoints.length === 0 ||
      followedByRuleCommonDPoints.length ===
        followedByRule?.otherDpoints.length;
    const shouldInsertBefore =
      precededByRuleCommonDPoints.length === 0 ||
      precededByRuleCommonDPoints.length ===
        precededByRule?.otherDpoints.length;

    return { setOnlyRuleOtherDPoints, shouldInsertAfter, shouldInsertBefore };
  }
}
