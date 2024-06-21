import {EventListenerInterface} from "../../Utility/Event/EventListenerInterface.ts";
import {World} from "../Grid/World.ts";
import {ViewportCoordinate} from "../Type/Coordinate.ts";

export type SimulationEvent = {
    preUpdate: World,
    postUpdate: World,
    start: unknown,
    stop: undefined,
    debug: ViewportCoordinate,
}

export interface SimulationInterface extends EventListenerInterface<SimulationEvent> {
    update(): void;
}