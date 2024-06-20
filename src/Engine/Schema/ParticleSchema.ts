import {
    Boolean,
    DecodedBuffer,
    Descriptor,
    NestedBufferBackedObject,
    Uint16,
} from "../../Utility/BufferBackedObject.ts";
import {RGBAColorDescriptor, RGBAColorSchema} from "./ColorSchema.ts";
import {CoordinateDescriptor, CoordinateSchema} from "./CoordinateSchema.ts";

export type ParticleDescriptor = {
    index: Descriptor<number>,
    dirty: Descriptor<boolean>,
    ephemeral: Descriptor<boolean>,
    coordinate: Descriptor<DecodedBuffer<CoordinateDescriptor>>,
    color: Descriptor<DecodedBuffer<RGBAColorDescriptor>>,
}

export const ParticleSchema: ParticleDescriptor = {
    index: Uint16(),
    dirty: Boolean(),
    ephemeral: Boolean(),
    coordinate: NestedBufferBackedObject(CoordinateSchema),
    color: NestedBufferBackedObject(RGBAColorSchema),
};


