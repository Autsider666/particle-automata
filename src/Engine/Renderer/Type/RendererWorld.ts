import {RendererChunk} from "./RendererChunk.ts";
import {RendererParticle} from "./RendererParticle.ts";

export type RendererWorld = {
    chunks: RendererChunk[],
    dirtyChunks: number[],
    particles: RendererParticle[],
    dirtyParticles: number[],
}