import {RGBATuple} from "../Color.ts";
import {BoundingBox} from "../Excalibur/BoundingBox.ts";
import {Coordinate, WorldDimensions} from "../Type/Dimensional.ts";
import {RenderHelper} from "./RenderHelper.ts";

export class PixelDataHelper<C extends Coordinate = Coordinate> extends RenderHelper<C> {
    public pixelData!: Uint8Array; //TODO should be better I guess?

    constructor(
        dimensions: WorldDimensions,
        particleSize: number,
    ) {
        super(dimensions, particleSize, 3);
        this.resize(dimensions);
    }

    resize({width, height}: WorldDimensions): void {
        this.width = width * this.particleSize;
        this.height = height * this.particleSize;

        this.pixelData = new Uint8Array(
            this.width * this.height * this.bytesPerPixel
        ).fill(0);

        this.gridBounds = BoundingBox.fromDimension<C>(width - 1, height - 1);
    }

    protected handlePixel(index: number, color: RGBATuple): void {
        this.pixelData[index] = color[0]; // Red
        this.pixelData[index + 1] = color[1]; // Green
        this.pixelData[index + 2] = color[2]; // Blue
    }
}