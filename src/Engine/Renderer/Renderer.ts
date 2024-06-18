import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {RendererConfig} from "../Config/RendererConfig.ts";
import {World} from "../Grid/World.ts";

export type RendererProps = {
    canvas: HTMLCanvasElement | OffscreenCanvas
    config: RendererConfig,
}

export abstract class Renderer {
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
        this.height = config.initialScreenBounds.height;
        this.width = config.initialScreenBounds.width;
    }

    abstract draw(world: World): void;

    resize({height, width}: WorldDimensions): void {
        this.firstDraw = true;
        this.height = height;
        this.width = width;
    }
}