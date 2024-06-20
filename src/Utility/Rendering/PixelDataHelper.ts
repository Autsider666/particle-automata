import {GridCoordinate} from "../../Engine/Type/Coordinate.ts";
import {RGBATuple} from "../Color.ts";
import {ViewportDimensions} from "../Type/Dimensional.ts";
import {RenderHelper} from "./RenderHelper.ts";

export class PixelDataHelper extends RenderHelper {
    public pixelData!: Uint8Array; //TODO should be better I guess?

    constructor(
        dimensions: ViewportDimensions,
        particleSize: number,
        private readonly useAlpha: boolean = false
    ) {
        super(dimensions, particleSize, useAlpha ? 4 : 3);
        this.resize(dimensions);
    }

    resize(viewPort: ViewportDimensions, defaultColor?: RGBATuple): void {
        super.resize(viewPort);

        this.pixelData = new Uint8Array(
            this.viewPort.width * this.viewPort.height * this.bytesPerPixel
        );

        if (defaultColor) {
            for (let x = 0; x < this.grid.width; x++) {
                for (let y = 0; y < this.grid.height; y++) {
                    this.fillRectangle(
                        {x, y} as GridCoordinate,
                        this.particleSize,
                        this.particleSize,
                        defaultColor,
                    );
                }
            }
        }
    }

    protected handlePixel(index: number, color: RGBATuple): void {
        this.pixelData[index] = color[0]; // Red
        this.pixelData[index + 1] = color[1]; // Green
        this.pixelData[index + 2] = color[2]; // Blue
        if (this.useAlpha) {
            this.pixelData[index + 3] = color[3]; // Alpha
        }
    }
}