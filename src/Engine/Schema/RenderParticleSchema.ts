import {
    DecodedBuffer,
    Descriptor,
    Int32,
    NestedBufferBackedObject,
    Uint8,
} from "../../Utility/BufferBackedObject.ts";

type RGBColorDescriptor = {
    red: Descriptor<number>,
    green: Descriptor<number>,
    blue: Descriptor<number>,
}

export const RGBColorSchema = {
    red: Uint8(),
    green: Uint8(),
    blue: Uint8(),
} as const;

export type CoordinateDescriptor = {
    x: Descriptor<number>,
    y: Descriptor<number>,
}

export const CoordinateSchema: CoordinateDescriptor = {
    x: Int32(),
    y: Int32(),
};


export type RenderParticleDescriptor = {
    coordinate: Descriptor<DecodedBuffer<CoordinateDescriptor>>,
    color: Descriptor<DecodedBuffer<RGBColorDescriptor>>,
}

export const RenderParticleSchema: RenderParticleDescriptor = {
    coordinate: NestedBufferBackedObject(CoordinateSchema),
    color: NestedBufferBackedObject(RGBColorSchema),
};


export type RenderChunkSchema = {
    coordinate: Descriptor<DecodedBuffer<CoordinateDescriptor>>,
    particles: Descriptor<DecodedBuffer<RGBColorDescriptor>>,
}