import {World} from "../Grid/World.ts";
import {Renderer} from "./Renderer.ts";


export class CanvasRenderer implements Renderer {
    protected firstDraw: boolean = true;

    constructor(
        protected readonly ctx: CanvasRect & CanvasFillStrokeStyles,
        protected readonly world: World,
        protected readonly particleSize: number,
        protected readonly height: number,
        protected readonly width: number,
    ) {
    }

    draw(): void {
        if (this.firstDraw) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        this.world.iterateAllChunks((chunk) => {
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