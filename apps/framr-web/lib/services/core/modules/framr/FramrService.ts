import {
  CreateGeneratorConfig,
  DPoint,
  DPointsetDPoint,
  FSLFrameType,
  FramesetDpoint,
  GeneratorConfig,
  GeneratorConfigRule,
  GeneratorConfigTool,
} from '../../../../types';
import {
  FrameEnum,
  StandAloneRuleEnum,
  ToolEnum,
  WithConstraintRuleEnum,
} from '../../../../types/enums';
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
  // private rulesHandler: RulesHandler;

  private _generatorConfig: GeneratorConfig | null = null;
  public get generatorConfig(): GeneratorConfig | null {
    return this._generatorConfig;
  }
  public set generatorConfig(value: GeneratorConfig) {
    this._generatorConfig = value;
  }

  constructor(config?: GeneratorConfig) {
    this.xmlIO = new XmlIO();
    // this.rulesHandler = new RulesHandler();
    if (config) {
      this.generatorConfig = config;
    }
  }
  initialize(config: CreateGeneratorConfig) {
    const initializeFramesets = (frameType: FSLFrameType | FrameEnum.UTIL) => {
      return {
        frame: frameType,
        dpoints: [],
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
      if (frame === FrameEnum.UTIL) {
        generatorConfig.framesets.utility = {
          frame,
          dpoints: framesetDPoints,
        };
      } else {
        currentFSL.framesets[frame] = {
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

    const updatedFramesets = Object.values(currentFSL.framesets).reduce(
      (fslFrame, { dpoints, frame }) => ({
        ...fslFrame,
        [frame]: {
          dpoints: dpoints.filter((dpoint) => !dpointIds.includes(dpoint.id)),
          frame,
        },
      }),
      currentFSL.framesets
    );

    this.generatorConfig = {
      ...generatorConfig,
      framesets: {
        ...generatorConfig.framesets,
        fsl: generatorConfig.framesets.fsl.map((fsl) =>
          fsl.number === fslNumber
            ? {
                ...fsl,
                framesets: updatedFramesets,
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
    const orderedDPoints = this.orderDPoints(frame, dpoints, generatorConfig);

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
                  [frame]: { frame, dpoints: orderedDPoints },
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
      console.log('New frameset ', frameset);
      this.orderFramesetDPoints(fslNumber, frameset as FSLFrameType);
    }
  }

  updateToolRules(toolId: string, rules: GeneratorConfigRule[]) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    if (toolId === this.generatorConfig.MWDTool.id) {
      this.generatorConfig.MWDTool.rules = rules;
    } else {
      this.generatorConfig.tools = this.generatorConfig.tools.map((tool) =>
        tool.id === toolId ? { ...tool, rules } : tool
      );
    }
  }

  removeDPointsConstraints(fslNumber: number, dpoints: FramesetDpoint[]) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }
    const activeFsl = this.getCurrentFSL(fslNumber);

    for (const frame in activeFsl.framesets) {
      activeFsl.framesets[frame as FSLFrameType].dpoints.filter(
        ({ dpointId, isBaseInstance }) =>
          !isBaseInstance &&
          dpoints.some((dpoint) => dpoint.dpointId === dpointId)
      );
    }
    this.generatorConfig.framesets.fsl.map((fslInstance) =>
      activeFsl.number === fslNumber ? activeFsl : fslInstance
    );

    this.generatorConfig.tools.forEach((tool) => {
      const rules = tool.rules.filter(
        (rule) =>
          !dpoints.some(
            (dpoint) =>
              rule.concernedDpoint.id === dpoint.dpointId &&
              [
                WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
                WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
              ].includes(rule.description as WithConstraintRuleEnum)
          )
      );
      this.updateToolRules(tool.id, rules);
    });
  }

  exportGeneratorConfig() {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    let fslDataString =
      `LIBTYPE:${this.generatorConfig.MWDTool.long}` +
      `\nFRMTYPE:REPEATING` +
      `\nUSER FRAME LIBRARY` +
      `\nFrameBuilderWizard Version : TnAShared2022_1_001 built on ${new Date().toISOString()}` +
      `\nLast modified: ${new Date().toISOString()}`;

    const {
      jobName,
      wellName,
      MWDTool: { name: mwdName, version: nwdVersion },
      framesets: {
        fsl: [fslFramesets],
        utility: utilityFrameset,
      },
    } = this.generatorConfig;
    const utilityDataString =
      fslDataString.replace('REPEATING', 'UTILITY') +
      `\nSTARTOFFRAME` +
      `\nFRM_TYPE:UTIL` +
      `\nMTF_FRM#${0}` +
      `\nGTF_FRM#${0}` +
      `\nROT_FRM#${0}` +
      `\n${jobName} ${wellName} ${FrameEnum.UTIL}` +
      `\nFRAME#6000\n` +
      getDPointList(utilityFrameset.dpoints);

    let frameNumber = 2000;
    [fslFramesets].forEach(({ framesets, number: fslNumber }) => {
      [FrameEnum.MTF, FrameEnum.GTF, FrameEnum.ROT].forEach((frame, i) => {
        const { dpoints } = framesets[frame as FSLFrameType];

        const object = Object.entries(FrameEnum).find(
          ([_, value]) => value === frame
        ) as [key: string, string];

        fslDataString +=
          `\nSTARTOFFRAME` +
          `\nFRM_TYPE:${object[0]}` +
          `\nMTF_FRM#${frameNumber}` +
          `\nGTF_FRM#${frameNumber + 1}` +
          `\nROT_FRM#${frameNumber + 2}` +
          `\n${jobName} FSL ${fslNumber} ${frame}` +
          `\nFRAME#${frameNumber + i}\n`;
        // if (dpoints.length > 0) {
        fslDataString += getDPointList(dpoints);
        // }
      });
      frameNumber++;
    });
    const repeatingFileName = `${jobName}_${mwdName}${nwdVersion}_Repeating`
      // reaplce special characters including space
      .replace(/[^a-zA-Z0-9_.]/g, '-');
    const utilityFileName = repeatingFileName.replace('Repeating', 'Utility');

    this.xmlIO.downloadFile(fslDataString, `${repeatingFileName}.udl`);
    this.xmlIO.downloadFile(utilityDataString, `${utilityFileName}.udl`);

    function getDPointList(dpoints: FramesetDpoint[]) {
      let dpointsString = '';
      dpoints.forEach((dpoint) => {
        dpointsString += `\n${dpoint.name}`;
      });

      return (dpointsString += `\nNULL` + `\n37321` + `\nENDOFFRAME\n`);
    }
  }

  private orderDPoints(
    frame: FSLFrameType,
    dpoints: FramesetDpoint[],
    generatorConfig: GeneratorConfig
  ) {
    const rules = this.getRules();

    // Partition the data points based on whether they should be at the beginning
    const [firstDPoints, dpointRest] = partition(dpoints, (dpoint) =>
      rules.some(
        (rule) =>
          rule.concernedDpoint.id === dpoint.dpointId &&
          rule.description === StandAloneRuleEnum.SHOULD_BE_THE_FIRST
      )
    );

    const rulesHandler = new RulesHandler(frame);

    // Add first data points to the ordered list, handling conflicts
    rulesHandler.handleFirstDPoints(firstDPoints, rules);
    const nonForbiddenDPoints = dpointRest.filter(
      (remainingDPoint) =>
        !rules.some(
          (rule) =>
            rule.concernedDpoint.id === remainingDPoint.dpointId &&
            rule.description === StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT
        )
    );

    // partition dpoints with or without constraints
    const [constraintDPoints, dpointsWithoutConstraints] = partition(
      nonForbiddenDPoints,
      (dpoint) =>
        rules.some(
          (rule) =>
            rule.concernedDpoint.id === dpoint.dpointId &&
            [
              WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT,
              WithConstraintRuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT,
            ].includes(rule.description as WithConstraintRuleEnum)
        )
    );

    // converting dpoints with update rate and density rate interval to dpoints with bit interval
    const dpointsWithConstraints = rulesHandler.resolveDPointConstraints(
      constraintDPoints,
      rules,
      generatorConfig
    );

    console.log({
      nonForbiddenDPoints,
      dpointsWithConstraints,
      dpointsWithoutConstraints,
      rules: generatorConfig.tools.map((_) => _.rules),
    });
    // Get available MWD Tool DPoints
    const mwdDPoints = generatorConfig.MWDTool.rules
      .filter((_) => _.description !== StandAloneRuleEnum.SHOULD_NOT_BE_PRESENT)
      .map((_) => _.concernedDpoint)
      .sort((a, b) => a.bits - b.bits);
    const mwdSeparator = mwdDPoints[0];

    // Process non constraint remaining data points and apply rules
    for (const dpoint of dpointsWithoutConstraints) {
      // Handle all other rules
      rulesHandler.handleDPointRules(dpoint, rules);

      const bitsCount = rulesHandler.orderedDPoints.reduce(
        (bitsCount, _) => bitsCount + _.bits,
        0
      );

      // Handle dpoints with constraints having intervals now mesured in bit
      rulesHandler.handleDPointsWithContraint(
        dpointsWithConstraints,
        bitsCount,
        rules
      );
    }

    const orderedDPointsClone = structuredClone(rulesHandler.orderedDPoints);

    const orderedDPointsetsPerDPointsetId: Record<string, DPointsetDPoint[]> =
      {};
    for (const dpoint of orderedDPointsClone) {
      if (orderedDPointsetsPerDPointsetId[dpoint.dpointsetId]) {
        orderedDPointsetsPerDPointsetId[dpoint.dpointsetId].push(dpoint);
      } else orderedDPointsetsPerDPointsetId[dpoint.dpointsetId] = [dpoint];
    }

    const orderedDPointsets = Object.values(orderedDPointsetsPerDPointsetId);

    const cursors: SpreadingCursors = {
      bitsCount: 0,
      lastIndex: -1,
    };
    orderedDPointsets.forEach((currentDPointset, index) => {
      const nextDPointset = orderedDPointsets[index + 1];
      if (nextDPointset) {
        rulesHandler.handle80BitsRule(
          mwdSeparator,
          cursors,
          generatorConfig.MWDTool.id,
          nextDPointset,
          currentDPointset
        );
      }
    });

    // Handle frameset overloading dpoints
    const { maxBits, maxDPoints } = generatorConfig.MWDTool;
    rulesHandler.handleOverloadingDPoints(maxBits, maxDPoints);

    return rulesHandler.orderedDPoints;
  }

  // private getRules(toolId?: string) {
  getRules(toolId?: string) {
    if (!this.generatorConfig) {
      throw new FramrServiceError('Service was not initialized');
    }

    const rules: GeneratorConfigRule[] = [];
    const mainTool: GeneratorConfigTool = {
      ...this.generatorConfig.MWDTool,
      type: ToolEnum.LWD,
    };

    const tools = this.generatorConfig.tools.concat(mainTool);
    if (toolId) {
      const toolRules = tools
        .find((_) => _.id === toolId)
        ?.rules.filter((_) => _.isActive);
      if (!toolRules) {
        throw new FramrServiceError('Unknown tool id');
      }
      rules.push(...toolRules);
    } else {
      for (const tool of tools) {
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
