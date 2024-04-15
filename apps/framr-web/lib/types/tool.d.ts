export enum ToolEnum {
  MWD = 'MWD',
  LWD = 'LWD',
}

export interface CreateTool {
  name: string;
  version: string;
  long: string;
  type: ToolEnum;
}

export interface LWDTool extends CreateTool {
  id: string;
  type: ToolEnum.LWD;
}

export interface CreateMWDTool extends CreateTool {
  type: ToolEnum.MWD;
  max_bits: number;
  max_dpoints: number;
}

export interface MWDTool extends CreateMWDTool {
  id: string;
}

export type Tool = LWDTool | MWDTool;
