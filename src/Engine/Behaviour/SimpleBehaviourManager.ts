import {Particle} from "../Particle/Particle.ts";
import {BehaviourManager} from "./BehaviourManager.ts";
import {WorldCoordinate} from "../Grid/World.ts";

export class SimpleBehaviourManager extends BehaviourManager {
    updateParticle(particle: Particle, coordinate: WorldCoordinate): void {
        if (particle.ephemeral) {
            return;
        }

        this.tryMoveDown(particle, coordinate);
        this.tryMoveDownSide(particle, coordinate);
    }

    // private tryMoveDown(particle: Particle, {x, y}: WorldCoordinate): boolean {
    //     const dY = y + 1;
    //     console.log(x,y);
    //     return dY < this.world.chunkSize && this.setParticle(
    //         {x, y: dY} as WorldCoordinate,
    //         particle
    //     );
    // }
    //
    // private tryMoveDownSide(particle: Particle, {x, y}: WorldCoordinate): boolean {
    //     const dY = y + 1;
    //     if (dY >= this.world.chunkSize) {
    //         return false;
    //     }
    //
    //     const dXLeft = x - 1;
    //     if (dXLeft > 0 && this.setParticle(
    //         {x: dXLeft, y: dY} as WorldCoordinate,
    //         particle
    //     )) {
    //         return true;
    //     }
    //
    //     const dXRight = x + 1;
    //     return dXRight < this.world.chunkSize && this.setParticle(
    //         {x: dXLeft, y: dY} as WorldCoordinate,
    //         particle
    //     );
    // }

    private tryMoveDown(_particle: Particle, coordinate: WorldCoordinate): void {
        this.moveParticle(coordinate, {dX: 0, dY: 1});
    }

    private tryMoveDownSide(_particle: Particle, coordinate: WorldCoordinate): void {
        this.moveParticle(coordinate, {dX: 1, dY: 1});
        this.moveParticle(coordinate, {dX: -1, dY: 1});
    }
}