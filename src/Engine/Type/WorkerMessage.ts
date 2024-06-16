import {EventKey, EventMap} from "../../Utility/Excalibur/EventHandler.ts";
import {Coordinate} from "../../Utility/Type/Dimensional.ts";
import {Config} from "./Config.ts";

export type WorkerMessage = {
    init: {
        canvas: OffscreenCanvas,
        config: Config,
    },
    start: undefined,
    stop: undefined,
    create: Coordinate,
}

export type MessageMap<TMessages extends WorkerMessage = WorkerMessage> = {
    [K in keyof TMessages]?: TMessages[K]
}

export type MessageFormat<TMessages extends EventMap = WorkerMessage> = {
    type: EventKey<TMessages>,
    data: TMessages[EventKey<TMessages>],
}

export type MessageIdentifier<TMessages extends EventMap = WorkerMessage> = keyof TMessages;