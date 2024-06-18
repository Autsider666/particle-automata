import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";

export interface WorldBuilder {
    build(config: SimulationConfig): World
}