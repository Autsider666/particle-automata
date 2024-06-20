import {DecodedBuffer} from "../../../Utility/BufferBackedObject.ts";
import {ChunkDescriptor} from "../../Schema/ChunkSchema.ts";

export type RendererChunk = Readonly<DecodedBuffer<ChunkDescriptor>>;