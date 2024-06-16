import {RGBATuple} from "./Color.ts";
import {BoundingBox} from "./Excalibur/BoundingBox.ts";
import {Coordinate, WorldDimensions} from "./Type/Dimensional.ts";

const BytesPerPixel: number = 4;

export class ImageDataHelper<C extends Coordinate = Coordinate> {
    private imageData!: ImageData;
    private gridBounds!: BoundingBox<C>;
    private width!: number;
    private height!: number;

    constructor(
        dimensions: WorldDimensions,
        private readonly particleSize: number,
    ) {
        this.resize(dimensions);
    }

    resize({width, height}: WorldDimensions): void {
        this.width = width * this.particleSize;
        this.height = height * this.particleSize;

        this.imageData = new ImageData(this.width, this.height);

        for (let i = 0; i < this.imageData.data.length; i += BytesPerPixel) {
            this.imageData.data[i + 3] = 255;
        }

        this.gridBounds = BoundingBox.fromDimension<C>(width-1, height-1);
    }

    public applyImageData(ctx: CanvasImageData): void {
        ctx.putImageData(this.imageData, 0, 0);
    }

    public fillRectangle(coordinate: C, width: number, height: number, color: RGBATuple): void { //TODO Cache rectangles?
        if (!this.gridBounds.containsCoordinate(coordinate)) {
            return;
        }

        const dX = coordinate.x * this.particleSize;
        const dY = coordinate.y * this.particleSize;
        for (let y = dY; y < dY + height; y++) {
            for (let x = dX; x < dX + width; x++) {
                this.fillPixel({x, y}, color);
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

    private fillPixel(coordinate: Coordinate, color: RGBATuple): void {
        const idx = this.getIndexForPixelLocation(coordinate);
        this.imageData.data[idx] = color[0]; // Red
        this.imageData.data[idx + 1] = color[1]; // Green
        this.imageData.data[idx + 2] = color[2]; // Blue

        let alpha = color[3];
        if (alpha <= 1){
           alpha*=255;
        }
        this.imageData.data[idx + 3] = alpha; // Alpha
    }
}