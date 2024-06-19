import {EventKey, EventMap} from "../../Utility/Event/Type.ts";
import {Coordinate, GridDimensions} from "../../Utility/Type/Dimensional.ts";
import {EngineConfig} from "../Config/EngineConfig.ts";
import {RenderMode} from "./RenderMode.ts";

export type WorkerMessage = {
    init: EngineConfig,
    ready: undefined,
    startRendering: {
        mode: RenderMode,
        canvas: OffscreenCanvas,
    },
    stopRendering: {
        mode: RenderMode,
    },
    start: undefined,
    stop: undefined,
    resize: GridDimensions,
    create: Coordinate,
    keepAlive: undefined,
}

export type MessageMap<TMessages extends WorkerMessage = WorkerMessage> = {
    [K in keyof TMessages]?: TMessages[K]
}

export type MessageFormat<TMessages extends EventMap = WorkerMessage> = {
    type: EventKey<TMessages>,
    data: TMessages[EventKey<TMessages>],
}

export type MessageIdentifier<TMessages extends EventMap = WorkerMessage> = keyof TMessages;