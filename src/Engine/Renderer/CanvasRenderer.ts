import {Dimensions} from "../../Utility/Type/Dimensional.ts";
import {World, WorldCoordinate} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {Renderer} from "./Renderer.ts";


export class CanvasRenderer implements Renderer {
    protected firstDraw: boolean = true;

    constructor(
        protected readonly ctx: CanvasRect & CanvasFillStrokeStyles,
        protected readonly world: World,
        protected readonly particleSize: number,
        protected height: number,
        protected width: number,
    ) {
    }

    resize({height, width}: Dimensions): void {
        this.clear();
        this.firstDraw = true;
        this.height = height;
        this.width = width;
        this.clear();
    }

    draw(): void {
        if (this.firstDraw) {
            this.clear();

            this.world.iterateAllParticles(this.handleParticle.bind(this));

            this.firstDraw = false;
        } else {
            this.world.iterateActiveChunks((chunk) =>
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

    private clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}