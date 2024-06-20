import {Descriptor, Uint8} from "../../Utility/BufferBackedObject.ts";

export type RGBAColorDescriptor = {
    red: Descriptor<number>,
    green: Descriptor<number>,
    blue: Descriptor<number>,
    alpha: Descriptor<number>,
}

export const RGBAColorSchema: RGBAColorDescriptor = {
    red: Uint8(),
    green: Uint8(),
    blue: Uint8(),
    alpha: Uint8(),
};