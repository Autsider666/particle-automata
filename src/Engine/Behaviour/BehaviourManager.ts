import {Direction, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World} from "../Grid/World.ts";
import {Particle, PossibleElementType} from "../Particle/Particle.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";

export type DirtyParticle = Particle

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
            if (particle.element.ephemeral || particle.element.immovable) {
                return;
            }

            if (duplicateCheck.has(particle.id)) {
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

    setParticle(coordinate: GridCoordinate, element: PossibleElementType): void {
        if (this.chunk.containsCoordinate(coordinate)) {
            this.chunk.createNewParticle(coordinate, element);
        } else {
            this.world.createNewParticle(coordinate, element);
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