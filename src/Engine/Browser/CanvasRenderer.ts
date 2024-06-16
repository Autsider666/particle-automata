import {World} from "../Grid/World.ts";

export class CanvasRenderer {
    private firstDraw: boolean = true;

    constructor(
        private readonly world: World,
        private readonly particleSize: number,
        private readonly height: number = window.innerHeight,
        private readonly width: number = window.innerWidth,
        private readonly debug: boolean = false,
    ) {
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.firstDraw && !this.debug) {
            ctx.clearRect(0, 0, this.width, this.height);
        }

        // this.world.iterateParticles((particle, {x, y}) => {
        //     if (particle.ephemeral) {
        //         ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        //         return;
        //     }
        //
        //     ctx.fillStyle = particle.color;
        //     ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        // }, true);

        this.world.iterateChunks((chunk) => {
            if (!chunk.isActive() && !this.firstDraw && !this.debug) {
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

            if (this.debug && !this.firstDraw && chunk.isActive()) { //TODO split debug drawing of to DebugCanvasRenderer and a overlapping debug canvas?
                ctx.strokeStyle = 'rgb(50,114,99)';
                ctx.lineWidth = 1;
                const halfStroke = ctx.lineWidth * 0.5;
                ctx.strokeRect(
                    chunk.bounds.left * this.particleSize + halfStroke,
                    chunk.bounds.top * this.particleSize + halfStroke,
                    chunk.bounds.width * this.particleSize - halfStroke * 2,
                    chunk.bounds.height * this.particleSize - halfStroke * 2,
                );
            }
        });

        if (this.firstDraw) {
            this.firstDraw = false;
        }
    }
}