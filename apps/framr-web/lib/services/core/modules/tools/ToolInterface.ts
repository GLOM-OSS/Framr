import { CreateTool } from '../../../../types';

export enum ToolsEventChannel {
  CREATE_TOOLS_CHANNEL = 'CREATE_TOOLS',
  FIND_ONE_TOOLS_CHANNEL = 'FIND_ONE_TOOLS',
  FIND_ALL_TOOLS_CHANNEL = 'FIND_ALL_TOOLS',
  UPDATE_TOLLS_CHANNEL = 'UPDATE_TOOLS',
  DELETE_TOLLS_CHANNEL = 'DELETE_TOOLS',
}
export interface ToolInterface {
  create(createTool: CreateTool): void;
  findOne(index: number): void;
  findAll(): void;
  update(index: number, createTool: CreateTool): void;
  delete(index: number): Promise<void>;
}
