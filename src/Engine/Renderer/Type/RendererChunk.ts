import {BoundingBox} from "../../../Utility/Excalibur/BoundingBox.ts";

export type RendererChunk = Readonly<{
    id: number,
    bounds: BoundingBox,
}>;