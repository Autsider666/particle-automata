import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";

export type SimulationConfig = {
    fps: number,
    imageDataMode?: boolean,
    startOnInit?: boolean,
    outerBounds: WorldDimensions,
    chunks: {
        size: number,
    }
}