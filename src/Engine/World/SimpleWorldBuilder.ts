import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {World} from "../Grid/World.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {Config} from "../Type/Config.ts";
import {WorldBuilder} from "./WorldBuilder.ts";

export class SimpleWorldBuilder implements WorldBuilder {
    build(config: Config): World {
        const initialWorldBounds = BoundingBox.fromDimension(config.world.width, config.world.height);
        const world = new World(initialWorldBounds, config.chunks.size); //TODO add outer bounds

        const leftOffset: number = 10;
        const rightOffset: number = 10;
        const topOffset: number = Math.round(initialWorldBounds.bottom/2);
        const bottomOffset: number = 10;

        world.iterateAllParticles((_particle, coordinate) => {
            const {x, y} = coordinate;
            if (x === initialWorldBounds.left + leftOffset
                || x === initialWorldBounds.right - (rightOffset + 1)
                // || y === initialWorldBounds.top
                || y === initialWorldBounds.bottom - (bottomOffset + 1)
            ) {
                if (y < topOffset
                    || y > initialWorldBounds.bottom - (bottomOffset + 1)
                    || x < leftOffset
                    || x > initialWorldBounds.right - (rightOffset+1)
                    || x === Math.round(initialWorldBounds.right / 2)) {
                    return;
                }

                world.setParticle(coordinate, ParticleType.Stone);
            }
        });

        return world;
    }
}