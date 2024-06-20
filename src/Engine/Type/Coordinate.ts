import {Coordinate} from "../../Utility/Type/Dimensional.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";

export type ChunkCoordinate = Distinct<Coordinate, 'Chunk'>;
export type GridCoordinate = Distinct<Coordinate, 'Grid'>;
export type ViewportCoordinate = Distinct<Coordinate, 'Viewport'>;