import {Distinct} from "./Distinct.ts";

export type Coordinate = { x: number, y: number };
export type Direction<AllowedValues extends number = number> = Readonly<{ dX: AllowedValues, dY: AllowedValues }>;
export type Dimensions<Height extends number = number, Width extends number = number> = Readonly<{
    height: Height,
    width: Width
}>;
export type WorldDimensions = Distinct<Dimensions, 'Grid'>;

export class Traversal {
    static getDestinationCoordinate<C extends Coordinate = Coordinate>({x, y}: C, {dX, dY}: Direction): C {
        return {
            x: x + dX,
            y: y + dY,
        } as C;
    }

    static getGridDimensions({width, height}: Dimensions, particleSize: number): WorldDimensions {
        return {
            height: Math.round(height / particleSize),
            width: Math.round(width / particleSize),
        } as WorldDimensions;
    }
}