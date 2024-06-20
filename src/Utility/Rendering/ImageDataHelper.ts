import {RGBATuple} from "../Color.ts";
import {ViewportDimensions} from "../Type/Dimensional.ts";
import {RenderHelper} from "./RenderHelper.ts";

export class ImageDataHelper extends RenderHelper {
    private imageData!: ImageData;

    constructor(
        dimensions: ViewportDimensions,
        particleSize: number,
    ) {
        super(dimensions, particleSize, 4);
        this.resize(dimensions);
    }

    resize(viewPort: ViewportDimensions): void {
        super.resize(viewPort);

        this.imageData = new ImageData(this.viewPort.width, this.viewPort.height);

        for (let i = 0; i < this.imageData.data.length; i += this.bytesPerPixel) {
            this.imageData.data[i + 3] = 255;
        }
    }

    public applyImageData(ctx: CanvasImageData): void {
        ctx.putImageData(this.imageData, 0, 0);
    }

    protected handlePixel(index: number, color: RGBATuple): void {
        this.imageData.data[index] = color[0]; // Red
        this.imageData.data[index + 1] = color[1]; // Green
        this.imageData.data[index + 2] = color[2]; // Blue

        let alpha = color[3];
        if (alpha <= 1) {
            alpha *= 255;
        }
        this.imageData.data[index + 3] = alpha; // Alpha
    }
}