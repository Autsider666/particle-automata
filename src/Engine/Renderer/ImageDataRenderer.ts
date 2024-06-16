import {ColorTuple} from "../../Utility/Color.ts";
import {ImageDataHelper} from "../../Utility/ImageDataHelper.ts";
import {Coordinate, Dimensions} from "../../Utility/Type/Dimensional.ts";
import {World, WorldCoordinate} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {Renderer} from "./Renderer.ts";


export class ImageDataRenderer implements Renderer {
    private imageData: ImageDataHelper;
    private firstDraw: boolean = true;

    constructor(
        private readonly ctx: CanvasImageData & CanvasRect,
        private readonly world: World,
        private readonly particleSize: number,
        private height: number,
        private width: number,
    ) {
        this.imageData = new ImageDataHelper(
            width,
            height,
        );
    }

    resize({height, width}: Dimensions): void {
        this.clear();
        this.firstDraw = true;
        this.height = height;
        this.width = width;
        this.clear();

        this.imageData = new ImageDataHelper(
            width,
            height,
        );
    }

    draw(): void {
        if (this.firstDraw) {
            this.clear();

            this.world.iterateAllParticles(this.handleParticle.bind(this));

            this.firstDraw = false;
        } else {

            this.world.iterateActiveChunks(chunk =>
                chunk.iterateDirtyParticles(this.handleParticle.bind(this))
            );
        }

        this.imageData.applyImageData(this.ctx);
    }

    private handleParticle(particle: Particle, coordinate: WorldCoordinate): void {
        if (particle.ephemeral) {
            this.clearGridElement(coordinate);
        } else if (particle.colorTuple) {
            this.fillGridElement(coordinate, particle.colorTuple);
        }
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    private clearGridElement({x, y}: Coordinate): void {
        this.imageData.fillRectangle(
            {
                x: x * this.particleSize,
                y: y * this.particleSize
            },
            this.particleSize,
            this.particleSize,
            [0, 0, 0, 0],
        );
    }

    private fillGridElement({x, y}: Coordinate, color: ColorTuple) {
        this.imageData.fillRectangle(
            {
                x: x * this.particleSize,
                y: y * this.particleSize
            },
            this.particleSize,
            this.particleSize,
            color,
        );
    }
}