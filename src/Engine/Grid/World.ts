import {ArrayOfBufferBackedObjects, DecodedBuffer, structSize} from "../../Utility/BufferBackedObject.ts";
import {BaseEventHandler} from "../../Utility/Excalibur/BaseEventHandler.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import type {Dimensions, Direction} from "../../Utility/Type/Dimensional.ts";
import {Traversal} from "../../Utility/Type/Dimensional.ts";
import {Particle} from "../Particle/Particle.ts";
import {RenderParticleSchema} from "../Schema/RenderParticleSchema.ts";
import {ChunkCoordinate, WorldCoordinate} from "../Type/Coordinate.ts";
import {Chunk} from "./Chunk.ts";

export type WorldEvent = {
    worldCreated: Dimensions,
    chunkCreated: { coordinate: ChunkCoordinate, chunk:Chunk }
}

export class World extends BaseEventHandler<WorldEvent> {
    private readonly chunks = new Map<string, Chunk | undefined>();
    private readonly activeChunks: { chunk: Chunk, coordinate: ChunkCoordinate }[] = [];
    private activeParticles: number = 0;

    constructor(
        public readonly chunkSize: number,
        private readonly outerBounds: BoundingBox<WorldCoordinate>,
    ) {
        super();

        this.emit('worldCreated', outerBounds);
    }

    get totalChunks(): number {
        return this.chunks.size;
    }

    getParticle(coordinate: WorldCoordinate): Particle | undefined {
        return this.getChunk(coordinate)?.getParticle(coordinate);
    }

    setParticle(coordinate: WorldCoordinate, particle: Particle): boolean {
        const result = !!this.getChunk(coordinate)?.setParticle(coordinate, particle);
        if (!result) {
            console.warn('setParticle Failed', coordinate, particle);
        }

        return result;
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

    public iterateDirtyParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: WorldCoordinate) => void): void {
        this.iterateActiveChunks(chunk => {
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

    private getChunkCoordinate({x, y}: WorldCoordinate): ChunkCoordinate {
        return {
            x: Math.floor(x / this.chunkSize),
            y: Math.floor(y / this.chunkSize),
        } as ChunkCoordinate;
    }

    private getChunk(coordinate: WorldCoordinate): Chunk | undefined {
        const chunkCoordinate = this.getChunkCoordinate(coordinate);
        const key = this.toKey(chunkCoordinate);
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }

        return this.createChunk(chunkCoordinate);
    }

    private createChunk(coordinate: ChunkCoordinate): Chunk | undefined {
        const {x, y} = coordinate;
        const bounds = BoundingBox.fromDimension<WorldCoordinate>(this.chunkSize, this.chunkSize, {
            x: x * this.chunkSize,
            y: y * this.chunkSize
        } as WorldCoordinate);

        console.log(coordinate, bounds, this.outerBounds, this.outerBounds?.containsBoundingBox(bounds));

        let chunk: Chunk | undefined;
        if (this.outerBounds?.containsBoundingBox(bounds) !== false) {
            chunk = new Chunk(bounds);

            this.emit('chunkCreated', {coordinate, chunk});
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
        this.activeParticles = 0;
        this.activeChunks.length = 0;
        for (const [key, chunk] of this.chunks) {
            if (chunk?.isActive()) {
                this.activeParticles += chunk.getActiveParticleCount();
                this.activeChunks.unshift({
                    chunk,
                    coordinate: this.toCoordinate(key),
                });
            }
        }
    }

    updateRenderParticles(renderParticles: DecodedBuffer<typeof RenderParticleSchema>[]) {
        this.iterateDirtyParticles((particle, coordinate) => {
            const renderParticle: DecodedBuffer<typeof RenderParticleSchema> | undefined = renderParticles[this.toWorldIndex(coordinate)];
            if (!renderParticle) {
                throw new Error('No render particle for this index?');
            }

            renderParticle.color.red = particle.colorTuple ? particle.colorTuple[0] : 0;
            renderParticle.color.green = particle.colorTuple ? particle.colorTuple[0] : 0;
            renderParticle.color.blue = particle.colorTuple ? particle.colorTuple[0] : 0;
        });
    }

    private toWorldIndex({x, y}: WorldCoordinate): number {
        return y * this.outerBounds?.width + x;
    }

    getChangedParticleBuffer(): ArrayBuffer {
        const buffer = new ArrayBuffer(structSize(RenderParticleSchema) * this.outerBounds.width * this.outerBounds.height);
        const particles = ArrayOfBufferBackedObjects(buffer, RenderParticleSchema);


        let i: number = 0;
        this.iterateAllParticles((particle, {x, y}) => {
            const renderParticle: DecodedBuffer<typeof RenderParticleSchema> | undefined = particles[i];
            if (!renderParticle) {
                throw new Error('No render particle for this index?');
            }

            console.log(x, y, particle);

            renderParticle.coordinate.x = x;
            renderParticle.coordinate.y = y;

            renderParticle.color.red = particle.colorTuple ? particle.colorTuple[0] : 0;
            renderParticle.color.green = particle.colorTuple ? particle.colorTuple[0] : 0;
            renderParticle.color.blue = particle.colorTuple ? particle.colorTuple[0] : 0;

            i++;
        });


        return buffer;
    }
}