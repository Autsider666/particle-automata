import {EventEmitterInterface} from "../Event/EventEmitterInterface.ts";
import {EventHandlerInterface} from "../Event/EventHandlerInterface.ts";
import {EventKey, EventMap, Handler} from "../Event/Type.ts";
import {EventHandler} from "./EventHandler.ts";

export abstract class BaseEventHandler<Events extends EventMap> implements EventHandlerInterface<Events> {
    protected constructor(protected readonly events: EventHandlerInterface<Events> = new EventHandler<Events>()) {

    }

    on<TEventName extends EventKey<Events>>(eventName: TEventName, handler: Handler<Events[TEventName]>): void {
        this.events.on(eventName, handler);
    }

    off<TEventName extends EventKey<Events>>(eventName: TEventName, handler: Handler<Events[TEventName]>): void {
        this.events.off(eventName, handler);
    }

    emit<TEventName extends EventKey<Events>>(eventName: TEventName, event: Events[TEventName]): void {
        this.events.emit(eventName, event);
    }

    pipe(emitter: EventEmitterInterface<Events>): void {
        this.events.pipe(emitter);
    }

}