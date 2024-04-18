import { CreateLWDTool, CreateTool, LWDTool  } from "../../../../types";


export interface ToolInterface {
  create(createTool: CreateTool) : Promise<void>;
  findOne(index: number) : Promise<void>;
  findAll() : Promise<void>;
  update(index: number, createTool: CreateTool) : Promise<void>;
  delete(index: number) : Promise<void>;
}
