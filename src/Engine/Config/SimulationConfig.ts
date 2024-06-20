import {GridDimensions} from "../../Utility/Type/Dimensional.ts";

export type SimulationConfig = {
    fps: number,
    imageDataMode?: boolean,
    startOnInit?: boolean,
    outerBounds: GridDimensions,
    chunks: ChunkConfig
}

export type ChunkConfig = {
    size: number,
};