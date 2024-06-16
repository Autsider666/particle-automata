import {World} from "../Grid/World.ts";
import {Config} from "../Type/Config.ts";

export interface WorldBuilder {
    build(config:Config):World
}