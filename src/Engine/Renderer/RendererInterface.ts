import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

export interface RendererInterface {
    render(world: RendererWorld): void;

    resize(viewport: ViewportDimensions): void
}