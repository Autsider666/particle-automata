import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {RenderMode} from "../Type/RenderMode.ts";

export type  RendererConfig = {
    modes: RenderMode[],
    initialScreenBounds: WorldDimensions,
    particleSize: number,
}