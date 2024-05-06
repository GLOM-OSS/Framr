import { CreateRule } from '../../../../types';

export enum RulesEventChannel {
  CREATE_RULES_CHANNEL = 'CREATE_RULES',
  FIND_ONE_RULES_CHANNEL = 'FIND_ONE_RULES',
  FIND_ALL_RULES_CHANNEL = 'FIND_ALL_RULES',
  UPDATE_RULES_CHANNEL = 'UPDATE_RULES',
  DELETE_RULES_CHANNEL = 'DELETE_RULES',
}
export interface RuleInterface {
  create(rule: CreateRule): void;
  findOne(index: string): void;
  findAll(toolId?: string, DPointId?: string): void;
  update(index: string, rule: CreateRule): void;
  delete(index: string): void;
}
