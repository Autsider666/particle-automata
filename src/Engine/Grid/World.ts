import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import type {Direction} from "../../Utility/Type/Dimensional.ts";
import {Coordinate, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";
import {Particle} from "../Particle/Particle.ts";
import {Chunk} from "./Chunk.ts";

export type ChunkCoordinate = Distinct<Coordinate, 'Chunk'>;
export type WorldCoordinate = Distinct<Coordinate, 'World'>;

export class World {
    private readonly chunks = new Map<string, Chunk|undefined>();
    private readonly activeChunks = new Set<{ chunk: Chunk, coordinate: ChunkCoordinate }>();

    constructor(
        public readonly chunkSize: number,
        private readonly outerBounds?: BoundingBox,
        // private readonly removeOutsideBounds: boolean = true, //TODO add as option
    ) {
    }

    get totalChunks(): number {
        return this.chunks.size;
    }

    getParticle(coordinate: WorldCoordinate): Particle|undefined {
        return this.getChunk(coordinate)?.getParticle(coordinate);
    }

    setParticle(coordinate: WorldCoordinate, particle: Particle): boolean {
        return !!this.getChunk(coordinate)?.setParticle(coordinate, particle);
    }

    moveParticle<P extends Particle = Particle>(
        coordinate: WorldCoordinate,
        direction: Direction,
    ): boolean {
        const currentChunk = this.getChunk(coordinate);
        if (!currentChunk) {
            return false;
        }
        const destination = Traversal.getDestinationCoordinate<WorldCoordinate>(coordinate, direction);
        const destinationChunk = this.getChunk(destination);

        return !!(destinationChunk?.moveParticle<P>(currentChunk, coordinate, destination));
    }

    containsCoordinate(coordinate: WorldCoordinate): boolean {
        //FIXME probably should return true when void
        return this.getChunk(coordinate)?.containsCoordinate(coordinate) ?? false;
    }

    public iterateAllChunks(callback: (chunk: Chunk, coordinate: ChunkCoordinate) => void): void {
        for (const [key, chunk] of this.chunks) {
            if (chunk) {
                callback(chunk, this.toCoordinate(key));
            }
        }
    }

    public iterateActiveChunks(callback: (chunk: Chunk, coordinate: ChunkCoordinate) => void): void {
        for (const {chunk, coordinate} of this.activeChunks) {
            callback(chunk, coordinate);
        }
    }

    public iterateAllParticles(callback: (particle: Particle, coordinate: WorldCoordinate) => void): void {
        this.iterateAllChunks((chunk: Chunk) => {
            chunk.iterateAllParticles((particle, coordinate) => {
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

    private getChunk(coordinate: WorldCoordinate): Chunk|undefined {
        const chunkCoordinate = this.getChunkCoordinate(coordinate);
        const key = this.toKey(chunkCoordinate);
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }

        return this.createChunk(chunkCoordinate);
    }

    private createChunk(coordinate: ChunkCoordinate): Chunk|undefined {
        const {x, y} = coordinate;
        const bounds = BoundingBox.fromDimension(this.chunkSize, this.chunkSize, {
            x: x * this.chunkSize,
            y: y * this.chunkSize
        });

        let chunk:Chunk|undefined;
        if (this.outerBounds?.containsBoundingBox(bounds) !== false) {
            chunk = new Chunk(bounds);
        }

        this.chunks.set(this.toKey(coordinate), chunk);

        return chunk;
    }

    isValidCoordinate(coordinate: WorldCoordinate): boolean {
        return this.getChunk(coordinate)?.isValidCoordinate(coordinate) ?? false;
    }

    wakeChunk(coordinate: WorldCoordinate) {
        const {x, y} = coordinate;
        if (x % this.chunkSize === 0) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: -1, dY: 0})
            )?.wakeUp();
        }

        if (x % this.chunkSize === this.chunkSize - 1) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: +1, dY: 0})
            )?.wakeUp();
        }

        if (y % this.chunkSize === 0) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: 0, dY: -1})
            )?.wakeUp();
        }

        if (y % this.chunkSize === this.chunkSize - 1) {
            this.getChunk(
                Traversal.getDestinationCoordinate(coordinate, {dX: 0, dY: +1})
            )?.wakeUp();
        }

        this.getChunk(coordinate)?.wakeUp(); //TODO move this to Manager for 1 less search?
    }

    prepareForUpdate() {
        this.activeChunks.clear();
        for (const [key, chunk] of this.chunks) {
            if (chunk?.isActive()) {
                this.activeChunks.add({
                    chunk,
                    coordinate: this.toCoordinate(key),
                });
            }
        }
    }
}