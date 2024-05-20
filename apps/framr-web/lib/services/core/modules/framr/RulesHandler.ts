import {
  DPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  Rule,
  RuleWithConstraint,
  RuleWithOtherDPoint,
} from '../../../../types';
import {
  FrameEnum,
  RuleEnumType,
  StandAloneRuleEnum,
  WithConstraintRuleEnum,
  WithOtherDPointRuleEnum,
} from '../../../../types/enums';
import { getRandomID } from '../common/common';

type DPointWithConstraint = {
  lastCount: number;
  bitInterval: number;
  dpoint: FramesetDpoint;
};

/**
 * Represents the number of bits, last index, and data point index for spreading cursors.
 */
export type SpreadingCursors = {
  bitsCount: number;
  lastIndex: number;
  dpointIndex: number;
};

/**
 * Partitions an array into two arrays based on a predicate function.
 * @param array The array to partition.
 * @param predicate A function that determines which array to partition the element into.
 * @returns An array containing two arrays,
 * one for elements satisfying the predicate and the other for elements not satisfying the predicate.
 */
export function partition<T>(
  array: T[],
  predicate: (value: T) => boolean
): [T[], T[]] {
  const trueArray: T[] = [];
  const falseArray: T[] = [];
  array.forEach((element) => {
    if (predicate(element)) {
      trueArray.push(element);
    } else {
      falseArray.push(element);
    }
  });
  return [trueArray, falseArray];
}

export function getFramesetDPoint(dpoint: DPoint): FramesetDpoint {
  return {
    ...dpoint,
    isBaseInstance: true,
    id: getRandomID(),
    dpointId: dpoint.id,
  };
}

export class RulesHandler {
  private _orderedDPoints: FramesetDpoint[] = [];

  /**
   * Gets the ordered data points.
   */
  public get orderedDPoints(): FramesetDpoint[] {
    return this._orderedDPoints;
  }

  /**
   * Sets the ordered data points.
   */
  public set orderedDPoints(value: FramesetDpoint[]) {
    this._orderedDPoints = value;
  }

  constructor(private readonly frame: FrameEnum) {}

  /**
   * Handles the ordering of data points intended to be first, considering conflicts and applying rules.
   * @param firstDPoints Array of data points intended to be first.
   * @param rules Generator config rules.
   */
  handleFirstDPoints(
    firstDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[]
  ) {
    const orderedFirstDPoints: FramesetDpoint[] = [];

    firstDPoints.forEach((dpoint) => {
      const conflictingRule = rules.find((rule) =>
        this.rulePredicate(rule, dpoint.id, [
          StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST,
        ])
      );
      if (conflictingRule) {
        const alternativeDPoint = firstDPoints.find(
          (dp) =>
            !rules.some((rule) =>
              this.rulePredicate(rule, dp.id, [
                StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST,
              ])
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

    this.orderedDPoints = [...orderedFirstDPoints];
  }

  /**
   * Handles rules related to an individual data point, including constraints and sequencing.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   */
  handleDPointRules(dpoint: FramesetDpoint, rules: GeneratorConfigRule[]) {
    const dpointSet = this.handleDPointSequencingRules(dpoint, rules);

    // Add the data point to the ordered list
    let iterator = this.orderedDPoints.length;
    if (iterator === 0) {
      this.orderedDPoints.push(...dpointSet);
    } else {
      while (iterator > 0) {
        iterator--;
        const suitablePostion = this.findDPointSuitablePosition(
          iterator,
          dpoint,
          rules
        );
        if (suitablePostion) {
          this.orderedDPoints.splice(suitablePostion, 0, ...dpointSet);
          break;
        }
      }
    }
    const dpointPosition = this.orderedDPoints.findIndex(
      (dp) => dp.id === dpoint.id
    );

    // handle should not rules
    this.handleProhibitiveRules(dpointPosition, dpoint, rules);
  }

  /**
   * Handles data point sequencing (preceded by, followed by, set only) rules.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   * @returns an array containing the dpoint and if applicable its other dpoints.
   */
  handleDPointSequencingRules(
    dpoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ): FramesetDpoint[] {
    const precededByRule = rules.find((rule) =>
      this.rulePredicate(rule, dpoint.dpointId, [
        WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
        WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
      ])
    ) as RuleWithOtherDPoint | undefined;

    const followedByRule = rules.find((rule) =>
      this.rulePredicate(rule, dpoint.dpointId, [
        WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
        WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
      ])
    ) as RuleWithOtherDPoint | undefined;

    const shouldBeSetOnly = rules.find((rule) =>
      this.rulePredicate(rule, dpoint.dpointId, [
        WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
      ])
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
      return shouldBePartOfSet ? [] : [dpoint];
    } else if (
      precededByRule &&
      followedByRule &&
      precededByRule.otherDpoints.some((otherDPoint) =>
        followedByRule.otherDpoints.some((_) => _.id === otherDPoint.id)
      )
    ) {
      // If both preceded by and followed by rules exist, mark the data point with an error
      return [
        {
          ...dpoint,
          error: `Dpoint cannot be both preceded by and followed by the same other DPoint`,
        },
      ];
    } else {
      const dpointSet: FramesetDpoint[] = [];

      if (followedByRule) {
        dpointSet.push(
          dpoint,
          ...followedByRule.otherDpoints.map((dpoint) =>
            getFramesetDPoint(dpoint)
          )
        );
      }

      if (precededByRule) {
        dpointSet.push(
          ...precededByRule.otherDpoints.map((dpoint) =>
            getFramesetDPoint(dpoint)
          ),
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
        if (shouldInsertAfter) {
          dpointSet.push(...otherDPoints);
        } else if (shouldInsertBefore) {
          dpointSet.unshift(...otherDPoints);
        } else {
          return [
            {
              ...dpoint,
              error:
                'DPoints following or preceding DPoint are conflicting with DPoint set',
            },
          ];
        }
      }
      return dpointSet;
    }
  }

  /**
   * Handles rules related to 80 bit constraints for MWD data points.
   * @param mwdDPoints Array of MWD data points.
   * @param cursors Spreading cursors containing bit count, last index, and data point index.
   * @param generatorConfig Generator configuration.
   * @returns Object containing updated cursors and MWD data points.
   */
  handle80BitsRule(
    mwdDPoints: DPoint[],
    cursors: SpreadingCursors,
    generatorConfig: GeneratorConfig
  ) {
    const BITS_LIMIT = 80;

    const closestBitLimitMultiple =
      Math.round(cursors.bitsCount / BITS_LIMIT) * BITS_LIMIT;
    if (closestBitLimitMultiple <= cursors.bitsCount) {
      const index = this.orderedDPoints.findIndex(
        (_, index) =>
          _.tool.id === generatorConfig.MWDTool.id && index > cursors.lastIndex
      );
      if (index === -1) {
        const mwdDPointIndex = cursors.dpointIndex % mwdDPoints.length;
        const dpoint = mwdDPoints[mwdDPointIndex];
        if (dpoint) {
          this.orderedDPoints.push({
            ...getFramesetDPoint(dpoint),
            isBaseInstance: cursors.dpointIndex / mwdDPoints.length < 1,
          });
          cursors.lastIndex = this.orderedDPoints.length - 1;
          cursors.dpointIndex++;
        }
      }
    }
    return { cursors, mwdDPoints };
  }

  /**
   * Resolved density and update rate constraints a single type of constraint depending on bits interval.
   * @param dpoints Array of data points.
   * @param rules Generator config rules.
   * @param generatorConfig Generator configuration.
   * @returns Object containing non-constraint data points and bit constraint data points.
   */
  resolveDPointConstraints(
    constraintDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[],
    generatorConfig: GeneratorConfig
  ): DPointWithConstraint[] {
    return constraintDPoints.map<DPointWithConstraint>((cdp) => {
      let bitInterval = 0;
      const densityConstraintRule = rules.find((rule) =>
        this.rulePredicate(rule, cdp.dpointId, [
          WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
        ])
      ) as RuleWithConstraint | undefined;

      if (densityConstraintRule) {
        bitInterval =
          (densityConstraintRule.interval * generatorConfig.bitRate) /
          generatorConfig.penetrationRate;
      }

      const updateRateConstraintRule = rules.find((rule) =>
        this.rulePredicate(rule, cdp.dpointId, [
          WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
        ])
      ) as RuleWithConstraint | undefined;

      if (updateRateConstraintRule) {
        bitInterval =
          updateRateConstraintRule.interval * generatorConfig.bitRate;
      }

      return {
        lastCount: -1,
        bitInterval,
        dpoint: {
          ...cdp,
          error:
            bitInterval === 0
              ? 'Invalid interval constraint'
              : densityConstraintRule && updateRateConstraintRule
              ? 'Update rate and density rate should not complementary'
              : undefined,
        },
      };
    });
  }

  handleDPointsWithContraint(
    dpoints: DPointWithConstraint[],
    bitsCount: number,
    rules: GeneratorConfigRule[]
  ) {
    dpoints
      .filter((bitCdp) => bitsCount >= bitCdp.lastCount + bitCdp.bitInterval)
      .forEach((cdp) => {
        const originalIndex = dpoints.findIndex(
          (_) => _.dpoint.id === cdp.dpoint.id
        );
        const dpointSet = this.handleDPointSequencingRules(
          { ...cdp.dpoint, id: getRandomID() },
          rules
        );
        this.orderedDPoints.push(...dpointSet);
        dpoints[originalIndex] = {
          ...cdp,
          lastCount: this.orderedDPoints.reduce(
            (bitsCount, _) => bitsCount + _.bits,
            0
          ),
        };
      });
  }

  handleOverloadingDPoints(maxBits: number, maxDPoints: number) {
    let bitsCount = 0;
    this.orderedDPoints = this.orderedDPoints.map((dpoint, i) => {
      bitsCount += Number(dpoint.bits);
      return {
        ...dpoint,
        error:
          bitsCount > maxBits
            ? `Frameset is overloaded with ${maxBits - bitsCount} bits`
            : i + 1 > maxDPoints
            ? `Frameset is overloaded with ${maxDPoints - (i + 1)} data points`
            : undefined,
      };
    });
  }

  /**
   * Handles rules that prohibit certain sequences or configurations of data points.
   * @param dpointPosition The position where dpoint should insert
   * @param dpoint data point
   * @param rules generator config rule
   * @returns 0 if the dpoint has an error and 1 if everything went well
   */
  handleProhibitiveRules(
    dpointPosition: number,
    dpoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ) {
    const shouldNotBePrecededByOther = rules.some(
      (rule) =>
        this.rulePredicate(rule, dpoint.dpointId, [
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER,
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
        ]) &&
        this.orderedDPoints.some((orderedDpoint, index) =>
          (rule as RuleWithOtherDPoint).otherDpoints.some(
            (otherDPoint) =>
              otherDPoint.id === orderedDpoint.dpointId &&
              index < dpointPosition
          )
        )
    );

    const shouldNotBeFollowedByOther = rules.some(
      (rule) =>
        this.rulePredicate(rule, null, [
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER,
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
        ]) &&
        this.orderedDPoints.some((orderedDPoint, index) =>
          (rule as RuleWithOtherDPoint).otherDpoints.some(
            (otherDPoint) =>
              otherDPoint.id === orderedDPoint.dpointId &&
              index > dpointPosition
          )
        )
    );

    if (shouldNotBePrecededByOther || shouldNotBeFollowedByOther) {
      // If the data point should not be preceded by or followed by other DPoints, mark it with an error
      this.orderedDPoints.splice(dpointPosition, 1, {
        ...dpoint,
        error: `Dpoint cannot be ${
          shouldNotBePrecededByOther ? 'preceded by' : 'followed by'
        } other specified DPoints`,
      });
      return 0;
    }
    return 1;
  }

  findDPointSuitablePosition(
    iterator: number,
    curentDPoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ) {
    const previousDPoint = this.orderedDPoints[iterator];
    if (
      rules.some(
        (rule) =>
          rule.concernedDpoint.id === previousDPoint.dpointId &&
          StandAloneRuleEnum.SHOULD_BE_THE_FIRST === rule.description
      )
    ) {
      return this.orderedDPoints.length;
    } else if (
      rules.some(
        (rule) =>
          (this.rulePredicate(rule, previousDPoint.dpointId, [
            WithOtherDPointRuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
          ]) &&
            (rule as RuleWithOtherDPoint).otherDpoints.some(
              (_) => _.id === curentDPoint.dpointId
            )) ||
          (this.rulePredicate(rule, curentDPoint.dpointId, [
            WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
          ]) &&
            (rule as RuleWithOtherDPoint).otherDpoints.some(
              (_) => _.id === previousDPoint.dpointId
            )) ||
          (this.rulePredicate(rule, previousDPoint.dpointId, [
            WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
          ]) &&
            !(rule as RuleWithOtherDPoint).otherDpoints.some(
              (_) => _.id === curentDPoint.dpointId
            )) ||
          (this.rulePredicate(rule, curentDPoint.dpointId, [
            WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
            WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
          ]) &&
            !(rule as RuleWithOtherDPoint).otherDpoints.some(
              (_) => _.id === previousDPoint.dpointId
            ))
      )
    ) {
      console.log(iterator, previousDPoint, curentDPoint);
      // moves the point one steps up if there is a rule that forbits
      // that it should be preceded by the previous or that the previous should
      // should be followed by the current dpoint
      if (
        !rules.some(
          (rule) =>
            (this.rulePredicate(rule, previousDPoint.dpointId, [
              WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
            ]) &&
              (rule as RuleWithOtherDPoint).otherDpoints.some(
                (_) => _.id === this.orderedDPoints[iterator - 1]?.dpointId
              )) ||
            (WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY ===
              rule.description &&
              rule.otherDpoints.some((_) => _.id === previousDPoint.dpointId))
        )
      ) {
        return iterator;
      }
    } else {
      return this.orderedDPoints.length;
    }
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

  private rulePredicate(
    rule: Rule,
    dpointId: string | null,
    ruleDescriptions: RuleEnumType[]
  ) {
    return (
      (dpointId ? rule.concernedDpoint.id === dpointId : true) &&
      (this.frame ? rule.framesets.includes(this.frame) : true) &&
      ruleDescriptions.includes(rule.description)
    );
  }
}
