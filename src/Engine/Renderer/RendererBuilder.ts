import {RenderMode} from "../Type/RenderMode.ts";
import {CanvasRenderer} from "./CanvasRenderer.ts";
import {DebugCanvasRenderer} from "./DebugCanvasRenderer.ts";
import {ImageDataRenderer} from "./ImageDataRenderer.ts";
import {Renderer, RendererProps} from "./Renderer.ts";
import {WebGLRenderer} from "./WebGLRenderer.ts";

export class RendererBuilder {
    static build(
        mode: RenderMode,
        props: RendererProps,
    ): Renderer {
        switch (mode) {
            case RenderMode.Debug:
                return new DebugCanvasRenderer(props);
            case RenderMode.Draw:
                return new CanvasRenderer(props);
            case RenderMode.ImageData:
                return new ImageDataRenderer(props);
            case RenderMode.WebGL:
                return new WebGLRenderer(props);
        }
    }
}