import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {BaseRenderer, RendererProps} from "./BaseRenderer.ts";

export abstract class Abstract2DContextRenderer extends BaseRenderer {
    protected readonly ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

    constructor(props: RendererProps) {
        super(props);

        const ctx = props.canvas.getContext('2d');
        if (!(ctx instanceof OffscreenCanvasRenderingContext2D || ctx instanceof CanvasRenderingContext2D)) {
            throw new Error('Could not get 2D context from canvas');
        }

        this.ctx = ctx;
    }

    resize(dimensions: ViewportDimensions): void {
        this.clear();
        super.resize(dimensions);
        this.clear();
    }

    protected clear(): void {
        this.ctx.clearRect(0, 0, this.width * this.particleSize, this.height * this.particleSize);
    }
}