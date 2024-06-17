import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";
import {Config} from "../Type/Config.ts";

export type RendererProps = {
    canvas: HTMLCanvasElement | OffscreenCanvas
    world: World,
    config: Config,
}

export abstract class Renderer {
    protected firstDraw: boolean = true;
    protected height: number;
    protected width: number;
    protected readonly canvas: HTMLCanvasElement | OffscreenCanvas;
    protected readonly world: World;
    protected readonly particleSize: number;

    constructor({
                    canvas,
                    world,
                    config,
                }: RendererProps) {
        this.canvas = canvas;
        this.world = world;
        this.particleSize = config.simulation.particleSize;
        this.height = config.world.outerBounds.height;
        this.width = config.world.outerBounds.width;
    }

    abstract draw(): void;

    resize({height, width}: WorldDimensions): void {
        this.firstDraw = true;
        this.height = height;
        this.width = width;
    }
}