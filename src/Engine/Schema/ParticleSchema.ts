import {Boolean, DecodedBuffer, Descriptor, NestedBufferBackedObject,} from "../../Utility/BufferBackedObject.ts";
import {RGBAColorDescriptor, RGBAColorSchema} from "./ColorSchema.ts";
import {CoordinateDescriptor, CoordinateSchema} from "./CoordinateSchema.ts";

export type ParticleDescriptor = {
    dirty: Descriptor<boolean>,
    ephemeral: Descriptor<boolean>,
    coordinate: Descriptor<DecodedBuffer<CoordinateDescriptor>>,
    color: Descriptor<DecodedBuffer<RGBAColorDescriptor>>,
}

export const ParticleSchema: ParticleDescriptor = {
    dirty: Boolean(),
    ephemeral: Boolean(),
    coordinate: NestedBufferBackedObject(CoordinateSchema),
    color: NestedBufferBackedObject(RGBAColorSchema),
};


