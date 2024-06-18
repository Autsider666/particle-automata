import {ChunkCoordinate, WorldCoordinate} from "../../Type/Coordinate.ts";
import {RendererChunk} from "./RendererChunk.ts";
import {RendererParticle} from "./RendererParticle.ts";

export type RendererWorld = {
    chunks: Map<ChunkCoordinate, RendererChunk>,
    dirtyChunks: Map<ChunkCoordinate, RendererChunk>,
    particles: Map<WorldCoordinate, RendererParticle>,
    dirtyParticles: Map<WorldCoordinate, RendererParticle>,
}