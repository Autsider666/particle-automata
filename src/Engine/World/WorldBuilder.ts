import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import type {Dimensions} from "../../Utility/Type/Dimensional.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World} from "../Grid/World.ts";
import {ChunkCoordinate} from "../Type/Coordinate.ts";

export type ActiveChunkList = { chunk: Chunk, coordinate: ChunkCoordinate }[];

export type ChunkCreatedEvent = { coordinate: ChunkCoordinate, chunk: Chunk };

export type WorldEvent = {
    worldCreated: Dimensions,
    chunkCreated: ChunkCreatedEvent,
    postStep: { activeChunks: Readonly<ActiveChunkList> }
}

export interface WorldBuilder {
    build(config: SimulationConfig, events: EventHandlerInterface<WorldEvent>): World
}