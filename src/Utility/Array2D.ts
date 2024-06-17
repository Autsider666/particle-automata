import type {Coordinate, Dimensions} from "./Type/Dimensional.ts";

type DefaultValueGenerator<I> = (index: number) => I;

export class Array2D<I, C extends Coordinate = Coordinate> {
    private store: I[];
    private readonly iterateSet = new Set<I>();
    private readonly changedIndexes = new Set<number>();
    private readonly defaultValue: DefaultValueGenerator<I>;

    private readonly arrayWidth: number;
    private readonly arrayHeight: number;
    private readonly length: number;

    constructor(
        {width, height}: Dimensions,
        defaultValue: DefaultValueGenerator<I>,
        private readonly offset: Coordinate,
    ) {
        this.arrayWidth = width;
        this.arrayHeight = height;
        this.length = width * height;

        this.defaultValue = index => {
            const item = defaultValue(index);
            this.changedIndexes.add(index);
            this.iterateSet.add(item);
            return item;
        };

        this.store = [...Array<I>(this.length)].map((_, index) => this.defaultValue(index));
    }

    public clear(): void {
        this.changedIndexes.clear();
        this.iterateSet.clear();
        this.store = [...Array<I>(this.length)].map((_, index) => this.defaultValue(index));
    }

    public get<P extends I = I>(coordinate: C): P {
        this.validateCoordinate(coordinate);

        const item = this.store[this.toIndex(coordinate)];
        if (!item) {
            throw new Error('No particle found at coordinate');
        }

        return item as P;
    }

    private getByIndex(index: number): I {
        if (!this.isValidIndex(index)) {
            throw new Error('Invalid index');
        }

        return this.store[index];
    }


    set(coordinate: C, item: I): void {
        this.validateCoordinate(coordinate);

        const index = this.toIndex(coordinate);
        this.iterateSet.delete(this.getByIndex(index));

        this.setIndex(index, item);
    }

    private setIndex(index: number, item: I): boolean {
        if (!this.isValidIndex(index)) {
            return false;
        }

        this.store[index] = item;
        this.iterateSet.add(item);
        this.changedIndexes.add(index);

        return true;
    }

    iterateItems<P extends I = I>(callback: (item: P, coordinate: C) => void): void {
        for (let x = 0; x < this.arrayWidth; x++) {
            for (let y = 0; y < this.arrayHeight; y++) {
                const coordinate = {x: x + this.offset.x, y: y + this.offset.y} as C;
                callback(this.get<P>(coordinate), coordinate);
            }
        }
    }

    iterateChanges(callback: (item: I, coordinate: C) => void): void {
        for (const index of this.changedIndexes) {
            callback(this.getByIndex(index), this.toCoordinate(index));
        }
    }

    resetChanges():void {
        this.changedIndexes.clear();
    }

    // private toCoordinate(index: number): C {
    //     const x = index % this.arrayWidth + this.offset.x;
    //     const y = (index - x) / this.arrayWidth + this.offset.x;
    //     return {x, y} as C;
    // }

    public getIndex(coordinate: Readonly<C>): number {
        this.validateCoordinate(coordinate);

        return this.toIndex(coordinate);
    }

    containsCoordinate({x, y}: C): boolean {
        const dX = x - this.offset.x;
        const dY = y - this.offset.y;

        return dX >= 0 && dX < this.arrayWidth && dY >= 0 && dY < this.arrayHeight;
    }

    private toIndex({x, y}: Readonly<C>): number {
        return (y - this.offset.y) * this.arrayWidth + (x - this.offset.x);
    }

    private toCoordinate(index: number): C {
        const x = index % this.arrayWidth;
        const y = (index - x) / this.arrayWidth;
        return {x: x + this.offset.x, y: y + this.offset.y} as C;
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.length;
    }

    private validateCoordinate(coordinate: Readonly<C>): void {
        if (this.containsCoordinate(coordinate)) {
            return;
        }

        throw new Error('Invalid coordinate');
    }
}