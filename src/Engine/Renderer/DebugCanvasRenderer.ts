import {CanvasRenderer} from "./CanvasRenderer.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

export class DebugCanvasRenderer extends CanvasRenderer {
    protected draw({dirtyChunks, chunks}: RendererWorld): void {
        if (this.firstDraw) {
            this.clear();
            return;
        }

        this.ctx.lineWidth = 1;
        const halfStroke = this.ctx.lineWidth * 0.5;
        this.ctx.strokeStyle = 'rgb(50,114,99)';
        const dirtyChunkSet = new Set<number>();
        for (const index of dirtyChunks) {
            const chunk = chunks[index];
            dirtyChunkSet.add(chunk.id);
            this.ctx.strokeRect(
                chunk.bounds.left * this.particleSize + halfStroke,
                chunk.bounds.top * this.particleSize + halfStroke,
                chunk.bounds.width * this.particleSize - halfStroke * 2,
                chunk.bounds.height * this.particleSize - halfStroke * 2,
            );
        }


        for (const chunk of chunks) {
            if (dirtyChunkSet.has(chunk.id)) {
                continue;
            }

            this.ctx.clearRect(
                chunk.bounds.left * this.particleSize + halfStroke,
                chunk.bounds.top * this.particleSize + halfStroke,
                chunk.bounds.width * this.particleSize - halfStroke * 2,
                chunk.bounds.height * this.particleSize - halfStroke * 2,
            );
        }

        this.ctx.strokeStyle = 'rgb(55,222,215)';
        this.ctx.strokeRect(
            0,
            0,
            this.width * this.particleSize,
            this.height * this.particleSize,
        );
    }
}