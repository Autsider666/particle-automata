import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import type {Direction} from "../../Utility/Type/Dimensional.ts";
import {Traversal} from "../../Utility/Type/Dimensional.ts";
import {Particle, PossibleElementType} from "../Particle/Particle.ts";
import {ChunkCoordinate, GridCoordinate} from "../Type/Coordinate.ts";
import {ChunkList, WorldEvent} from "../World/WorldBuilder.ts";
import {Chunk} from "./Chunk.ts";

export class World {
    private readonly chunks = new Map<string, Chunk | undefined>();
    private readonly activeChunks: ChunkList = [];
    private readonly dirtyChunks: ChunkList = [];

    constructor(
        public readonly chunkSize: number,
        private readonly outerBounds: BoundingBox<GridCoordinate>,
        private readonly events: EventHandlerInterface<WorldEvent>,
    ) {
        this.events.emit('worldCreated', outerBounds);
    }

    get totalChunks(): number {
        return this.chunks.size;
    }

    getParticle(coordinate: GridCoordinate): Particle | undefined {
        return this.getChunk(coordinate)?.getParticle(coordinate);
    }

    createNewParticle(coordinate: GridCoordinate, elementType: PossibleElementType): boolean {
        const chunk = this.getChunk(coordinate);
        if (!chunk) {
            console.warn('createNewParticle Failed', coordinate, elementType);
            return false;
        }

        chunk.createNewParticle(coordinate, elementType);

        return true;
    }

    moveParticle(
        coordinate: GridCoordinate,
        direction: Direction,
    ): boolean {
        const currentChunk = this.getChunk(coordinate);
        if (!currentChunk) {
            return false;
        }
        const destination = Traversal.getDestinationCoordinate<GridCoordinate>(coordinate, direction);
        const destinationChunk = this.getChunk(destination);
        if (!destinationChunk) {
            return false;
        }

        destinationChunk.moveParticle(currentChunk, coordinate, destination);

        return true;
    }

    containsCoordinate(coordinate: GridCoordinate): boolean {
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

    public iterateDirtyChunks(callback: (chunk: Chunk, coordinate: ChunkCoordinate) => void): void {
        for (const {chunk, coordinate} of this.dirtyChunks) {
            callback(chunk, coordinate);
        }
    }

    public getActiveChunkIds(): number[] {
        return this.activeChunks.map(({chunk}) => chunk.id);
    }

    public iterateAllParticles(callback: (particle: Particle, coordinate: GridCoordinate) => void): void {
        this.iterateAllChunks((chunk: Chunk) => {
            chunk.iterateAllParticles((particle, coordinate) => {
                callback(particle, coordinate);
            });
        });
    }

    public iterateDirtyParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: GridCoordinate) => void): void {
        this.iterateDirtyChunks(chunk => {
            chunk.iterateDirtyParticles(callback);
        });
    }

    private toCoordinate(key: string): ChunkCoordinate {
        const [x, y] = key.split('-').map(string => parseInt(string));
        return {x, y} as ChunkCoordinate;
    }

    private toKey({x, y}: ChunkCoordinate): string {
        return `${x}-${y}`;
    }

    private getChunkCoordinate({x, y}: GridCoordinate): ChunkCoordinate {
        return {
            x: Math.floor(x / this.chunkSize),
            y: Math.floor(y / this.chunkSize),
        } as ChunkCoordinate;
    }

    private getChunk(coordinate: GridCoordinate): Chunk | undefined {
        const chunkCoordinate = this.getChunkCoordinate(coordinate);
        const key = this.toKey(chunkCoordinate);
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }

        return this.createChunk(chunkCoordinate);
    }

    private createChunk(coordinate: ChunkCoordinate): Chunk | undefined {
        const {x, y} = coordinate;
        const bounds = BoundingBox.fromDimension<GridCoordinate>(this.chunkSize, this.chunkSize, {
            x: x * this.chunkSize,
            y: y * this.chunkSize
        } as GridCoordinate);

        let chunk: Chunk | undefined;
        if (this.outerBounds?.containsBoundingBox(bounds) !== false) {
            chunk = new Chunk(bounds);
            // chunk.chunkData.coordinate.x = x;
            // chunk.chunkData.coordinate.y = y;

            // this.events.emit('chunkCreated', {coordinate, chunk});
        }

        this.chunks.set(this.toKey(coordinate), chunk);

        return chunk;
    }

    isValidCoordinate(coordinate: GridCoordinate): boolean {
        return this.getChunk(coordinate)?.isValidCoordinate(coordinate) ?? false;
    }

    wakeChunk(coordinate: GridCoordinate) {
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

        const chunk = this.getChunk(coordinate);
        if (!chunk) {
            throw new Error('Could not awake origin chunk');
        }

        chunk.wakeUp();
    }

    prepareForUpdate() {
        this.activeChunks.length = 0;
        for (const [key, chunk] of this.chunks) {
            if (chunk?.isActive()) {
                this.activeChunks.unshift({
                    chunk,
                    coordinate: this.toCoordinate(key),
                });
            }

        }

        this.events.emit('postStep', {activeChunks: this.activeChunks});
    }

    prepareForDraw(): void {
        this.dirtyChunks.length = 0;

        for (const [key, chunk] of this.chunks) {
            if (chunk?.isActive()) {
                const dirtyCount = chunk?.getAmountDirty();
                if (dirtyCount !== undefined && dirtyCount > 0) {
                    this.dirtyChunks.unshift({
                        chunk,
                        coordinate: this.toCoordinate(key),
                    });
                }
            }
        }
    }
}