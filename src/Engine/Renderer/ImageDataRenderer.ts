import {ColorTuple} from "../../Utility/Color.ts";
import {ImageDataHelper} from "../../Utility/ImageDataHelper.ts";
import {Coordinate} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";


export class ImageDataRenderer {
    private readonly imageData: ImageDataHelper;
    private firstDraw: boolean = true;

    constructor(
        private readonly ctx: CanvasImageData,
        private readonly world: World,
        private readonly particleSize: number,
        height: number = window.innerHeight,
        width: number = window.innerWidth,
    ) {
        this.imageData = new ImageDataHelper(
            width * 2,
            height,
            particleSize,
        );
    }

    draw(): void {
        if (this.firstDraw) {
            // ctx.clearRect(0, 0, this.width, this.height);
        }

        this.world.iterateChunks((chunk) => {
            // if (!chunk.isActive() && !this.firstDraw) {
            //     return;
            // }

            chunk.iterateParticles((particle, coordinate): void => { //TODO only changed particles
                if (particle.ephemeral) {
                    this.clearGridElement(coordinate);
                } else if (particle.colorTuple) {
                    this.fillGridElement(coordinate, particle.colorTuple);
                }
            });
        });

        if (this.firstDraw) {
            this.firstDraw = false;
        }

        this.imageData.applyImageData(this.ctx);
    }

    private clearGridElement({x, y}: Coordinate): void {
        this.imageData.fillRectangle(
            {
                x: x * this.particleSize,
                y: y * this.particleSize
            },
            this.particleSize,
            this.particleSize,
            [0, 0, 0],
        );
    }

    private fillGridElement({x,y}: Coordinate, color: ColorTuple) {
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