import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {Abstract2DContextRenderer} from "./Abstract2DContextRenderer.ts";
import {RendererParticle} from "./Type/RendererParticle.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";


export class CanvasRenderer extends Abstract2DContextRenderer {
    resize(dimensions: WorldDimensions): void {
        this.clear();
        super.resize(dimensions);
        this.clear();
    }

    draw({dirtyParticles}:RendererWorld): void {
        if (this.firstDraw) {
            this.firstDraw = false;
        }

            for (const [coordinate, particle] of dirtyParticles) {
                this.handleParticle(coordinate,particle);
            }
    }

    private handleParticle({x, y}: WorldCoordinate, particle: RendererParticle): void {
        if (!particle.ephemeral) {
            this.ctx.fillStyle = particle.color.hex;
            this.ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        } else {
            this.ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        }
    }
}