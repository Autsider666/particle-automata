import {EventListenerInterface} from "../../Utility/Event/EventListenerInterface.ts";
import {World} from "../Grid/World.ts";

export type SimulationEvent = {
    preUpdate: World,
    postUpdate: World,
    start: unknown,
    stop: undefined,
}

export interface SimulationInterface extends EventListenerInterface<SimulationEvent> {
    update(): void;
}