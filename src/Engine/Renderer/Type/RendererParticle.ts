import {RGBATuple} from "../../../Utility/Color.ts";

export type RendererParticle = {
    id: number,
    dirty: boolean,
    ephemeral: boolean,
    color: {
        hex: string,
        tuple: RGBATuple
    }
}