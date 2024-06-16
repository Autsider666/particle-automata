import {ColorTuple} from "./Color.ts";
import {Coordinate} from "./Type/Dimensional.ts";

const BytesPerPixel: number = 4;

export class ImageDataHelper {
    private readonly imageData: ImageData;

    constructor(
        private readonly gridWidth: number,
        private readonly gridHeight: number,
        private readonly elementSize: number,
    ) {
        this.imageData = new ImageData(this.gridWidth * this.elementSize, this.gridHeight * elementSize);
        for (let i = 0; i < this.imageData.data.length; i += BytesPerPixel) {
            this.imageData.data[i + 3] = 255;
        }
    }

    public applyImageData(ctx: CanvasImageData): void {
        ctx.putImageData(this.imageData, 0, 0);
    }

    public fillRectangle({x:x1, y:y1}: Coordinate, width: number, height: number, color: ColorTuple) {
        for (let y = y1; y < y1 + height; y++) {
            for (let x = x1; x < x1 + width; x++) {
                this.fillPixel({x: x, y: y}, color);
            }
        }
    }

    private getIndexForPixelLocation({x, y}: Coordinate): number {
        return (y * this.imageData.width + x) * BytesPerPixel;
    }

    // private getPixelLocationForIndex(index: number): Coordinate {
    //     const pixelIdx = Math.floor(index / BytesPerPixel);
    //     const y = Math.floor(pixelIdx / this.imageData.width);
    //     const x = pixelIdx % this.imageData.width;
    //     return {x: x, y: y};
    // }

    private fillPixel(coordinate: Coordinate, color: ColorTuple): void {
        const idx = this.getIndexForPixelLocation(coordinate);
        this.imageData.data[idx] = color[0]; // Red
        this.imageData.data[idx + 1] = color[1]; // Green
        this.imageData.data[idx + 2] = color[2]; // Blue
        this.imageData.data[idx + 3] = color[3]; // Alpha
    }
}