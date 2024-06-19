import {DecodedBuffer} from "../../Utility/BufferBackedObject.ts";
import {GridDimensions} from "../../Utility/Type/Dimensional.ts";
import {RendererConfig} from "../Config/RendererConfig.ts";
import {RenderParticleSchema} from "../Schema/RenderParticleSchema.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

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

    abstract draw(world: RendererWorld, renderParticles: DecodedBuffer<typeof RenderParticleSchema>[]): void;

    resize({height, width}: GridDimensions): void {
        this.firstDraw = true;
        this.height = height;
        this.width = width;
    }
}