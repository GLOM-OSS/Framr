import { randomUUID } from 'crypto';
import { EventBus } from '../../../../../services/libs/event-bus';
import {
  DPoint,
  GeneratorConfigRule,
  MWDTool,
  Service,
} from '../../../../../types';
import {
  FrameEnum,
  ToolEnum,
  WithOtherDPointRuleEnum,
} from '../../../../../types/enums';
import { IDBConnection } from '../../../db/IDBConnection';
import { ToolsEventChannel } from '../../tools/ToolInterface';
import { ToolsService } from '../../tools/ToolsService';
import { FramrService } from '../FramrService';
import { sampleFileContent } from './sample-file';

describe('RulesHandler', () => {
  const eventBus = new EventBus();
  const database = IDBConnection.getDatabase();
  const framr = new FramrService();
  const toolServices = new ToolsService();

  let sampleService: Service;
  let sampleDPoints: DPoint[] = [];
  let sampleDataRules: GeneratorConfigRule[] = [];

  beforeAll(async () => {
    // // Create a Blob from the buffer
    const blob = new Blob([sampleFileContent], { type: 'text/plain' });

    // Create a File from the Blob
    const file = new File([blob], __filename);
    // const data = await dataProcessor.processXMLData(file);

    const createFromCallback = new Promise((resolve) => {
      eventBus.once(ToolsEventChannel.CREATE_FROM_TOOLS_CHANNEL, resolve);
    });
    toolServices.createFrom(file);
    await createFromCallback;

    [sampleService] = (await database.findAll('services')).map((_) => _.value);
    const rules = (await database.findAll('rules'))
      .filter(
        (_) =>
          sampleService.tool.id === _.value.tool.id &&
          _.value.framesets.includes(FrameEnum.ROT)
      )
      .map((_) => ({
        ..._.value,
        isActive: true,
        isGeneric: true,
      }));
    sampleDataRules = rules.slice(0, 3);
    sampleDPoints = (await database.findAll('dpoints'))
      .filter((_) =>
        sampleDataRules.some((rule) => rule.concernedDpoint.id === _.value.id)
      )
      .map((_) => _.value)
      .slice(0, 3);

    const mwdTool: MWDTool = {
      id: 'mwd-tool-id',
      long: 'MWD Tool Id',
      maxBits: 12,
      maxDPoints: 5,
      name: '',
      type: ToolEnum.MWD,
      version: 'v1.0',
    };

    framr.initialize({
      bitRate: 5,
      MWDTool: {
        ...mwdTool,
        rules: rules
          .slice(3, 5)
          .map((rule) => ({
            ...rule,
            tool: mwdTool,
            concernedDpoint: { ...rule.concernedDpoint, tool: mwdTool },
          })),
      },
      penetrationRate: 15,
      tools: [
        {
          ...sampleService.tool,
          type: ToolEnum.LWD,
          rules: sampleDataRules,
        },
      ],
    });
  });

  afterAll(async () => {
    await Promise.all([
      database.clear('dpoints'),
      database.clear('rules'),
      database.clear('services'),
      database.clear('tools'),
    ]);
  });

  it('Generator should be initialized', () => {
    expect(framr.generatorConfig).not.toBeNull();
    expect(framr.generatorConfig?.framesets.fsl.length).toEqual(6);
  });

  it('Should dispatch dpoint to various framesets', () => {
    const fslNumber = 1;
    const { tool, dpoints } = sampleService;
    framr.dispatchAndOrderDPoints(fslNumber, tool.id, dpoints);
    sampleDPoints.push(...dpoints);
    const fsl = framr.generatorConfig?.framesets.fsl.find(
      (_) => _.number === fslNumber
    );
    expect(fsl).not.toBeNull();

    const fslFrameset = fsl?.framesets[FrameEnum.ROT];
    expect(fslFrameset).not.toBeUndefined();
    expect(fslFrameset?.dpoints.length).toBeGreaterThan(0);
  });

  it('Should order framset dpoints', () => {
    const fslNumber = 1;
    const { tool } = sampleService;
    framr.dispatchAndOrderDPoints(fslNumber, tool.id, sampleDPoints);

    const cdpIndex = Math.floor(Math.random() * sampleDPoints.length);
    const concernedDpoint = sampleDPoints[cdpIndex];
    const description =
      cdpIndex % 2
        ? WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER
        : cdpIndex % 3
        ? WithOtherDPointRuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER
        : sampleDPoints.length == 3
        ? WithOtherDPointRuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
        : WithOtherDPointRuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER;
    const otherDpoints = sampleDPoints.slice(cdpIndex + 1);

    framr.updateToolRules(tool.id, [
      ...sampleDataRules,
      {
        tool,
        description,
        concernedDpoint,
        otherDpoints,
        isActive: true,
        isGeneric: false,
        id: randomUUID(),
        framesets: [FrameEnum.ROT],
      },
    ]);

    framr.orderFramesetDPoints(fslNumber, FrameEnum.ROT);

    console.log(framr.orderedDPoints);
    console.log({ description, concernedDpoint, otherDpoints, sampleDPoints });

    const rules = framr.getRules(tool.id);
    expect(rules.length).toEqual(sampleDataRules.length + 1);
  });
});
