import {Abstract2DContextRenderer} from "./Abstract2DContextRenderer.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";


export class CanvasRenderer extends Abstract2DContextRenderer {
    // resize(dimensions: GridDimensions): void {
    //     this.clear();
    //     super.resize(dimensions);
    //     this.clear();
    // }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected draw(_world: RendererWorld): void {
        throw new Error('CanvasRenderer does nothing atm');

        // for (const [coordinate, particle] of dirtyParticles) {
        //     this.handleParticle(coordinate,particle);
        // }
    }

    // private handleParticle({x, y}: WorldCoordinate, particle: RendererParticle): void {
    //     // if (!particle.ephemeral) {
    //     //     this.ctx.fillStyle = particle.color.hex;
    //     //     this.ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
    //     // } else {
    //     //     this.ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
    //     // }
    // }
}