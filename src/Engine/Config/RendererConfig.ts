import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {RenderMode} from "../Type/RenderMode.ts";

export type  RendererConfig = {
    modes: RenderMode[],
    initialScreenBounds: ViewportDimensions,
    particleSize: number,
}