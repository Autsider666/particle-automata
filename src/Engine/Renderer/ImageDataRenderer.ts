import {RGBATuple} from "../../Utility/Color.ts";
import {ImageDataHelper} from "../../Utility/ImageDataHelper.ts";
import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {WorldCoordinate} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {Renderer, RendererProps} from "./Renderer.ts";

export class ImageDataRenderer extends Renderer {
    private imageData: ImageDataHelper<WorldCoordinate>;

    constructor(props: RendererProps) {
        super(props);
        this.imageData = new ImageDataHelper(
            props.dimensions,
            this.particleSize,
        );
    }

    resize(dimensions: WorldDimensions): void {
        this.clear();
        super.resize(dimensions);
        this.clear();

        this.imageData.resize(dimensions);
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
        this.ctx.clearRect(0, 0, this.width * this.particleSize, this.height * this.particleSize);
    }

    private clearGridElement(coordinate: WorldCoordinate): void {
        this.imageData.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            [0, 0, 0, 255],
        );
    }

    private fillGridElement(coordinate: WorldCoordinate, color: RGBATuple) {
        this.imageData.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            color,
        );
    }
}