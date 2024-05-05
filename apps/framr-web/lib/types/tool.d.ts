import { ToolEnum } from './enums';

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
  maxBits: number;
  maxDPoints: number;
}

export interface MWDTool extends CreateMWDTool {
  id: string;
}

export type CreateTool = CreateLWDTool | CreateMWDTool;

export type Tool = LWDTool | MWDTool;
