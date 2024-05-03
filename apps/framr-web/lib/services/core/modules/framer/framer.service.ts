import {
  CreateGeneratorConfig,
  DPoint,
  FSLFrameType,
  FSLFrameset,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  RuleWithConstraint,
  RuleWithOtherDPoint,
} from '../../../../../lib/types';
import {
  FrameEnum,
  StandAloneRuleEnum,
  WithConstraintRuleEnum,
  WithOtherDPointRuleEnum,
} from '../../../../../lib/types/enums';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus } from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema } from '../../db/schema';

export const BITS_LIMIT = 80;

export class FramerService {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;

  private _generatorConfig: GeneratorConfig | null = null;

  constructor() {
    this.eventBus = new EventBus();
    this.database = IDBConnection.getDatabase();
  }

  public get generatorConfig(): GeneratorConfig | null {
    return this._generatorConfig;
  }
  public set generatorConfig(value: GeneratorConfig) {
    this._generatorConfig = value;
  }

  async initialize(config: CreateGeneratorConfig) {
    if (this.generatorConfig) {
      throw new FramrServiceError('Service was already initialized');
    }

    const rules = await this.database.findAll('rules');

    const initializeToolRules = (toolId: string) => {
      return rules
        .filter(({ value: rule }) => rule.tool.id === toolId)
        .map<GeneratorConfigRule>((_) => ({
          ..._.value,
          isGeneric: true,
          isActive: true,
        }));
    };

    const mwdRules = initializeToolRules(config.MWDTool.id);

    const initializeFramesets = (frameType: FSLFrameType | FrameEnum.UTIL) => {
      return {
        frame: frameType,
        dpoints: mwdRules
          .filter(
            (rule) =>
              rule.description === StandAloneRuleEnum.SHOULD_BE_PRESENT &&
              rule.framesets.includes(frameType)
          )
          .reduce<FramesetDpoint[]>((dps, rule) => {
            const dpointsToAdd = [
              rule.concernedDpoint,
              ...((rule as RuleWithOtherDPoint).otherDpoints ?? []),
            ].map((dpoint) => ({ isBaseInstance: true, ...dpoint }));
            return [...dps, ...dpointsToAdd];
          }, []),
      };
    };

    const mwdFramesets = {
      fsl: [...new Array(6)].map((_, i) => ({
        framesets: {
          [FrameEnum.GTF]: initializeFramesets(FrameEnum.GTF),
          [FrameEnum.MTF]: initializeFramesets(FrameEnum.MTF),
          [FrameEnum.ROT]: initializeFramesets(FrameEnum.ROT),
        },
        number: i + 1,
      })),
      utility: initializeFramesets(FrameEnum.UTIL),
    } as GeneratorConfig['framesets'];

    this.generatorConfig = {
      ...config,
      id: crypto.randomUUID(),
      MWDTool: {
        ...config.MWDTool,
        rules: mwdRules,
      },
      tools: config.tools.map((tool) => ({
        ...tool,
        rules: initializeToolRules(tool.id),
      })),
      framesets: mwdFramesets,
    };
  }

  addAndDispatchDPoints(fslNumber: number, toolId: string, dpoints: DPoint[]) {
    const rules = this.getRules(toolId);
    const currentFSL = this.getCurrentFSL(fslNumber);
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);

    for (const dpoint of dpoints) {
      const dpointRule = rules.find((_) => _.concernedDpoint.id === dpoint.id);
      if (dpointRule) {
        for (const frame of dpointRule.framesets) {
          if (
            frame === FrameEnum.MTF ||
            frame === FrameEnum.ROT ||
            frame === FrameEnum.GTF
          ) {
            const currentFrameset = currentFSL.framesets[frame];
            currentFSL.framesets[frame] = {
              frame: currentFrameset.frame,
              dpoints: [
                ...currentFrameset.dpoints,
                { ...dpoint, isBaseInstance: true },
              ],
            };
          } else if (frame === FrameEnum.UTIL) {
            generatorConfig.framesets.utility.dpoints.push({
              ...dpoint,
              isBaseInstance: true,
            });
          }
        }
      }
    }

    this.generatorConfig = {
      ...generatorConfig,
      framesets: {
        ...generatorConfig.framesets,
        fsl: (this.generatorConfig as GeneratorConfig).framesets.fsl.map(
          (fsl) => (fsl.number === fslNumber ? currentFSL : fsl)
        ),
      },
    };
  }

  removeDPoints(fslNumber: number, dpointIds: string[]) {
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);
    const currentFSL = this.getCurrentFSL(fslNumber);

    const updatedFramesets = Object.fromEntries(
      Object.entries(currentFSL.framesets).map(([key, { dpoints, frame }]) => [
        key as FSLFrameType,
        {
          dpoints: dpoints.filter((dpoint) => dpointIds.includes(dpoint.id)),
          frame,
        },
      ])
    );

    this.generatorConfig = {
      ...generatorConfig,
      framesets: {
        ...generatorConfig.framesets,
        fsl: generatorConfig.framesets.fsl.map((fsl) =>
          fsl.number === fslNumber
            ? {
                ...fsl,
                framesets: updatedFramesets as Record<
                  FSLFrameType,
                  FSLFrameset
                >,
              }
            : fsl
        ),
      },
    };
  }

  orderFramesetDPoints(fslNumber: number, frame: FSLFrameType) {
    const rules = this.getRules();
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);

    const {
      framesets: {
        [frame]: { dpoints },
      },
      framesets: fslFramesets,
    } = this.getCurrentFSL(fslNumber);

    // Partition the data points based on whether they should be at the beginning
    const [firstDPoints, remainingDPoints] = partition(dpoints, (dpoint) =>
      rules.some(
        (rule) =>
          rule.concernedDpoint.id === dpoint.id &&
          rule.description === StandAloneRuleEnum.SHOULD_BE_THE_FIRST
      )
    );

    // Add first data points to the ordered list, handling conflicts
    const orderedDPoints: FramesetDpoint[] = [
      ...this.handleFirstDPoints(firstDPoints, rules),
    ];

    let mwdDPointSpreadingIndex = 0;
    let lastMWDSpreadingIndex = -1;
    let mwdDPoints = generatorConfig.MWDTool.rules
      .filter(
        (_) =>
          _.description !== StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT &&
          _.framesets.includes(frame)
      )
      .map((_) => _.concernedDpoint)
      .sort((a, b) => b.bits - a.bits);

    const remainingValidDPoints = remainingDPoints.filter(
      (remainingDPoint) =>
        !rules.some(
          (rule) =>
            rule.concernedDpoint.id === remainingDPoint.id &&
            rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT
        )
    );
    const [constraintDPoints, nonConstraintDPoints] = partition(
      remainingValidDPoints,
      (remainingDPoint) =>
        rules.some(
          (rule) =>
            rule.concernedDpoint.id === remainingDPoint.id &&
            (rule.description ===
              WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT ||
              rule.description ===
                WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT)
        )
    );
    const bitConstraintDPoints = constraintDPoints.map<{
      lastCount: number;
      bitInterval: number;
      dpoint: FramesetDpoint;
    }>((cdp) => {
      let bitInterval = 0;
      const densityConstraintRule = rules.find(
        (rule) =>
          cdp.id === rule.concernedDpoint.id &&
          rule.description ===
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
      ) as RuleWithConstraint | undefined;

      if (densityConstraintRule) {
        bitInterval =
          (densityConstraintRule.interval * generatorConfig.bitRate) /
          generatorConfig.penetrationRate;
      }

      const updateRateConstraintRule = rules.find(
        (rule) =>
          rule.concernedDpoint.id === cdp.id &&
          rule.description ===
            WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT
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
    // Process remaining data points and apply rules
    for (const dpoint of nonConstraintDPoints) {
      const bitsCount = orderedDPoints.reduce(
        (bitsCount, _) => bitsCount + _.bits,
        0
      );
      const closestBitLimitMultiple =
        Math.floor(bitsCount / BITS_LIMIT) * BITS_LIMIT;
      if (closestBitLimitMultiple <= bitsCount) {
        const index = orderedDPoints.findIndex(
          (_, index) =>
            _.tool.id === generatorConfig.MWDTool.id &&
            index > lastMWDSpreadingIndex
        );
        if (index !== -1) {
          mwdDPoints = mwdDPoints.filter(
            (_) => _.id !== orderedDPoints[index].id
          );
        } else {
          const mwdDPointIndex =
            mwdDPointSpreadingIndex % (mwdDPoints.length - 1);
          orderedDPoints.push({
            ...mwdDPoints[mwdDPointIndex],
            isBaseInstance:
              Math.floor(mwdDPointSpreadingIndex / (mwdDPoints.length - 1)) <=
              1,
          });
          lastMWDSpreadingIndex = orderedDPoints.length - 1;
          mwdDPointSpreadingIndex++;
        }
      }

      bitConstraintDPoints
        .filter((bitCdp) => bitsCount >= bitCdp.lastCount + bitCdp.bitInterval)
        .forEach((cdp) => {
          const originalIndex = bitConstraintDPoints.findIndex(
            (_) => _.dpoint.id === cdp.dpoint.id
          );
          orderedDPoints.push(cdp.dpoint);
          bitConstraintDPoints[originalIndex] = {
            ...cdp,
            lastCount: orderedDPoints.reduce(
              (bitsCount, _) => bitsCount + _.bits,
              0
            ),
          };
        });

      const precededByRule = rules.find(
        (rule) =>
          rule.concernedDpoint.id === dpoint.id &&
          (rule.description ===
            WithOtherDPointRuleEnum.SHOULD_BE_PRECEDED_BY_OTHER ||
            rule.description ===
              WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER)
      ) as RuleWithOtherDPoint | undefined;
      const followedByRule = rules.find(
        (rule) =>
          rule.concernedDpoint.id === dpoint.id &&
          (rule.description ===
            WithOtherDPointRuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER ||
            rule.description ===
              WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER)
      ) as RuleWithOtherDPoint | undefined;

      if (
        precededByRule &&
        followedByRule &&
        precededByRule.otherDpoints.some((otherDPoint) =>
          followedByRule.otherDpoints.some((_) => _.id === otherDPoint.id)
        )
      ) {
        // If both preceded by and followed by rules exist, mark the data point with an error
        orderedDPoints.push({
          ...dpoint,
          error: `Dpoint cannot be both preceded by and followed by the same other DPoint`,
        });
        continue;
      } else {
        // Add the data point to the ordered list if no conflicting rule applies
        if (!orderedDPoints.some((dp) => dp.id === dpoint.id)) {
          orderedDPoints.push(dpoint);
        }
        const dpointPosition = orderedDPoints.findIndex(
          (dp) => dp.id === dpoint.id
        );

        const shouldNotBePrecededByOther = rules.some(
          (rule) =>
            rule.concernedDpoint.id === dpoint.id &&
            (rule.description ===
              WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER ||
              rule.description ===
                WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER) &&
            orderedDPoints.some((orderedDpoint, index) =>
              (rule as RuleWithOtherDPoint).otherDpoints.some(
                (otherDPoint) =>
                  otherDPoint.id === orderedDpoint.id && index < dpointPosition
              )
            )
        );

        const shouldNotBeFollowedByOther = rules.some(
          (rule) =>
            (rule.description ===
              WithOtherDPointRuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER ||
              rule.description ===
                WithOtherDPointRuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER) &&
            orderedDPoints.some((orderedDPoint, index) =>
              (rule as RuleWithOtherDPoint).otherDpoints.some(
                (otherDPoint) =>
                  otherDPoint.id === orderedDPoint.id && index > dpointPosition
              )
            )
        );

        if (shouldNotBePrecededByOther || shouldNotBeFollowedByOther) {
          // If the data point should not be preceded by or followed by other DPoints, mark it with an error
          orderedDPoints.splice(dpointPosition, 1, {
            ...dpoint,
            error: `Dpoint cannot be ${
              shouldNotBePrecededByOther ? 'preceded by' : 'followed by'
            } other specified DPoints`,
          });
          continue;
        }

        if (followedByRule) {
          const otherDPoints = followedByRule.otherDpoints.map((dp) => ({
            ...dp,
            isBaseInstance: true,
          }));
          orderedDPoints.splice(dpointPosition + 1, 0, ...otherDPoints);
        }

        if (precededByRule) {
          const otherDPoints = precededByRule.otherDpoints.map((dp) => ({
            ...dp,
            isBaseInstance: true,
          }));
          orderedDPoints.splice(dpointPosition, 0, ...otherDPoints);
        }

        const shouldBeSetOnly = rules.find(
          (rule) =>
            rule.concernedDpoint.id === dpoint.id &&
            rule.description ===
              WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
        ) as RuleWithOtherDPoint | undefined;

        if (shouldBeSetOnly) {
          const [precededByRuleCommonDPoints, otherDPoints] = partition(
            shouldBeSetOnly.otherDpoints,
            (otherDPoint) =>
              !!precededByRule?.otherDpoints.some(
                (_) => _.id === otherDPoint.id
              )
          );
          const [followedByRuleCommonDPoints, otherDPoints2] = partition(
            shouldBeSetOnly.otherDpoints,
            (otherDPoint) =>
              !!followedByRule?.otherDpoints.some(
                (_) => _.id === otherDPoint.id
              )
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
            orderedDPoints.splice(
              dpointPosition +
                (shouldInsertAfter
                  ? followedByRuleCommonDPoints.length + 1
                  : -precededByRuleCommonDPoints.length),
              0,
              ...[...otherDPoints, ...otherDPoints2].map((dpoint) => ({
                ...dpoint,
                isBaseInstance: true,
              }))
            );
          } else {
            orderedDPoints.splice(dpointPosition, 1, {
              ...dpoint,
              error:
                'DPoints following or preceding DPoint are conflicting with DPoint set',
            });
            continue;
          }
        }
      }
    }

    this.generatorConfig = {
      ...generatorConfig,
      framesets: {
        ...generatorConfig.framesets,
        fsl: generatorConfig.framesets.fsl.map((fslInstance) =>
          fslInstance.number === fslNumber
            ? {
                number: fslNumber,
                framesets: { ...fslFramesets, [frame]: orderedDPoints },
              }
            : fslInstance
        ),
      },
    };

    function partition<T>(
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
  }

  /**
   * Helper function to handle ordering of first data points, handling conflicts
   * @param firstDPoints array of dpoints intending to be first
   * @param rules Generator config rules
   * @returns array of frameset dpoints
   */
  private handleFirstDPoints(
    firstDPoints: FramesetDpoint[],
    rules: GeneratorConfigRule[]
  ): FramesetDpoint[] {
    const orderedFirstDPoints: FramesetDpoint[] = [];

    firstDPoints.forEach((dpoint) => {
      const conflictingRule = rules.find(
        (rule) =>
          rule.concernedDpoint.id === dpoint.id &&
          rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST
      );
      if (conflictingRule) {
        const alternativeDPoint = firstDPoints.find(
          (dp) =>
            !rules.some(
              (rule) =>
                rule.concernedDpoint.id === dp.id &&
                rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_THE_FIRST
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

    return orderedFirstDPoints;
  }

  private getRules(toolId?: string) {
    const rules: GeneratorConfigRule[] = [];
    if (toolId) {
      const toolRules = this.generatorConfig?.tools.find(
        (_) => _.id === toolId
      )?.rules;
      if (!toolRules) {
        throw new FramrServiceError('Unknown tool id');
      }
      rules.push(...toolRules);
    } else {
      for (const tool of this.generatorConfig?.tools ?? []) {
        rules.push(...tool.rules);
      }
    }
    return rules;
  }

  private getCurrentFSL(fslNumber: number) {
    const currentFSL = this.generatorConfig?.framesets.fsl.find(
      (fsl) => fsl.number === fslNumber
    );
    if (!currentFSL) {
      throw new FramrServiceError('Could not find Fsl instance');
    }
    return currentFSL;
  }

  private retrieveGeneratorConfig(fslNumber: number) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    if (fslNumber > this.generatorConfig.framesets.fsl.length) {
      throw new FramrServiceError('Incorrect Fsl number');
    }

    return this.generatorConfig;
  }
}
