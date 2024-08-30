import {
  DPointsetDPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  RuleWithConstraint,
} from '../../../../../types';
import { FrameEnum, WithConstraintRuleEnum } from '../../../../../types/enums';
import { DPointWithConstraint, rulePredicate } from '../RulesHandler';
import { DPointsetHandler } from './DPointsetHandler';

export interface ConstrainstHandlerPayload {
  dpoints: DPointWithConstraint[];
  bitsCount: number;
}

export type RateParams = Pick<GeneratorConfig, 'penetrationRate' | 'bitRate'>;

export class DPointConstrainstHandler {
  constructor(
    private readonly frame: FrameEnum,
    private readonly dpointsetHandler: DPointsetHandler
  ) {}

  /**
   * Resolved density and update rate constraints a single type of constraint depending on bits interval.
   * @param dpoints Array of data points.
   * @param rules Generator config rules.
   * @param rateConfig Generator configuration.
   * @returns Object containing non-constraint data points and bit constraint data points.
   */
  resolve(
    constraintDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[],
    rateConfig: RateParams
  ): DPointWithConstraint[] {
    return constraintDPoints.map<DPointWithConstraint>((cdp) => {
      let bitInterval = 0;
      const densityConstraintRule = rules.find((rule) =>
        rulePredicate(
          this.frame,
          rule,
          [WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT],
          cdp.dpointId
        )
      ) as RuleWithConstraint | undefined;

      if (densityConstraintRule) {
        bitInterval =
          (densityConstraintRule.interval / rateConfig.penetrationRate) *
          rateConfig.bitRate;
      }

      const updateRateConstraintRule = rules.find((rule) =>
        rulePredicate(
          this.frame,
          rule,
          [
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
          ],
          cdp.dpointId
        )
      ) as RuleWithConstraint | undefined;

      if (updateRateConstraintRule) {
        bitInterval = updateRateConstraintRule.interval * rateConfig.bitRate;
      }

      return {
        lastCount: 0,
        bitInterval,
        dpoint: {
          ...cdp,
          error:
            bitInterval === 0
              ? 'Invalid interval constraint'
              : densityConstraintRule && updateRateConstraintRule
              ? 'Update rate and density rate are mutually exclusive contrainsts'
              : undefined,
        },
      };
    });
  }

  /**
   * Add the constrainst dpoint set to ordered dpoint sets as required by the given constrainst
   * @param constrainst Constrainst to be handled
   * @param orderedDPointsets Array of dpoint elements group by sets
   * @param rules
   * @returns  a flaterned array of dpointset dpoint
   */
  handle(
    constrainst: DPointWithConstraint,
    orderedDPointsets: DPointsetDPoint[][],
    rules: GeneratorConfigRule[]
  ): DPointsetDPoint[] {
    let lastCount = 0;
    let isBaseInstance = true;
    const orderedDPoints: DPointsetDPoint[] = [];
    for (let i = 0; i < orderedDPointsets.length; i++) {
      const dpointset = orderedDPointsets[i];
      const nextDPointset = orderedDPointsets[i + 1];
      for (let j = 0; j < dpointset.length; j++) {
        const dpoint = dpointset[j];
        lastCount += dpoint.bits;
        if (dpoint.dpointId === constrainst.dpoint.dpointId) {
          isBaseInstance = false;
          lastCount = 0;
        }
      }

      if (
        lastCount < constrainst.bitInterval ||
        (nextDPointset &&
          nextDPointset[0].dpointId === constrainst.dpoint.dpointId)
      ) {
        orderedDPoints.push(...dpointset);
      } else {
        const constrainstDPointset = this.dpointsetHandler.handle(
          { ...constrainst.dpoint, isBaseInstance },
          rules
        );
        lastCount = 0;
        isBaseInstance = false;
        orderedDPoints.push(...dpointset, ...constrainstDPointset);
      }
    }

    return orderedDPoints;
  }
}
