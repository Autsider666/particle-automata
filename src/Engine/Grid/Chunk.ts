import {Array2D} from "../../Utility/Array2D.ts";
import {BufferBackedObject, DecodedBuffer, structSize} from "../../Utility/BufferBackedObject.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {SharedArray2D} from "../../Utility/SharedArray2D.ts";
import type {Particle} from "../Particle/Particle";
import {ParticleType} from "../Particle/ParticleType.ts";
import {ChunkDescriptor, ChunkSchema} from "../Schema/ChunkSchema.ts";
import {ParticleDescriptor} from "../Schema/ParticleSchema.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";

let chunkId: number = 0;

type SharedParticle = DecodedBuffer<ParticleDescriptor>;

export class Chunk {
    public readonly buffer: SharedArrayBuffer;
    public readonly schema: ChunkDescriptor;
    public readonly chunkData: DecodedBuffer<ChunkDescriptor>;

    private readonly particles: Array2D<Particle, GridCoordinate>; //TODO check if Set is faster
    private readonly sharedParticles: SharedArray2D<SharedParticle, GridCoordinate>;

    private shouldUpdate: boolean = true;
    private shouldUpdateNextTime: boolean = false;

    constructor(
        public readonly bounds: BoundingBox,
        private readonly newParticleBuilder: () => Particle = () => ParticleType.Air,
    ) {
        this.schema = ChunkSchema(bounds.width * bounds.height);
        this.buffer = new SharedArrayBuffer(structSize(this.schema));

        this.chunkData = BufferBackedObject<ChunkDescriptor>(this.buffer, this.schema);
        this.chunkData.id = chunkId++;
        this.chunkData.dirty = this.shouldUpdate;
        this.chunkData.bounds.height = this.bounds.height;
        this.chunkData.bounds.width = this.bounds.width;
        this.chunkData.bounds.top = this.bounds.top;
        this.chunkData.bounds.left = this.bounds.left;

        this.particles = new Array2D<Particle, GridCoordinate>(bounds, this.newParticleBuilder.bind(this), bounds.topLeft);
        this.sharedParticles = new SharedArray2D<SharedParticle, GridCoordinate>(
            bounds,
            (index, item) => {
                const coordinate = this.particles.getCoordinate(index);
                item.coordinate.x = coordinate.x;
                item.coordinate.y = coordinate.y;
                item.index = index;

                const particle = this.particles.get(coordinate);
                item.ephemeral = particle.ephemeral;

                const color = particle.colorTuple;
                if (!color) {
                    throw new Error('ColorTuple should always be set');
                }

                item.color.red = color[0];
                item.color.green = color[1];
                item.color.blue = color[2];
                item.color.alpha = color[3];
            },
            bounds.topLeft,
            this.chunkData.particles,
        );
    }

    get id(): number {
        return this.chunkData.id;
    }

    public iterateDirtyParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: GridCoordinate) => void): void {
        this.particles.iterateChanges(({item: particle, coordinate}) => {
            callback(particle as P, coordinate);
        });
    }

    public iterateAllParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: GridCoordinate) => void): void {
        this.particles.iterateItems(callback);
    }

    public containsCoordinate(coordinate: GridCoordinate): boolean {
        return this.particles.containsCoordinate(coordinate);
    }

    public getParticle<P extends Particle = Particle>(coordinate: GridCoordinate): P {
        return this.particles.get<P>(coordinate);
    }

    public setParticle(coordinate: GridCoordinate, particle: Particle): void {
        this.particles.set(coordinate, particle);

        this.wakeUp();
    }

    public moveParticle<P extends Particle = Particle>(
        source: Chunk,
        currentCoordinate: GridCoordinate,
        targetCoordinate: GridCoordinate,
    ): P {
        const currentParticle = source.getParticle<P>(currentCoordinate);
        const targetParticle = this.getParticle<P>(targetCoordinate);

        this.setParticle(targetCoordinate, currentParticle);
        source.setParticle(currentCoordinate, targetParticle);

        return targetParticle;
    }

    public isValidCoordinate(coordinate: GridCoordinate) {
        return this.particles.containsCoordinate(coordinate);
    }

    public prepareForUpdate(): void {
        //TODO move to own post update?
        this.particles.iterateChanges(({index}) => this.sharedParticles.updateParticle(index));
        this.chunkData.dirty = this.shouldUpdate;

        this.shouldUpdate = this.shouldUpdateNextTime;
        this.shouldUpdateNextTime = false;

        this.particles.resetChanges();
    }

    public isActive(): boolean {
        return this.shouldUpdate;
    }

    public wakeUp(): void {
        this.shouldUpdate = true;
        this.shouldUpdateNextTime = true;
    }

    getActiveParticleCount(): number { //TODO remove?
        if (!this.shouldUpdate) {
            return 0;
        }

        return this.particles.getChangesCount();
    }
}