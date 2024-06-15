import {Particle} from "../Particle/Particle.ts";
import {Direction, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World, WorldCoordinate} from "../Grid/World.ts";

type DirtyFlag = {
    dirty?: boolean,
    id?: number; //FIXME remove
};

type DirtyParticle = Particle<DirtyFlag>


let particleId: number = 0;

export abstract class BehaviourManager {
    constructor(
        protected readonly world: World,
        protected readonly chunk: Chunk,
    ) {
    }

    updateActiveChunk(): void {
        if (!this.chunk.dirty) {
            return;
        }

        const duplicateCheck = new Set<number>();
        this.chunk.dirty = false;

        this.chunk.iterateParticles<DirtyParticle>((particle, coordinate) => {
            if (!particle.id) {
                particle.id = particleId++;
            } else if (duplicateCheck.has(particle.id)) {
                return;
            }

            duplicateCheck.add(particle.id);

            particle.dirty = false;
            this.updateParticle(particle, coordinate);

            if (particle.dirty) {
                this.chunk.dirty = true;
            }
        });
    }

    abstract updateParticle(particle: DirtyParticle, coordinate: WorldCoordinate): void;

    getParticle<P extends Particle = Particle>(coordinate: WorldCoordinate): P {
        if (this.chunk.containsCoordinate(coordinate)) {
            return this.chunk.getParticle(coordinate) as P;
        }

        return this.world.getParticle(coordinate) as P;
    }

    setParticle(coordinate: WorldCoordinate, particle: Particle): void {
        if (this.chunk.containsCoordinate(coordinate)) {
            this.chunk.setParticle(coordinate, particle);
        } else {
            this.world.setParticle(coordinate, particle);
        }
    }

    moveParticle(coordinate: WorldCoordinate, direction: Direction): void {
        const destination = Traversal.getDestinationCoordinate(coordinate, direction);
        if (this.chunk.containsCoordinate(coordinate) && this.chunk.containsCoordinate(destination)) {
            this.chunk.moveParticle(this.chunk, coordinate, destination);
        } else {
            this.world.moveParticle(coordinate, direction);
        }
    }

    isValidCoordinate(coordinate: WorldCoordinate): boolean {
        if (this.chunk.containsCoordinate(coordinate)) {
            return this.chunk.isValidCoordinate(coordinate);
        }

        return this.world.isValidCoordinate(coordinate);
    }
}