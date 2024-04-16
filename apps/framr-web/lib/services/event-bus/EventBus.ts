import { EventEmitter } from 'eventemitter3';
import { ToolManagementChannelEnum } from './EventBusChannel.enum';
import { EventBusChannelPayload, EventBusHandler } from './EventBusChannel';

/**
 * EventBus class represents a singleton event bus instance using EventEmitter3.
 * It provides a central communication channel for emitting and listening to events.
 * @example
 * 
    const eventBus = new EventBus();

    eventBus.emit(EventBusChannelEnum.CREATE_TOOL, {
        data: {
            id: crypto.randomUUID(),
            long: 'tool long name',
            max_bits: 1,
            name: 'my first tools',
            type: ToolEnum.MWD,
            max_dpoints: 10,
            version: '1.0',
        },
        status: EventBusChannelStatus.SUCCESS,
    });

    eventBus.once(EventBusChannelEnum.DELETE_TOOL, (data) => {
        console.log(data)
    });

 */
export class EventBus {
  /**
   * Singleton instance of the EventEmitter.
   * It holds the reference to the unique event bus instance.
   */
  private static instance: EventEmitter;

  /**
   * Initializes the event bus instance.
   * If the instance doesn't exist, creates a new one; otherwise, returns the existing instance.
   */
  constructor() {
    // Check if the instance already exists
    if (!EventBus.instance) {
      // If the instance doesn't exist, create a new EventEmitter instance
      EventBus.instance = new EventEmitter();
    }
  }

  emit<Channel extends ToolManagementChannelEnum>(
    channel: Channel,
    payload: EventBusChannelPayload<Channel>
  ) {
    EventBus.instance.emit(channel, payload);
  }

  on<Channel extends ToolManagementChannelEnum>(
    channel: Channel,
    evenHandler: EventBusHandler
  ) {
    EventBus.instance.on(channel, evenHandler);
  }

  once<Channel extends ToolManagementChannelEnum>(
    channel: Channel,
    evenHandler: EventBusHandler
  ) {
    EventBus.instance.once(channel, evenHandler);
  }
}
