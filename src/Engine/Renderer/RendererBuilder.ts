import {RendererConfig} from "../Config/RendererConfig.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {CanvasRenderer} from "./CanvasRenderer.ts";
import {DebugCanvasRenderer} from "./DebugCanvasRenderer.ts";
import {ImageDataRenderer} from "./ImageDataRenderer.ts";
import {Renderer, RendererProps} from "./Renderer.ts";
import {WebGLRenderer} from "./WebGLRenderer.ts";

export class RendererBuilder {
    static build(
        mode: RenderMode,
        config: RendererConfig,
        rootElement:HTMLElement,
    ): Renderer {
        const props:RendererProps = {
            canvas: this.getCanvasForMode(rootElement,mode),
            config,
        };

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

    static getCanvasForMode = (rootElement: HTMLElement, renderMode: RenderMode): HTMLCanvasElement => {
        let canvas = rootElement.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.classList.add(renderMode);
            rootElement.appendChild(canvas);
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas;
    };
}