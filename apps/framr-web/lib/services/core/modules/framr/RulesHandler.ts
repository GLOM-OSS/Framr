import {
  DPoint,
  DPointsetDPoint,
  FramesetDpoint,
  GeneratorConfigRule,
  Rule,
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
import {
  DPointConstrainstHandler,
  RateParams,
} from './rules/DPointConstraintsHandler';
import { DPointsetHandler } from './rules/DPointsetHandler';
import {
  EightyBitsRuleHandler,
  SeparatorOptions,
} from './rules/EightyBitsRuleHandler';
import { FirstDPointHandler } from './rules/FirstDPointHandler';

export type DPointWithConstraint = {
  bitInterval: number;
  dpoint: FramesetDpoint;
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
  dpointId?: string
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
  handleFirstDPoints(rules: GeneratorConfigRule[]) {
    // get a cloned version reference of ordered dpoints group by sets
    const orderedDPointsets = this.getOrderedDPointsGroupBySets();

    // Partition the data points based on whether they should be at the beginning
    const [firstDPointsets, dpointsetRest] = partition(
      orderedDPointsets,
      (dpoints) =>
        rules.some(
          (rule) =>
            dpoints.some(
              (dpoint) => rule.concernedDpoint.id === dpoint.dpointId
            ) && rule.description === StandAloneRuleEnum.SHOULD_BE_THE_FIRST
        )
    );

    const orderedFirstDPoints = this.firstDPointHandler.handle(
      firstDPointsets.length > 0 ? firstDPointsets : dpointsetRest,
      rules
    );
    const orderedDPointRest = this.orderedDPoints.filter(
      (dpoint) => !orderedFirstDPoints.some((dp) => dp.id === dpoint.id)
    );
    this.orderedDPoints = [...orderedFirstDPoints, ...orderedDPointRest];
  }

  /**
   * Adds dpoint set to ordered dpoints.
   * @param dpoint The data point to handle.
   * @param rules Generator config rules.
   */
  handleDPointset(dpoint: FramesetDpoint, rules: GeneratorConfigRule[]) {
    const dpointSet = this.dpointsetHandler.handle(dpoint, rules);
    this.orderedDPoints.push(...dpointSet);
  }

  /**
   * Handles rules related to 80 bit constraints for MWD data points.
   * @param mwdSeparator Array of MWD data points.
   * @param separatorOptions Spreading cursors containing bit count, last index, and data point index.
   * @param generatorConfig Generator configuration.
   * @returns Object containing updated cursors and MWD data points.
   */
  handle80BitsRule(mwdRules: GeneratorConfigRule[]) {
    // Get available MWD Tool DPoints sorted by dpoint bit (asc)
    const mwdDPoints = mwdRules
      .filter((_) => _.description !== StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT)
      .map((_) => _.concernedDpoint)
      .sort((a, b) => a.bits - b.bits);

    // get the dpoint with smaller number of bit
    const mwdSeparator = mwdDPoints[0];

    if (mwdSeparator) {
      // get a cloned version of ordered dpoints grouped by sets
      const orderedDPointsets = this.getOrderedDPointsGroupBySets();

      this.orderedDPoints = [];
      let separatorOptions: SeparatorOptions = {
        bitsCount: 0,
        lastIndex: -1,
        nextSet: [],
        currentSet: [],
        separator: mwdSeparator,
      };
      for (let index = 0; index < orderedDPointsets.length; index++) {
        const currentSet = orderedDPointsets[index];
        const nextSet = orderedDPointsets[index + 1];

        if (nextSet) {
          const [nextCursors, nextInsertion] =
            this.eightyBitsRuleHandler.handle({
              ...separatorOptions,
              currentSet,
              nextSet,
            });

          this.orderedDPoints.push(...nextInsertion);
          separatorOptions = { ...separatorOptions, ...nextCursors };
        } else this.orderedDPoints.push(...currentSet);
      }
    }
  }

  /**
   * Handle dpoint constrainsts
   * @param withConstrainstDPoints
   * @param rules
   */
  handleDPointConstraints(
    rules: GeneratorConfigRule[],
    rateOptions: RateParams
  ) {
    // Filter dpoints with constraints
    const constraintDPoints = this.orderedDPoints.filter((dpoint) =>
      rules.some((rule) =>
        rulePredicate(
          this.frame,
          rule,
          [
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
          ],
          dpoint.dpointId
        )
      )
    );

    // Convert density and update rate constraints to bits interval constrainst.
    const withConstrainstDPoints = this.dpointConstraintsHandler.resolve(
      constraintDPoints,
      rules,
      rateOptions
    );

    for (const withConstrainstDPoint of withConstrainstDPoints) {
      // get a cloned version of ordered dpoints grouped by sets
      const orderedDPointsets = this.getOrderedDPointsGroupBySets();

      this.orderedDPoints = this.dpointConstraintsHandler.handle(
        withConstrainstDPoint,
        orderedDPointsets,
        rules
      );
    }
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
   * Order dpoints. Clones the list of dpoints and checks for compatibilities between sets.
   * Swaps sets if necessary.
   * @param rules
   * @param orderedDPoints Optional, default to `ruleHandler.orderedDPoints`
   */
  orderDPointsetDPoints(
    rules: GeneratorConfigRule[],
    orderedDPoints?: DPointsetDPoint[]
  ) {
    // get a cloned version reference of ordered dpoints group by sets
    const orderedDPointsets = this.getOrderedDPointsGroupBySets(orderedDPoints);

    for (let i = orderedDPointsets.length - 1; i > 0; i--) {
      const currentDPointset = orderedDPointsets[i];

      for (let j = i - 1; j > 0; j--) {
        const previousDPointset = orderedDPointsets[j];

        if (
          this.shouldDPointsetsBeSwapped(
            rules,
            previousDPointset,
            currentDPointset
          )
        ) {
          const previousDPointsetFirstDPointPosition =
            this.orderedDPoints.findIndex(
              (dpoint) => dpoint.id === previousDPointset[0].id
            );

          this.orderedDPoints = this.orderedDPoints.filter(
            (dp) =>
              !currentDPointset.some((_) => _.dpointsetId === dp.dpointsetId)
          );

          this.orderedDPoints.splice(
            previousDPointsetFirstDPointPosition,
            0,
            ...currentDPointset
          );
        }
      }
    }
  }

  private shouldDPointsetsBeSwapped(
    rules: GeneratorConfigRule[],
    previousDPointset: DPointsetDPoint[],
    currentDPointset: DPointsetDPoint[]
  ) {
    const previousDPointsetLastDPoint =
      previousDPointset[previousDPointset.length - 1];
    const [currentDPointsetFirstDPoint] = currentDPointset;

    // Required conditions for dpoint sets to be swapped
    return rules.some(
      (rule) =>
        // The last dpoint from previous dpoint set has a rule that stipulates that
        // the first dpoint of the current dpoint set should not immediately follow it
        this.isDPointRestricted(
          rule,
          previousDPointsetLastDPoint,
          currentDPointsetFirstDPoint,
          [WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER]
        ) ||
        // The first dpoints from current dpoint set must has a rule that stipulates that
        // the last dpoint of the previous dpoint set should not immediately preceed it
        this.isDPointRestricted(
          rule,
          currentDPointsetFirstDPoint,
          previousDPointsetLastDPoint,
          [WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER]
        ) ||
        // One dpoint from previous dpoint set has a rule that stipulates that
        // a dpoint of the current dpoint set should not follow it
        this.isDPointsetRestricted(rule, previousDPointset, currentDPointset, [
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER,
        ]) ||
        // One dpoints from current dpoint set must has a rule that stipulates that
        // a dpoint of the previous dpoint set should not preceed it
        this.isDPointsetRestricted(rule, currentDPointset, previousDPointset, [
          WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER,
        ])
    );
  }

  private isDPointRestricted(
    rule: GeneratorConfigRule,
    concernedDPoint: DPointsetDPoint,
    targettedDPoint: DPointsetDPoint,
    restrictions: WithOtherDPointRuleEnum[]
  ) {
    return (
      rulePredicate(this.frame, rule, restrictions, concernedDPoint.dpointId) &&
      (rule as RuleWithOtherDPoint).otherDpoints.some(
        (_) => _.id === targettedDPoint.dpointId
      )
    );
  }

  private isDPointsetRestricted(
    rule: GeneratorConfigRule,
    concernedDPointset: DPointsetDPoint[],
    targettedDPointset: DPointsetDPoint[],
    restrictions: WithOtherDPointRuleEnum[]
  ) {
    return concernedDPointset.some(
      (concernedDPoint) =>
        rulePredicate(
          this.frame,
          rule,
          restrictions,
          concernedDPoint.dpointId
        ) &&
        (rule as RuleWithOtherDPoint).otherDpoints.some((_) =>
          targettedDPointset.some(
            (targettedDPoint) => _.id === targettedDPoint.dpointId
          )
        )
    );
  }

  /**
   * Group ordered dpoints by sets
   * @param dpoints
   * @returns array of dpoint sets
   */
  getOrderedDPointsGroupBySets(orderedDPoints?: DPointsetDPoint[]) {
    const orderedDPointsClone =
      orderedDPoints ?? structuredClone(this.orderedDPoints);

    const orderedDPointsetsPerDPointsetId: Record<string, DPointsetDPoint[]> =
      {};
    for (const dpoint of orderedDPointsClone) {
      if (orderedDPointsetsPerDPointsetId[dpoint.dpointsetId]) {
        orderedDPointsetsPerDPointsetId[dpoint.dpointsetId].push(dpoint);
      } else orderedDPointsetsPerDPointsetId[dpoint.dpointsetId] = [dpoint];
    }

    return Object.values(orderedDPointsetsPerDPointsetId);
  }
}
