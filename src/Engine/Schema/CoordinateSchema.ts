import {Descriptor, Int32} from "../../Utility/BufferBackedObject.ts";

export type CoordinateDescriptor = {
    x: Descriptor<number>,
    y: Descriptor<number>,
}

export const CoordinateSchema: CoordinateDescriptor = {
    x: Int32(),
    y: Int32(),
};
