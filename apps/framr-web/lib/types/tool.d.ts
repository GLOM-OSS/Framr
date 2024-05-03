import { ToolEnum } from './enums';

export interface CreateTool {
  name: string;
  version: string;
  long: string;
  type: ToolEnum;
  max_bits?: number;
  max_dpoints?: number;
}

export interface ITool extends CreateTool {
  id: string;
}

export interface CreateLWDTool {
  name: string;
  version: string;
  long: string;
  type: ToolEnum;
}

export interface LWDTool extends CreateLWDTool {
  id: string;
  type: ToolEnum.LWD;
}

export interface CreateMWDTool extends CreateLWDTool {
  type: ToolEnum.MWD;
  max_bits: number;
  max_dpoints: number;
}

export interface MWDTool extends CreateMWDTool {
  id: string;
}

export type CreateTool = CreateLWDTool | CreateMWDTool;

export type Tool = LWDTool | MWDTool;
