import {EventEmitterInterface} from "./EventEmitterInterface.ts";
import {EventListenerInterface} from "./EventListenerInterface.ts";
import {EventMap} from "./Type.ts";

export interface EventHandlerInterface<TEvents extends EventMap> extends EventListenerInterface<TEvents>, EventEmitterInterface<TEvents> {
}