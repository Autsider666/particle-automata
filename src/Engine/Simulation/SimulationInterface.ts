import {EventListenerInterface} from "../../Utility/Event/EventListenerInterface.ts";
import {ViewportCoordinate} from "../Type/Coordinate.ts";

export type SimulationEvent = {
    preUpdate: undefined,
    postUpdate: undefined,
    debug: ViewportCoordinate,
}

export interface SimulationInterface extends EventListenerInterface<SimulationEvent> {
    update(): void;
}