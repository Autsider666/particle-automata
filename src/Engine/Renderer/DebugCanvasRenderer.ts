import {World} from "../Grid/World.ts";
import {Renderer} from "./Renderer.ts";

export class DebugCanvasRenderer implements Renderer {
    private firstDraw: boolean = true;

    constructor(
        private readonly ctx: CanvasRect & CanvasFillStrokeStyles & CanvasPathDrawingStyles,
        private readonly world: World,
        private readonly particleSize: number,
    ) {
    }

    draw(): void {
        if (this.firstDraw){
            this.firstDraw = false;
            return;
        }

        this.world.iterateAllChunks((chunk) => {
            this.ctx.lineWidth = 1;
            const halfStroke = this.ctx.lineWidth * 0.5;
            if (chunk.isActive()) {
                this.ctx.strokeStyle = 'rgb(50,114,99)';
                this.ctx.strokeRect(
                    chunk.bounds.left * this.particleSize + halfStroke,
                    chunk.bounds.top * this.particleSize + halfStroke,
                    chunk.bounds.width * this.particleSize - halfStroke * 2,
                    chunk.bounds.height * this.particleSize - halfStroke * 2,
                );
            } else {
                this.ctx.clearRect(
                    chunk.bounds.left * this.particleSize + halfStroke,
                    chunk.bounds.top * this.particleSize + halfStroke,
                    chunk.bounds.width * this.particleSize - halfStroke * 2,
                    chunk.bounds.height * this.particleSize - halfStroke * 2,
                );
            }
        });
    }
}