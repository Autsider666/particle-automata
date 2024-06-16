/**
 * Taken from the BoundingBox of Excalibur https://excaliburjs.com/
 * https://github.com/excaliburjs/Excalibur/blob/main/src/engine/Collision/BoundingBox.ts
 */
import type {Coordinate} from "../Type/Dimensional.ts";

export class BoundingBox<C extends Coordinate = Coordinate> {
    constructor(
        public readonly left: number,
        public readonly top: number,
        public readonly right: number,
        public readonly bottom: number,
    ) {
    }

    public static fromDimension<C extends Coordinate = Coordinate>(width: number, height: number, pos: C = {x: 0, y: 0} as C) {
        const anchor: Coordinate = {x: 0, y: 0};

        return new BoundingBox<C>(
            -width * anchor.x + pos.x,
            -height * anchor.y + pos.y,
            width - width * anchor.x + pos.x,
            height - height * anchor.y + pos.y
        );
    }

    public get width() {
        return this.right - this.left;
    }

    public get height() {
        return this.bottom - this.top;
    }

    public get topLeft(): C {
        return {x: this.left, y: this.top} as C;
    }

    public get bottomRight(): C {
        return {x: this.right, y: this.bottom} as C;
    }

    public get topRight(): C {
        return {x: this.right, y: this.top} as C;
    }

    public get bottomLeft(): C {
        return {x: this.left, y: this.bottom} as C;
    }

    public containsCoordinate({x, y}: C): boolean {
        return this.left <= x && this.top <= y && this.bottom >= y && this.right >= x;
    }

    public containsBoundingBox(bounds: BoundingBox<C>): boolean {
        return this.left <= bounds.left && this.top <= bounds.top && bounds.bottom <= this.bottom && bounds.right <= this.right;
    }
}