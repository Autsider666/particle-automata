import {Direction, Traversal} from "../../Utility/Type/Dimensional.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World, WorldCoordinate} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {BehaviourManager} from "./BehaviourManager.ts";

type ObviousParticleData = {
    hasBeenDisplaced?: boolean,
    dirty?: boolean,
}

type ObviousParticle = Particle<ObviousParticleData>;

type NeighboringDirection = Direction<-1 | 0 | 1>;

type DirectionalOptions = NeighboringDirection[];

export class ObviousNonsenseBehaviourManager extends BehaviourManager {
    private readonly airDensity: number = ParticleType.Air.density ?? 1;

    private readonly updateList: DirectionalOptions = [
        {dX: 0, dY: +1},
        {dX: -1, dY: +1},
        {dX: +1, dY: +1},
        {dX: -1, dY: 0},
        {dX: +1, dY: 0},
    ];

    private readonly risingDisplacementDirections: DirectionalOptions = [
        {dX: +1, dY: 0},
        {dX: -1, dY: 0},
        {dX: +1, dY: -1},
        {dX: -1, dY: -1},
    ];

    private readonly fallingDisplacementDirections: DirectionalOptions = [
        {dX: +1, dY: 0},
        {dX: -1, dY: 0},
        {dX: +1, dY: +1},
        {dX: -1, dY: +1},
    ];


    constructor(
        world: World,
        chunk: Chunk,
    ) {
        super(world, chunk);
    }

    updateParticle(particle: ObviousParticle, coordinate: WorldCoordinate): void {
        if (particle.ephemeral) { //TODO reset displacement?
            return;
        }

        if (particle.density !== undefined && particle.immovable !== true) {
            if (particle.fluidity) {
                this.updateFluid(particle, coordinate);
            } else {
                this.updateOther(particle, coordinate);
            }

            particle.hasBeenDisplaced = false;
        } else {
            particle.hasBeenDisplaced = true;
        }
    }

    private updateFluid(particle: ObviousParticle, coordinate: WorldCoordinate): void {
        let i: number = -1;
        for (const {dX, dY} of this.updateList) {
            const moved = this.tryGridPosition(
                particle,
                coordinate,
                {
                    dX,
                    dY: (this.doesParticleRise(particle) ? -1 : +1) * dY,
                },
                true
            );

            i++;

            if (!moved) {
                continue;
            }

            particle.dirty = true;

            if (i === 4) {
                this.shuffleUpdateList(true);
            }

            return;
        }

        this.shuffleUpdateList(true);
    }

    private updateOther(particle: ObviousParticle, coordinate: WorldCoordinate): void {
        let i = 0;
        for (const updateDirection of this.updateList) {
            if (this.tryGridPosition(particle, coordinate, updateDirection)) {
                particle.dirty = true;
                break;
            }

            if (i === 2) {
                break;
            }

            i++;
        }

        this.shuffleUpdateList(false);
    }

    private tryGridPosition(particle: ObviousParticle, coordinate: WorldCoordinate, direction: Direction, trySwap: boolean = true): boolean {
        if (!this.canMoveInDirection(coordinate, direction)) {
            return false;
        }

        const targetCoordinate = Traversal.getDestinationCoordinate(coordinate, direction);
        const particleInDirection = this.getParticle<ObviousParticle>(targetCoordinate);
        if (particleInDirection.immovable) {
            return false;
        }

        const density = particle.density ?? 0;
        const densityInDirection = particleInDirection.density ?? 0;
        const rises = this.doesParticleRise(particle);

        // Move to the given position if it's empty.
        if (particleInDirection.ephemeral) {
            if (
                // Whether to check if we're heavier than air or air's heavier than us
                // depends on if we move up or down
                (!rises && (density * Math.random() > densityInDirection))
                ||
                (rises && (densityInDirection * Math.random() > density))
            ) {
                this.moveParticle(coordinate, direction);

                particle.dirty = true;
                particleInDirection.dirty = true;

                return true;
            }
        } else if (trySwap && !particleInDirection.hasBeenDisplaced) {
            if (
                (!rises && (density * Math.random() > densityInDirection))
                ||
                (rises && (densityInDirection * Math.random() > density))
            ) {
                if (this.displaceParticle(
                    particleInDirection,
                    targetCoordinate,
                    rises ? this.risingDisplacementDirections : this.fallingDisplacementDirections,
                )) {
                    this.moveParticle(coordinate, direction);

                    particle.dirty = true;
                    particleInDirection.dirty = true;
                }

                return true;
            }
        }

        // We failed to move to the given grid position
        return false;
    }

    private displaceParticle(particle: ObviousParticle, coordinate: WorldCoordinate, options: DirectionalOptions): boolean {
        if (particle.hasBeenDisplaced) {
            return false;
        }

        for (const option of options) {
            // Get the other particle to try the potential grid positions.
            if (this.tryGridPosition(particle, coordinate, option, false)) {
                particle.dirty = true;
                break;
            }
        }

        particle.hasBeenDisplaced = true;

        return true;
    }

    private shuffleUpdateList(fluid: boolean): void {
        if (Math.random() > 0.5) {
            const temp = this.updateList[1];
            this.updateList[1] = this.updateList[2];
            this.updateList[2] = temp;
        }

        if (fluid && Math.random() > 0.5) {
            const temp = this.updateList[3];
            this.updateList[3] = this.updateList[4];
            this.updateList[4] = temp;
        }
    }

    private doesParticleRise(particle: ObviousParticle): boolean {
        return particle.density ? particle.density < this.airDensity : true;
    }

    private canMoveInDirection(coordinate: WorldCoordinate, direction: Direction): boolean {
        return this.isValidCoordinate(
            Traversal.getDestinationCoordinate(coordinate, direction)
        );
    }
}