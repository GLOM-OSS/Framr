import { Tool } from './tool';

export interface CreateDPoint {
  name: string;
  bits: number;
  tool: Tool
}

export interface DPoint extends CreateDPoint {
  id: string;
}
