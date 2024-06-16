import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";

export type RendererProps = {
    ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    world: World,
    particleSize: number,
    dimensions: WorldDimensions,
}

export abstract class Renderer {
    protected firstDraw: boolean = true;
    protected height: number;
    protected width: number;
    protected readonly ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
    protected readonly world: World;
    protected readonly particleSize: number;

    constructor({
                              ctx,
                              world,
                              particleSize,
                              dimensions,
                          }: RendererProps) {
        this.ctx = ctx;
        this.world = world;
        this.particleSize = particleSize;
        this.height = dimensions.height;
        this.width = dimensions.width;
    }

    abstract draw(): void;

    resize({height, width}: WorldDimensions): void {
        this.firstDraw = true;
        this.height = height;
        this.width = width;
    }
}