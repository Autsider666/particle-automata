import {Array2D} from "../../Utility/Array2D.ts";
import {Coordinate, Dimensions} from "../../Utility/Type/Dimensional.ts";
import type {Particle} from "../Particle/Particle";
import {ParticleType} from "../Particle/ParticleType.ts";
import {WorldCoordinate} from "./World.ts";

// type Change = {
//     source: Chunk,
//     origin: WorldCoordinate,
//     target: WorldCoordinate,
// }

export class Chunk {
    private readonly particles: Array2D<Particle, WorldCoordinate>; //TODO check if Set is faster
    // private readonly changes = new Set<Change>();

    public dirty: boolean = true;

    constructor(
        dimensions: Dimensions,
        coordinateZero: Coordinate,
        private readonly newParticleBuilder: () => Particle = () => ParticleType.Air
    ) {
        this.particles = new Array2D<Particle, WorldCoordinate>(dimensions, this.newParticleBuilder.bind(this), coordinateZero);
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

        this.dirty = true;
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

        // this.changes.add({
        //     source,
        //     origin: {x: currentCoordinate.x, y: currentCoordinate.y} as WorldCoordinate,
        //     target: {x: targetCoordinate.x, y: targetCoordinate.y} as WorldCoordinate,
        // });
    }

    // commitChanges() {
    //     for (const change of this.changes) {
    //         if (this.getParticle(change.target).ephemeral === true) {
    //             this.changes.delete(change);
    //         }
    //     }
    //
    //     this.changes.add({
    //             source: this,
    //             origin: {x: 0, y: 0} as WorldCoordinate,
    //             target: {x: 0, y: 0} as WorldCoordinate
    //         }
    //     );
    //     const changes = Array.from(this.changes);
    //     for (let i = 0; i < changes.length; i++) {
    //         const current = changes[i].target;
    //         const next = changes[i+1].target;
    //         if (current.x !== next.x && current.y !== current.y) {
    //
    //         }
    //     }
    //
    //     this.changes.clear();
    // }
    isValidCoordinate(coordinate: WorldCoordinate) {
        return this.particles.containsCoordinate(coordinate);
    }
}