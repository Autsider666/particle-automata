import {CanvasRenderer} from "./CanvasRenderer.ts";

export class DebugCanvasRenderer extends CanvasRenderer {
    draw(): void {
        if (this.firstDraw) {
            this.firstDraw = false;
            this.clear();
            return;
        }

        this.ctx.lineWidth = 1;
        this.world.iterateAllChunks((chunk) => {
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

        this.ctx.strokeStyle = 'rgb(55,222,215)';
        this.ctx.strokeRect(
            0,
            0,
            this.width * this.particleSize,
            this.height * this.particleSize,
        );
    }
}