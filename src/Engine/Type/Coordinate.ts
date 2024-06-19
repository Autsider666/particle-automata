import {Coordinate} from "../../Utility/Type/Dimensional.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";

export type ChunkCoordinate = Distinct<Coordinate, 'Chunk'>;
export type WorldCoordinate = Distinct<Coordinate, 'World'>;
export type CanvasCoordinate = Distinct<Coordinate, 'Canvas'>;