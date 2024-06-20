import {Array2D} from "./Array2D.ts";
import type {Coordinate, Dimensions} from "./Type/Dimensional.ts";

export type DefaultValueSetter<I> = (index: number, item: I) => void;

export class SharedArray2D<I, C extends Coordinate = Coordinate> extends Array2D<I, C> {
    private readonly updateParticleValue: DefaultValueSetter<I>;

    constructor(
        dimensions: Dimensions,
        updateParticleValue: DefaultValueSetter<I>,
        protected readonly offset: Coordinate,
        existingStore: I[],
    ) {
        super(
            dimensions,
            () => {
                throw new Error('This should never be called for SharedArray2D');
            },
            offset,
            existingStore
        );

        this.updateParticleValue = (index, item) => {
            updateParticleValue(index, item);
            this.changedIndexes.add(index);
            this.iterateSet.add(item);
            return item;
        };

        const size = dimensions.width * dimensions.height;
        for (let i = 0; i < size; i++) {
            this.updateParticle(i);
        }
    }

    public updateParticle(index: number): void {
        this.updateParticleValue(index, this.store[index]);
    }
}