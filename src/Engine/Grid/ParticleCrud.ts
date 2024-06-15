import type {Particle} from "../Particle/Particle.ts";
import {WorldCoordinate} from "./World.ts";

export interface ParticleCrud {
    getParticle(coordinate: WorldCoordinate): Particle;

    setParticle(coordinate: WorldCoordinate, particle: Particle): boolean;

    containsCoordinate(coordinate: WorldCoordinate): boolean;
}