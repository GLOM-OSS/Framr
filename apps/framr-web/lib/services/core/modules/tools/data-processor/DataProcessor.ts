import { randomUUID } from 'crypto';
import {
  DPoint,
  LWDTool,
  Rule,
  Service,
  XmlData,
  XmlDataPoint,
} from '../../../../../types';
import {
  FrameEnum,
  StandAloneRuleEnum,
  ToolEnum,
} from '../../../../../types/enums';
import { XmlIO } from '../../../../libs/xml-io';

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

  async processXMLData(file: File): Promise<FramrBulkData> {
    const { tool: xmlTools } = await this.xmlIO.parseFromFile<XmlData>(file);

    const tools: LWDTool[] = [];
    const services: Service[] = [];
    const dpoints: DPoint[] = [];
    const rules: Rule[] = [];

    for (const {
      mandatory: { dpoint: mandatoryDpoints },
      services: { service: toolServices },
      ...tool
    } of Array.isArray(xmlTools) ? xmlTools : [xmlTools]) {
      const newTool: LWDTool = {
        ...tool,
        type: ToolEnum.LWD,
        id: randomUUID(),
      };
      tools.push(newTool);

      for (const { name, ...rest } of mandatoryDpoints) {
        const newDPoint: DPoint = {
          name,
          bits: 0,
          tool: newTool,
          id: randomUUID(),
        };
        rules.push({
          tool: newTool,
          id: randomUUID(),
          concernedDpoint: newDPoint,
          description: StandAloneRuleEnum.SHOULD_BE_PRESENT,
          framesets: this.getDpointFrames(rest),
        });
        dpoints.push(newDPoint);
      }

      services.push(
        ...toolServices.map(({ dpoint: dpoints, interact, name }) => ({
          name,
          interact,
          tool: newTool,
          id: randomUUID(),
          dpoints: (Array.isArray(dpoints) ? dpoints : [dpoints]).map(
            ({ name, ...rest }) => {
              const newDPoint: DPoint = {
                name,
                bits: 0,
                tool: newTool,
                id: randomUUID(),
              };
              rules.push({
                tool: newTool,
                id: randomUUID(),
                concernedDpoint: newDPoint,
                description: StandAloneRuleEnum.SHOULD_BE_PRESENT,
                framesets: this.getDpointFrames(rest),
              });
              return newDPoint;
            }
          ),
        }))
      );
    }

    return { tools, services, dpoints, rules };
  }

  private getDpointFrames<DPoint = Omit<XmlDataPoint, 'name'>>(dpoint: DPoint) {
    const frames: FrameEnum[] = [];

    for (const key in dpoint) {
      if (dpoint[key as keyof DPoint]) {
        frames.push(FrameEnum[key.toUpperCase() as keyof typeof FrameEnum]);
      }
    }

    return frames;
  }
}
