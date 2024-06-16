import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";
import {Config} from "../Type/Config.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {CanvasRenderer} from "./CanvasRenderer.ts";
import {DebugCanvasRenderer} from "./DebugCanvasRenderer.ts";
import {ImageDataRenderer} from "./ImageDataRenderer.ts";
import {Renderer, RendererProps} from "./Renderer.ts";

export class RendererBuilder {
    static build(
        mode: RenderMode,
        {config, world, ctx, dimensions}: {
            config: Config,
            world: World,
            ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
            dimensions: WorldDimensions,
        }
    ): Renderer {
        const props: RendererProps = {
            ctx,
            world,
            particleSize: config.simulation.particleSize,
            dimensions,
        };
        switch (mode) {
            case RenderMode.Debug:
                return new DebugCanvasRenderer(props);
            case RenderMode.Draw:
                return new CanvasRenderer(props);
            case RenderMode.ImageData:
                return new ImageDataRenderer(props);
        }
    }
}