import {
  CreateGeneratorConfig,
  DPoint,
  FSLFrameType,
  FSLFrameset,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  RuleWithOtherDPoint,
} from '../../../../types';
import { FrameEnum, StandAloneRuleEnum } from '../../../../types/enums';
import { FramrServiceError } from '../../../libs/errors';
import { XmlIO } from '../../../libs/xml-io';
import { getRandomID } from '../common/common';
import {
  RulesHandler,
  SpreadingCursors,
  getFramesetDPoint,
  partition,
} from './RulesHandler';

export class FramrService {
  private readonly xmlIO: XmlIO;
  private rulesHandler: RulesHandler;

  private _generatorConfig: GeneratorConfig | null = null;
  public get generatorConfig(): GeneratorConfig | null {
    return this._generatorConfig;
  }
  public set generatorConfig(value: GeneratorConfig) {
    this._generatorConfig = value;
  }

  public get orderedDPoints(): FramesetDpoint[] {
    return this.rulesHandler.orderedDPoints;
  }
  public set orderedDPoints(value: FramesetDpoint[]) {
    this.rulesHandler.orderedDPoints = value;
  }

  constructor(config?: GeneratorConfig) {
    this.xmlIO = new XmlIO();
    this.rulesHandler = new RulesHandler();
    if (config) {
      this.generatorConfig = config;
    }
  }
  initialize(config: CreateGeneratorConfig) {
    if (this.generatorConfig) {
      throw new FramrServiceError('Service was already initialized');
    }

    const initializeFramesets = (frameType: FSLFrameType | FrameEnum.UTIL) => {
      return {
        frame: frameType,
        dpoints: config.MWDTool.rules
          .filter(
            (rule) =>
              rule.description === StandAloneRuleEnum.SHOULD_BE_PRESENT &&
              rule.framesets.includes(frameType)
          )
          .reduce<FramesetDpoint[]>((dps, rule) => {
            const dpointsToAdd = [
              rule.concernedDpoint,
              ...((rule as RuleWithOtherDPoint).otherDpoints ?? []),
            ].map<FramesetDpoint>((dpoint) => getFramesetDPoint(dpoint));
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
      id: getRandomID(),
      framesets: mwdFramesets,
    };
    return this.generatorConfig;
  }

  dispatchAndOrderDPoints(
    fslNumber: number,
    dpoints: DPoint[],
    toolId?: string
  ) {
    const rules = this.getRules(toolId);
    const currentFSL = this.getCurrentFSL(fslNumber);
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);

    for (const frame of [
      FrameEnum.GTF,
      FrameEnum.MTF,
      FrameEnum.ROT,
      FrameEnum.UTIL,
    ]) {
      const framesetDPoints = dpoints
        .filter((dpoint) =>
          rules.some(
            (_) =>
              _.concernedDpoint.id === dpoint.id && _.framesets.includes(frame)
          )
        )
        .map((dpoint) => getFramesetDPoint(dpoint));
      if (frame !== FrameEnum.UTIL) {
        currentFSL.framesets[frame] = {
          frame,
          dpoints: framesetDPoints,
        };
      } else {
        generatorConfig.framesets.utility = {
          frame,
          dpoints: framesetDPoints,
        };
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

    this.orderFramesets(fslNumber);
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
    const generatorConfig = this.retrieveGeneratorConfig(fslNumber);

    const {
      framesets: {
        [frame]: { dpoints },
      },
      framesets: fslFramesets,
    } = this.getCurrentFSL(fslNumber);
    // order DPoints and populate the orderedDPoints array
    this.orderDPoints(frame, dpoints, generatorConfig);

    this.generatorConfig = {
      ...generatorConfig,
      framesets: {
        ...generatorConfig.framesets,
        fsl: generatorConfig.framesets.fsl.map((fslInstance) =>
          fslInstance.number === fslNumber
            ? {
                number: fslNumber,
                framesets: {
                  ...fslFramesets,
                  [frame]: { frame, dpoints: this.orderedDPoints },
                },
              }
            : fslInstance
        ),
      },
    };
  }

  orderFramesets(fslNumber: number) {
    const { framesets: fslFramesets } = this.getCurrentFSL(fslNumber);
    for (const frameset in fslFramesets) {
      this.orderFramesetDPoints(fslNumber, frameset as FSLFrameType);
    }
  }

  updateToolRules(toolId: string, rules: GeneratorConfigRule[]) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    this.generatorConfig = {
      ...this.generatorConfig,
      tools: this.generatorConfig.tools.map((tool) =>
        tool.id === toolId ? { ...tool, rules } : tool
      ),
    };
  }

  exportGeneratorConfig() {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    let dataString =
      `LIBTYPE:${this.generatorConfig.MWDTool.long}` +
      `\nFRMTYPE:REPEATING` +
      `\nUSER FRAME LIBRARY` +
      `\nFrameBuilderWizard Version : TnAShared2022_1_001 built on ${new Date().toISOString()}` +
      `\nLast modified: ${new Date().toISOString()}`;

    let frameNumber = 2000;
    const { jobName, wellName, framesets, MWDTool } = this.generatorConfig;
    framesets.fsl.forEach(({ framesets, number: fslNumber }) => {
      [FrameEnum.MTF, FrameEnum.GTF, FrameEnum.ROT].forEach((frame, i) => {
        dataString +=
          `\nSTARTOFFRAME` +
          `\nFRM_TYPE:${frame}` +
          `\nMTF_FRM#${frameNumber}` +
          `\nGTF_FRM#${frameNumber + 1}` +
          `\nROT_FRM#${frameNumber + 2}` +
          `\nFSL ${fslNumber} ${wellName}` +
          `\nFRAME#${frameNumber + i}`;
        const { dpoints } = framesets[frame as FSLFrameType];
        dpoints.forEach((dpoint) => {
          dataString += `\n${dpoint.name}`;
        });

        dataString += `\nNULL` + `\n37321` + `ENDOFFRAME\n`;
      });
      frameNumber++;
    });

    this.xmlIO.downloadFile(
      dataString,
      `${new Date().toISOString()}_${jobName}_${wellName}_${MWDTool.name}.udl`
    );
  }

  private orderDPoints(
    frame: FSLFrameType,
    dpoints: FramesetDpoint[],
    generatorConfig: GeneratorConfig
  ) {
    const rules = this.getRules();

    // Partition the data points based on whether they should be at the beginning
    const [firstDPoints, remainingDPoints] = partition(dpoints, (dpoint) =>
      rules.some(
        (rule) =>
          rule.concernedDpoint.id === dpoint.id &&
          rule.description === StandAloneRuleEnum.SHOULD_BE_THE_FIRST
      )
    );

    this.rulesHandler = new RulesHandler(frame);

    // Add first data points to the ordered list, handling conflicts
    this.rulesHandler.handleFirstDPoints(firstDPoints, rules);

    const remainingValidDPoints = remainingDPoints.filter(
      (remainingDPoint) =>
        !rules.some(
          (rule) =>
            rule.concernedDpoint.id === remainingDPoint.id &&
            rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT
        )
    );

    const { bitConstraintDPoints, nonConstraintDPoints } =
      this.rulesHandler.filterAndBuildBitConstraintData(
        remainingValidDPoints,
        rules,
        generatorConfig
      );

    // Get available MWD Tool DPoints
    let mwdDPoints = generatorConfig.MWDTool.rules
      .filter(
        (_) =>
          _.description !== StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT &&
          _.framesets.includes(frame)
      )
      .map((_) => _.concernedDpoint)
      .sort((a, b) => b.bits - a.bits);

    let cursors: SpreadingCursors = {
      bitsCount: 0,
      lastIndex: -1,
      dpointIndex: 0,
    };

    // Process non constraint remaining data points and apply rules
    for (const dpoint of nonConstraintDPoints) {
      const bitsCount = this.orderedDPoints.reduce(
        (bitsCount, _) => bitsCount + _.bits,
        0
      );
      if (bitsCount > 0) {
        ({ cursors, mwdDPoints } = this.rulesHandler.handle80BitsRule(
          mwdDPoints,
          { ...cursors, bitsCount },
          generatorConfig
        ));
      }

      // Handle rule with bit constraints
      this.rulesHandler.handleBitContraintRule(
        bitConstraintDPoints,
        bitsCount,
        rules
      );

      // Handle all other rules
      this.rulesHandler.handleDPointRules(dpoint, rules);

      // Handle frameset overloading dpoints
      this.rulesHandler.handleOverloadingDPoints(generatorConfig);
    }
  }

  // private getRules(toolId?: string) {
  getRules(toolId?: string) {
    const rules: GeneratorConfigRule[] = [];
    if (toolId) {
      const toolRules = this.generatorConfig?.tools
        .find((_) => _.id === toolId)
        ?.rules.filter((_) => _.isActive);
      if (!toolRules) {
        throw new FramrServiceError('Unknown tool id');
      }
      rules.push(...toolRules);
    } else {
      for (const tool of this.generatorConfig?.tools ?? []) {
        rules.push(...tool.rules.filter((_) => _.isActive));
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
