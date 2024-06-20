import {
    Boolean,
    DecodedBuffer,
    Descriptor,
    NestedArrayOfBufferBackedObjects,
    NestedBufferBackedObject,
    Uint16,
    Uint32,
} from "../../Utility/BufferBackedObject.ts";
import {CoordinateDescriptor, CoordinateSchema} from "./CoordinateSchema.ts";
import {ParticleDescriptor, ParticleSchema} from "./ParticleSchema.ts";

export type BoundsDescriptor = {
    width: Descriptor<number>,
    height: Descriptor<number>,
    left: Descriptor<number>,
    top: Descriptor<number>,
}

export const BoundsSchema: BoundsDescriptor = {
    width: Uint32(),
    height: Uint32(),
    left: Uint32(),
    top: Uint32(),
};

export type ChunkDescriptor = {
    id: Descriptor<number>,
    dirty: Descriptor<boolean>,
    bounds: Descriptor<DecodedBuffer<BoundsDescriptor>>
    coordinate: Descriptor<DecodedBuffer<CoordinateDescriptor>>,
    particles: Descriptor<DecodedBuffer<ParticleDescriptor>[]>,
}

export const ChunkSchema = (size: number): ChunkDescriptor => {
    return {
        id: Uint16(),
        dirty: Boolean(),
        bounds: NestedBufferBackedObject(BoundsSchema),
        coordinate: NestedBufferBackedObject(CoordinateSchema),
        particles: NestedArrayOfBufferBackedObjects(size, ParticleSchema)
    };
};