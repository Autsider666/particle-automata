import {BaseParticle} from "./ParticleType.ts";

export type Particle<ExtraProperties extends object = NonNullable<Readonly<BaseParticle>>> =
    Partial<ExtraProperties> & Readonly<BaseParticle>;