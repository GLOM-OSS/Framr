import { CreateDPoint } from '../../../../types';

export enum DpointsEventChannel {
  CREATE_DPOINT_CHANNEL = 'CREATE_DPOINTS',
  FIND_ONE_DPOINT_CHANNEL = 'FIND_ONE_DPOINTS',
  FIND_ALL_DPOINT_CHANNEL = 'FIND_ALL_DPOINTS',
  UPDATE_DPOINT_CHANNEL = 'UPDATE_DPOINTS',
  DELETE_DPOINT_CHANNEL = 'DELETE_DPOINTS',
}
export interface DpointInterface {
  create(dpoint: CreateDPoint): void;
  findOne(index: number): void;
  findAll(): void;
  update(index: number, dpoint: CreateDPoint): void;
  delete(index: number): void;
}
