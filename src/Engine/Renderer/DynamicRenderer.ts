import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {RendererConfig} from "../Config/RendererConfig.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {RendererProps} from "./BaseRenderer.ts";
import {CanvasRenderer} from "./CanvasRenderer.ts";
import {DebugCanvasRenderer} from "./DebugCanvasRenderer.ts";
import {ImageDataRenderer} from "./ImageDataRenderer.ts";
import {RendererInterface} from "./RendererInterface.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";
import {WebGLRenderer} from "./WebGLRenderer.ts";

export class DynamicRenderer implements RendererInterface {
    private readonly renderers: RendererInterface[] = [];

    constructor(config: RendererConfig, rootElement: HTMLElement) {
        for (const renderMode of config.modes) {
            this.initRenderer(renderMode, config, rootElement);
        }
    }

    render(world: RendererWorld): void {
        for (const renderer of this.renderers) {
            renderer.render(world);
        }
    }

    resize(viewport: ViewportDimensions): void {
        for (const renderer of this.renderers) {
            renderer.resize(viewport);
        }
    }

    private initRenderer(
        mode: RenderMode,
        config: RendererConfig,
        rootElement: HTMLElement
    ): void {
        const canvas = this.getCanvasForMode(rootElement, mode);

        canvas.width = config.viewport.width;
        canvas.height = config.viewport.height;

        const props: RendererProps = {canvas, config};
        let renderer: RendererInterface | undefined;
        switch (mode) {
            case RenderMode.Debug:
                renderer = new DebugCanvasRenderer(props);
                break;
            case RenderMode.Draw:
                renderer = new CanvasRenderer(props);
                break;
            case RenderMode.ImageData:
                renderer = new ImageDataRenderer(props);
                break;
            case RenderMode.WebGL:
            default:
                renderer = new WebGLRenderer(props);
                break;
        }

        if (renderer) {
            this.renderers.push(renderer);
        }
    }

    public getCanvasForMode(rootElement: HTMLElement, renderMode: RenderMode): HTMLCanvasElement {
        let canvas = rootElement.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.classList.add(renderMode);
            rootElement.appendChild(canvas);
        }

        return canvas;
    }
}