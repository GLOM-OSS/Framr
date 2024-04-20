import {
  XmlDataPoint,
  XmlData,
  DPoint,
  LWDTool,
  Rule,
  Service,
} from '../../../../../types';
import { FrameEnum, RuleEnum, ToolEnum } from '../../../../../types/enums';

export type ProcessedXMLData = {
  tools: LWDTool[];
  services: Service[];
  dpoints: DPoint[];
  rules: Rule[];
};

export class DataProcessor {
  processXMLData(rawData: XmlData): ProcessedXMLData {
    const tools: LWDTool[] = [];
    const services: Service[] = [];
    const dpoints: DPoint[] = [];
    const rules: Rule[] = [];

    for (const {
      mandatory: { dpoint: mandatoryDpoints },
      services: { service: toolServices },
      ...tool
    } of rawData.tool) {
      const newTool: LWDTool = {
        ...tool,
        type: ToolEnum.LWD,
        id: crypto.randomUUID(),
      };
      tools.push(newTool);

      for (const { name, ...rest } of mandatoryDpoints) {
        const newDPoint: DPoint = {
          name,
          //FIXME: where do I get this value
          bits: 0,
          tool: newTool,
          id: crypto.randomUUID(),
        };
        rules.push({
          tool: newTool,
          id: crypto.randomUUID(),
          concernedDpoint: newDPoint,
          description: RuleEnum.SHOULD_BE_PRESENT,
          framesets: this.getDpointFrames(rest),
        });
        dpoints.push(newDPoint);
      }

      services.push(
        ...toolServices.map(({ dpoint: dpoints, interact, name }) => ({
          name,
          interact,
          tool: newTool,
          id: crypto.randomUUID(),
          dpoints: dpoints.map(({ name, ...rest }) => ({
            name,
            bits: 0,
            tool: newTool,
            id: crypto.randomUUID(),
          })),
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
