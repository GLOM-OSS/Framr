import { CreateDPoint } from '../../../../types';
import { FilterOptions } from '../common/common.types';

export enum DPointsEventChannel {
  CREATE_DPOINT_CHANNEL = 'CREATE_DPOINTS',
  FIND_ONE_DPOINT_CHANNEL = 'FIND_ONE_DPOINTS',
  FIND_ALL_DPOINT_CHANNEL = 'FIND_ALL_DPOINTS',
  UPDATE_DPOINT_CHANNEL = 'UPDATE_DPOINTS',
  DELETE_DPOINT_CHANNEL = 'DELETE_DPOINTS',
}

export interface DPointInterface {
  create(dpoint: CreateDPoint): void;
  findOne(index: string): void;
  findAll(filter?: FilterOptions): void;
  update(index: string, dpoint: CreateDPoint): void;
  delete(index: string): void;
}
