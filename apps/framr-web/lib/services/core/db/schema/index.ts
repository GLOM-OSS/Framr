import { DBSchema } from 'idb';
import { DPoint, Rule, Service, Tool } from '../../../../types';
import { type StoreRecord } from '../../../libs/idb';

export interface FramrDBSchema extends DBSchema {
  tools: {
    key: string;
    value: Tool;
  };
  dpoints: {
    key: string;
    value: DPoint;
  };
  services: {
    key: string;
    value: Service;
  };
  rules: {
    key: string;
    value: Rule;
  };
}

export type ToolRecord = StoreRecord<FramrDBSchema, 'tools'>;
export type DPointRecord = StoreRecord<FramrDBSchema, 'dpoints'>;
export type RuleRecord = StoreRecord<FramrDBSchema, 'rules'>;
export type ServiceRecord = StoreRecord<FramrDBSchema, 'services'>;
