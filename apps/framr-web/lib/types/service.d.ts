import { DPoint } from './dpoint';
import { Tool } from './tool';

export interface CreateService {
  name: string;
  interact?: string;
  dpoints: DPoint[];
  tool: Tool;
}

export interface Service extends CreateService {
  id: string;
}
