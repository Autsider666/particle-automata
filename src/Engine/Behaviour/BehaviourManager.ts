import {Direction, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";

type DirtyFlag = {
    dirty?: boolean,
    id?: number; //FIXME remove
};

export type DirtyParticle = Particle<DirtyFlag>


let particleId: number = 0;

export abstract class BehaviourManager {
    constructor(
        protected readonly world: World,
        protected readonly chunk: Chunk,
    ) {
    }

    updateActiveChunk(duplicateCheck: Set<number>): void {
        if (!this.chunk.isActive()) {
            return;
        }

        this.chunk.iterateAllParticles<DirtyParticle>((particle, coordinate) => {
            if (particle.ephemeral || particle.immovable) {
                return;
            }

            if (particle.id === undefined) {
                particle.id = particleId++;
            } else if (duplicateCheck.has(particle.id)) {
                return;
            }

            duplicateCheck.add(particle.id);

            particle.dirty = false;
            this.updateParticle(particle, coordinate);

            if (particle.dirty) {
                this.wakeChunk(coordinate);
            }
        });
    }

    abstract updateParticle(particle: DirtyParticle, coordinate: GridCoordinate): void;

    getParticle<P extends Particle = Particle>(coordinate: GridCoordinate): P {
        if (this.chunk.containsCoordinate(coordinate)) {
            return this.chunk.getParticle(coordinate) as P;
        }

        return this.world.getParticle(coordinate) as P;
    }

    setParticle(coordinate: GridCoordinate, particle: Particle): void {
        if (this.chunk.containsCoordinate(coordinate)) {
            this.chunk.setParticle(coordinate, particle);
        } else {
            this.world.setParticle(coordinate, particle);
        }
    }

    moveParticle(coordinate: GridCoordinate, direction: Direction): boolean {
        const destination = Traversal.getDestinationCoordinate(coordinate, direction);
        if (this.chunk.containsCoordinate(coordinate) && this.chunk.containsCoordinate(destination)) {
            this.chunk.moveParticle(this.chunk, coordinate, destination);

            return true;
        }

        return this.world.moveParticle(coordinate, direction);
    }

    wakeChunk(coordinate: GridCoordinate): void {
        this.world.wakeChunk(coordinate);
    }

    isValidCoordinate(coordinate: GridCoordinate): boolean {
        if (this.chunk.containsCoordinate(coordinate)) {
            return this.chunk.isValidCoordinate(coordinate);
        }

        return this.world.isValidCoordinate(coordinate);
    }
}