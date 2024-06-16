import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import type {Direction} from "../../Utility/Type/Dimensional.ts";
import {Coordinate, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";
import {Particle} from "../Particle/Particle.ts";
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

    public iterateAllChunks(callback: (chunk: Chunk, coordinate: ChunkCoordinate) => void): void {
        for (const [key, chunk] of this.chunks) {
            callback(chunk, this.toCoordinate(key));
        }
    }

    public iterateAllParticles(callback: (particle: Particle, coordinate: WorldCoordinate) => void): void {
        this.iterateAllChunks((chunk: Chunk) => {
            chunk.iterateParticles((particle, coordinate) => {
                callback(particle, coordinate);
            });
        });
    }

    private toCoordinate(key: string): ChunkCoordinate {
        const [x, y] = key.split('-').map(string => parseInt(string));
        return {x, y} as ChunkCoordinate;
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

        const chunk = new Chunk(bounds);

        this.chunks.set(this.toKey(coordinate), chunk);

        return chunk;
    }

    isValidCoordinate(coordinate: WorldCoordinate): boolean {
        return this.getChunkIfExists(coordinate)?.isValidCoordinate(coordinate) ?? false;
    }

    wakeChunk(coordinate: WorldCoordinate) {
        const {x, y} = coordinate;
        if (x % this.chunkSize === 0) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: -1, dY: 0})
            ).wakeUp();
        }

        if (x % this.chunkSize === this.chunkSize - 1) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: +1, dY: 0})
            ).wakeUp();
        }

        if (y % this.chunkSize === 0) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: 0, dY: -1})
            ).wakeUp();
        }

        if (y % this.chunkSize === this.chunkSize - 1) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: 0, dY: +1})
            ).wakeUp();
        }

        this.getChunk(coordinate).wakeUp(); //TODO move this to Manager for 1 less search?
    }
}