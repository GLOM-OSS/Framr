import { FrameEnum } from '../../../../../lib/types/enums';
import {
  CreateGeneratorConfig,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
} from '../../../../../lib/types';
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
      const utilRules = rules.filter((_) =>
        _.value.framesets.includes(FrameEnum.UTIL)
      );
      this.generatorConfig = {
        ...config,
        id: crypto.randomUUID(),
        framesets: {
          fsl: [],
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
}
