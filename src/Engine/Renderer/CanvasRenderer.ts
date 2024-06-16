import {World} from "../Grid/World.ts";


export class CanvasRenderer {
    protected firstDraw: boolean = true;

    constructor(
        protected readonly ctx: CanvasRect&CanvasFillStrokeStyles,
        protected readonly world: World,
        protected readonly particleSize: number,
        protected readonly height: number = window.innerHeight,
        protected readonly width: number = window.innerWidth,
    ) {
    }

    draw(): void {
        if (this.firstDraw) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        this.world.iterateChunks((chunk) => {
            if (!chunk.isActive() && !this.firstDraw) {
                return;
            }

            chunk.iterateParticles((particle, {x, y}) => { //TODO only changed particles
                if (!particle.ephemeral) {
                    this.ctx.fillStyle = particle.color;
                    this.ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                } else {
                    this.ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                }
            });
        });

        if (this.firstDraw) {
            this.firstDraw = false;
        }
    }
}