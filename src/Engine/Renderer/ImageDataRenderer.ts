import {RGBATuple} from "../../Utility/Color.ts";
import {ImageDataHelper} from "../../Utility/Rendering/ImageDataHelper.ts";
import {GridDimensions, Traversal} from "../../Utility/Type/Dimensional.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {Abstract2DContextRenderer} from "./Abstract2DContextRenderer.ts";
import {RendererProps} from "./Renderer.ts";
import {RendererParticle} from "./Type/RendererParticle.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

export class ImageDataRenderer extends Abstract2DContextRenderer {
    private imageData: ImageDataHelper<WorldCoordinate>;

    constructor(props: RendererProps) {
        super(props);
        this.imageData = new ImageDataHelper(
            Traversal.getGridDimensions(props.config.initialScreenBounds,this.particleSize),
            this.particleSize,
        );
    }

    resize(dimensions: GridDimensions): void {
        this.clear();
        super.resize(dimensions);
        this.clear();

        this.imageData.resize(dimensions);
    }

    draw({dirtyParticles}: RendererWorld): void {
        if (this.firstDraw) {
            this.firstDraw = false;
        }

        for (const [coordinate, particle] of dirtyParticles) {
            this.handleParticle(coordinate, particle);
        }

        this.imageData.applyImageData(this.ctx);
    }

    private handleParticle(coordinate: WorldCoordinate, particle: RendererParticle): void {
        if (particle.ephemeral) {
            this.clearGridElement(coordinate);
        } else {
            this.fillGridElement(coordinate, particle.color.tuple);
        }
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