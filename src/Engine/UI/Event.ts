import {ElementType} from "../Particle/Particle.ts";
// export type ModifyParticleEvent = {
//     element: ParticleElement,
//     coordinate: ViewportCoordinate,
//     radius: number,
// };

// export type InputEvent = {
//     onFocus: boolean,
//     elementSelected: ParticleElement,
//     setRunning: boolean,
//     replaceParticles: ModifyParticleEvent,
// }

export type InputEvent = {
    ShowStats: boolean,
    SimulationRunning: boolean,
    DrawElement: ElementType,
    DrawSize: number,
}