import { CreateService } from '../../../../types';

export enum ServicesEventChannel {
  CREATE_SERVICES_CHANNEL = 'CREATE_SERVICES',
  FIND_ONE_SERVICES_CHANNEL = 'FIND_ONE_SERVICES',
  FIND_ALL_SERVICES_CHANNEL = 'FIND_ALL_SERVICES',
  UPDATE_SERVICES_CHANNEL = 'UPDATE_SERVICES',
  DELETE_SERVICES_CHANNEL = 'DELETE_SERVICES',
}
export interface ServiceInterface {
  create(service: CreateService): void;
  findOne(index: string): void;
  findAll(toolId?: string): void;
  update(toolId: string, service: CreateService): void;
  delete(index: string): void;
}
