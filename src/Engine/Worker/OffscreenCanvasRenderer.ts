import {World} from "../Grid/World.ts";


export class OffscreenCanvasRenderer {
    protected firstDraw: boolean = true;

    constructor(
        protected readonly world: World,
        protected readonly particleSize: number,
        protected readonly height: number = window.innerHeight,
        protected readonly width: number = window.innerWidth,
    ) {
    }

    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        if (this.firstDraw) {
            ctx.clearRect(0, 0, this.width, this.height);
        }

        this.world.iterateChunks((chunk) => {
            if (!chunk.isActive() && !this.firstDraw) {
                return;
            }

            chunk.iterateParticles((particle, {x, y}) => { //TODO only changed particles
                if (!particle.ephemeral) {
                    ctx.fillStyle = particle.color;
                    ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                } else {
                    ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                }
            });
        });

        if (this.firstDraw) {
            this.firstDraw = false;
        }
    }
}