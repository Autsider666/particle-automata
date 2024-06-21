import {Array2D} from "../../Utility/Array2D.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {Particle, ParticleBuilder, ParticleElement, PossibleElementType} from "../Particle/Particle";
import {GridCoordinate} from "../Type/Coordinate.ts";

let chunkId: number = 0;

export class Chunk {
    public readonly id: number = chunkId++;

    private readonly particles: Array2D<Particle, GridCoordinate>; //TODO check if Set is faster

    private shouldUpdate: boolean = true;
    private shouldUpdateNextTime: boolean = false;

    constructor(
        public readonly bounds: BoundingBox<GridCoordinate>,
        private readonly newParticleBuilder: () => Particle = () => ParticleBuilder(ParticleElement.Air.type),
    ) {
        this.particles = new Array2D<Particle, GridCoordinate>(bounds, this.newParticleBuilder.bind(this), bounds.topLeft);
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

    public createNewParticle(coordinate: GridCoordinate, elementType: PossibleElementType): void {
        this.setParticle(coordinate, ParticleBuilder(elementType));
    }

    private setParticle(coordinate: GridCoordinate, particle: Particle): void {
        this.particles.set(coordinate, particle);

        particle.dirty = true;

        this.wakeUp();
    }

    public moveParticle<P extends Particle = Particle>(
        source: Chunk,
        currentCoordinate: GridCoordinate,
        targetCoordinate: GridCoordinate,
    ): void {
        const currentParticle = source.getParticle<P>(currentCoordinate);
        const targetParticle = this.getParticle<P>(targetCoordinate);

        this.setParticle(targetCoordinate, currentParticle);
        source.setParticle(currentCoordinate, targetParticle);

        currentParticle.dirty = true;
        targetParticle.dirty = true;

        this.wakeUp();
    }

    public isValidCoordinate(coordinate: GridCoordinate) {
        return this.particles.containsCoordinate(coordinate);
    }

    public prepareForUpdate(): void {
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

    public getAmountDirty(): number {
        return this.particles.getChangesCount();
    }
}