import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {RendererConfig} from "../Config/RendererConfig.ts";
import {RendererInterface} from "./RendererInterface.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

export type RendererProps = {
    canvas: HTMLCanvasElement | OffscreenCanvas
    config: RendererConfig,
}

export abstract class BaseRenderer implements RendererInterface {
    protected firstDraw: boolean = true;
    protected height: number;
    protected width: number;
    protected readonly canvas: HTMLCanvasElement | OffscreenCanvas;
    protected readonly particleSize: number;

    constructor({
                    canvas,
                    config,
                }: RendererProps) {
        this.canvas = canvas;
        this.particleSize = config.particleSize;
        this.height = config.viewport.height;
        this.width = config.viewport.width;
    }

    public render(world: RendererWorld): void {
        this.draw(world);
        this.firstDraw = false;
    }

    protected abstract draw(world: RendererWorld): void;

    resize({height, width}: ViewportDimensions): void {
        this.firstDraw = true;
        this.height = height;
        this.width = width;
    }
}