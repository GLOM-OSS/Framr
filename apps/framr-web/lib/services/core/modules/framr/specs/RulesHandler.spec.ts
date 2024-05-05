import { EventBus } from '../../../../../services/libs/event-bus';
import {
  DPoint,
  FSLFrameType,
  GeneratorConfigRule,
  Service,
} from '../../../../../types';
import { FrameEnum, ToolEnum } from '../../../../../types/enums';
import { IDBConnection } from '../../../db/IDBConnection';
import { ToolsEventChannel } from '../../tools/ToolInterface';
import { ToolsService } from '../../tools/ToolsService';
import { DataProcessor } from '../../tools/data-processor/DataProcessor';
import { FramrService } from '../FramrService';
import { sampleFileContent } from './sample-file';

describe('RulesHandler', () => {
  const eventBus = new EventBus();
  const database = IDBConnection.getDatabase();
  const dataProcessor = new DataProcessor();
  const framr = new FramrService();
  const toolServices = new ToolsService();

  const sampleDPoints: DPoint[] = [];
  let sampleData: Service[] = [];
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

    sampleData = (await database.findAll('services'))
      .map((_) => _.value)
      .slice(0, 3);
    sampleDataRules = (await database.findAll('rules'))
      .filter((_) =>
        sampleData.some((data) => data.tool.id === _.value.tool.id)
      )
      .map((_) => ({
        ..._.value,
        isActive: true,
        isGeneric: true,
      }))
      .slice(0, 3);

    framr.initialize({
      bitRate: 5,
      MWDTool: {
        id: '',
        long: '',
        maxBits: 12,
        maxDPoints: 5,
        name: '',
        type: ToolEnum.MWD,
        version: 'v1.0',
        rules: sampleDataRules,
      },
      penetrationRate: 15,
      tools: sampleData.map((_) => ({
        ..._.tool,
        type: ToolEnum.LWD,
        rules: sampleDataRules.filter((rule) => rule.tool.id === _.tool.id),
      })),
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

    sampleData.forEach(({ tool, dpoints: dps }) => {
      framr.addAndDispatchDPoints(fslNumber, tool.id, dps);
      sampleDPoints.push(...dps);
    });
    const fsl = framr.generatorConfig?.framesets.fsl.find(
      (_) => _.number === fslNumber
    );
    expect(fsl).not.toBeNull();

    for (const frame in fsl?.framesets) {
      const fslFrameset = fsl?.framesets[frame as FSLFrameType];
      expect(fslFrameset.dpoints.length).toBeGreaterThan(0);
    }
  });

  it('Should order framset dpoints', () => {
    const fslNumber = 1;
    if (sampleDPoints.length === 0) {
      sampleData.forEach(({ tool, dpoints: dps }) => {
        framr.addAndDispatchDPoints(fslNumber, tool.id, dps);
        sampleDPoints.push(...dps);
      });
    }

    framr.orderFramesetDPoints(fslNumber, FrameEnum.ROT);
  });
});
