import {RGBATuple} from "../Color.ts";
import {BoundingBox} from "../Excalibur/BoundingBox.ts";
import {Coordinate, WorldDimensions} from "../Type/Dimensional.ts";

export abstract class RenderHelper<C extends Coordinate = Coordinate> {
    protected gridBounds!: BoundingBox<C>;
    protected width: number;
    protected height: number;

    constructor(
        {width, height}: WorldDimensions,
        protected readonly particleSize: number,
        protected readonly bytesPerPixel: number = 4
    ) {
        this.gridBounds = BoundingBox.fromDimension<C>(width - 1, height - 1);
        this.width = width * this.particleSize;
        this.height = height * this.particleSize;
    }

    //TODO Cache rectangles?
    public fillRectangle(coordinate: C, width: number, height: number, color: RGBATuple): void {
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

    protected getIndexForPixelLocation({x, y}: Coordinate): number {
        return (y * this.width + x) * this.bytesPerPixel;
    }

    protected getPixelLocationForIndex(index: number): Coordinate {
        const pixelIdx = Math.floor(index / this.bytesPerPixel);
        const y = Math.floor(pixelIdx / this.width);
        const x = pixelIdx % this.width;
        return {x: x, y: y};
    }

    private fillPixel(coordinate: Coordinate, color: RGBATuple): void {
        const idx = this.getIndexForPixelLocation(coordinate);
        for (let i = 0; i < this.bytesPerPixel; i++) {
            this.handlePixel(idx, color);
        }
    }

    protected abstract handlePixel(index: number, color: RGBATuple): void;
}