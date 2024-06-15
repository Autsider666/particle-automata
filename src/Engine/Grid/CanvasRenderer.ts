import {World} from "./World.ts";

export class CanvasRenderer {
    private firstDraw:boolean = true;
    constructor(
        private readonly world: World,
        private readonly particleSize: number,
        private readonly height: number = window.innerHeight,
        private readonly width: number = window.innerWidth,
        private readonly debug:boolean = false,
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

        this.world.iterateChunks(chunk => {
            if (!chunk.dirty && !this.firstDraw) {
            // if (!chunk.dirty) {
                return;
            }

            if(this.debug){
                ctx.strokeStyle = 'gray';
                ctx.strokeRect(
                    chunk.bounds.left * this.particleSize,
                    chunk.bounds.top * this.particleSize,
                    chunk.bounds.width * this.particleSize,
                    chunk.bounds.height * this.particleSize,
                );
            }

            chunk.iterateParticles((particle, {x, y}) => {
                if (particle.ephemeral) {
                    ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
                    return;
                }

                ctx.fillStyle = particle.color;
                ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
            });
        });

        if (this.firstDraw) {
            this.firstDraw = false;
        }
    }
}