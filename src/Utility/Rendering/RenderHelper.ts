import {GridCoordinate, ViewportCoordinate} from "../../Engine/Type/Coordinate.ts";
import {RGBATuple} from "../Color.ts";
import {BoundingBox} from "../Excalibur/BoundingBox.ts";
import {GridDimensions, Traversal, ViewportDimensions} from "../Type/Dimensional.ts";

export abstract class RenderHelper {
    protected gridBounds!: BoundingBox<GridCoordinate>;
    protected grid: GridDimensions;

    protected constructor(
        protected viewPort: ViewportDimensions,
        protected readonly particleSize: number,
        protected readonly bytesPerPixel: number = 4
    ) {
        this.grid = Traversal.getGridDimensions(viewPort, particleSize);
    }

    public resize(viewPort: ViewportDimensions): void {
        this.viewPort = viewPort;

        this.grid = Traversal.getGridDimensions(viewPort, this.particleSize);

        this.gridBounds = BoundingBox.fromDimension<GridCoordinate>(this.grid.width - 1, this.grid.height - 1);

    }

    //TODO Cache rectangles?
    public fillRectangle(coordinate: GridCoordinate, width: number, height: number, color: RGBATuple): void {
        if (!this.gridBounds.containsCoordinate(coordinate)) {
            return;
        }

        const dX = coordinate.x * this.particleSize;
        const dY = coordinate.y * this.particleSize;
        for (let y = dY; y < dY + height; y++) {
            for (let x = dX; x < dX + width; x++) {
                this.fillPixel({x, y} as ViewportCoordinate, color);
            }
        }
    }

    protected getIndexForPixelLocation({x, y}: ViewportCoordinate): number {
        return (y * this.viewPort.width + x) * this.bytesPerPixel;
    }

    protected getPixelLocationForIndex(index: number): GridCoordinate {
        const pixelIdx = Math.floor(index / this.bytesPerPixel);
        const y = Math.floor(pixelIdx / this.viewPort.width);
        const x = pixelIdx % this.viewPort.width;
        return {x: x, y: y} as GridCoordinate;
    }

    private fillPixel(coordinate: ViewportCoordinate, color: RGBATuple): void {
        this.handlePixel(this.getIndexForPixelLocation(coordinate), color); //FIXME is iteration need?
    }

    protected abstract handlePixel(index: number, color: RGBATuple): void;
}