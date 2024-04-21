import { CreateRule } from '../../../../types';

export enum RulesEventChannel {
  CREATE_RULES_CHANNEL = 'CREATE_RULES',
  FIND_ONE_RULES_CHANNEL = 'FIND_ONE_RULES',
  FIND_ALL_RULES_CHANNEL = 'FIND_ALL_RULES',
  UPDATE_RULES_CHANNEL = 'UPDATE_RULES',
  DELETE_RULES_CHANNEL = 'DELETE_RULES',
}
export interface RuleInterface {
  create(RULES: CreateRule): void;
  findOne(index: number): void;
  findAll(): void;
  update(index: number, RULES: CreateRule): void;
  delete(index: number): void;
}
