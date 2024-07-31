import {
  DPoint,
  LWDTool,
  Rule,
  Service,
  Tool,
  XmlData,
  XmlDataPoint,
} from '../../../../../types';
import {
  FrameEnum,
  StandAloneRuleEnum,
  ToolEnum,
  WithOtherDPointRuleEnum,
} from '../../../../../types/enums';
import { FramrServiceError } from '../../../../libs/errors';
import { XmlIO } from '../../../../libs/xml-io';
import { getRandomID } from '../../common/common';

export type FramrBulkData = {
  tools: LWDTool[];
  services: Service[];
  dpoints: DPoint[];
  rules: Rule[];
};

export class DataProcessor {
  private readonly xmlIO: XmlIO;
  constructor() {
    this.xmlIO = new XmlIO();
  }

  async processXmlFile(file: File): Promise<FramrBulkData> {
    const { tool: xmlTools } = await this.xmlIO.parseFromFile<XmlData>(file);

    const tools: LWDTool[] = [];
    const services: Service[] = [];
    const dpoints: DPoint[] = [];
    const rules: Rule[] = [];

    for (const {
      mandatory,
      services: xmlToolServices,
      ...tool
    } of Array.isArray(xmlTools) ? xmlTools : [xmlTools]) {
      const newTool: LWDTool = {
        ...tool,
        type: ToolEnum.LWD,
        id: getRandomID(),
      };
      tools.push(newTool);

      let mandatoryDpoints = mandatory?.dpoint ?? [];
      mandatoryDpoints = Array.isArray(mandatoryDpoints)
        ? mandatoryDpoints
        : [mandatoryDpoints];
      for (const { name, ...rest } of mandatoryDpoints) {
        const newDPoint: DPoint = {
          name,
          bits: 0,
          tool: newTool,
          id: getRandomID(),
        };
        rules.push({
          tool: newTool,
          id: getRandomID(),
          concernedDpoint: newDPoint,
          description: StandAloneRuleEnum.SHOULD_BE_PRESENT,
          framesets: DataProcessor.getDpointFrames(rest),
        });
        dpoints.push(newDPoint);
      }
      let toolServices = xmlToolServices?.service;
      toolServices = toolServices
        ? Array.isArray(toolServices)
          ? toolServices
          : [toolServices]
        : [];
      services.push(
        ...toolServices.map(({ dpoint: serviceDPoints, interact, name }) => ({
          name,
          interact,
          tool: newTool,
          id: getRandomID(),
          dpoints: (serviceDPoints
            ? Array.isArray(serviceDPoints)
              ? serviceDPoints
              : [serviceDPoints]
            : []
          ).map(({ name, ...rest }) => {
            const newDPoint: DPoint = {
              name,
              bits: 0,
              tool: newTool,
              id: getRandomID(),
            };
            const dpoint = dpoints.find((_) => _.name === name);
            if (!dpoint) dpoints.push(newDPoint);
            rules.push({
              tool: newTool,
              id: getRandomID(),
              concernedDpoint: dpoint ?? newDPoint,
              description: StandAloneRuleEnum.SHOULD_BE_PRESENT,
              framesets: DataProcessor.getDpointFrames(rest),
            });
            return newDPoint;
          }),
        }))
      );
    }

    return { tools, services, dpoints, rules };
  }

  async processTxtFile(file: File, framrBulkData: FramrBulkData) {
    return new Promise<FramrBulkData>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target!.result as string;
        const lines = content.split('\n');
        lines.shift();
        for (const line of lines) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [toolName, dpointName, _, numberOfBits] = line
            .split('\t')
            .map((item) => item.trim());

          const dpointIndex = framrBulkData.dpoints.findIndex(
            (dpoint) => dpoint.name === dpointName
            // && dpoint.tool.name === toolName
          );
          if (dpointIndex !== -1) {
            const dpoint = framrBulkData.dpoints[dpointIndex];
            framrBulkData.dpoints[dpointIndex] = {
              ...dpoint,
              bits: Number(numberOfBits),
            };

            framrBulkData.services = framrBulkData.services.map((service) => ({
              ...service,
              dpoints: service.dpoints.map((dpoint) => ({
                ...dpoint,
                bits:
                  dpoint.name === dpointName
                    ? Number(numberOfBits)
                    : dpoint.bits,
              })),
            }));
          }

          const toolIndex = framrBulkData.tools.findIndex(
            (tool) => tool.name === toolName
          );
          if (toolIndex === -1) {
            const newTool: Tool = {
              id: getRandomID(),
              long: '',
              version: '',
              name: toolName,
              type: ToolEnum.LWD,
            };
            framrBulkData.tools.push(newTool);
            const newDPoint = {
              id: getRandomID(),
              bits: Number(numberOfBits),
              name: dpointName,
              tool: newTool,
            };
            framrBulkData.dpoints.push(newDPoint);
          }
        }
        resolve(framrBulkData);
      };

      reader.onerror = function (e) {
        console.error('Error reading TXT file', e);
        reject(new FramrServiceError('Error reading TXT file'));
      };

      reader.readAsText(file);
    });
  }

  async processDPointCSV(file: File) {
    return new Promise<FramrBulkData>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target!.result as string;
        const lines = content.split('\n');
        const header = lines.shift();
        if (!header?.includes('internal name')) {
          reject(
            new FramrServiceError(
              'Provided csv cannot be used to import tools and dpoints'
            )
          );
        }

        const framrBulkData: FramrBulkData = {
          dpoints: [],
          rules: [],
          services: [],
          tools: [],
        };

        for (const line of lines) {
          const [
            internalName,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            commercialName,
            version,
            serviceName,
            dpointName,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            toolType,
            mtf,
            gtf,
            rot,
            util,
            numberOfBits,
          ] = line.split(',');

          let tool = framrBulkData.tools.find(
            (tool) => tool.name === internalName
          );
          if (!tool) {
            tool = {
              id: getRandomID(),
              long: '',
              version,
              name: internalName,
              type: ToolEnum.LWD,
            };
            framrBulkData.tools.push(tool);
          }

          const newDPoint: DPoint = {
            id: getRandomID(),
            bits: Number(numberOfBits),
            name: dpointName,
            tool,
          };
          framrBulkData.dpoints.push(newDPoint);

          const framesets: FrameEnum[] = [];
          if (mtf) {
            framesets.push(FrameEnum.MTF);
          } else if (gtf) {
            framesets.push(FrameEnum.GTF);
          } else if (rot) {
            framesets.push(FrameEnum.ROT);
          } else if (util) {
            framesets.push(FrameEnum.UTIL);
          }
          const dpointRule: Rule = {
            id: getRandomID(),
            concernedDpoint: newDPoint,
            description: StandAloneRuleEnum.SHOULD_BE_PRESENT,
            framesets,
            tool,
          };
          framrBulkData.rules.push(dpointRule);

          const serviceIndex = framrBulkData.services.findIndex(
            (dpoint) => dpoint.name === serviceName
          );
          if (serviceIndex === -1) {
            const newService: Service = {
              dpoints: [newDPoint],
              id: getRandomID(),
              name: serviceName,
              tool,
            };
            framrBulkData.services.push(newService);
          } else {
            const service = framrBulkData.services[serviceIndex];
            framrBulkData.services[serviceIndex] = {
              ...service,
              dpoints: [...service.dpoints, newDPoint],
            };
          }
        }

        resolve(framrBulkData);
      };

      reader.onerror = function (e) {
        console.error('Error reading CSV file', e);
        reject(new FramrServiceError('Error reading CSV file'));
      };

      reader.readAsText(file);
    });
  }

  async processRuleCSV(file: File, framrBulkData: FramrBulkData) {
    return new Promise<FramrBulkData>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target!.result as string;
        const lines = content.split('\n');
        const header = lines.shift();
        if (!header?.includes('Rule number')) {
          throw new FramrServiceError(
            'Provided csv cannot be used to import rules'
          );
        }

        for (const line of lines) {
          const [
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ruleNumber,
            toolName,
            toolVersion,
            primaryDPointName,
            framesets,
            ruleDescription,
            secondaryDPoints,
          ] = line.split(',').map((col) => col.replace(/"/g, ''));
          const concernedDpoint = framrBulkData.dpoints.find(
            ({ name, tool }) =>
              name == primaryDPointName &&
              tool.name == toolName &&
              tool.version == toolVersion
          );
          if (concernedDpoint) {
            const otherDPoints = framrBulkData.dpoints.filter((_) =>
              secondaryDPoints.includes(_.name)
            );
            const newRule: Rule = {
              concernedDpoint,
              description: ruleDescription as WithOtherDPointRuleEnum,
              framesets: DataProcessor.getDpointFrames({
                gtf: framesets.includes('gtf'),
                mtf: framesets.includes('mtf'),
                rot: framesets.includes('util'),
              }),
              id: getRandomID(),
              tool: concernedDpoint.tool,
              otherDpoints: otherDPoints,
            };
            framrBulkData.rules.push(newRule);
          }
        }

        resolve(framrBulkData);
      };

      reader.onerror = function (e) {
        console.error('Error reading CSV file', e);
        reject(new FramrServiceError('Error reading CSV file'));
      };

      reader.readAsText(file);
    });
  }

  private static getDpointFrames<DPoint = Omit<XmlDataPoint, 'name'>>(
    dpoint: DPoint
  ) {
    const frames: FrameEnum[] = [];

    for (const key in dpoint) {
      if (dpoint[key as keyof DPoint]) {
        frames.push(FrameEnum[key.toUpperCase() as keyof typeof FrameEnum]);
      }
    }

    return frames;
  }
}
