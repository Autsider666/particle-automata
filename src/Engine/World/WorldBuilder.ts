import {EngineConfig} from "../EngineConfig.ts";
import {World} from "../Grid/World.ts";

export interface WorldBuilder {
    build(config: EngineConfig): World
}