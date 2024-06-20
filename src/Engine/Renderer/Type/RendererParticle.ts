import {DecodedBuffer} from "../../../Utility/BufferBackedObject.ts";
import {ParticleDescriptor} from "../../Schema/ParticleSchema.ts";

export type RendererParticle = Readonly<DecodedBuffer<ParticleDescriptor>>;