import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {Abstract2DContextRenderer} from "./Abstract2DContextRenderer.ts";


export class CanvasRenderer extends Abstract2DContextRenderer {
    resize(dimensions: WorldDimensions): void {
        this.clear();
        super.resize(dimensions);
        this.clear();
    }

    draw(world: World): void {
        if (this.firstDraw) {
            this.clear();

            world.iterateAllParticles(this.handleParticle.bind(this));

            this.firstDraw = false;
        } else {
            world.iterateActiveChunks((chunk) =>
                chunk.iterateDirtyParticles(this.handleParticle.bind(this))
            );
        }
    }

    private handleParticle(particle: Particle, {x, y}: WorldCoordinate): void {
        if (!particle.ephemeral) {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        } else {
            this.ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        }
    }
}