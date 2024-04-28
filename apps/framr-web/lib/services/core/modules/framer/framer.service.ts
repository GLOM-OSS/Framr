import {
  CreateGeneratorConfig,
  DPoint,
  FSLFrameEnum,
  FSLFrameset,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
} from '../../../../../lib/types';
import { FrameEnum, RuleEnum } from '../../../../../lib/types/enums';
import { FramrServiceError } from '../../../libs/errors';
import { EventBus } from '../../../libs/event-bus';
import { IDBFactory } from '../../../libs/idb';
import { IDBConnection } from '../../db/IDBConnection';
import { FramrDBSchema } from '../../db/schema';

export class FramerService {
  private readonly eventBus: EventBus;
  private readonly database: IDBFactory<FramrDBSchema>;

  constructor() {
    this.eventBus = new EventBus();
    this.database = IDBConnection.getDatabase();
  }

  private generatorConfig: GeneratorConfig | null = null;

  async initialize(config: CreateGeneratorConfig) {
    if (!this.generatorConfig) {
      const dpoints = await this.database.findAll('dpoints');
      const rules = await this.database.findAll('rules');
      const services = await this.database.findAll('services');

      const utilRules = rules.filter((_) =>
        _.value.framesets.includes(FrameEnum.UTIL)
      );
      this.generatorConfig = {
        ...config,
        id: crypto.randomUUID(),
        framesets: {
          fsl: [...new Array(6)].map((_, i) => ({
            framesets: {
              [FrameEnum.GTF]: { dpoints: [], frame: FrameEnum.GTF },
              [FrameEnum.MTF]: { dpoints: [], frame: FrameEnum.GTF },
              [FrameEnum.ROT]: { dpoints: [], frame: FrameEnum.GTF },
            },
            number: i + 1,
          })),
          utility: {
            frame: FrameEnum.UTIL,
            dpoints: dpoints
              .filter((dpoint) =>
                utilRules.some(
                  ({ value: rule }) =>
                    rule.concernedDpoint.id === dpoint.value.id
                )
              )
              .map<FramesetDpoint>((_) => ({
                isBaseInstance: true,
                ..._.value,
              })),
          },
        },
        tools: config.tools.map((tool) => ({
          ...tool,
          services: services
            .filter((_) => _.value.tool.id === tool.id)
            .map((_) => _.value),
          rules: rules
            .filter(({ value: rule }) => rule.tool.id === tool.id)
            .map<GeneratorConfigRule>((_) => ({
              ..._.value,
              isGeneric: true,
              isActive: false,
            })),
        })),
      };
    } else throw new FramrServiceError('Service was already initialized');
  }

  addAndDispatchDPoints(fslNumber: number, toolId: string, dpoints: DPoint[]) {
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);

    const rules = generatorConfig.tools.find((_) => _.id === toolId)?.rules;
    if (!rules) {
      throw new FramrServiceError('Unknown tool id');
    }

    const currentFSL = this.getCurrentFSL(generatorConfig, fslNumber);

    for (const dpoint of dpoints) {
      const dpointRule = rules.find(
        (_) =>
          _.concernedDpoint.id === dpoint.id &&
          _.description === RuleEnum.SHOULD_BE_PRESENT
      );
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

    const currentFSL = this.getCurrentFSL(generatorConfig, fslNumber);

    const updatedFramesets = Object.fromEntries(
      Object.entries(currentFSL.framesets).map(([key, { dpoints, frame }]) => [
        key as FSLFrameEnum,
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
        fsl: (this.generatorConfig as GeneratorConfig).framesets.fsl.map(
          (fsl) =>
            fsl.number === fslNumber
              ? {
                  ...fsl,
                  framesets: updatedFramesets as Record<
                    FSLFrameEnum,
                    FSLFrameset
                  >,
                }
              : fsl
        ),
      },
    };
  }

  private getCurrentFSL(generatorConfig: GeneratorConfig, fslNumber: number) {
    const fslInstances = generatorConfig.framesets.fsl;
    const currentFSL = fslInstances.find((fsl) => fsl.number === fslNumber);
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
