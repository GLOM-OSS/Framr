import {
  DPoint,
  DPointsetDPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  Rule,
  RuleWithOtherDPoint,
} from '../../../../types';
import {
  FrameEnum,
  RuleEnumType,
  StandAloneRuleEnum,
  WithOtherDPointRuleEnum,
} from '../../../../types/enums';
import { getRandomID } from '../common/common';
import { DPointConstrainstHandler } from './rules/DPointConstraintsHandler';
import { DPointsetHandler } from './rules/DPointsetHandler';
import { EightyBitsRuleHandler } from './rules/EightyBitsRuleHandler';
import { FirstDPointHandler } from './rules/FirstDPointHandler';

export type DPointWithConstraint = {
  lastCount: number;
  bitInterval: number;
  dpoint: FramesetDpoint;
};

/**
 * Represents the number of bits, last index, and data point index for spreading cursors.
 */
export type SeparatorOptions = {
  bitsCount: number;
  lastIndex: number;
  separator: DPoint;
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

export function rulePredicate(
  frame: FrameEnum,
  rule: Rule,
  ruleDescriptions: RuleEnumType[],
  dpointId: string | null
) {
  return (
    (dpointId ? rule.concernedDpoint.id === dpointId : true) &&
    (frame ? rule.framesets.includes(frame) : true) &&
    ruleDescriptions.includes(rule.description)
  );
}

export class RulesHandler {
  private _orderedDPoints: DPointsetDPoint[] = [];

  /**
   * Gets the ordered data points.
   */
  public get orderedDPoints(): DPointsetDPoint[] {
    return this._orderedDPoints;
  }

  /**
   * Sets the ordered data points.
   */
  public set orderedDPoints(value: DPointsetDPoint[]) {
    this._orderedDPoints = value;
  }

  private readonly dpointsetHandler: DPointsetHandler;
  private readonly firstDPointHandler: FirstDPointHandler;
  private readonly eightyBitsRuleHandler: EightyBitsRuleHandler;
  private readonly dpointConstraintsHandler: DPointConstrainstHandler;

  constructor(private readonly frame: FrameEnum) {
    this.dpointsetHandler = new DPointsetHandler(this.frame);
    this.eightyBitsRuleHandler = new EightyBitsRuleHandler();
    this.firstDPointHandler = new FirstDPointHandler(this.frame);
    this.dpointConstraintsHandler = new DPointConstrainstHandler(
      this.frame,
      this.dpointsetHandler
    );
  }

  /**
   * Handles the ordering of data points intended to be first, considering conflicts and applying rules.
   * @param firstDPoints Array of data points intended to be first.
   * @param rules Generator config rules.
   */
  handleFirstDPoints(
    firstDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[]
  ) {
    this.orderedDPoints = this.firstDPointHandler.handle(firstDPoints, rules);
  }

  /**
   * Handles rules related to an individual data point, including constraints and sequencing.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   */
  handleDPointRules(dpoint: FramesetDpoint, rules: GeneratorConfigRule[]) {
    const dpointSet = this.dpointsetHandler.handle(dpoint, rules);
    this.orderedDPoints.push(...dpointSet);

    // Add the data point to the ordered list
    // let iterator = this.orderedDPoints.length;
    // if (iterator === 0) {
    //   this.orderedDPoints.push(...dpointSet);
    // } else {
    //   while (iterator > 0) {
    //     iterator--;
    //     const suitablePostion = this.findDPointSuitablePosition(
    //       iterator,
    //       dpoint,
    //       rules
    //     );
    //     if (suitablePostion) {
    //       this.orderedDPoints.splice(suitablePostion, 0, ...dpointSet);
    //       break;
    //     }
    //   }
    // }
  }

  /**
   * Handles data point sequencing (preceded by, followed by, set only) rules.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   * @returns an array containing the dpoint and if applicable its other dpoints.
   */
  handleDPointset(
    dpoint: FramesetDpoint,
    rules: GeneratorConfigRule[]
  ): DPointsetDPoint[] {
    return this.dpointsetHandler.handle(dpoint, rules);
  }

  /**
   * Handles rules related to 80 bit constraints for MWD data points.
   * @param mwdSeparator Array of MWD data points.
   * @param separatorOptions Spreading cursors containing bit count, last index, and data point index.
   * @param generatorConfig Generator configuration.
   * @returns Object containing updated cursors and MWD data points.
   */
  handle80BitsRule(
    separatorOptions: SeparatorOptions,
    nextDPointset: DPointsetDPoint[],
    currentDPointset: DPointsetDPoint[]
  ) {
    this.eightyBitsRuleHandler.handle(
      separatorOptions,
      [currentDPointset, nextDPointset],
      this.orderedDPoints
    );
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
    return this.dpointConstraintsHandler.resolve(
      constraintDPoints,
      rules,
      generatorConfig
    );
  }

  handleDPointsWithContraint(
    dpoints: DPointWithConstraint[],
    bitsCount: number,
    rules: GeneratorConfigRule[]
  ) {
    this.dpointConstraintsHandler.handle(
      { dpoints, bitsCount },
      this.orderedDPoints,
      rules
    );
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
    dpoint: DPointsetDPoint,
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
