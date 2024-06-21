import {DecodedBuffer} from "../../Utility/BufferBackedObject.ts";
import {ImageDataHelper} from "../../Utility/Rendering/ImageDataHelper.ts";
import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {RGBAColorDescriptor} from "../Schema/ColorSchema.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {Abstract2DContextRenderer} from "./Abstract2DContextRenderer.ts";
import {RendererProps} from "./BaseRenderer.ts";
import {RendererParticle} from "./Type/RendererParticle.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

export class ImageDataRenderer extends Abstract2DContextRenderer {
    private imageData: ImageDataHelper;

    constructor(props: RendererProps) {
        super(props);
        this.imageData = new ImageDataHelper(
            props.config.viewport,
            this.particleSize,
        );
    }

    resize(dimensions: ViewportDimensions): void {
        super.resize(dimensions);

        this.imageData.resize(dimensions);
    }

    protected draw({dirtyParticles, particles}: RendererWorld): void {
        for (const index of dirtyParticles) {
            this.handleParticle(particles[index]);
        }

        this.imageData.applyImageData(this.ctx);
    }

    private handleParticle(particle: RendererParticle): void {
        if (particle.ephemeral) {
            this.clearGridElement(particle.coordinate as GridCoordinate);
        } else {
            this.fillGridElement(particle.coordinate as GridCoordinate, particle.color);
        }
    }

    private clearGridElement(coordinate: GridCoordinate): void {
        this.imageData.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            [0, 0, 0, 255],
        );
    }

    private fillGridElement(coordinate: GridCoordinate, color: DecodedBuffer<RGBAColorDescriptor>) {
        this.imageData.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            [color.red, color.green, color.blue, color.alpha],
        );
    }
}