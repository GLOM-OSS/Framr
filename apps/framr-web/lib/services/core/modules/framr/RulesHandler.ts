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

type BitConstraintDPoint = {
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

  constructor(private readonly frame?: FrameEnum) {}

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
   * @returns 0 if conflicting rules apply, 1 otherwise.
   */
  handleDPointRules(dpoint: FramesetDpoint, rules: GeneratorConfigRule[]) {
    const precededByRule = rules.find((rule) =>
      this.rulePredicate(rule, dpoint.id, [
        WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER,
        WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
      ])
    ) as RuleWithOtherDPoint | undefined;
    const followedByRule = rules.find((rule) =>
      this.rulePredicate(rule, dpoint.id, [
        WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER,
        WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER,
      ])
    ) as RuleWithOtherDPoint | undefined;

    if (
      precededByRule &&
      followedByRule &&
      precededByRule.otherDpoints.some((otherDPoint) =>
        followedByRule.otherDpoints.some((_) => _.id === otherDPoint.id)
      )
    ) {
      // If both preceded by and followed by rules exist, mark the data point with an error
      this.orderedDPoints.push({
        ...dpoint,
        error: `Dpoint cannot be both preceded by and followed by the same other DPoint`,
      });
      return 0;
    } else {
      // Add the data point to the ordered list if no conflicting rule applies
      if (!this.orderedDPoints.some((dp) => dp.id === dpoint.id)) {
        this.orderedDPoints.push(dpoint);
      }
      const dpointPosition = this.orderedDPoints.findIndex(
        (dp) => dp.id === dpoint.id
      );
      const result = this.handleProhibitiveRules(dpointPosition, dpoint, rules);
      if (result === 0) return 0;

      if (followedByRule) {
        this.handleSequentialRule(dpointPosition + 1, followedByRule, rules);
      }

      if (precededByRule) {
        this.handleSequentialRule(dpointPosition, precededByRule, rules);
      }

      const shouldBeSetOnly = rules.find((rule) =>
        this.rulePredicate(rule, dpoint.id, [
          WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY,
        ])
      ) as RuleWithOtherDPoint | undefined;

      if (shouldBeSetOnly) {
        return this.handleSetOnlyRule(
          dpointPosition,
          dpoint,
          shouldBeSetOnly,
          rules,
          precededByRule,
          followedByRule
        );
      }
      return 1;
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
      Math.floor(cursors.bitsCount / BITS_LIMIT) * BITS_LIMIT;
    if (closestBitLimitMultiple <= cursors.bitsCount) {
      const index = this.orderedDPoints.findIndex(
        (_, index) =>
          _.tool.id === generatorConfig.MWDTool.id && index > cursors.lastIndex
      );
      if (index !== -1) {
        mwdDPoints = mwdDPoints.filter(
          (_) => _.id !== this.orderedDPoints[index].id
        );
      } else {
        const mwdDPointIndex = cursors.dpointIndex % (mwdDPoints.length - 1);
        this.orderedDPoints.push({
          ...mwdDPoints[mwdDPointIndex],
          isBaseInstance:
            Math.floor(cursors.dpointIndex / (mwdDPoints.length - 1)) <= 1,
        });
        cursors.lastIndex = this.orderedDPoints.length - 1;
        cursors.dpointIndex++;
      }
    }
    return { cursors, mwdDPoints };
  }

  /**
   * Handles rules with density or update rate constraints for data points.
   * @param dpoints Array of data points.
   * @param rules Generator config rules.
   * @param generatorConfig Generator configuration.
   * @returns Object containing non-constraint data points and bit constraint data points.
   */
  filterAndBuildBitConstraintData(
    dpoints: FramesetDpoint[],
    rules: GeneratorConfigRule[],
    generatorConfig: GeneratorConfig
  ) {
    const [constraintDPoints, nonConstraintDPoints] = partition(
      dpoints,
      (dpoint) =>
        rules.some((rule) =>
          this.rulePredicate(rule, dpoint.id, [
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
          ])
        )
    );

    const bitConstraintDPoints = constraintDPoints.map<BitConstraintDPoint>(
      (cdp) => {
        let bitInterval = 0;
        const densityConstraintRule = rules.find((rule) =>
          this.rulePredicate(rule, cdp.id, [
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
          ])
        ) as RuleWithConstraint | undefined;

        if (densityConstraintRule) {
          bitInterval =
            (densityConstraintRule.interval * generatorConfig.bitRate) /
            generatorConfig.penetrationRate;
        }

        const updateRateConstraintRule = rules.find((rule) =>
          this.rulePredicate(rule, cdp.id, [
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
      }
    );
    return { nonConstraintDPoints, bitConstraintDPoints };
  }

  handleBitContraintRule(
    dpoints: BitConstraintDPoint[],
    bitsCount: number,
    rules: GeneratorConfigRule[]
  ) {
    const otherDPoints: FramesetDpoint[] = [];
    dpoints
      .filter((bitCdp) => bitsCount >= bitCdp.lastCount + bitCdp.bitInterval)
      .forEach((cdp) => {
        const originalIndex = dpoints.findIndex(
          (_) => _.dpoint.id === cdp.dpoint.id
        );
        otherDPoints.push(cdp.dpoint);
        dpoints[originalIndex] = {
          ...cdp,
          lastCount: this.orderedDPoints.reduce(
            (bitsCount, _) => bitsCount + _.bits,
            0
          ),
        };
      });
    if (otherDPoints.length > 0) {
      const orderedDPoints = this.handleOtherDPointsRules(otherDPoints, rules);
      this.orderedDPoints.push(...orderedDPoints);
    }
  }

  handleOverloadingDPoints(generatorConfig: GeneratorConfig) {
    const { maxBits, maxDPoints } = generatorConfig.MWDTool;
    let bitsCount = 0;
    this.orderedDPoints = this.orderedDPoints.map((dpoint, i) => {
      bitsCount += dpoint.bits;
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
  private handleProhibitiveRules(
    dpointPosition: number,
    dpoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ) {
    const shouldNotBePrecededByOther = rules.some(
      (rule) =>
        this.rulePredicate(rule, dpoint.id, [
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER,
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER,
        ]) &&
        this.orderedDPoints.some((orderedDpoint, index) =>
          (rule as RuleWithOtherDPoint).otherDpoints.some(
            (otherDPoint) =>
              otherDPoint.id === orderedDpoint.id && index < dpointPosition
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
              otherDPoint.id === orderedDPoint.id && index > dpointPosition
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

  /**
   * Handles rules requiring sequential placement of data points relative to each other.
   * @param dpointPosition The position where dpoint should insert
   * @param sequentialRule This can either be a followed by or a preceded by rule
   * @param rules generator config rule
   */
  private handleSequentialRule(
    dpointPosition: number,
    sequentialRule: RuleWithOtherDPoint,
    rules: GeneratorConfigRule[]
  ): void {
    const otherDPoints = sequentialRule.otherDpoints.map<FramesetDpoint>(
      (dp) => ({
        ...dp,
        isBaseInstance: true,
      })
    );
    if (otherDPoints.length > 0) {
      const concernedDpointId = sequentialRule.concernedDpoint.id;
      const orderedOtherDPoints = this.handleOtherDPointsRules(
        otherDPoints,
        rules,
        concernedDpointId
      );
      this.orderedDPoints.splice(dpointPosition, 0, ...orderedOtherDPoints);
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
    dpointPosition: number,
    dpoint: FramesetDpoint,
    setOnlyRule: RuleWithOtherDPoint,
    rules: GeneratorConfigRule[],
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

    if (shouldInsertAfter || shouldInsertBefore) {
      const otherDPoints = setOnlyRuleOtherDPoints.map<FramesetDpoint>(
        (dpoint) => ({
          ...dpoint,
          isBaseInstance: true,
        })
      );
      if (otherDPoints.length > 0) {
        const orderedOtherDPoints = this.handleOtherDPointsRules(
          otherDPoints,
          rules,
          dpoint.id
        );
        this.orderedDPoints.splice(
          dpointPosition +
            (shouldInsertAfter
              ? followedByRuleCommonDPoints.length + 1
              : -precededByRuleCommonDPoints.length),
          0,
          ...orderedOtherDPoints
        );
      }
    } else {
      this.orderedDPoints.splice(dpointPosition, 1, {
        ...dpoint,
        error:
          'DPoints following or preceding DPoint are conflicting with DPoint set',
      });
      return 0;
    }
    return 1;
  }

  /**
   * Handles rules associated with other data points (nested within another rule),
   * recursively applying rules.
   * @param otherDPoints
   * @param rules
   * @returns an ordered list of dpoints
   */
  private handleOtherDPointsRules(
    otherDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[],
    concernedDpointId?: string
  ) {
    const nestedRuleHandler = new RulesHandler(this.frame);
    otherDPoints
      .filter((_) => _.id !== concernedDpointId)
      .forEach((dpoint) => nestedRuleHandler.handleDPointRules(dpoint, rules));
    return nestedRuleHandler.orderedDPoints;
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
