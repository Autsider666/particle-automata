import {EventKey, EventMap, Handler} from "./Type.ts";


export interface EventListenerInterface<TEvents extends EventMap> {
    on<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>): void;

    off<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>): void;
}