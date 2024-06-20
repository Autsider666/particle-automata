import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {WorldBuilder, WorldEvent} from "./WorldBuilder.ts";

export class SimpleWorldBuilder implements WorldBuilder {
    build(config: SimulationConfig, events: EventHandlerInterface<WorldEvent>): World {
        const bounds = config.outerBounds;
        const outerBounds = BoundingBox.fromDimension<GridCoordinate>(bounds.width, bounds.height);

        return new World(config.chunks.size, outerBounds, events);
    }
}