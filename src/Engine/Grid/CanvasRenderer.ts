import {World} from "./World.ts";

export class CanvasRenderer {
    constructor(
        private readonly world: World,
        private readonly particleSize: number,
        private readonly height: number = window.innerHeight,
        private readonly width: number = window.innerWidth,
    ) {
    }

    draw(ctx: CanvasRenderingContext2D, cleared: boolean = true): void {
        if (cleared) {
            ctx.clearRect(0, 0, this.width, this.height);
            // ctx.fillStyle = transparent;
            // ctx.fillStyle = Air.baseColor;
            // ctx.fillRect(0, 0, this.width, this.height);
        }

        this.world.iterateParticles((particle, {x, y}) => {
            if (particle.ephemeral) {
                ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                return;
            }

            ctx.fillStyle = particle.color;
            ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        }, true);
    }
}