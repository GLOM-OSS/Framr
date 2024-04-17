import { DPoint, Rule, Service, Tool } from '../../../../types';
import { DBSchema } from 'idb';

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
