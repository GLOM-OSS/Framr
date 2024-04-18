import { FramrDBSchema } from '.';
import { StoreRecord } from '../../IDBFactory.types';

export type ToolRecord = StoreRecord<FramrDBSchema, 'tools'>;
export type DPointRecord = StoreRecord<FramrDBSchema, 'dpoints'>;
export type RuleRecord = StoreRecord<FramrDBSchema, 'rules'>;
export type ServiceRecord = StoreRecord<FramrDBSchema, 'services'>;