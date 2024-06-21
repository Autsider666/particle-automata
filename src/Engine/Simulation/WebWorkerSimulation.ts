import * as Comlink from "comlink";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {EngineConfig} from "../Config/EngineConfig.ts";
import {World} from "../Grid/World.ts";
import {ParticleIdentifier, ParticleType} from "../Particle/ParticleType.ts";
import {RealWorldWebGLRenderer} from "../Renderer/RealWorldWebGLRenderer.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {WorldEvent} from "../World/WorldBuilder.ts";
import {Simulation} from "./Simulation.ts";
import {SimulationInterface} from "./SimulationInterface.ts";

export type UpdateData = {
    newBuffers: SharedArrayBuffer[],
    dirtyChunks: number[],
    dirtyParticles: number[],
}

export type UpdateCallback = () => void

export class WebWorkerSimulation {
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;
    private readonly events = new EventHandler<WorldEvent>();
    private readonly renderer: RealWorldWebGLRenderer;

    constructor(
        private readonly config: EngineConfig,
        private readonly updateCallback: UpdateCallback,
        canvas: OffscreenCanvas,
    ) {
        this.world = new SimpleWorldBuilder().build(this.config.simulation, this.events);

        this.simulation = new Simulation(this.world, ObviousNonsenseBehaviourManager);
        this.fpsManager = new FrameRateManager(this.update.bind(this), this.config.simulation.fps, true);

        this.renderer = new RealWorldWebGLRenderer({
            config: config.renderer,
            canvas
        });

        this.renderer.render({
            dirtyParticles: [],
            particles: [],
            dirtyChunks: [],
            chunks: [],
        }, this.world);
    }

    async start(): Promise<void> {
        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private update(): void {
        this.simulation.update();
        // const middle = Math.round(this.config.simulation.outerBounds.width/3);
        // const range = 50;
        // for (let i = -range; i < range; i++) {
        //     if (i %2 === 0) {
        //         continue;
        //     }
        //     this.world.setParticle({x: middle+i, y: 0} as GridCoordinate, ParticleType.Sand);
        // }

        this.render();

        this.updateCallback();
    }

    private render(): void {
        this.world.prepareForDraw();

        this.renderer.render({
            dirtyParticles: [],
            particles: [],
            dirtyChunks: [],
            chunks: [],
        }, this.world);
    }

    // async setUpdateCallback(callback: ((buffer: ArrayBuffer) => void)): Promise<void> {
    //     this.updateCallback = callback;
    // }
    //
    // async setNewChunkCallback(callback: SharedArrayBufferCallback): Promise<void> {
    //     this.newChunkCallback = callback;
    // }

    // async getRenderBuffer():Promise<SharedArrayBuffer> {
    //     return this.renderBuffer;
    // }
    replaceParticles(type: ParticleIdentifier, particleCoordinates: GridCoordinate[]) {
        for (const particleCoordinate of particleCoordinates) {
            if (this.world.isValidCoordinate(particleCoordinate)) {
                this.world.setParticle(particleCoordinate, ParticleType.get(type));
            }
            // if (replace || this.world.getParticle(particleCoordinate)?.type !== type) {
            // }
        }
    }
}

Comlink.expose(WebWorkerSimulation);