import {Array2D} from "../../Utility/Array2D.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import type {Particle} from "../Particle/Particle";
import {ParticleType} from "../Particle/ParticleType.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";

let chunkId: number = 0;

export class Chunk {
    public readonly id: number = chunkId++;

    private readonly particles: Array2D<Particle, WorldCoordinate>; //TODO check if Set is faster

    private shouldUpdate: boolean = true;
    private shouldUpdateNextTime: boolean = false;

    constructor(
        public readonly bounds: BoundingBox,
        private readonly newParticleBuilder: () => Particle = () => ParticleType.Air
    ) {
        this.particles = new Array2D<Particle, WorldCoordinate>(bounds, this.newParticleBuilder.bind(this), bounds.topLeft);
    }

    public iterateDirtyParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: WorldCoordinate) => void): void {
        this.particles.iterateChanges((particle, coordinate)=> {
            callback(particle as P, coordinate);
        });
    }

    public iterateAllParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: WorldCoordinate) => void): void {
        this.particles.iterateItems(callback);
    }

    public containsCoordinate(coordinate: WorldCoordinate): boolean {
        return this.particles.containsCoordinate(coordinate);
    }

    public getParticle<P extends Particle = Particle>(coordinate: WorldCoordinate): P {
        return this.particles.get<P>(coordinate);
    }

    public setParticle(coordinate: WorldCoordinate, particle: Particle): void {
        this.particles.set(coordinate, particle);

        this.wakeUp();

        // if (this.getParticle(coordinate)?.ephemeral === true) {
        //     this.particles.set(coordinate, particle);
        //     this.dirty = true;
        //
        //     return true;
        // }
        //
        // return false;
    }

    public moveParticle<P extends Particle = Particle>(
        source: Chunk,
        currentCoordinate: WorldCoordinate,
        targetCoordinate: WorldCoordinate,
    ): P {
        const currentParticle = source.getParticle<P>(currentCoordinate);
        const targetParticle = this.getParticle<P>(targetCoordinate);

        this.setParticle(targetCoordinate, currentParticle);
        source.setParticle(currentCoordinate, targetParticle);

        return targetParticle;
    }

    public isValidCoordinate(coordinate: WorldCoordinate) {
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
}