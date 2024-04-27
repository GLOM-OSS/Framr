import {
  CreateGeneratorConfig,
  DPoint,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule
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

  async updateFslFramesets(fslNumber: number, newDpoints: DPoint[]) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    if (fslNumber > this.generatorConfig.framesets.fsl.length) {
      throw new FramrServiceError('Incorrect Fsl number');
    }

    const rules = await this.database.findAll('rules');
    const fslInstances = this.generatorConfig.framesets.fsl;
    const currentFSL = fslInstances.find((_) => _.number === fslNumber);
    if (!currentFSL) {
      throw new FramrServiceError('Could not find Fsl instance');
    }

    for (const dpoint of newDpoints) {
      const dpointRule = rules.find(
        (_) =>
          _.value.concernedDpoint.id === dpoint.id &&
          _.value.description === RuleEnum.SHOULD_BE_PRESENT
      );
      if (dpointRule) {
        const { framesets } = dpointRule.value;
        for (const frame of framesets) {
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
            this.generatorConfig.framesets.utility.dpoints.push({
              ...dpoint,
              isBaseInstance: true,
            });
          }
        }
      }
    }

    const isFSLPresent = fslInstances.some((_) => _.number === fslNumber);
    this.generatorConfig.framesets.fsl = isFSLPresent
      ? fslInstances.map((fsl) => (fsl.number === fslNumber ? currentFSL : fsl))
      : [currentFSL];
  }
}
