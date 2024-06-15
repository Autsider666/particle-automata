import type {Direction} from "../../Utility/Type/Dimensional.ts";
import {Coordinate, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";
import {Particle} from "../Particle/Particle.ts";
import {BoundingBox} from "../Utility/Excalibur/BoundingBox";
import {Chunk} from "./Chunk.ts";

export type ChunkCoordinate = Distinct<Coordinate, 'Chunk'>;
export type WorldCoordinate = Distinct<Coordinate, 'World'>;

export class World {
    private readonly chunks: Map<string, Chunk> = new Map<string, Chunk>();

    constructor(
        initialWorldBounds: BoundingBox,
        public readonly chunkSize: number
    ) {
        this.generateMissingChunks(initialWorldBounds);
    }

    private generateMissingChunks(bounds: BoundingBox): void {
        const top = Math.floor(bounds.top / this.chunkSize);
        const bottom = Math.ceil(bounds.bottom / this.chunkSize) - 1;
        const left = Math.floor(bounds.left / this.chunkSize);
        const right = Math.ceil(bounds.right / this.chunkSize) - 1;

        for (let x = left; x <= right; x++) {
            for (let y = top; y <= bottom; y++) {
                const coordinate = {x, y} as ChunkCoordinate;
                if (this.chunks.has(this.toKey(coordinate))) {
                    continue;
                }

                this.createChunk(coordinate);
            }
        }
    }

    get totalChunks(): number {
        return this.chunks.size;
    }

    getParticle(coordinate: WorldCoordinate): Particle {
        return this.getChunk(coordinate).getParticle(coordinate);
    }

    setParticle(coordinate: WorldCoordinate, particle: Particle): void {
        this.getChunk(coordinate).setParticle(coordinate, particle);
    }

    moveParticle(coordinate: WorldCoordinate, direction: Direction): void {
        const currentChunk = this.getChunk(coordinate);
        const destination = Traversal.getDestinationCoordinate<WorldCoordinate>(coordinate, direction);
        const destinationChunk = this.getChunk(destination);

        destinationChunk.moveParticle(currentChunk, coordinate, destination);
    }

    containsCoordinate(coordinate: WorldCoordinate): boolean {
        return this.getChunk(coordinate).containsCoordinate(coordinate);
    }

    public iterateChunks(callback: (chunk: Chunk) => void): void {
        for (const [, chunk] of this.chunks) {
            callback(chunk);
        }
    }

    public iterateParticles(callback: (particle: Particle, coordinate: WorldCoordinate) => void, ignoreDirty: boolean = false): void {
        this.iterateChunks((chunk: Chunk) => {
            if (!chunk.dirty && !ignoreDirty) {
                return;
            }

            chunk.iterateParticles((particle, coordinate) => {
                callback(particle, coordinate);
            });
        });
    }

    private toKey({x, y}: ChunkCoordinate): string {
        return `${x}-${y}`;
    }

    private getChunkCoordinate({x, y}: WorldCoordinate): ChunkCoordinate {
        return {
            x: Math.floor(x / this.chunkSize),
            y: Math.floor(y / this.chunkSize),
        } as ChunkCoordinate;
    }

    private getChunk(coordinate: WorldCoordinate): Chunk {
        const chunkCoordinate = this.getChunkCoordinate(coordinate);
        const key = this.toKey(chunkCoordinate);
        const chunk = this.chunks.get(key);

        return chunk ?? this.createChunk(chunkCoordinate);
    }

    private getChunkIfExists(coordinate: WorldCoordinate): Chunk | undefined {
        const chunkCoordinate = this.getChunkCoordinate(coordinate);
        const key = this.toKey(chunkCoordinate);

        return this.chunks.get(key);
    }

    private createChunk(coordinate: ChunkCoordinate): Chunk {
        const {x, y} = coordinate;
        const bounds = BoundingBox.fromDimension(this.chunkSize, this.chunkSize, {
            x: x * this.chunkSize,
            y: y * this.chunkSize
        });

        const chunk = new Chunk(
            bounds,
            bounds.topLeft,
        );

        this.chunks.set(this.toKey(coordinate), chunk);

        return chunk;
    }

    isValidCoordinate(coordinate: WorldCoordinate): boolean {
        return this.getChunkIfExists(coordinate)?.isValidCoordinate(coordinate) ?? false;
    }
}