import {Array2D} from "../../Utility/Array2D.ts";
import type {Particle} from "../Particle/Particle";
import {ParticleType} from "../Particle/ParticleType.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {WorldCoordinate} from "./World.ts";

// type Change = {
//     source: Chunk,
//     origin: WorldCoordinate,
//     target: WorldCoordinate,
// }

let chunkId: number = 0;

export class Chunk {
    public readonly id: number = chunkId++;

    private readonly particles: Array2D<Particle, WorldCoordinate>; //TODO check if Set is faster
    // private readonly changes = new Set<Change>();

    private shouldUpdate: boolean = false;
    private shouldUpdateNextTime: boolean = false;

    constructor(
        public readonly bounds: BoundingBox,
        private readonly newParticleBuilder: () => Particle = () => ParticleType.Air
    ) {
        this.particles = new Array2D<Particle, WorldCoordinate>(bounds, this.newParticleBuilder.bind(this), bounds.topLeft);
    }

    public iterateParticles<P extends Particle = Particle>(callback: (particle: P, coordinate: WorldCoordinate) => void): void {
        this.particles.iterateItems(callback);
    }

    public containsCoordinate(coordinate: WorldCoordinate): boolean {
        return this.particles.containsCoordinate(coordinate);
    }

    public getParticle(coordinate: WorldCoordinate): Particle {
        return this.particles.get(coordinate);
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

    public moveParticle(source: Chunk, currentCoordinate: WorldCoordinate, targetCoordinate: WorldCoordinate): void {
        const sourceParticle = source.getParticle(currentCoordinate);
        const targetParticle = this.getParticle(targetCoordinate);

        this.setParticle(targetCoordinate, sourceParticle);
        source.setParticle(currentCoordinate, targetParticle);
    }

    public isValidCoordinate(coordinate: WorldCoordinate) {
        return this.particles.containsCoordinate(coordinate);
    }

    public prepareForUpdate(): void {
        this.shouldUpdate = this.shouldUpdateNextTime;
        this.shouldUpdateNextTime = false;
    }

    public isActive(): boolean {
        return this.shouldUpdate;
    }

    public wakeUp(): void {
        this.shouldUpdate = true;
        this.shouldUpdateNextTime = true;
    }
}