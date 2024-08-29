import {
  DPointsetDPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  RuleWithConstraint,
} from '../../../../../types';
import { FrameEnum, WithConstraintRuleEnum } from '../../../../../types/enums';
import { getRandomID } from '../../common/common';
import { DPointWithConstraint, rulePredicate } from '../RulesHandler';
import { DPointsetHandler } from './DPointsetHandler';

export interface DPointsetHandlerPayload {
  dpoints: DPointWithConstraint[];
  bitsCount: number;
}

export class DPointConstrainstHandler {
  constructor(
    private readonly frame: FrameEnum,
    private readonly dpointsetHandler: DPointsetHandler
  ) {}

  /**
   * Resolved density and update rate constraints a single type of constraint depending on bits interval.
   * @param dpoints Array of data points.
   * @param rules Generator config rules.
   * @param generatorConfig Generator configuration.
   * @returns Object containing non-constraint data points and bit constraint data points.
   */
  resolve(
    constraintDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[],
    generatorConfig: GeneratorConfig
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
          (densityConstraintRule.interval * generatorConfig.bitRate) /
          generatorConfig.penetrationRate;
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
        bitInterval =
          updateRateConstraintRule.interval * generatorConfig.bitRate;
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
              ? 'Update rate and density rate should not complementary'
              : undefined,
        },
      };
    });
  }

  handle(
    { bitsCount, dpoints }: DPointsetHandlerPayload,
    orderedDPoints: DPointsetDPoint[],
    rules: GeneratorConfigRule[]
  ) {
    const clonedDpoints = structuredClone(dpoints);
    clonedDpoints
      .filter((bitCdp) => bitsCount >= bitCdp.lastCount + bitCdp.bitInterval)
      .forEach((cdp) => {
        const originalIndex = dpoints.findIndex(
          (_) => _.dpoint.id === cdp.dpoint.id
        );
        const dpointSet = this.dpointsetHandler.handle(
          { ...cdp.dpoint, id: getRandomID() },
          rules
        );
        orderedDPoints.push(
          ...dpointSet.map((dpoint) => {
            return {
              ...dpoint,
              isBaseInstance: !orderedDPoints.some(
                (_) => _.dpointId === dpoint.dpointId && _.isBaseInstance
              ),
            };
          })
        );
        dpoints[originalIndex] = {
          ...cdp,
          lastCount: orderedDPoints.reduce(
            (bitsCount, _) => bitsCount + _.bits,
            0
          ),
        };
      });
  }
}
