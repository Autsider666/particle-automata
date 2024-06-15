/**
 * Taken from the BoundingBox of Excalibur https://excaliburjs.com/
 * https://github.com/excaliburjs/Excalibur/blob/main/src/engine/Collision/BoundingBox.ts
 */
import type {Coordinate} from "../../../Utility/Type/Dimensional.ts";

export class BoundingBox {
    constructor(
        public readonly left: number,
        public readonly top: number,
        public readonly right: number,
        public readonly bottom: number,
    ) {
    }

    public static fromDimension(width: number, height: number, pos: Coordinate = {x: 0, y: 0}) {
        const anchor: Coordinate = {x: 0, y: 0};

        return new BoundingBox(
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

    public get topLeft(): Coordinate {
        return {x: this.left, y: this.top};
    }

    public get bottomRight(): Coordinate {
        return {x: this.right, y: this.bottom};
    }

    public get topRight(): Coordinate {
        return {x: this.right, y: this.top};
    }

    public get bottomLeft(): Coordinate {
        return {x: this.left, y: this.bottom};
    }

    public containsCoordinate({x, y}: Coordinate): boolean {
        return this.left <= x && this.top <= y && this.bottom >= y && this.right >= x;
    }

    public containsBoundingBox(bounds:BoundingBox):boolean {
        return this.left <= bounds.left && this.top <= bounds.top && bounds.bottom <= this.bottom && bounds.right <= this.right;
    }
}