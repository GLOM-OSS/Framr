import { ToolEnum } from '../../../../types/enums';
import { CreateTool } from '../../../../types';

export enum ToolsEventChannel {
  CREATE_TOOLS_CHANNEL = 'CREATE_TOOLS',
  FIND_ONE_TOOLS_CHANNEL = 'FIND_ONE_TOOLS',
  FIND_ALL_TOOLS_CHANNEL = 'FIND_ALL_TOOLS',
  UPDATE_TOLLS_CHANNEL = 'UPDATE_TOOLS',
  DELETE_TOLLS_CHANNEL = 'DELETE_TOOLS',
  CREATE_FROM_TOOLS_CHANNEL = 'create-from-tools-channel',
}

export type ToolFilterOptions = {
  type?: ToolEnum;
};

export interface ToolInterface {
  create(createTool: CreateTool): void;
  findOne(index: string): void;
  findAll(filter: ToolFilterOptions): void;
  update(index: string, createTool: CreateTool): void;
  delete(index: string): void;
  createFrom(file: File): void;
}
