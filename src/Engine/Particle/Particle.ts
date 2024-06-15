import {ParticleTypeData} from "./ParticleType.ts";

export type Particle<ExtraProperties extends object = NonNullable<Readonly<ParticleTypeData>>> =
    Partial<ExtraProperties> & Readonly<ParticleTypeData>;