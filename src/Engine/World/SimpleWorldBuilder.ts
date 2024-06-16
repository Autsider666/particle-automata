import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {World} from "../Grid/World.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {Config} from "../Type/Config.ts";
import {WorldBuilder} from "./WorldBuilder.ts";

export class SimpleWorldBuilder implements WorldBuilder {
    build(config: Config): World {
        const bounds = config.world.outerBounds;
        let outerBounds: BoundingBox | undefined;
        if (bounds) {
            outerBounds = BoundingBox.fromDimension(bounds.width, bounds.height);
        }

        const world = new World(config.chunks.size, outerBounds);

        if (!bounds || !outerBounds){
            return world;
        }

        const leftOffset: number = Math.round(bounds.height / 4);
        const rightOffset: number = leftOffset;
        const topOffset: number = Math.round(outerBounds.bottom / 2);
        const bottomOffset: number = Math.round(bounds.height / 5);

        world.iterateAllParticles((_particle, coordinate) => {
            const {x, y} = coordinate;
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
                    return;
                }

                world.setParticle(coordinate, ParticleType.Stone);
            }
        });

        return world;
    }
}