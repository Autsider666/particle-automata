import {GridDimensions} from "../../Utility/Type/Dimensional.ts";

export type SimulationConfig = {
    fps: number,
    imageDataMode?: boolean,
    startOnInit?: boolean,
    outerBounds: GridDimensions,
    chunks: {
        size: number,
    }
}