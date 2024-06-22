import {ParticleElement} from "../Particle/Particle.ts";
import {ViewportCoordinate} from "../Type/Coordinate.ts";

export type ModifyParticleEvent = {
    element: ParticleElement,
    coordinate: ViewportCoordinate,
    radius: number,
};

export type UIEvent = {
    onFocus: boolean,
    elementSelected: ParticleElement,
    setRunning: boolean,
    replaceParticles: ModifyParticleEvent,
}