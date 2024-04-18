<<<<<<< HEAD:apps/framr-web/lib/services/tools/ToolsService.ts
import { CreateLWDTool, CreateTool, LWDTool } from "../../types";
import { ToolEnum } from "../../types/enums";
import { IDBFactory } from "../db/IDBFactory";
import { StoreRecord } from "../db/IDBFactory.types";
import { IDBConnection } from "../db/connection/IDBConnection";
import { FramrDBSchema } from "../db/connection/schema";
import { EventBus, EventBusChannelStatus } from "../event-bus";
=======
import { CreateLWDTool, CreateTool, LWDTool } from "../../../../types";
import { ToolEnum } from "../../../../types/enums";
import { IDBConnection } from "../../db/IDBConnection";
import { FramrDBSchema } from "../../db/schema";
import { EventBus, EventBusChannelStatus } from "../../../libs/event-bus";
import { IDBFactory, StoreRecord } from "../../../libs/idb";

>>>>>>> 94f1ba5 (feat(app): 1 moving the tools service into the core module):apps/framr-web/lib/services/core/modules/tools/ToolsService.ts
// import { EventBusPayload } from "../event-bus/EventBus";
import { ToolInterface } from "./ToolInterface";

export enum ToolsEventChannel {
  CREATE_TOOLS_CHANNEL = "CREATE_TOOLS",
  FIND_ONE_TOOLS_CHANNEL = "FIND_ONE_TOOLS",
  FIND_ALL_TOOLS_CHANNEL = "FIND_ALL_TOOLS",
  UPDATE_TOLLS_CHANNEL = 'UPDATE_TOOLS',
  DELETE_TOLLS_CHANNEL = 'DELETE_TOOLS',
}

export class ToolsService implements ToolInterface {

  private readonly eventBus : EventBus;
  private readonly database : IDBFactory<FramrDBSchema>;
  // private readonly eventBus : EventBus = new EventBus();
  // private readonly database :  IDBFactory<FramrDBSchema> = IDBConnection.getDatabase();

  constructor() {
    this.database = IDBConnection.getDatabase();
    this.eventBus = new EventBus();
  }

  async create(createTool: CreateTool): Promise<void> {

    let newTool: StoreRecord<FramrDBSchema, "tools"> | null = null;

    if(createTool.type == ToolEnum.LWD) {
      newTool = {
        value:{...createTool, id: crypto.randomUUID(), type: ToolEnum.LWD}
      };
      let response = await this.database.insert('tools', newTool)
        .then(() => {
          this.eventBus.emit(ToolsEventChannel.CREATE_TOOLS_CHANNEL, {data:{...newTool!.value, id:response}, status:EventBusChannelStatus.SUCCESS});
        }).catch(() => {
          this.eventBus.emit(ToolsEventChannel.CREATE_TOOLS_CHANNEL, { data:{name:'error_creating_lwd_tools', message:'failure to create'}, status:EventBusChannelStatus.ERROR });
        });
    }

    if(createTool.type == ToolEnum.MWD) {
      newTool = {
        value:{...createTool, id: crypto.randomUUID(), type: ToolEnum.MWD, max_bits: 1, max_dpoints:10}
      };
      let response = await this.database.insert('tools', newTool)
      .then(() => {
        this.eventBus.emit(ToolsEventChannel.CREATE_TOOLS_CHANNEL, {data:{...newTool!.value, id:response}, status:EventBusChannelStatus.SUCCESS});
      }).catch(() => {
        this.eventBus.emit(ToolsEventChannel.CREATE_TOOLS_CHANNEL, { data:{name:'error_creating_mwd_tools', message:'failure to create'}, status:EventBusChannelStatus.ERROR });
      });
    }
  }


  async findOne(index: number): Promise<void> {

    let response = await this.database.findOne('tools', index)
    .then((result) => {
      this.eventBus.emit(ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL, {data:{...result}, status:EventBusChannelStatus.SUCCESS});
    }).catch((error) => {
      this.eventBus.emit(ToolsEventChannel.FIND_ONE_TOOLS_CHANNEL, { data:{name:'error_find_tools', message:'failure to find'}, status:EventBusChannelStatus.ERROR });
    });

  }

  async findAll(): Promise<void> {

    let response =  await this.database.findAll('tools')
    .then((result) => {
      this.eventBus.emit(ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL, {data:{...result}, status:EventBusChannelStatus.SUCCESS});
    }).catch((error) => {
      this.eventBus.emit(ToolsEventChannel.FIND_ALL_TOOLS_CHANNEL, { data:{name:'error_get_tools', message:'failure to get'}, status:EventBusChannelStatus.ERROR });
    })
  }

  async update(index: number, createTool: CreateTool): Promise<void> {

   let response =  await this.database.update("tools", index, createTool)
    .then((result) => {
      this.eventBus.emit(ToolsEventChannel.UPDATE_TOLLS_CHANNEL, {data:{ result }, status:EventBusChannelStatus.SUCCESS});
    }).catch((error) => {
      this.eventBus.emit(ToolsEventChannel.UPDATE_TOLLS_CHANNEL, { data:{name:'error_update_tools', message:`fail to update tools ${{...createTool}}`}, status:EventBusChannelStatus.ERROR });
    })
  }

  async delete(index: number): Promise<void> {
    await this.database.delete("tools", index)
    .then((result) => {
      this.eventBus.emit(ToolsEventChannel.DELETE_TOLLS_CHANNEL, {data:{'id': index}, status:EventBusChannelStatus.SUCCESS});
    }).catch((error) => {
      this.eventBus.emit(ToolsEventChannel.DELETE_TOLLS_CHANNEL, { data:{name:'error_delete_tools', message:`fail to delete tools ${index}`}, status:EventBusChannelStatus.ERROR });
    })
  }
}

