import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {WorldBuilder} from "./WorldBuilder.ts";

export class SimpleWorldBuilder implements WorldBuilder {
    build(config: SimulationConfig): World {
        const bounds = config.outerBounds;
        const outerBounds = BoundingBox.fromDimension<WorldCoordinate>(bounds.width, bounds.height);

        const world = new World(config.chunks.size, outerBounds);

        const leftOffset: number = Math.round(bounds.height / 4);
        const rightOffset: number = leftOffset;
        const topOffset: number = Math.round(outerBounds.bottom / 2);
        const bottomOffset: number = Math.round(bounds.height / 5);
        for (let x = outerBounds.left; x < outerBounds.right; x++) {
            for (let y = outerBounds.top; y < outerBounds.bottom; y++) {
                if (x === outerBounds.left + leftOffset
                    || x === outerBounds.right - (rightOffset + 1)
                    // || y === initialWorldBounds.top
                    || y === outerBounds.bottom - (bottomOffset + 1)
                ) {
                    if (y < topOffset
                        || y > outerBounds.bottom - (bottomOffset + 1)
                        || x < leftOffset
                        || x > outerBounds.right - (rightOffset + 1)
                        || x === Math.round(outerBounds.right / 2)) {
                        continue;
                    }

                    world.setParticle({x, y} as WorldCoordinate, ParticleType.Stone);
                }
            }
        }

        return world;
    }
}