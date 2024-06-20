import {onWorker} from "../OnWorker.ts";
import {Distinct} from "./Distinct.ts";

export type Coordinate = { x: number, y: number };
export type Direction<AllowedValues extends number = number> = Readonly<{ dX: AllowedValues, dY: AllowedValues }>;
export type Dimensions<Height extends number = number, Width extends number = number> = Readonly<{
    height: Height,
    width: Width
}>;
export type GridDimensions = Distinct<Dimensions, 'Grid'>;
export type ViewportDimensions = Distinct<Dimensions, 'Viewport'>;

export class Traversal {
    static getDestinationCoordinate<C extends Coordinate = Coordinate>({x, y}: C, {dX, dY}: Direction): C {
        return {
            x: x + dX,
            y: y + dY,
        } as C;
    }

    static getGridDimensions({width, height}: ViewportDimensions, particleSize: number): GridDimensions {
        return {
            height: Math.round(height / particleSize),
            width: Math.round(width / particleSize),
        } as GridDimensions;
    }

    static getViewportDimensions({width, height}: Dimensions): ViewportDimensions {
        if (onWorker()) {
            throw new Error('Can\'t calculate viewport on worker');
        }

        return {
            height: Math.round(height),
            width: Math.round(width),
        } as ViewportDimensions;
    }

    static iterateBetweenTwoCoordinates<C extends Coordinate = Coordinate>(
        start: C,
        end: C,
        callback: (step: C) => void,
        isWithingBounds?: (coordinate: C) => boolean
    ): void {
        const matrixX1 = start.x;
        const matrixY1 = start.y;
        const matrixX2 = end.x;
        const matrixY2 = end.y;

        if (matrixX1 === matrixX2 && matrixY1 === matrixY2) {
            callback(start);
            return;
        }

        let diffX = matrixX1 - matrixX2;
        let diffY = matrixY1 - matrixY2;

        const modX = diffX < 0 ? 1 : -1;
        const modY = diffY < 0 ? 1 : -1;

        diffX = Math.abs(diffX);
        diffY = Math.abs(diffY);

        const diffXIsLarger = diffX > diffY;

        const longerSideLength = diffXIsLarger ? diffX : diffY;
        const shorterSideLength = diffXIsLarger ? diffY : diffX;

        const slope = (longerSideLength === 0 || shorterSideLength === 0) ? 0 : shorterSideLength / longerSideLength;
        let increaseShorterSide: number;
        for (let i = 1; i <= longerSideLength; i++) {
            increaseShorterSide = Math.round(i * slope);
            const increaseX: number = diffXIsLarger ? i : increaseShorterSide;
            const increaseY: number = !diffXIsLarger ? i : increaseShorterSide;

            const currentCoordinate = {
                x: matrixX1 + (increaseX * modX),
                y: matrixY1 + (increaseY * modY)
            } as C;

            if (isWithingBounds === undefined || isWithingBounds(currentCoordinate)) {
                callback(currentCoordinate);
            }
        }
    }
}