import {RGBATuple} from "../Color.ts";
import {BoundingBox} from "../Excalibur/BoundingBox.ts";
import {Coordinate, GridDimensions} from "../Type/Dimensional.ts";
import {RenderHelper} from "./RenderHelper.ts";

export class ImageDataHelper<C extends Coordinate = Coordinate> extends RenderHelper<C> {
    private imageData!: ImageData;

    constructor(
        dimensions: GridDimensions,
        particleSize: number,
    ) {
        super(dimensions, particleSize, 4);
        this.resize(dimensions);
    }

    resize({width, height}: GridDimensions): void {
        this.width = width * this.particleSize;
        this.height = height * this.particleSize;

        this.imageData = new ImageData(this.width, this.height);

        for (let i = 0; i < this.imageData.data.length; i += this.bytesPerPixel) {
            this.imageData.data[i + 3] = 255;
        }

        this.gridBounds = BoundingBox.fromDimension<C>(width - 1, height - 1);
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