import {Dimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";
import {Config} from "../Type/Config.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {CanvasRenderer} from "./CanvasRenderer.ts";
import {DebugCanvasRenderer} from "./DebugCanvasRenderer.ts";
import {ImageDataRenderer} from "./ImageDataRenderer.ts";
import {Renderer} from "./Renderer.ts";

export class RendererBuilder {
    static build(
        mode: RenderMode,
        {config,world,ctx, dimensions}: {
            config:Config,
            world:World,
            ctx:CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,
            dimensions:Dimensions,
        }
    ): Renderer {
        switch (mode) {
            case RenderMode.Debug:
                return new DebugCanvasRenderer(
                    ctx,
                    world,
                    config.simulation.particleSize,
                    // config.world.height * config.simulation.particleSize,
                    // config.world.width * config.simulation.particleSize,
                );
            case RenderMode.Draw:
                return new CanvasRenderer(
                    ctx,
                    world,
                    config.simulation.particleSize,
                    dimensions.height,
                    dimensions.width,
                );
            case RenderMode.ImageData:
                return new ImageDataRenderer(
                    ctx,
                    world,
                    config.simulation.particleSize,
                    dimensions.height,
                    dimensions.width,
                );
        }
    }
}